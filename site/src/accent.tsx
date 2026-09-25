import Check from '@burtson-labs/icons/react/check';
import * as React from 'react';

import { cn, Popover, PopoverContent, PopoverTrigger } from '@burtson-labs/ui';

export const ACCENTS = [
  { id: 'ink', label: 'Ink', swatch: '#18181b' },
  { id: 'violet', label: 'Violet (Burtson)', swatch: '#a60ee5' },
  { id: 'blue', label: 'Blue', swatch: '#2563eb' },
  { id: 'teal', label: 'Teal', swatch: '#0d9488' },
  { id: 'orange', label: 'Orange', swatch: '#ea580c' },
] as const;
export type Accent = (typeof ACCENTS)[number]['id'];

const KEY = 'bl-ui-accent';

function readAccent(): Accent {
  const attr = document.documentElement.dataset.accent;
  return ACCENTS.some((a) => a.id === attr) ? (attr as Accent) : 'ink';
}

export function useAccent(): [Accent, (a: Accent) => void] {
  const [accent, setState] = React.useState<Accent>(readAccent);
  React.useEffect(() => {
    const sync = () => setState(readAccent());
    window.addEventListener('bl-accent-change', sync);
    return () => window.removeEventListener('bl-accent-change', sync);
  }, []);
  const set = (a: Accent) => {
    document.documentElement.dataset.accent = a;
    try {
      localStorage.setItem(KEY, a);
    } catch (err) {
      // Not remembered this visit; the swatch still applies.
      void err;
    }
    setState(a);
    window.dispatchEvent(new Event('bl-accent-change'));
  };
  return [accent, set];
}

/** Swatches that re-theme the whole docs site, to show the tokens at work. */
export function AccentSwatches({ className }: { className?: string }) {
  const [accent, setAccent] = useAccent();
  return (
    <div role="radiogroup" aria-label="Accent colour" className={cn('flex gap-1.5', className)}>
      {ACCENTS.map((a, index) => (
        <button
          key={a.id}
          type="button"
          role="radio"
          aria-checked={accent === a.id}
          aria-label={a.label}
          title={a.label}
          tabIndex={accent === a.id ? 0 : -1}
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
          className="grid size-6 place-items-center rounded-full border border-border-strong outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
          style={{ background: a.swatch }}
        >
          {accent === a.id && <Check className="size-3.5 text-white" aria-hidden />}
        </button>
      ))}
    </div>
  );
}

export function AccentPicker() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Accent colour"
        className="grid size-8 place-items-center rounded-md outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/30"
      >
        <span className="size-4 rounded-full border border-border-strong bg-brand" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-3">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Accent</p>
        <AccentSwatches />
      </PopoverContent>
    </Popover>
  );
}
