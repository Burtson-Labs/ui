import CheckCircle from '@burtson-labs/icons/react/check-circle';
import CircleDashed from '@burtson-labs/icons/react/circle-dashed';
import X from '@burtson-labs/icons/react/x';
import * as React from 'react';

import { cn, focusRingClasses, touchTargetClasses } from '../lib/utils';

import { Progress } from './progress';

export interface ChecklistItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Set from real app events (a repo opened, a provider tested), never from a click on the list. */
  done: boolean;
  /** A button or link that starts the task. Hidden once done. */
  action?: React.ReactNode;
}

export interface OnboardingChecklistProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  items: ChecklistItem[];
  /** Shows a close button. Persist the dismissal yourself. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Replaces the list once every item is done. */
  complete?: React.ReactNode;
}

/**
 * A short list of first tasks with progress. The app decides when each task
 * is done and whether the list shows at all; this renders it.
 */
const OnboardingChecklist = React.forwardRef<HTMLElement, OnboardingChecklistProps>(
  function OnboardingChecklist(
    {
      title,
      description,
      items,
      onDismiss,
      dismissLabel = 'Dismiss checklist',
      complete,
      className,
      ...props
    },
    ref,
  ) {
    const titleId = React.useId();
    const done = items.filter((i) => i.done).length;
    const allDone = items.length > 0 && done === items.length;
    return (
      <section
        ref={ref}
        data-slot="onboarding-checklist"
        aria-labelledby={titleId}
        className={cn('rounded-lg border bg-card p-4 text-[13px] text-card-foreground', className)}
        {...props}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-sm font-semibold">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-muted-foreground">{description}</p>}
          </div>
          {onDismiss && (
            <button
              type="button"
              aria-label={dismissLabel}
              onClick={onDismiss}
              className={cn(
                '-me-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground',
                focusRingClasses,
                touchTargetClasses,
              )}
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Progress
            value={done}
            max={Math.max(items.length, 1)}
            aria-label={`${done} of ${items.length} done`}
            className="flex-1"
          />
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums" aria-hidden>
            {done}/{items.length}
          </span>
        </div>
        {allDone && complete ? (
          <div className="mt-3">{complete}</div>
        ) : (
          <ul className="mt-3 flex flex-col gap-1">
            {items.map((item) => (
              <li
                key={item.id}
                data-slot="onboarding-checklist-item"
                data-state={item.done ? 'done' : 'todo'}
                className="flex items-start gap-2.5 rounded-md px-1 py-1.5"
              >
                {item.done ? (
                  <CheckCircle aria-hidden className="mt-px size-4 shrink-0 text-success" />
                ) : (
                  <CircleDashed
                    aria-hidden
                    className="mt-px size-4 shrink-0 text-muted-foreground"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn('font-medium', item.done && 'text-muted-foreground line-through')}
                  >
                    {item.title}
                    <span className="sr-only">{item.done ? ', done' : ', not done'}</span>
                  </p>
                  {item.description && !item.done && (
                    <p className="mt-0.5 text-muted-foreground">{item.description}</p>
                  )}
                </div>
                {item.action && !item.done && <div className="shrink-0">{item.action}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  },
);

export { OnboardingChecklist };
