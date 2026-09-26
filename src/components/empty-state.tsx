import * as React from 'react';

import { cn } from '../lib/utils';

const EmptyState = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function EmptyState({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="empty-state"
        className={cn(
          'flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted/60 px-6 py-10 text-center',
          className,
        )}
        {...props}
      />
    );
  },
);

const EmptyStateIcon = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function EmptyStateIcon({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="empty-state-icon"
        className={cn(
          'mb-4 grid size-10 place-items-center rounded-lg border border-brand/15 bg-brand-soft text-brand [&_svg]:size-5',
          className,
        )}
        {...props}
      />
    );
  },
);

const EmptyStateTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<'h3'>>(
  function EmptyStateTitle({ className, children, ...props }, ref) {
    return (
      <h3
        ref={ref}
        data-slot="empty-state-title"
        className={cn('text-sm font-semibold text-foreground', className)}
        {...props}
      >
        {children}
      </h3>
    );
  },
);

const EmptyStateDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(
  function EmptyStateDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        data-slot="empty-state-description"
        className={cn('mt-1 max-w-md text-sm leading-5 text-muted-foreground', className)}
        {...props}
      />
    );
  },
);

const EmptyStateActions = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function EmptyStateActions({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="empty-state-actions"
        className={cn('mt-5 flex flex-wrap justify-center gap-2', className)}
        {...props}
      />
    );
  },
);

export { EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle };
