import ListChecks from '@burtson-labs/icons/react/list-checks';
import * as React from 'react';

import { cn, headingTag, type HeadingLevel } from '../lib/utils';

import { Button } from './button';

export interface AgentPlanStep {
  id: string;
  title: string;
  description?: React.ReactNode;
}
export interface AgentPlanProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  title?: string;
  /** The title's heading rank, 2 to 6, to fit the page outline. Default 3. */
  headingLevel?: HeadingLevel;
  summary?: React.ReactNode;
  steps: AgentPlanStep[];
  state?: 'proposed' | 'approved' | 'rejected';
  busy?: boolean;
  onApprove?: () => void;
  onRevise?: () => void;
  /** Built-in text, for translation. */
  labels?: Partial<typeof agentPlanLabels>;
}

const agentPlanLabels = {
  title: 'Proposed plan',
  proposed: 'For your review',
  approved: 'Plan approved',
  rejected: 'Changes requested',
  steps: 'Planned steps',
  revise: 'Request changes',
  approve: 'Approve plan',
};

/** Review a proposed plan before execution. The app records approval and starts work. */
export const AgentPlan = React.forwardRef<HTMLElement, AgentPlanProps>(function AgentPlan(
  {
    title,
    headingLevel,
    summary,
    steps,
    state = 'proposed',
    busy = false,
    onApprove,
    onRevise,
    labels,
    className,
    children,
    ...props
  },
  ref,
) {
  const id = React.useId();
  const l = { ...agentPlanLabels, ...labels };
  return (
    <section
      ref={ref}
      data-slot="agent-plan"
      data-state={state}
      aria-labelledby={id}
      aria-busy={busy || undefined}
      className={cn('grid min-w-0 gap-4 rounded-lg border border-border bg-surface p-5', className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ListChecks aria-hidden className="size-4 shrink-0 text-brand" />
        {React.createElement(
          headingTag(headingLevel),
          { id, className: 'min-w-0 flex-1 text-sm font-semibold break-words' },
          title ?? l.title,
        )}
        <span role="status" className="text-xs text-muted-foreground">
          {l[state]}
        </span>
      </div>
      {summary && <div className="text-sm leading-relaxed text-muted-foreground">{summary}</div>}
      <ol className="grid gap-4" aria-label={l.steps}>
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
              {l.revise}
            </Button>
          )}
          {onApprove && (
            <Button onClick={onApprove} loading={busy} disabled={busy || steps.length === 0}>
              {l.approve}
            </Button>
          )}
        </div>
      )}
    </section>
  );
});
