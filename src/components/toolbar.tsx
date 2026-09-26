import * as React from 'react';

import { cn } from '../lib/utils';

export interface ToolbarProps extends React.ComponentProps<'div'> {
  /** Names the group for screen readers ("List tools"). */
  'aria-label'?: string;
}

/** A labelled group of controls; Tab moves between them as in any form. */
const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="toolbar"
      role="group"
      className={cn(
        'flex min-h-10 flex-wrap items-center gap-1 rounded-lg border border-border bg-surface p-1.5 shadow-xs',
        className,
      )}
      {...props}
    />
  );
});

const ToolbarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function ToolbarGroup({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="toolbar-group"
        className={cn('flex items-center gap-1', className)}
        {...props}
      />
    );
  },
);

const ToolbarSeparator = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function ToolbarSeparator({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="toolbar-separator"
        aria-hidden="true"
        className={cn('mx-1 h-5 w-px bg-border', className)}
        {...props}
      />
    );
  },
);

const ToolbarSpacer = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function ToolbarSpacer({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="toolbar-spacer"
        aria-hidden="true"
        className={cn('min-w-2 flex-1', className)}
        {...props}
      />
    );
  },
);

export { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarSpacer };
