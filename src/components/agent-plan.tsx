import ListChecks from '@burtson-labs/icons/react/list-checks';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';

export interface AgentPlanStep {
  id: string;
  title: string;
  description?: React.ReactNode;
}
export interface AgentPlanProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  title?: string;
  summary?: React.ReactNode;
  steps: AgentPlanStep[];
  state?: 'proposed' | 'approved' | 'rejected';
  busy?: boolean;
  onApprove?: () => void;
  onRevise?: () => void;
}

/** Review a proposed plan before execution. The app records approval and starts work. */
export function AgentPlan({
  title = 'Proposed plan',
  summary,
  steps,
  state = 'proposed',
  busy = false,
  onApprove,
  onRevise,
  className,
  children,
  ...props
}: AgentPlanProps) {
  const id = React.useId();
  return (
    <section
      data-slot="agent-plan"
      data-state={state}
      aria-labelledby={id}
      aria-busy={busy || undefined}
      className={cn('grid min-w-0 gap-4 rounded-lg border border-border bg-surface p-5', className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ListChecks aria-hidden className="size-4 shrink-0 text-brand" />
        <h3 id={id} className="min-w-0 flex-1 text-sm font-semibold break-words">
          {title}
        </h3>
        <span role="status" className="text-xs text-muted-foreground">
          {state === 'proposed'
            ? 'For your review'
            : state === 'approved'
              ? 'Plan approved'
              : 'Changes requested'}
        </span>
      </div>
      {summary && <div className="text-sm leading-relaxed text-muted-foreground">{summary}</div>}
      <ol className="grid gap-4" aria-label="Planned steps">
        {steps.map((step, index) => (
          <li key={step.id} className="flex min-w-0 gap-3">
            <span
              aria-hidden
              className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-xs tabular-nums text-muted-foreground"
            >
              {index + 1}
            </span>
            <div className="grid min-w-0 gap-1">
              <span className="text-sm font-medium break-words">{step.title}</span>
              {step.description && (
                <div className="text-xs leading-relaxed break-words text-muted-foreground">
                  {step.description}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {children}
      {state === 'proposed' && (onApprove || onRevise) && (
        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          {onRevise && (
            <Button variant="outline" onClick={onRevise} disabled={busy}>
              Request changes
            </Button>
          )}
          {onApprove && (
            <Button onClick={onApprove} loading={busy} disabled={busy || steps.length === 0}>
              Approve plan
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
