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
      danger: 'bg-destructive text-destructive',
      info: 'bg-info text-info',
    },
  },
  defaultVariants: { status: 'neutral' },
});

function StatusDot({
  className,
  status,
  pulse = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof statusDotVariants> & { pulse?: boolean }) {
  return (
    <span
      data-slot="status-dot"
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
}

function Status({
  className,
  status,
  pulse,
  children,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof statusDotVariants> & { pulse?: boolean }) {
  return (
    <span
      data-slot="status"
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
}

export { Status, StatusDot, statusDotVariants };
