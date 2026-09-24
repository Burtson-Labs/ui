import * as React from 'react';

import { cn } from '../lib/utils';

function EmptyState({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted/60 px-6 py-10 text-center',
        className,
      )}
      {...props}
    />
  );
}

function EmptyStateIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state-icon"
      className={cn(
        'mb-4 grid size-10 place-items-center rounded-lg border border-brand/15 bg-brand-soft text-brand [&_svg]:size-5',
        className,
      )}
      {...props}
    />
  );
}

function EmptyStateTitle({ className, children, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      data-slot="empty-state-title"
      className={cn('text-sm font-semibold text-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function EmptyStateDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn('mt-1 max-w-md text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
}

function EmptyStateActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state-actions"
      className={cn('mt-5 flex flex-wrap justify-center gap-2', className)}
      {...props}
    />
  );
}

export { EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle };
