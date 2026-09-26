import * as React from 'react';

import { cn } from '../lib/utils';

const PageHeader = React.forwardRef<HTMLElement, React.ComponentProps<'header'>>(
  function PageHeader({ className, ...props }, ref) {
    return (
      <header
        ref={ref}
        data-slot="page-header"
        className={cn(
          'flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between',
          className,
        )}
        {...props}
      />
    );
  },
);

const PageHeaderMain = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function PageHeaderMain({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="page-header-main"
        className={cn('min-w-0 space-y-1', className)}
        {...props}
      />
    );
  },
);

const PageHeaderEyebrow = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function PageHeaderEyebrow({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="page-header-eyebrow"
        className={cn(
          'text-[11px] font-semibold tracking-[0.12em] text-brand uppercase',
          className,
        )}
        {...props}
      />
    );
  },
);

const PageHeaderTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<'h1'>>(
  function PageHeaderTitle({ className, children, ...props }, ref) {
    return (
      <h1
        ref={ref}
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
  },
);

const PageHeaderDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(
  function PageHeaderDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        data-slot="page-header-description"
        className={cn('max-w-3xl text-sm leading-5 text-muted-foreground', className)}
        {...props}
      />
    );
  },
);

/** The actions: wrap under the title on narrow screens rather than squeezing it; share the row on phones. */
const PageHeaderActions = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function PageHeaderActions({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="page-header-actions"
        className={cn(
          'flex shrink-0 flex-wrap items-center gap-2 max-sm:*:data-[slot=button]:min-w-0 max-sm:*:data-[slot=button]:flex-1',
          className,
        )}
        {...props}
      />
    );
  },
);

export {
  PageHeader,
  PageHeaderActions,
  PageHeaderDescription,
  PageHeaderEyebrow,
  PageHeaderMain,
  PageHeaderTitle,
};
