import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import Wrench from '@burtson-labs/icons/react/wrench';
import * as React from 'react';

import { cn } from '../lib/utils';
import * as CollapsiblePrimitive from '../primitives/vendor/radix/react-collapsible';

import { Button } from './button';
import { StatusDot } from './status';

export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

const statusText: Record<ToolCallStatus, string> = {
  pending: 'Queued',
  running: 'Running',
  success: 'Done',
  error: 'Failed',
};
const statusDot = {
  pending: 'neutral',
  running: 'brand',
  success: 'success',
  error: 'danger',
} as const;

const json = (value: unknown) => {
  if (typeof value === 'string') return value;
  const seen = new WeakSet<object>();
  try {
    return (
      JSON.stringify(
        value,
        (_key, item: unknown) => {
          if (typeof item === 'bigint') return item.toString();
          if (item && typeof item === 'object') {
            if (seen.has(item)) return '[Repeated reference]';
            seen.add(item);
          }
          return item;
        },
        2,
      ) ?? String(value)
    );
  } catch {
    return '[Value could not be displayed]';
  }
};

export interface ToolCallProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** The tool's name, e.g. `get_load`. */
  name: string;
  status: ToolCallStatus;
  /** Arguments the agent passed; shown as formatted JSON. */
  args?: unknown;
  /** What the tool returned; shown as formatted JSON. */
  result?: unknown;
  /** Error message when the call failed. */
  error?: string;
  durationMs?: number;
  defaultOpen?: boolean;
}

/** A tool call an agent made: name, live status, and collapsible arguments and result. */
function ToolCall({
  name,
  status,
  args,
  result,
  error,
  durationMs,
  defaultOpen = false,
  className,
  ...props
}: ToolCallProps) {
  const hasDetail = args !== undefined || result !== undefined || Boolean(error);
  return (
    <CollapsiblePrimitive.Root defaultOpen={defaultOpen} disabled={!hasDetail}>
      <div
        data-slot="tool-call"
        data-status={status}
        className={cn(
          'animate-in overflow-hidden rounded-md border bg-surface text-[13px]',
          status === 'error' && 'border-destructive/30',
          className,
        )}
        {...props}
      >
        <CollapsiblePrimitive.Trigger className="group/tool flex h-9 w-full items-center gap-2 px-3 text-left outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-default disabled:hover:bg-transparent">
          <Wrench className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-mono text-[12.5px]">{name}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <StatusDot status={statusDot[status]} pulse={status === 'running'} />
            {statusText[status]}
            {durationMs !== undefined && status !== 'running' && (
              <span className="tabular-nums">· {(durationMs / 1000).toFixed(1)}s</span>
            )}
          </span>
          {hasDetail && (
            <ChevronRight
              aria-hidden
              className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]/tool:rotate-90"
            />
          )}
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="grid gap-2 border-t p-3">
            {args !== undefined && (
              <section className="grid gap-1">
                <h4 className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                  Arguments
                </h4>
                <pre className="overflow-x-auto rounded-sm bg-muted/60 p-2 font-mono text-[12px] leading-5">
                  {json(args)}
                </pre>
              </section>
            )}
            {error ? (
              <p role="alert" className="text-xs font-medium text-destructive">
                {error}
              </p>
            ) : (
              result !== undefined && (
                <section className="grid gap-1">
                  <h4 className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                    Result
                  </h4>
                  <pre className="max-h-64 overflow-auto rounded-sm bg-muted/60 p-2 font-mono text-[12px] leading-5">
                    {json(result)}
                  </pre>
                </section>
              )
            )}
          </div>
        </CollapsiblePrimitive.Content>
      </div>
    </CollapsiblePrimitive.Root>
  );
}

export interface ToolApprovalProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  name: string;
  /** What will happen, in plain words, e.g. "Approve L-1042 and send it to Gravitate". */
  description: React.ReactNode;
  args?: unknown;
  /** `pending` shows the buttons; the others record the decision. */
  state?: 'pending' | 'approved' | 'denied';
  /** Disable decision controls while the application records the choice. */
  busy?: boolean;
  onApprove?: () => void;
  onDeny?: () => void;
  approveLabel?: string;
  denyLabel?: string;
}

/** A gate before an agent runs a tool with side effects: the person approves or denies it. */
function ToolApproval({
  name,
  description,
  args,
  state = 'pending',
  busy = false,
  onApprove,
  onDeny,
  approveLabel = 'Approve',
  denyLabel = 'Deny',
  className,
  ...props
}: ToolApprovalProps) {
  return (
    <div
      data-slot="tool-approval"
      aria-busy={busy || undefined}
      data-state={state}
      className={cn(
        'grid animate-in gap-3 rounded-md border p-3 text-[13px]',
        state === 'pending' ? 'border-warning/40 bg-warning/5' : 'bg-surface',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Wrench className="size-3.5 text-muted-foreground" aria-hidden />
        <span className="font-mono text-[12.5px]">{name}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {state === 'pending'
            ? 'Needs your approval'
            : state === 'approved'
              ? 'Approved'
              : 'Denied'}
        </span>
      </div>
      <p className="text-sm">{description}</p>
      {args !== undefined && (
        <pre className="overflow-x-auto rounded-sm bg-muted/60 p-2 font-mono text-[12px] leading-5">
          {json(args)}
        </pre>
      )}
      {state === 'pending' && (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onDeny} disabled={busy || !onDeny}>
            {denyLabel}
          </Button>
          <Button size="sm" onClick={onApprove} disabled={busy || !onApprove}>
            {approveLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export { ToolApproval, ToolCall };
