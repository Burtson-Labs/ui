import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ArtifactPanel,
  AttachmentItem,
  AudioPlayer,
  CodeBlock,
  dark,
  formatContextWindow,
  formatCost,
  formatElapsed,
  ImageGallery,
  ImageLightbox,
  light,
  Markdown,
  MessageActions,
  MessageAttachments,
  MessageUsage,
  ModelPicker,
  type ModelOption,
  ResponseVersions,
  safeImageSrc,
  safeLinkHref,
  tokenizeCode,
} from '@burtson-labs/ui';

describe('safe URLs', () => {
  it('keeps http(s), blob: and data:image sources; drops script-bearing URLs', () => {
    expect(safeImageSrc('https://x.test/a.png')).toBe('https://x.test/a.png');
    expect(safeImageSrc('/uploads/a.png')).toBe('/uploads/a.png');
    expect(safeImageSrc('blob:https://x.test/1234')).toBe('blob:https://x.test/1234');
    expect(safeImageSrc('data:image/svg+xml,%3Csvg%3E')).toBe('data:image/svg+xml,%3Csvg%3E');
    expect(safeImageSrc('data:image/png;base64,iVBORw0KGgo=')).toBe(
      'data:image/png;base64,iVBORw0KGgo=',
    );
    for (const bad of [
      'javascript:alert(1)',
      ' JAVASCRIPT:alert(1)',
      'java\tscript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'data:image,nothing',
      'vbscript:msgbox',
      '',
      undefined,
      null,
    ])
      expect(safeImageSrc(bad), String(bad)).toBeUndefined();
  });

  it('links only http(s), with mailto and blob as opt-ins', () => {
    expect(safeLinkHref('https://x.test')).toBe('https://x.test');
    expect(safeLinkHref('javascript:alert(1)')).toBeUndefined();
    expect(safeLinkHref('mailto:a@x.test')).toBeUndefined();
    expect(safeLinkHref('mailto:a@x.test', { mailto: true })).toBe('mailto:a@x.test');
    expect(safeLinkHref('blob:https://x.test/1', { blob: true })).toBe('blob:https://x.test/1');
    expect(safeLinkHref('data:text/html,hi', { blob: true, mailto: true })).toBeUndefined();
  });

  it('does not load unsafe attachment previews or link unsafe files', () => {
    const { container } = render(
      <>
        <AttachmentItem name="a.png" preview="javascript:alert(1)" />
        <MessageAttachments
          files={[
            { name: 'x.png', type: 'image/png', href: 'javascript:alert(1)' },
            { name: 'y.pdf', type: 'application/pdf', href: 'javascript:alert(1)' },
            { name: 'z.png', type: 'image/png', href: 'data:image/png;base64,AAAA' },
          ]}
        />
      </>,
    );
    for (const img of container.querySelectorAll('img'))
      expect(img.getAttribute('src')).not.toMatch(/^javascript:/i);
    expect(container.querySelectorAll('a[href^="javascript"]').length).toBe(0);
    // A data: image is shown but is not a link.
    expect(screen.getByRole('img', { name: 'z.png' }).closest('a')).toBeNull();
    expect(screen.queryByRole('link', { name: /y\.pdf/ })).toBeNull();
  });
});

describe('chat content URLs in server markup (what React 18 would render)', () => {
  it('never writes a javascript: href or src for attachments or downloads', () => {
    const html = renderToStaticMarkup(
      <>
        <MessageAttachments
          files={[
            { name: 'a.pdf', type: 'application/pdf', href: 'javascript:alert(1)' },
            { name: 'b.png', type: 'image/png', href: 'javascript:alert(2)' },
            { name: 'c.webm', type: 'audio/webm', href: 'javascript:alert(3)' },
            { name: 'd.pdf', type: 'application/pdf', href: '/files/d.pdf' },
          ]}
        />
        <AudioPlayer src="javascript:alert(4)" downloadName="x.webm" />
      </>,
    );
    expect(html).not.toMatch(/javascript:/i);
    expect(html).toContain('href="/files/d.pdf"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('download="x.webm"');
    expect(renderToStaticMarkup(<AudioPlayer src="/a.webm" downloadName="a.webm" />)).toContain(
      'download="a.webm"',
    );
  });
});

describe('code highlighting', () => {
  it('tokenizes common languages and always round-trips the source', () => {
    const samples: [string, string][] = [
      ['ts', 'const n: number = 42; // answer\nfetch(`/api/${n}`).then((r) => r.json());'],
      ['json', '{ "name": "ui", "private": true, "n": -1.5e3 }'],
      ['bash', 'npm run check && echo "$HOME" # done\nexport FOO=--bar'],
      ['python', 'def f(x):\n    """doc"""\n    return x ** 2 if x else None  # sq'],
    ];
    for (const [lang, code] of samples) {
      const tokens = tokenizeCode(code, lang);
      expect(tokens, lang).not.toBeNull();
      expect(tokens?.map((t) => t.text).join(''), lang).toBe(code);
    }
    const ts = tokenizeCode('const x = "hi"; // c', 'typescript') ?? [];
    expect(ts.find((t) => t.text === 'const')?.type).toBe('keyword');
    expect(ts.find((t) => t.text === '"hi"')?.type).toBe('string');
    expect(ts.find((t) => t.text === '// c')?.type).toBe('comment');
    const json = tokenizeCode('{"a": 1}', 'json') ?? [];
    expect(json.find((t) => t.text === '"a"')?.type).toBe('property');
    expect(tokenizeCode('x', 'cobol')).toBeNull();
  });

  it('renders model output as text, never markup', () => {
    const evil = 'const a = "<img src=x onerror=alert(1)>"; </code><script>alert(2)</script>';
    const { container } = render(<CodeBlock code={evil} lang="js" />);
    expect(container.querySelector('img, script')).toBeNull();
    expect(container.querySelector('code')?.textContent).toBe(evil);
    expect(container.querySelector('[data-token="keyword"]')?.textContent).toBe('const');
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeTruthy();
  });

  it('takes a pluggable highlighter, falls back to the built-in, and turns off', () => {
    const custom = vi.fn((code: string) => <mark data-testid="custom">{code}</mark>);
    const { rerender, container } = render(
      <CodeBlock code="let a = 1" lang="js" highlight={custom} />,
    );
    expect(custom).toHaveBeenCalledWith('let a = 1', 'js');
    expect(screen.getByTestId('custom').textContent).toBe('let a = 1');
    rerender(<CodeBlock code="let a = 1" lang="js" highlight={() => null} />);
    expect(container.querySelector('[data-token="keyword"]')).not.toBeNull();
    rerender(<CodeBlock code="let a = 1" lang="js" highlight={false} />);
    expect(container.querySelector('[data-token]')).toBeNull();
    rerender(<Markdown highlight={false}>{'```js\nlet a = 1\n```'}</Markdown>);
    expect(container.querySelector('[data-token]')).toBeNull();
    expect(container.querySelector('code')?.textContent).toBe('let a = 1');
  });

  it('mixes token colours that read at 4.5:1 on the code background in both themes', () => {
    const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const lum = (c: number[]) => {
      const [r = 0, g = 0, b = 0] = c.map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a: number[], b: number[]) => {
      const [x, y] = [lum(a), lum(b)];
      return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
    };
    const mix = (a: number[], b: number[], p: number) =>
      a.map((v, i) => v * p + (b[i] ?? 0) * (1 - p));
    for (const palette of [light, dark]) {
      const fg = rgb(palette['code-foreground']);
      const bg = rgb(palette.code);
      for (const tone of ['brand', 'success', 'warning', 'info', 'destructive'] as const)
        expect(contrast(mix(rgb(palette[tone]), fg, 0.6), bg), tone).toBeGreaterThanOrEqual(4.5);
      // Comments: the foreground at 65% over the background.
      expect(contrast(mix(fg, bg, 0.65), bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

const models: ModelOption[] = [
  {
    value: 'sonnet',
    label: 'Claude Sonnet',
    provider: 'Anthropic',
    contextWindow: 200_000,
    capabilities: ['Vision'],
  },
  { value: 'opus', label: 'Claude Opus', provider: 'Anthropic', description: 'Deep work' },
  {
    value: 'gpt',
    label: 'GPT Large',
    provider: 'OpenAI',
    disabled: true,
    disabledReason: 'Needs an API key',
  },
  { value: 'local', label: 'Qwen', provider: 'Local' },
];

describe('ModelPicker', () => {
  it('names the current model, groups by provider and picks with the keyboard', async () => {
    const onValueChange = vi.fn();
    render(<ModelPicker models={models} defaultValue="sonnet" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('button', { name: 'Model: Claude Sonnet' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const dialog = await screen.findByRole('dialog', { name: 'Search models' });
    expect(within(dialog).getByText('Anthropic')).toBeTruthy();
    expect(within(dialog).getByText('OpenAI')).toBeTruthy();
    expect(within(dialog).getByText('200K context')).toBeTruthy();
    expect(within(dialog).getByText('Vision')).toBeTruthy();
    const gpt = within(dialog).getByRole('option', { name: /GPT Large/ });
    expect(gpt.getAttribute('aria-disabled')).toBe('true');
    expect(gpt.textContent).toContain('Needs an API key');
    await userEvent.type(within(dialog).getByRole('combobox'), 'opus');
    expect(within(dialog).queryByRole('option', { name: /Qwen/ })).toBeNull();
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('opus');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Model: Claude Opus' })).toBeTruthy();
  });

  it('is controlled and translatable, and searches capabilities', async () => {
    const onValueChange = vi.fn();
    render(
      <ModelPicker
        models={models}
        value={null}
        onValueChange={onValueChange}
        labels={{ trigger: 'Modèle', placeholder: 'Choisir', search: 'Rechercher' }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Modèle: Choisir' }));
    const dialog = await screen.findByRole('dialog', { name: 'Rechercher' });
    await userEvent.type(within(dialog).getByRole('combobox'), 'vision');
    await userEvent.click(within(dialog).getByRole('option', { name: /Claude Sonnet/ }));
    expect(onValueChange).toHaveBeenCalledWith('sonnet');
    // Controlled with null: the trigger keeps the placeholder until the parent updates.
    expect(screen.getByRole('button', { name: 'Modèle: Choisir' })).toBeTruthy();
  });

  it('formats context windows compactly', () => {
    expect(formatContextWindow(200_000, 'en-US')).toBe('200K');
    expect(formatContextWindow(1_000_000, 'en-US')).toBe('1M');
    expect(formatContextWindow(0)).toBe('');
  });
});

describe('ResponseVersions', () => {
  function Versions({ start = 1, count = 3 }: { start?: number; count?: number }) {
    const [index, setIndex] = React.useState(start);
    return <ResponseVersions index={index} count={count} onIndexChange={setIndex} />;
  }

  it('moves between versions, announces the change and keeps focus at the ends', async () => {
    render(<Versions />);
    const group = screen.getByRole('group', { name: 'Response versions' });
    expect(group.textContent).toContain('2 / 3');
    const status = within(group).getByRole('status');
    expect(status.textContent).toBe(''); // nothing announced on mount
    const next = screen.getByRole('button', { name: 'Next response' });
    await userEvent.click(next);
    expect(status.textContent).toBe('Response 3 of 3');
    expect(next.getAttribute('aria-disabled')).toBe('true');
    expect((next as HTMLButtonElement).disabled).toBe(false);
    await userEvent.click(next);
    expect(group.textContent).toContain('3 / 3');
    expect(document.activeElement).toBe(next);
    await userEvent.keyboard('{ArrowLeft}');
    expect(status.textContent).toBe('Response 2 of 3');
    expect(
      screen.getByRole('button', { name: 'Previous response' }).hasAttribute('aria-disabled'),
    ).toBe(false);
  });

  it('renders nothing for a single version and fits in MessageActions', () => {
    const { container, rerender } = render(<Versions count={1} start={0} />);
    expect(container.querySelector('[data-slot="response-versions"]')).toBeNull();
    rerender(
      <MessageActions
        copyText="x"
        versions={{
          index: 0,
          count: 2,
          onIndexChange: () => undefined,
          labels: { status: (c, t) => `Réponse ${c} sur ${t}` },
        }}
      />,
    );
    const actions = screen.getByRole('group', { name: 'Message actions' });
    expect(within(actions).getByRole('group', { name: 'Response versions' })).toBeTruthy();
    expect(actions.textContent).toContain('Réponse 1 sur 2');
  });
});

describe('MessageUsage', () => {
  it('shows measured values with full names for screen readers', () => {
    const { container } = render(
      <MessageUsage
        inputTokens={1204}
        outputTokens={356}
        cost={0.0042}
        durationMs={3240}
        locale="en-US"
      />,
    );
    const usage = container.querySelector('[data-slot="message-usage"]');
    expect(usage?.textContent).toBe(
      'Input tokens: 1,204 in, ·Output tokens: 356 out, ·Cost: $0.0042, ·Duration: 3.2s',
    );
  });

  it('leaves out what was not measured and renders nothing when empty', () => {
    const { container, rerender } = render(
      <MessageUsage outputTokens={10} cost={null} inputTokens={Number.NaN} locale="en-US" />,
    );
    expect(container.querySelectorAll('[data-usage]').length).toBe(1);
    rerender(<MessageUsage />);
    expect(container.querySelector('[data-slot="message-usage"]')).toBeNull();
  });

  it('formats cost and time', () => {
    expect(formatCost(1.5, 'USD', 'en-US')).toBe('$1.50');
    expect(formatCost(0.0042, 'USD', 'en-US')).toBe('$0.0042');
    expect(formatCost(0, 'USD', 'en-US')).toBe('$0.00');
    expect(formatCost(2, 'XXZ', 'en-US')).toMatch(/2/);
    expect(formatElapsed(850, 'en-US')).toBe('850ms');
    expect(formatElapsed(65_000, 'en-US')).toBe('1m 5s');
  });
});

const images = [
  { src: 'https://x.test/a.png', alt: 'A bar chart' },
  { src: 'https://x.test/b.png', alt: 'A line chart', caption: 'b.png' },
  { src: 'javascript:alert(1)', alt: 'Bad image' },
];

describe('ImageLightbox', () => {
  it('opens from a thumbnail, moves with arrows and closes with Escape back to the thumbnail', async () => {
    render(<ImageGallery images={images} />);
    const thumb = screen.getByRole('button', { name: 'A bar chart' });
    await userEvent.click(thumb);
    const dialog = await screen.findByRole('dialog', { name: 'A bar chart' });
    expect(within(dialog).getByRole('status').textContent).toBe('Image 1 of 3');
    expect(
      within(dialog).getByRole('button', { name: 'Previous image' }).getAttribute('aria-disabled'),
    ).toBe('true');
    await userEvent.keyboard('{ArrowRight}');
    expect(within(dialog).getByRole('img', { name: 'A line chart' })).toBeTruthy();
    expect(within(dialog).getByText('b.png')).toBeTruthy();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Next image' }));
    // The unsafe URL never reaches an <img>.
    expect(within(dialog).getByRole('img', { name: 'Image unavailable: Bad image' }).tagName).toBe(
      'DIV',
    );
    expect(document.querySelector('img[src^="javascript"]')).toBeNull();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(thumb));
  });

  it('is controllable and shows a single image without navigation', () => {
    const onOpenChange = vi.fn();
    render(<ImageLightbox images={images.slice(0, 1)} open onOpenChange={onOpenChange} />);
    const dialog = screen.getByRole('dialog', { name: 'A bar chart' });
    expect(within(dialog).queryByRole('button', { name: 'Next image' })).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('opens MessageAttachments images in the viewer when asked', async () => {
    render(
      <MessageAttachments
        lightbox
        files={[
          { name: 'a.png', type: 'image/png', href: '/a.png', alt: 'Chart' },
          { name: 'n.txt', type: 'text/plain', href: '/n.txt' },
        ]}
      />,
    );
    expect(screen.queryByRole('link', { name: 'Chart' })).toBeNull();
    expect(screen.getByRole('link', { name: /n\.txt/ })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Chart' }));
    expect(await screen.findByRole('dialog', { name: 'Chart' })).toBeTruthy();
  });
});

describe('ArtifactPanel', () => {
  function mockNarrow(narrow: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({
        matches: narrow && query.includes('max-width'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
  }
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  function Demo() {
    const [open, setOpen] = React.useState(false);
    return (
      <ArtifactPanel
        open={open}
        onOpenChange={setOpen}
        title="report.md"
        description="Version 2"
        artifact={<p>Artifact body</p>}
      >
        <button type="button" onClick={() => setOpen(true)}>
          Open report
        </button>
      </ArtifactPanel>
    );
  }

  it('opens beside the conversation as a named region and returns focus on close', async () => {
    render(<Demo />);
    expect(screen.queryByText('Artifact body')).toBeNull();
    const opener = screen.getByRole('button', { name: 'Open report' });
    await userEvent.click(opener);
    const region = screen.getByRole('region', { name: 'report.md' });
    expect(region.getAttribute('aria-describedby')).toBeTruthy();
    expect(within(region).getByText('Artifact body')).toBeTruthy();
    expect(screen.getByRole('separator', { name: 'Resize artifact' })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.click(within(region).getByRole('button', { name: 'Close artifact' }));
    expect(screen.queryByRole('region', { name: 'report.md' })).toBeNull();
    await act(() => new Promise((r) => requestAnimationFrame(() => r(undefined))));
    expect(document.activeElement).toBe(opener);
  });

  it('becomes a sheet on smaller screens', async () => {
    mockNarrow(true);
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Open report' }));
    const sheet = await screen.findByRole('dialog', { name: 'report.md' });
    expect(within(sheet).getByText('Artifact body')).toBeTruthy();
    expect(screen.queryByRole('separator')).toBeNull();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
