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
  /** BCP 47 locale for the token counts. Undefined uses the reader's locale. */
  locale?: Intl.LocalesArgument;
  /** Visible and announced text, for translation. */
  labels?: Partial<typeof contextUsageLabels>;
}

const contextUsageLabels = {
  /** Builds the count text from the formatted numbers. */
  summary: (used: string, limit: string) => `${used} of ${limit} tokens`,
  unavailable: 'Usage unavailable',
  compacting: 'Compacting context…',
  critical: 'Almost full. Compact context or start a new conversation.',
  warning: 'Context is filling up.',
  compact: 'Compact context',
};

/** A capacity meter, not task progress. Never invents a token count or compacts on its own. */
export const ContextUsage = React.forwardRef<HTMLDivElement, ContextUsageProps>(
  function ContextUsage(
    {
      used,
      limit,
      label = 'Context window',
      onCompact,
      busy = false,
      locale,
      labels,
      className,
      ...props
    },
    ref,
  ) {
    const id = React.useId();
    const l = { ...contextUsageLabels, ...labels };
    const known =
      used !== null &&
      limit !== null &&
      Number.isFinite(used) &&
      Number.isFinite(limit) &&
      used >= 0 &&
      limit > 0;
    const ratio = known ? used / limit : 0;
    const summary = known
      ? l.summary(used.toLocaleString(locale), limit.toLocaleString(locale))
      : l.unavailable;
    const status = !known
      ? 'unknown'
      : ratio >= 0.95
        ? 'critical'
        : ratio >= 0.8
          ? 'warning'
          : 'normal';
    return (
      <div
        ref={ref}
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
          {/* Always mounted so a screen reader hears the threshold message when it
              appears. Its text depends only on the threshold and busy, never on the
              count, so it speaks once per crossing, not on every token. */}
          <p role="status" className="text-xs text-muted-foreground">
            {busy
              ? l.compacting
              : status === 'critical'
                ? l.critical
                : status === 'warning'
                  ? l.warning
                  : ''}
          </p>
          {onCompact && (
            <Button
              size="sm"
              variant="ghost"
              disabled={busy || !known || used === 0}
              onClick={onCompact}
            >
              {l.compact}
            </Button>
          )}
        </div>
      </div>
    );
  },
);
