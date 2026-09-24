import * as React from 'react';

import { cn } from '../lib/utils';

function PageHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot="page-header"
      className={cn(
        'flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
      {...props}
    />
  );
}

function PageHeaderMain({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="page-header-main" className={cn('min-w-0 space-y-1', className)} {...props} />
  );
}

function PageHeaderEyebrow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-eyebrow"
      className={cn('text-[11px] font-semibold tracking-[0.12em] text-brand uppercase', className)}
      {...props}
    />
  );
}

function PageHeaderTitle({ className, children, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn(
        'truncate text-xl font-semibold tracking-[-0.025em] text-foreground sm:text-2xl',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

function PageHeaderDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="page-header-description"
      className={cn('max-w-3xl text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
}

function PageHeaderActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn('flex shrink-0 flex-wrap items-center gap-2', className)}
      {...props}
    />
  );
}

export {
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderMain,
  PageHeaderTitle,
};
