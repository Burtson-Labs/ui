import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  AgentPlan,
  AskUser,
  CircularProgress,
  ContextUsage,
  LoadingDots,
  Progress,
  ThemeProvider,
  ThemeToggle,
  useTheme,
  type AskUserQuestion,
} from '@burtson-labs/ui';

const questions: AskUserQuestion[] = [
  {
    id: 'format',
    prompt: 'Choose a format',
    options: [
      { value: 'csv', label: 'CSV' },
      { value: 'pdf', label: 'PDF' },
    ],
    allowCustom: true,
  },
  {
    id: 'sections',
    prompt: 'Include sections',
    multiple: true,
    options: [
      { value: 'summary', label: 'Summary' },
      { value: 'details', label: 'Details' },
    ],
    required: false,
  },
];

describe('agent questions', () => {
  it('validates unanswered questions and focuses the first answer', async () => {
    const submit = vi.fn();
    render(<AskUser questions={questions} onSubmit={submit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert').textContent).toContain('required');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'CSV' }));
  });
  it('submits multiple choices and treats custom text as an alternative answer', async () => {
    const submit = vi.fn();
    render(<AskUser questions={questions} onSubmit={submit} />);
    await userEvent.click(screen.getByRole('radio', { name: 'CSV' }));
    await userEvent.type(screen.getByRole('textbox'), '  Spreadsheet  ');
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'CSV' }).checked).toBe(false);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Summary' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Details' }));
    await userEvent.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(submit).toHaveBeenCalledWith({
      format: { selected: [], text: 'Spreadsheet' },
      sections: { selected: ['summary', 'details'], text: '' },
    });
    expect(screen.getByRole('status').textContent).toBe('Answers sent');
    expect(screen.queryByRole('button', { name: 'Send answers' })).toBeNull();
  });
  it('keeps answers after failure, blocks duplicate submits and allows retry', async () => {
    let reject!: (reason: Error) => void;
    const submit = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<void>((_, fail) => {
            reject = fail;
          }),
      )
      .mockResolvedValueOnce(undefined);
    render(<AskUser questions={questions} onSubmit={submit} onSkip={vi.fn()} />);
    await userEvent.click(screen.getByRole('radio', { name: 'PDF' }));
    const form = screen.getByRole('button', { name: 'Send answers' }).closest('form')!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Skip for now' }).hasAttribute('disabled')).toBe(
      true,
    );
    await act(async () => {
      reject(new Error('Connection lost. Try again.'));
      await Promise.resolve();
    });
    expect(screen.getByRole('alert').textContent).toContain('Connection lost');
    expect(screen.getByRole<HTMLInputElement>('radio', { name: 'PDF' }).checked).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(submit).toHaveBeenCalledTimes(2);
  });
  it('ignores stale option IDs and supports a free-text-only question', async () => {
    const submit = vi.fn();
    const { rerender } = render(
      <AskUser
        questions={questions}
        defaultValue={{ format: { selected: ['gone'], text: '' } }}
        onSubmit={submit}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(submit).not.toHaveBeenCalled();
    rerender(
      <AskUser
        key="new"
        questions={[{ id: 'goal', prompt: 'What is the goal?' }]}
        onSubmit={submit}
      />,
    );
    await userEvent.type(screen.getByRole('textbox'), 'Make it readable');
    await userEvent.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(submit).toHaveBeenCalledWith({ goal: { selected: [], text: 'Make it readable' } });
  });
});

describe('capacity and loading', () => {
  it('distinguishes unknown work from measured zero and clamps a finite value', () => {
    const { rerender } = render(<CircularProgress label="Upload" />);
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
    rerender(<CircularProgress label="Upload" value={0} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('0');
    rerender(<CircularProgress label="Upload" value={300} max={200} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('200');
    rerender(<CircularProgress value={NaN} max={Infinity} />);
    expect(screen.getByRole('progressbar').getAttribute('aria-valuemax')).toBe('100');
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
  });
  it('keeps unknown capacity separate from empty and full capacity', () => {
    const { rerender } = render(<ContextUsage used={null} limit={100} />);
    expect(screen.queryByRole('meter')).toBeNull();
    expect(screen.getByText('Usage unavailable')).toBeTruthy();
    rerender(<ContextUsage used={0} limit={100} />);
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('0');
    rerender(<ContextUsage used={130} limit={100} />);
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe('130 of 100 tokens');
    expect(screen.getByText(/Almost full/)).toBeTruthy();
    rerender(<ContextUsage used={NaN} limit={0} />);
    expect(screen.queryByRole('meter')).toBeNull();
  });
  it('reports one readable waiting status and no false percentage', () => {
    render(
      <>
        <LoadingDots label="Thinking" showLabel />
        <Progress aria-label="Connecting" />
      </>,
    );
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status').textContent).toBe('Thinking');
    expect(screen.getByRole('progressbar').hasAttribute('aria-valuenow')).toBe(false);
  });
  it('leaves plan approval to the runtime and disables busy decisions', async () => {
    const approve = vi.fn();
    const revise = vi.fn();
    const props = {
      steps: [{ id: 'read', title: 'Read records' }],
      onApprove: approve,
      onRevise: revise,
    };
    const { rerender } = render(<AgentPlan {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Approve plan' }));
    expect(approve).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status').textContent).toBe('For your review');
    rerender(<AgentPlan {...props} busy />);
    await userEvent.click(screen.getByRole('button', { name: 'Request changes' }));
    expect(revise).not.toHaveBeenCalled();
    rerender(<AgentPlan {...props} state="approved" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

function Preference() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <span data-testid="preference">{theme}</span>
      <button onClick={() => setTheme('system')}>Use system</button>
      <ThemeToggle />
    </>
  );
}
describe('theme preferences', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.className = '';
    delete document.documentElement.dataset.theme;
  });
  it('follows the system, persists overrides and syncs another tab', async () => {
    let dark = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal('matchMedia', () => ({
      matches: dark,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    }));
    render(
      <ThemeProvider storageKey="test-theme">
        <Preference />
      </ThemeProvider>,
    );
    expect(document.documentElement.dataset.theme).toBe('light');
    act(() => {
      dark = true;
      for (const listener of listeners) listener();
    });
    expect(document.documentElement.dataset.theme).toBe('dark');
    await userEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(localStorage.getItem('test-theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    act(() => {
      localStorage.setItem('test-theme', 'dark');
      window.dispatchEvent(new StorageEvent('storage', { key: 'test-theme', newValue: 'dark' }));
    });
    expect(document.documentElement.dataset.theme).toBe('dark');
    await userEvent.click(screen.getByRole('button', { name: 'Use system' }));
    expect(localStorage.getItem('test-theme')).toBe('system');
    act(() => {
      dark = false;
      for (const listener of listeners) listener();
    });
    expect(document.documentElement.dataset.theme).toBe('light');
  });
  it('stays usable when storage is blocked and renders on the server', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    render(
      <ThemeProvider defaultTheme="light">
        <ThemeToggle />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
    expect(
      renderToString(
        <ThemeProvider defaultTheme="dark">
          <ThemeToggle />
        </ThemeProvider>,
      ),
    ).toContain('Switch to light theme');
  });
});
