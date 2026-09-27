import AlertCircle from '@burtson-labs/icons/react/alert-circle';
import Check from '@burtson-labs/icons/react/check';
import Circle from '@burtson-labs/icons/react/circle';
import Pause from '@burtson-labs/icons/react/pause';
import * as React from 'react';

import { cn } from '../lib/utils';

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
  state: AgentRunState;
  steps: AgentRunStep[];
  /** Explain the current state, especially what a person needs to do next. */
  summary?: React.ReactNode;
  busy?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}
const labels: Record<AgentRunState, string> = {
  queued: 'Queued',
  running: 'Running',
  waiting: 'Needs your input',
  paused: 'Paused',
  completed: 'Completed',
  failed: 'Failed',
  canceled: 'Canceled',
};
function RunIcon({ state }: { state: AgentRunState }) {
  if (state === 'running') return <Spinner className="size-4" label="Running" />;
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
export function AgentRun({
  title,
  state,
  steps,
  summary,
  busy = false,
  onPause,
  onResume,
  onCancel,
  onRetry,
  children,
  className,
  ...props
}: AgentRunProps) {
  const id = React.useId();
  const active = ['queued', 'running', 'waiting', 'paused'].includes(state);
  return (
    <section
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
          <h3 id={id} className="min-w-0 text-sm font-semibold break-words">
            {title}
          </h3>
          <span
            role="status"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <RunIcon state={state} />
            {labels[state]}
          </span>
        </div>
        {summary && <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>}
      </header>
      <ol className="grid gap-4 p-4" aria-label="Run steps">
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
                <span className="sr-only"> — {labels[step.state]}</span>
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
              Cancel run
            </Button>
          )}
          {state === 'running' && onPause && (
            <Button variant="outline" size="sm" disabled={busy} onClick={onPause}>
              Pause run
            </Button>
          )}
          {state === 'paused' && onResume && (
            <Button size="sm" disabled={busy} onClick={onResume}>
              Resume run
            </Button>
          )}
          {state === 'failed' && onRetry && (
            <Button size="sm" disabled={busy} onClick={onRetry}>
              Retry run
            </Button>
          )}
        </footer>
      )}
    </section>
  );
}
