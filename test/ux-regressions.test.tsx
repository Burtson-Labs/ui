import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  Button,
  Combobox,
  Composer,
  CopyButton,
  Input,
  Progress,
  Textarea,
} from '@burtson-labs/ui';

import { dark, light } from '../src/tokens';

describe('action semantics', () => {
  it('does not submit a containing form unless requested', async () => {
    const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Button>Preview</Button>
        <Button type="submit">Save</Button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Preview' }));
    expect(submit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(submit).toHaveBeenCalledTimes(1);
  });
  it('prevents a disabled slotted link from activating its child handler', async () => {
    const click = vi.fn();
    render(
      <Button asChild disabled>
        <a href="/danger" onClick={click}>
          Disabled link
        </a>
      </Button>,
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.tabIndex).toBe(-1);
    await userEvent.click(link);
    expect(click).not.toHaveBeenCalled();
  });
  it('forwards refs to native controls', () => {
    const button = React.createRef<HTMLButtonElement>();
    const input = React.createRef<HTMLInputElement>();
    const textarea = React.createRef<HTMLTextAreaElement>();
    render(
      <>
        <Button ref={button}>Action</Button>
        <Input ref={input} aria-label="Name" />
        <Textarea ref={textarea} aria-label="Notes" />
      </>,
    );
    expect(button.current).toBe(screen.getByRole('button'));
    expect(input.current).toBe(screen.getByLabelText('Name'));
    expect(textarea.current).toBe(screen.getByLabelText('Notes'));
  });
});

describe('async composer', () => {
  it('retains a failed draft and allows retry', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined);
    render(<Composer onSubmit={onSubmit} />);
    const input = screen.getByRole<HTMLTextAreaElement>('textbox');
    await userEvent.type(input, 'Keep my work{Enter}');
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(input.value).toBe('Keep my work');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => expect(input.value).toBe(''));
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });
  it('blocks duplicate submissions while the first one is pending', async () => {
    let resolve!: () => void;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    render(<Composer onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox'), 'Hello{Enter}');
    expect(screen.getByRole('button', { name: 'Send' }).hasAttribute('disabled')).toBe(true);
    fireEvent.submit(screen.getByRole('textbox').closest('form')!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve();
      await Promise.resolve();
    });
  });
  it('does not submit during IME composition', () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} value="日本語" />);
    fireEvent.keyDown(screen.getByRole('textbox'), {
      key: 'Enter',
      isComposing: true,
      keyCode: 229,
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('feedback and forms', () => {
  it('scales progress to max and clamps out-of-range values', () => {
    const { container, rerender } = render(<Progress value={25} max={50} aria-label="Upload" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuemax')).toBe('50');
    expect(
      (container.querySelector('[data-slot="progress-indicator"]') as HTMLElement).style.transform,
    ).toBe('translateX(-50%)');
    rerender(<Progress value={99} max={50} aria-label="Upload" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('50');
    rerender(<Progress value={null} aria-label="Upload" />);
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
  });
  it('announces a clipboard failure without requiring a Toaster', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) },
    });
    render(<CopyButton value="text" />);
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Copy blocked'));
  });
  it('includes a named combobox selection in native FormData', () => {
    const { container } = render(
      <form>
        <Combobox
          name="model"
          aria-label="Model"
          value="local"
          onValueChange={() => {}}
          options={[{ value: 'local', label: 'Local' }]}
        />
      </form>,
    );
    expect(new FormData(container.querySelector('form')!).get('model')).toBe('local');
    expect(screen.getByRole('combobox', { name: 'Model' }).getAttribute('aria-haspopup')).toBe(
      'dialog',
    );
  });
});

function luminance(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
}
function contrast(a: string, b: string) {
  const aa = luminance(a),
    bb = luminance(b);
  return (Math.max(aa, bb) + 0.05) / (Math.min(aa, bb) + 0.05);
}
describe('core palette contrast', () => {
  for (const [name, palette] of Object.entries({ light, dark })) {
    it(`${name} text and filled actions meet 4.5:1`, () => {
      for (const [background, foreground] of [
        ['background', 'foreground'],
        ['background', 'muted-foreground'],
        ['primary', 'primary-foreground'],
        ['destructive', 'destructive-foreground'],
      ] as const)
        expect(contrast(palette[background], palette[foreground])).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe('resilient component states', () => {
  it('renders circular and bigint tool data without crashing the conversation', async () => {
    const { ToolCall } = await import('@burtson-labs/ui');
    const value: { self?: unknown; count: bigint } = { count: 123n };
    value.self = value;
    render(<ToolCall name="inspect" status="success" result={value} defaultOpen />);
    expect(screen.getByText(/Repeated reference/)).toBeTruthy();
    expect(screen.getByText(/123/)).toBeTruthy();
  });
  it('blocks tool decisions while the app is recording one', async () => {
    const { ToolApproval } = await import('@burtson-labs/ui');
    const onApprove = vi.fn();
    render(<ToolApproval name="deploy" description="Deploy release" busy onApprove={onApprove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onApprove).not.toHaveBeenCalled();
  });
  it('represents mixed checkboxes and empty pagination accurately', async () => {
    const { Checkbox, Pagination, paginationRange } = await import('@burtson-labs/ui');
    render(
      <>
        <Checkbox aria-label="Select rows" checked="indeterminate" />
        <Pagination page={99} pageCount={0} onPageChange={() => {}} />
      </>,
    );
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('mixed');
    expect(screen.getByRole('button', { name: 'Next page' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Previous page' }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(paginationRange(NaN, Infinity)).toEqual([]);
  });
});

describe('focus outline layering', () => {
  it('keeps the default focus outline in the base layer so component utilities win', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const css = readFileSync(join(process.cwd(), 'src/styles/theme.css'), 'utf8');
    const outside = css.replace(/@layer base \{[\s\S]*?\n\}\n/g, '');
    expect(outside).not.toMatch(/\[data-slot\][^{]*:focus-visible/);
    expect(css).toMatch(/:where\(\[data-slot\]\):focus-visible/);
  });
});

describe('shortcut labels', () => {
  it('shows ⌘ on Apple platforms and Ctrl elsewhere', async () => {
    const { shortcutLabel } = await import('@burtson-labs/ui');
    const nav = window.navigator;
    const set = (platform: string, ua: string) => {
      Object.defineProperty(nav, 'platform', { value: platform, configurable: true });
      Object.defineProperty(nav, 'userAgent', { value: ua, configurable: true });
    };
    set('MacIntel', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)');
    expect(shortcutLabel('k')).toBe('⌘K');
    set('Win32', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    expect(shortcutLabel('k')).toBe('Ctrl K');
    set('Linux x86_64', 'Mozilla/5.0 (X11; Linux x86_64)');
    expect(shortcutLabel('k')).toBe('Ctrl K');
  });
});
