import Check from '@burtson-labs/icons/react/check';
import * as React from 'react';

import { cn } from '../lib/utils';

export interface StepItem {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export type StepsBreakpoint = 'sm' | 'md' | 'lg';

export interface StepsProps extends React.ComponentProps<'ol'> {
  items: StepItem[];
  /** 0-based index of the step in progress; earlier steps show as done. */
  current: number;
  orientation?: 'horizontal' | 'vertical';
  /**
   * Below this width a horizontal Steps shows only where you are: the step's
   * title, "Step 2 of 5" and a segmented progress bar. `sm` (640px) by
   * default for horizontal steps; `false` keeps every step visible.
   */
  compactBelow?: StepsBreakpoint | false;
  /** The compact counter's text. */
  formatCounter?: (step: number, total: number) => string;
}

// Written out in full per breakpoint so Tailwind finds every class.
const compactClasses: Record<
  StepsBreakpoint,
  { other: string; item: string; marker: string; counter: string; bar: string; text: string }
> = {
  sm: {
    other: 'max-sm:hidden',
    item: 'max-sm:grid max-sm:grid-cols-[minmax(0,1fr)_auto] max-sm:items-baseline max-sm:gap-x-3 max-sm:gap-y-2',
    marker: 'max-sm:hidden',
    counter: 'hidden max-sm:block',
    bar: 'hidden max-sm:flex max-sm:col-span-2',
    text: 'max-sm:pt-0',
  },
  md: {
    other: 'max-md:hidden',
    item: 'max-md:grid max-md:grid-cols-[minmax(0,1fr)_auto] max-md:items-baseline max-md:gap-x-3 max-md:gap-y-2',
    marker: 'max-md:hidden',
    counter: 'hidden max-md:block',
    bar: 'hidden max-md:flex max-md:col-span-2',
    text: 'max-md:pt-0',
  },
  lg: {
    other: 'max-lg:hidden',
    item: 'max-lg:grid max-lg:grid-cols-[minmax(0,1fr)_auto] max-lg:items-baseline max-lg:gap-x-3 max-lg:gap-y-2',
    marker: 'max-lg:hidden',
    counter: 'hidden max-lg:block',
    bar: 'hidden max-lg:flex max-lg:col-span-2',
    text: 'max-lg:pt-0',
  },
};

/**
 * Progress through a short multi-step flow (a wizard, an onboarding). On a
 * phone a horizontal Steps collapses to the current step, "Step 2 of 5" and
 * a progress bar, instead of squeezing every title into a few letters.
 */
function Steps({
  items,
  current,
  orientation = 'horizontal',
  compactBelow = orientation === 'horizontal' ? 'sm' : false,
  formatCounter = (step, total) => `Step ${step} of ${total}`,
  className,
  ...props
}: StepsProps) {
  const compact = compactBelow ? compactClasses[compactBelow] : null;
  // The step the compact form shows: the current one, or the last when all are done.
  const focus = Math.min(Math.max(0, current), items.length - 1);
  return (
    <ol
      data-slot="steps"
      data-orientation={orientation}
      className={cn(
        'flex gap-3',
        orientation === 'horizontal' ? 'flex-row items-start' : 'flex-col',
        className,
      )}
      {...props}
    >
      {items.map((item, i) => {
        const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
        const isFocus = compact && i === focus;
        return (
          <li
            key={i}
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
            className={cn(
              'flex min-w-0 items-start gap-2.5',
              orientation === 'horizontal' && 'flex-1',
              compact && (isFocus ? compact.item : compact.other),
            )}
          >
            <span
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums',
                state === 'complete' && 'border-primary bg-primary text-primary-foreground',
                state === 'current' && 'border-brand bg-brand-soft text-brand',
                state === 'upcoming' && 'border-border-strong text-muted-foreground',
                isFocus && compact.marker,
              )}
            >
              {state === 'complete' ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className={cn('grid min-w-0 gap-0.5 pt-0.5', isFocus && compact.text)}>
              <span
                className={cn(
                  'break-words text-[13px] font-semibold',
                  state === 'upcoming' && 'text-muted-foreground',
                )}
              >
                {item.title}
                <span className="sr-only">
                  {state === 'complete' ? ' (done)' : state === 'current' ? ' (current)' : ''}
                </span>
              </span>
              {item.description && (
                <span className="text-xs text-muted-foreground">{item.description}</span>
              )}
            </span>
            {isFocus && (
              <>
                <span
                  data-slot="steps-counter"
                  className={cn(
                    'text-xs whitespace-nowrap text-muted-foreground tabular-nums',
                    compact.counter,
                  )}
                >
                  {formatCounter(focus + 1, items.length)}
                </span>
                <span data-slot="steps-bar" aria-hidden className={cn('gap-1', compact.bar)}>
                  {items.map((_, j) => (
                    <span
                      key={j}
                      className={cn(
                        'h-1 flex-1 rounded-full',
                        j <= current ? 'bg-brand' : 'bg-muted',
                      )}
                    />
                  ))}
                </span>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export { Steps };
