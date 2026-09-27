import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';

export interface ContextUsageProps extends React.ComponentProps<'div'> {
  /** Actual token count from the runtime. Null means unmeasured. */
  used: number | null;
  limit: number | null;
  label?: string;
  onCompact?: () => void;
  busy?: boolean;
}

/** A capacity meter, not task progress. Never invents a token count or compacts on its own. */
export function ContextUsage({
  used,
  limit,
  label = 'Context window',
  onCompact,
  busy = false,
  className,
  ...props
}: ContextUsageProps) {
  const id = React.useId();
  const known =
    used !== null &&
    limit !== null &&
    Number.isFinite(used) &&
    Number.isFinite(limit) &&
    used >= 0 &&
    limit > 0;
  const ratio = known ? used / limit : 0;
  const summary = known
    ? `${used.toLocaleString('en-US')} of ${limit.toLocaleString('en-US')} tokens`
    : 'Usage unavailable';
  const status = !known
    ? 'unknown'
    : ratio >= 0.95
      ? 'critical'
      : ratio >= 0.8
        ? 'warning'
        : 'normal';
  return (
    <div
      data-slot="context-usage"
      data-state={status}
      aria-busy={busy || undefined}
      className={cn('grid min-w-0 gap-2', className)}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span id={id} className="font-medium">
          {label}
        </span>
        <span className="text-muted-foreground tabular-nums">{summary}</span>
      </div>
      {known && (
        <div
          role="meter"
          aria-labelledby={id}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(used, limit)}
          aria-valuetext={summary}
          className="h-1.5 overflow-hidden rounded-full bg-border"
        >
          <div
            className={cn(
              'h-full rounded-full transition-[width] motion-reduce:transition-none',
              status === 'critical'
                ? 'bg-destructive'
                : status === 'warning'
                  ? 'bg-warning'
                  : 'bg-brand',
            )}
            style={{ width: `${Math.min(100, ratio * 100)}%` }}
          />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {busy
            ? 'Compacting context…'
            : status === 'critical'
              ? 'Almost full. Compact context or start a new conversation.'
              : status === 'warning'
                ? 'Context is filling up.'
                : ''}
        </p>
        {onCompact && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy || !known || used === 0}
            onClick={onCompact}
          >
            Compact context
          </Button>
        )}
      </div>
    </div>
  );
}
