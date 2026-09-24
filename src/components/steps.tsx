import Check from '@burtson-labs/icons/react/check';
import * as React from 'react';

import { cn } from '../lib/utils';

export interface StepItem {
  title: React.ReactNode;
  description?: React.ReactNode;
}

export interface StepsProps extends React.ComponentProps<'ol'> {
  items: StepItem[];
  /** 0-based index of the step in progress; earlier steps show as done. */
  current: number;
  orientation?: 'horizontal' | 'vertical';
}

/** Progress through a short multi-step flow (a wizard, an onboarding). */
function Steps({ items, current, orientation = 'horizontal', className, ...props }: StepsProps) {
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
        return (
          <li
            key={i}
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
            className={cn(
              'flex min-w-0 items-start gap-2.5',
              orientation === 'horizontal' && 'flex-1',
            )}
          >
            <span
              className={cn(
                'grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular-nums',
                state === 'complete' && 'border-brand bg-brand text-primary-foreground',
                state === 'current' && 'border-brand bg-brand-soft text-brand',
                state === 'upcoming' && 'border-border-strong text-muted-foreground',
              )}
            >
              {state === 'complete' ? <Check className="size-3.5" aria-hidden /> : i + 1}
            </span>
            <span className="grid min-w-0 gap-0.5 pt-0.5">
              <span
                className={cn(
                  'truncate text-[13px] font-semibold',
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
          </li>
        );
      })}
    </ol>
  );
}

export { Steps };
