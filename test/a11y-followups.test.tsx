import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AgentPlan,
  AgentRun,
  AskUser,
  ContextUsage,
  DEFAULT_THEME_STORAGE_KEY,
  focusRingClasses,
  LoadingDots,
  StreamingIndicator,
  ThemeProvider,
  themeInitScript,
  themeInitScriptHash,
  useTheme,
} from '@burtson-labs/ui';

import { themeInitFile } from '../src/lib/theme-init';

const ROOT = join(import.meta.dirname, '..');
const html = document.documentElement;
const stubDark = (matches: boolean) =>
  vi.stubGlobal('matchMedia', () => ({
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
// The script is text for a <script> tag; jsdom does not run inserted scripts,
// so the test runs the text directly.
const run = (source: string): void => {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  (new Function(source) as () => void)();
};

describe('theme init script', () => {
  beforeEach(() => stubDark(false));
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    html.className = '';
    delete html.dataset.theme;
    html.style.colorScheme = '';
  });

  it('applies the saved theme the way ThemeProvider does', () => {
    expect(DEFAULT_THEME_STORAGE_KEY).toBe('bl-theme');
    localStorage.setItem('bl-theme', 'dark');
    run(themeInitScript());
    expect(html.classList.contains('dark')).toBe(true);
    expect(html.dataset.theme).toBe('dark');
    expect(html.style.colorScheme).toBe('dark');
  });

  it('follows the system for system, missing or invalid values', () => {
    stubDark(true);
    localStorage.setItem('bl-theme', 'neon');
    run(themeInitScript());
    expect(html.dataset.theme).toBe('dark');
    stubDark(false);
    run(themeInitScript({ defaultTheme: 'dark' }));
    expect(html.dataset.theme).toBe('dark');
  });

  it('reads legacy keys and a query parameter', () => {
    localStorage.setItem('bl-ui-theme', 'dark');
    run(themeInitScript({ legacyStorageKeys: ['bl-ui-theme'] }));
    expect(html.dataset.theme).toBe('dark');
    localStorage.setItem('bl-theme', 'light');
    run(themeInitScript({ legacyStorageKeys: ['bl-ui-theme'] }));
    expect(html.dataset.theme).toBe('light');
    window.history.replaceState(null, '', '/?theme=dark');
    try {
      run(themeInitScript({ queryParam: 'theme' }));
      expect(html.dataset.theme).toBe('dark');
    } finally {
      window.history.replaceState(null, '', '/');
    }
  });

  it('falls back to the default theme when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    expect(() => run(themeInitScript({ defaultTheme: 'dark' }))).not.toThrow();
    expect(html.dataset.theme).toBe('dark');
  });

  it('refuses keys that are not plain names', () => {
    for (const bad of ['', 'a"b', "x');alert(1)//", '</script>', 'a b', 'x'.repeat(65)]) {
      expect(() => themeInitScript({ storageKey: bad })).toThrow(TypeError);
      expect(() => themeInitScript({ legacyStorageKeys: [bad] })).toThrow(TypeError);
      expect(() => themeInitScript({ queryParam: bad })).toThrow(TypeError);
    }
    expect(() => themeInitScript({ defaultTheme: 'blue' as unknown as 'dark' })).toThrow(TypeError);
    expect(themeInitScript({ storageKey: 'app.theme:v2_x-y' })).toContain('"app.theme:v2_x-y"');
  });

  it('hashes the exact script text for a CSP', async () => {
    const options = { storageKey: 'app-theme' };
    const expected = createHash('sha256').update(themeInitScript(options)).digest('base64');
    expect(await themeInitScriptHash(options)).toBe(`'sha256-${expected}'`);
  });

  it('configures the static file from its script element and ignores unsafe values', () => {
    const script = document.createElement('script');
    script.dataset.storageKey = 'app-theme';
    script.dataset.legacyStorageKeys = 'old-theme, bad"key';
    Object.defineProperty(document, 'currentScript', { value: script, configurable: true });
    try {
      localStorage.setItem('old-theme', 'dark');
      run(themeInitFile());
      expect(html.dataset.theme).toBe('dark');
      script.dataset.storageKey = 'bad key';
      localStorage.clear();
      localStorage.setItem('bl-theme', 'dark');
      html.dataset.theme = '';
      run(themeInitFile());
      expect(html.dataset.theme).toBe('dark');
    } finally {
      Reflect.deleteProperty(document, 'currentScript');
    }
  });

  it('is exported as a package file and the docs site uses the shared key', () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>;
    };
    expect(pkg.exports['./theme-init.js']).toBe('./dist/theme-init.js');
    const site = readFileSync(join(ROOT, 'site/public/theme-init.js'), 'utf8');
    expect(site).toContain("localStorage.getItem('bl-theme')");
    expect(readFileSync(join(ROOT, 'site/src/main.tsx'), 'utf8')).toContain("'bl-theme'");
  });
});

function Preference() {
  return <span data-testid="preference">{useTheme().theme}</span>;
}

describe('ThemeProvider legacy keys', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    html.className = '';
    delete html.dataset.theme;
  });

  it('moves a preference saved under an older key', () => {
    stubDark(false);
    localStorage.setItem('bl-ui-theme', 'dark');
    render(
      <ThemeProvider legacyStorageKeys={['bl-ui-theme']}>
        <Preference />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('preference').textContent).toBe('dark');
    expect(localStorage.getItem('bl-theme')).toBe('dark');
    expect(localStorage.getItem('bl-ui-theme')).toBeNull();
    expect(html.dataset.theme).toBe('dark');
  });

  it('prefers the current key over a legacy one', () => {
    stubDark(false);
    localStorage.setItem('bl-theme', 'light');
    localStorage.setItem('bl-ui-theme', 'dark');
    render(
      <ThemeProvider legacyStorageKeys={['bl-ui-theme']}>
        <Preference />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('preference').textContent).toBe('light');
  });
});

describe('AskUser follow-ups', () => {
  const question = {
    id: 'format',
    prompt: 'Choose a format',
    description: 'Pick one.',
    options: [
      { value: 'csv', label: 'CSV' },
      { value: 'pdf', label: 'PDF' },
    ],
  };

  it('describes a question by both its description and its error', async () => {
    render(<AskUser questions={[question]} onSubmit={() => {}} />);
    const group = screen.getByRole('group', { name: /Choose a format/ });
    const ids = () => (group.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
    expect(ids()).toHaveLength(1);
    expect(document.getElementById(ids()[0]!)?.textContent).toBe('Pick one.');
    await userEvent.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(ids()).toHaveLength(2);
    expect(ids().map((id) => document.getElementById(id)?.textContent)).toEqual([
      'Pick one.',
      'An answer is required.',
    ]);
  });

  it('uses the shared focus ring on its options', () => {
    render(<AskUser questions={[question]} onSubmit={() => {}} />);
    const radio = screen.getByRole('radio', { name: 'CSV' });
    for (const cls of focusRingClasses.split(' ')) expect(radio.classList).toContain(cls);
    expect(radio.closest('label')?.className).not.toContain('has-[:focus-visible]');
  });

  it('takes labels for every built-in string, and the older label props still win', async () => {
    const { rerender } = render(
      <AskUser
        questions={[question, { id: 'note', prompt: 'Notes', required: false }]}
        onSubmit={() => {}}
        labels={{
          submit: 'Envoyer',
          skip: 'Plus tard',
          required: '(obligatoire)',
          optional: 'Facultatif',
          answer: 'Votre réponse',
          answerRequired: 'Réponse requise.',
          missingAnswers: 'Répondez aux questions obligatoires.',
        }}
        onSkip={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Plus tard' })).toBeTruthy();
    expect(screen.getByText('Facultatif')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Votre réponse' })).toBeTruthy();
    expect(screen.getByRole('group', { name: /Choose a format.*\(obligatoire\)/ })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Envoyer' }));
    expect(screen.getByRole('alert').textContent).toBe('Répondez aux questions obligatoires.');
    expect(screen.getByText('Réponse requise.')).toBeTruthy();
    rerender(
      <AskUser
        questions={[question]}
        onSubmit={() => {}}
        labels={{ submit: 'Envoyer' }}
        submitLabel="Submit"
      />,
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeTruthy();
  });

  it('announces sending and sent with custom labels', async () => {
    let finish!: () => void;
    render(
      <AskUser
        questions={[{ id: 'goal', prompt: 'Goal?' }]}
        onSubmit={() => new Promise<void>((r) => (finish = r))}
        labels={{ sending: 'Envoi…', sent: 'Envoyé' }}
      />,
    );
    await userEvent.type(screen.getByRole('textbox'), 'x');
    await userEvent.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(screen.getByRole('status').textContent).toBe('Envoi…');
    await act(async () => {
      finish();
      await Promise.resolve();
    });
    expect(screen.getByRole('status').textContent).toBe('Envoyé');
  });
});

describe('heading levels', () => {
  const step = [{ id: 'a', title: 'Read', label: 'Read', state: 'completed' as const }];
  it('defaults to h3 and accepts 2 to 6', () => {
    const { rerender } = render(
      <>
        <AgentRun title="Run" state="running" steps={step} />
        <AgentPlan title="Plan" steps={step} />
        <AskUser title="Ask" questions={[]} onSubmit={() => {}} />
      </>,
    );
    for (const name of ['Run', 'Plan', 'Ask'])
      expect(screen.getByRole('heading', { name, level: 3 })).toBeTruthy();
    rerender(
      <>
        <AgentRun title="Run" state="running" steps={step} headingLevel={2} />
        <AgentPlan title="Plan" steps={step} headingLevel={4} />
        <AskUser title="Ask" questions={[]} onSubmit={() => {}} headingLevel={6} />
      </>,
    );
    expect(screen.getByRole('heading', { name: 'Run', level: 2 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Plan', level: 4 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Ask', level: 6 })).toBeTruthy();
    // The landmark keeps its name from the heading at any level.
    expect(screen.getByRole('region', { name: 'Run' })).toBeTruthy();
    expect(screen.getByRole('form', { name: 'Ask' })).toBeTruthy();
  });
  it('falls back to h3 for an out-of-range level from untyped callers', () => {
    render(<AgentPlan title="Plan" steps={[]} headingLevel={9 as 3} />);
    expect(screen.getByRole('heading', { name: 'Plan', level: 3 })).toBeTruthy();
  });
});

describe('ContextUsage announcements', () => {
  it('announces only when a threshold is crossed', () => {
    const { rerender } = render(<ContextUsage used={1000} limit={100000} locale="en-US" />);
    const status = screen.getByRole('status');
    expect(status.textContent).toBe('');
    rerender(<ContextUsage used={50000} limit={100000} locale="en-US" />);
    expect(screen.getByRole('status')).toBe(status);
    expect(status.textContent).toBe('');
    rerender(<ContextUsage used={81000} limit={100000} locale="en-US" />);
    expect(status.textContent).toBe('Context is filling up.');
    rerender(<ContextUsage used={85000} limit={100000} locale="en-US" />);
    expect(status.textContent).toBe('Context is filling up.');
    rerender(<ContextUsage used={96000} limit={100000} locale="en-US" />);
    expect(status.textContent).toMatch(/^Almost full/);
    rerender(<ContextUsage used={96000} limit={100000} locale="en-US" busy />);
    expect(status.textContent).toBe('Compacting context…');
    // The count itself is not in a live region.
    expect(screen.getByText('96,000 of 100,000 tokens').closest('[role=status]')).toBeNull();
  });

  it('formats counts in the given locale and translates its text', () => {
    render(
      <ContextUsage
        used={171000}
        limit={200000}
        locale="de-DE"
        onCompact={() => {}}
        labels={{
          summary: (used, limit) => `${used} von ${limit} Tokens`,
          warning: 'Der Kontext füllt sich.',
          compact: 'Kontext verdichten',
        }}
      />,
    );
    expect(screen.getByText('171.000 von 200.000 Tokens')).toBeTruthy();
    expect(screen.getByRole('meter').getAttribute('aria-valuetext')).toBe(
      '171.000 von 200.000 Tokens',
    );
    expect(screen.getByRole('status').textContent).toBe('Der Kontext füllt sich.');
    expect(screen.getByRole('button', { name: 'Kontext verdichten' })).toBeTruthy();
  });

  it("uses the reader's locale by default", () => {
    render(<ContextUsage used={12345} limit={100000} />);
    const text = `${(12345).toLocaleString()} of ${(100000).toLocaleString()} tokens`;
    expect(screen.getByText(text)).toBeTruthy();
  });
});

describe('LoadingDots and StreamingIndicator', () => {
  it('render one labelled status each, the same way', () => {
    const dots = React.createRef<HTMLSpanElement>();
    const typing = React.createRef<HTMLSpanElement>();
    render(
      <>
        <LoadingDots ref={dots} label="Thinking" />
        <StreamingIndicator ref={typing} />
      </>,
    );
    const statuses = screen.getAllByRole('status');
    expect(statuses).toHaveLength(2);
    expect(screen.getByRole('status', { name: 'Thinking' })).toBe(dots.current);
    expect(screen.getByRole('status', { name: 'Assistant is typing' })).toBe(typing.current);
    expect(typing.current?.dataset.slot).toBe('streaming-indicator');
    expect(dots.current?.dataset.slot).toBe('loading-dots');
    for (const el of statuses) {
      expect(el.querySelectorAll('[role=status]')).toHaveLength(0);
      expect(el.querySelector('[aria-hidden]')?.children).toHaveLength(3);
    }
    expect(typing.current?.textContent).toBe('Assistant is typing');
  });
  it('StreamingIndicator keeps its label prop and gains showLabel', () => {
    render(<StreamingIndicator label="Writing" showLabel />);
    const status = screen.getByRole('status', { name: 'Writing' });
    expect(status.querySelector('.sr-only')).toBeNull();
  });
});
