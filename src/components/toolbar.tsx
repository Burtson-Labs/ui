import * as React from 'react';

import { cn } from '../lib/utils';

function Toolbar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="toolbar"
      role="group"
      className={cn(
        'flex min-h-10 flex-wrap items-center gap-1 rounded-lg border border-border bg-surface p-1.5 shadow-xs',
        className,
      )}
      {...props}
    />
  );
}

function ToolbarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="toolbar-group"
      className={cn('flex items-center gap-1', className)}
      {...props}
    />
  );
}

function ToolbarSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="toolbar-separator"
      aria-hidden="true"
      className={cn('mx-1 h-5 w-px bg-border', className)}
      {...props}
    />
  );
}

function ToolbarSpacer({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="toolbar-spacer"
      aria-hidden="true"
      className={cn('min-w-2 flex-1', className)}
      {...props}
    />
  );
}

export { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarSpacer };
