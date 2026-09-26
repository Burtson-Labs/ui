import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const statusDotVariants = cva('size-2 shrink-0 rounded-full ring-2 ring-current/10', {
  variants: {
    status: {
      neutral: 'bg-muted-foreground text-muted-foreground',
      brand: 'bg-brand text-brand',
      success: 'bg-success text-success',
      warning: 'bg-warning text-warning',
      destructive: 'bg-destructive text-destructive',
      /** 0.x name for `destructive`; kept so existing apps keep compiling. */
      danger: 'bg-destructive text-destructive',
      info: 'bg-info text-info',
    },
  },
  defaultVariants: { status: 'neutral' },
});

export type StatusTone = NonNullable<VariantProps<typeof statusDotVariants>['status']>;

export interface StatusDotProps
  extends React.ComponentProps<'span'>, VariantProps<typeof statusDotVariants> {
  /** A ripple for a live state (running, connecting). Still under reduced motion. */
  pulse?: boolean;
}

const StatusDot = React.forwardRef<HTMLSpanElement, StatusDotProps>(function StatusDot(
  { className, status, pulse = false, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-slot="status-dot"
      data-status={status ?? 'neutral'}
      className={cn('relative inline-flex', className)}
      aria-hidden="true"
      {...props}
    >
      {pulse ? (
        <span
          className={cn(
            statusDotVariants({ status }),
            'absolute inset-0 animate-ping opacity-40 motion-reduce:hidden',
          )}
        />
      ) : null}
      <span className={statusDotVariants({ status })} />
    </span>
  );
});

const Status = React.forwardRef<HTMLSpanElement, StatusDotProps>(function Status(
  { className, status, pulse, children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-slot="status"
      data-status={status ?? 'neutral'}
      className={cn(
        'inline-flex items-center gap-2 text-xs font-medium text-muted-foreground',
        className,
      )}
      {...props}
    >
      <StatusDot status={status} pulse={pulse} />
      {children}
    </span>
  );
});

export { Status, StatusDot, statusDotVariants };
