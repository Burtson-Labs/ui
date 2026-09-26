import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const alertVariants = cva(
  'group/alert relative grid w-full grid-cols-1 has-[>svg]:grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 rounded-lg border px-4 py-3.5 text-sm shadow-xs [&>svg]:mt-0.5 [&>svg]:size-4',
  {
    variants: {
      variant: {
        default: 'border-border bg-surface text-foreground [&>svg]:text-muted-foreground',
        brand: 'border-brand/25 bg-brand-soft/70 text-foreground [&>svg]:text-brand',
        success: 'border-success/25 bg-success/10 text-foreground [&>svg]:text-success',
        warning: 'border-warning/25 bg-warning/10 text-foreground [&>svg]:text-warning',
        destructive:
          'border-destructive/25 bg-destructive/10 text-foreground [&>svg]:text-destructive',
        info: 'border-info/25 bg-info/10 text-foreground [&>svg]:text-info',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface AlertProps
  extends React.ComponentProps<'div'>, VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { className, variant, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="alert"
      data-variant={variant ?? 'default'}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
});

const AlertTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function AlertTitle({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="alert-title"
        className={cn('font-semibold tracking-[-0.01em]', className)}
        {...props}
      />
    );
  },
);

const AlertDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function AlertDescription({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="alert-description"
        className={cn(
          'col-start-1 group-has-[>svg]/alert:col-start-2 text-[13px] leading-5 text-muted-foreground',
          className,
        )}
        {...props}
      />
    );
  },
);

export { Alert, AlertDescription, AlertTitle, alertVariants };
