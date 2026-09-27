import * as React from 'react';

import { cn } from '../lib/utils';

export interface CircularProgressProps extends React.ComponentProps<'div'> {
  /** Omit or pass null when the amount of work is unknown. */
  value?: number | null;
  max?: number;
  /** Diameter in pixels. */
  size?: number;
  label?: string;
  showValue?: boolean;
}

/** Determinate or indeterminate progress; unknown work never reports a percentage. */
export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  function CircularProgress(
    {
      value,
      max = 100,
      size = 40,
      label = 'Loading',
      showValue = false,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const maximum = Number.isFinite(max) && max > 0 ? max : 100;
    const current =
      typeof value === 'number' && Number.isFinite(value)
        ? Math.min(maximum, Math.max(0, value))
        : null;
    const percent = current === null ? null : (current / maximum) * 100;
    const diameter = Number.isFinite(size) && size >= 16 ? size : 40;
    return (
      <div
        ref={ref}
        data-slot="circular-progress"
        data-state={
          current === null ? 'indeterminate' : current === maximum ? 'complete' : 'loading'
        }
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={maximum}
        aria-valuenow={current ?? undefined}
        className={cn('relative inline-grid shrink-0 place-items-center text-brand', className)}
        style={{ width: diameter, height: diameter, ...style }}
        {...props}
      >
        <svg viewBox="0 0 40 40" fill="none" aria-hidden className="size-full -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="3"
            className="text-border"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            pathLength="100"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${percent === null ? 28 : percent} 100`}
            opacity={percent === 0 ? 0 : undefined}
            className={cn(
              'origin-center transition-[stroke-dasharray] motion-reduce:transition-none',
              percent === null && 'animate-spin motion-reduce:animate-none',
            )}
          />
        </svg>
        {showValue && percent !== null && (
          <span
            aria-hidden
            className="absolute text-[10px] font-medium tabular-nums text-foreground"
          >
            {Math.round(percent)}%
          </span>
        )}
      </div>
    );
  },
);
