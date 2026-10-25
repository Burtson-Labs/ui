import AlertCircle from '@burtson-labs/icons/react/alert-circle';
import Check from '@burtson-labs/icons/react/check';
import Circle from '@burtson-labs/icons/react/circle';
import Pause from '@burtson-labs/icons/react/pause';
import * as React from 'react';

import { cn, headingTag, type HeadingLevel } from '../lib/utils';

import { Button } from './button';
import { Spinner } from './spinner';

export type AgentRunState =
  'queued' | 'running' | 'waiting' | 'paused' | 'completed' | 'failed' | 'canceled';
export interface AgentRunStep {
  id: string;
  label: string;
  state: AgentRunState;
  detail?: React.ReactNode;
}
export interface AgentRunProps extends Omit<React.ComponentProps<'section'>, 'title'> {
  title: string;
  /** The title's heading rank, 2 to 6, to fit the page outline. Default 3. */
  headingLevel?: HeadingLevel;
  state: AgentRunState;
  steps: AgentRunStep[];
  /** Explain the current state, especially what a person needs to do next. */
  summary?: React.ReactNode;
  busy?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
  /** Built-in text, for translation. State names go in `labels.states`. */
  labels?: Partial<typeof agentRunLabels> & {
    states?: Partial<Record<AgentRunState, string>>;
  };
}
const agentRunLabels = {
  steps: 'Run steps',
  cancel: 'Cancel run',
  pause: 'Pause run',
  resume: 'Resume run',
  retry: 'Retry run',
};
const stateLabels: Record<AgentRunState, string> = {
  queued: 'Queued',
  running: 'Running',
  waiting: 'Needs your input',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
  canceled: 'Canceled',
};
function RunIcon({ state }: { state: AgentRunState }) {
  // The state is announced once, as text, by the caller; the spinner is decoration.
  if (state === 'running')
    return <Spinner className="size-4" role={undefined} aria-label={undefined} aria-hidden />;
  const Icon =
    state === 'completed'
      ? Check
      : state === 'failed' || state === 'waiting'
        ? AlertCircle
        : state === 'paused'
          ? Pause
          : Circle;
  return (
    <Icon
      aria-hidden
      className={cn(
        'size-4',
        state === 'completed' && 'text-success',
        state === 'failed' && 'text-destructive',
        state === 'waiting' && 'text-warning',
      )}
    />
  );
}

/** A controlled run timeline. The application owns execution, cancellation and retry. */
export const AgentRun = React.forwardRef<HTMLElement, AgentRunProps>(function AgentRun(
  {
    title,
    state,
    steps,
    headingLevel,
    summary,
    busy = false,
    onPause,
    onResume,
    onCancel,
    onRetry,
    labels,
    children,
    className,
    ...props
  },
  ref,
) {
  const id = React.useId();
  const l = { ...agentRunLabels, ...labels };
  const states = { ...stateLabels, ...labels?.states };
  const active = ['queued', 'running', 'waiting', 'paused'].includes(state);
  return (
    <section
      ref={ref}
      data-slot="agent-run"
      data-state={state}
      aria-labelledby={id}
      className={cn(
        'min-w-0 overflow-hidden rounded-lg border border-border bg-surface',
        className,
      )}
      {...props}
    >
      <header className="grid gap-2 border-b border-border p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {React.createElement(
            headingTag(headingLevel),
            { id, className: 'min-w-0 text-sm font-semibold break-words' },
            title,
          )}
          <span
            role="status"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <RunIcon state={state} />
            {states[state]}
          </span>
        </div>
        {summary && <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>}
      </header>
      <ol className="grid gap-4 p-4" aria-label={l.steps}>
        {steps.map((step) => (
          <li
            key={step.id}
            className="flex min-w-0 gap-3"
            aria-current={step.state === 'running' || step.state === 'waiting' ? 'step' : undefined}
          >
            <span className="mt-0.5 shrink-0">
              <RunIcon state={step.state} />
            </span>
            <div className="grid min-w-0 flex-1 gap-1">
              <span className="text-sm font-medium break-words">
                {step.label}
                <span className="sr-only"> — {states[step.state]}</span>
              </span>
              {step.detail && (
                <div className="text-xs leading-relaxed break-words text-muted-foreground">
                  {step.detail}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      {children && <div className="grid min-w-0 gap-3 border-t border-border p-4">{children}</div>}
      {((state === 'running' && onPause) ||
        (state === 'paused' && onResume) ||
        (state === 'failed' && onRetry) ||
        (active && onCancel)) && (
        <footer
          className="flex flex-wrap justify-end gap-2 border-t border-border p-3"
          aria-busy={busy || undefined}
        >
          {active && onCancel && (
            <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
              {l.cancel}
            </Button>
          )}
          {state === 'running' && onPause && (
            <Button variant="outline" size="sm" disabled={busy} onClick={onPause}>
              {l.pause}
            </Button>
          )}
          {state === 'paused' && onResume && (
            <Button size="sm" disabled={busy} onClick={onResume}>
              {l.resume}
            </Button>
          )}
          {state === 'failed' && onRetry && (
            <Button size="sm" disabled={busy} onClick={onRetry}>
              {l.retry}
            </Button>
          )}
        </footer>
      )}
    </section>
  );
});
