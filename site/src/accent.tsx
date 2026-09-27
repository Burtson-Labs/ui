import Check from '@burtson-labs/icons/react/check';
import * as React from 'react';

import {
  accentPresets,
  accentTokens,
  cn,
  Input,
  NativeSelect,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useTheme,
  type ThemePreference,
} from '@burtson-labs/ui';

import { Code } from './code';

export const ACCENTS = Object.entries(accentPresets).map(([id, swatch]) => ({
  id: id as keyof typeof accentPresets,
  label: id === 'violet' ? 'Violet (Burtson)' : id[0]!.toUpperCase() + id.slice(1),
  swatch,
}));
export type Accent = keyof typeof accentPresets | 'custom';
interface Appearance {
  accent: Accent;
  custom: string;
  radius: 'square' | 'soft' | 'round';
  density: 'comfortable' | 'compact';
}
const defaults: Appearance = {
  accent: 'ink',
  custom: '#6366f1',
  radius: 'soft',
  density: 'comfortable',
};
const KEY = 'bl-ui-appearance';
const EVENT = 'bl-accent-change';
const radius = { square: '0px', soft: '0.625rem', round: '1rem' };
let memory: Appearance | undefined;
function readAppearance(): Appearance {
  if (memory) return memory;
  let saved: Partial<Appearance> = {};
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) || '{}');
    saved = parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    /* Optional browser state. */
  }
  const attr = document.documentElement.dataset.accent;
  const accent =
    attr === 'custom' || ACCENTS.some((a) => a.id === attr) ? (attr as Accent) : saved.accent;
  return {
    accent: accent === 'custom' || ACCENTS.some((a) => a.id === accent) ? accent! : 'ink',
    custom: /^#[0-9a-f]{6}$/i.test(saved.custom ?? '') ? saved.custom! : defaults.custom,
    radius: saved.radius === 'square' || saved.radius === 'round' ? saved.radius : 'soft',
    density: saved.density === 'compact' ? 'compact' : 'comfortable',
  };
}
function useAppearance(): [Appearance, (patch: Partial<Appearance>) => void] {
  const [state, setState] = React.useState(readAppearance);
  React.useEffect(() => {
    const sync = () => setState(readAppearance());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return [
    state,
    (patch) => {
      memory = { ...readAppearance(), ...patch };
      document.documentElement.dataset.accent = memory.accent;
      try {
        localStorage.setItem(KEY, JSON.stringify(memory));
        localStorage.setItem('bl-ui-accent', memory.accent);
      } catch {
        /* Apply in memory. */
      }
      window.dispatchEvent(new Event(EVENT));
    },
  ];
}
export function useAccent(): [Accent, (accent: Accent) => void] {
  const [appearance, update] = useAppearance();
  return [appearance.accent, (accent) => update({ accent })];
}
export function AppearanceSync() {
  const [appearance] = useAppearance();
  const { resolvedTheme } = useTheme();
  React.useEffect(() => {
    const root = document.documentElement;
    const color =
      appearance.accent === 'custom' ? appearance.custom : accentPresets[appearance.accent];
    const tokens = accentTokens(color, resolvedTheme);
    root.dataset.accent = appearance.accent;
    for (const [name, value] of Object.entries(tokens)) {
      if (appearance.accent === 'ink') root.style.removeProperty(`--${name}`);
      else root.style.setProperty(`--${name}`, value);
    }
    root.style.setProperty('--radius', radius[appearance.radius]);
    root.style.setProperty(
      '--control-height',
      appearance.density === 'compact' ? '2rem' : '2.25rem',
    );
  }, [appearance, resolvedTheme]);
  return null;
}

/** Swatches re-theme the docs and stay in sync with the custom editor. */
export function AccentSwatches({ className }: { className?: string }) {
  const [accent, setAccent] = useAccent();
  return (
    <div
      role="radiogroup"
      aria-label="Accent colour"
      className={cn('flex flex-wrap gap-2 pointer-coarse:gap-3', className)}
    >
      {ACCENTS.map((a, index) => (
        <button
          key={a.id}
          type="button"
          role="radio"
          aria-checked={accent === a.id}
          aria-label={a.label}
          title={a.label}
          tabIndex={accent === a.id || (accent === 'custom' && index === 0) ? 0 : -1}
          onKeyDown={(event) => {
            const next = ['ArrowRight', 'ArrowDown'].includes(event.key)
              ? (index + 1) % ACCENTS.length
              : ['ArrowLeft', 'ArrowUp'].includes(event.key)
                ? (index + ACCENTS.length - 1) % ACCENTS.length
                : event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? ACCENTS.length - 1
                    : null;
            if (next !== null) {
              event.preventDefault();
              setAccent(ACCENTS[next]!.id);
              event.currentTarget.parentElement
                ?.querySelectorAll<HTMLButtonElement>('button')
                [next]?.focus();
            }
          }}
          onClick={() => setAccent(a.id)}
          className="grid size-6 place-items-center rounded-full border border-border-strong outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring pointer-coarse:size-11"
          style={{ background: a.swatch }}
        >
          {accent === a.id && <Check className="size-3.5 text-white" aria-hidden />}
        </button>
      ))}
    </div>
  );
}
function ModeSelect() {
  const { theme, setTheme } = useTheme();
  const id = React.useId();
  return (
    <div className="grid gap-2 text-xs font-medium">
      <label htmlFor={id}>Mode</label>
      <NativeSelect
        id={id}
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemePreference)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </NativeSelect>
    </div>
  );
}
export function AccentPicker() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Appearance settings"
        className="grid size-8 place-items-center rounded-md outline-none hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring pointer-coarse:size-11"
      >
        <span className="size-4 rounded-full border border-border-strong bg-brand" />
      </PopoverTrigger>
      <PopoverContent align="end" className="grid w-72 gap-4 p-4">
        <ModeSelect />
        <div className="grid gap-2">
          <p className="text-xs font-medium">Accent</p>
          <AccentSwatches />
        </div>
        <a href="/docs/theming" className="text-xs text-brand underline underline-offset-4">
          Customize colors, radius and density
        </a>
      </PopoverContent>
    </Popover>
  );
}
export function ThemeEditor() {
  const [appearance, update] = useAppearance();
  const [hex, setHex] = React.useState(appearance.custom);
  const color =
    appearance.accent === 'custom' ? appearance.custom : accentPresets[appearance.accent];
  const palette = (mode: 'light' | 'dark') => {
    const base = accentTokens(color, mode);
    if (appearance.accent !== 'ink') return base;
    return mode === 'dark'
      ? {
          ...base,
          primary: '#fafafa',
          'primary-foreground': '#09090b',
          brand: '#fafafa',
          'brand-hover': '#d4d4d8',
          'brand-soft': '#27272a',
          'brand-soft-foreground': '#fafafa',
          accent: '#27272a',
          'accent-foreground': '#fafafa',
          ring: '#a1a1aa',
        }
      : {
          ...base,
          primary: '#18181b',
          'primary-foreground': '#ffffff',
          brand: '#18181b',
          'brand-hover': '#3f3f46',
          'brand-soft': '#f4f4f5',
          'brand-soft-foreground': '#18181b',
          accent: '#f4f4f5',
          'accent-foreground': '#18181b',
          ring: '#71717a',
        };
  };
  const vars = (mode: 'light' | 'dark') =>
    Object.entries(palette(mode))
      .map(([k, v]) => `  --${k}: ${v};`)
      .join('\n');
  const css = `:root {\n  --radius: ${radius[appearance.radius]};\n  --control-height: ${appearance.density === 'compact' ? '2rem' : '2.25rem'};\n${vars('light')}\n}\n.dark, [data-theme='dark'] {\n${vars('dark')}\n}`;
  const invalid = !/^#[0-9a-f]{6}$/i.test(hex);
  const id = React.useId();
  return (
    <section
      aria-label="Theme editor"
      className="my-8 grid gap-5 rounded-lg border border-border bg-surface p-5"
    >
      <div>
        <h2 className="text-lg font-semibold">Make it yours</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preview changes across this site. Copy both palettes into your app.
        </p>
      </div>
      <ModeSelect />
      <AccentSwatches />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-medium">
          Custom accent
          <input
            type="color"
            aria-label="Pick custom accent"
            value={appearance.custom}
            className="h-11 w-full cursor-pointer rounded-md border border-input bg-surface p-1"
            onChange={(e) => {
              setHex(e.target.value);
              update({ accent: 'custom', custom: e.target.value });
            }}
          />
        </label>
        <label className="grid gap-2 text-xs font-medium">
          Hex color
          <Input
            value={hex}
            maxLength={7}
            spellCheck={false}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${id}-error` : undefined}
            onChange={(e) => {
              setHex(e.target.value);
              if (/^#[0-9a-f]{6}$/i.test(e.target.value))
                update({ accent: 'custom', custom: e.target.value });
            }}
          />
          {invalid && (
            <span id={`${id}-error`} className="text-destructive">
              Use six hex digits, such as #6366f1.
            </span>
          )}
        </label>
        <div className="grid gap-2 text-xs font-medium">
          <label htmlFor={`${id}-radius`}>Corners</label>
          <NativeSelect
            id={`${id}-radius`}
            value={appearance.radius}
            onChange={(e) => update({ radius: e.target.value as Appearance['radius'] })}
          >
            <option value="square">Square</option>
            <option value="soft">Soft</option>
            <option value="round">Round</option>
          </NativeSelect>
        </div>
        <div className="grid gap-2 text-xs font-medium">
          <label htmlFor={`${id}-density`}>Control density</label>
          <NativeSelect
            id={`${id}-density`}
            value={appearance.density}
            onChange={(e) => update({ density: e.target.value as Appearance['density'] })}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </NativeSelect>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Primary text colors are derived for contrast. Compact controls keep 44px touch targets. Your
        choices are saved in this browser.
      </p>
      <details className="min-w-0">
        <summary className="cursor-pointer py-2 text-sm font-medium">Export theme CSS</summary>
        <Code lang="css" code={css} />
      </details>
    </section>
  );
}
