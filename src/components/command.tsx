import Search from '@burtson-labs/icons/react/search';
import * as React from 'react';

import { cn, noOutlineClasses } from '../lib/utils';
import { Command as CommandPrimitive } from '../primitives/vendor/cmdk';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';

const Command = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof CommandPrimitive>>(
  function Command({ className, ...props }, ref) {
    return (
      <CommandPrimitive
        ref={ref}
        data-slot="command"
        className={cn(
          // Standalone with a border, the box is the field: its border takes the
          // ring colour while the search input has keyboard focus. In a popover or
          // dialog there is no border of its own, so the rule draws nothing.
          'flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface-raised text-popover-foreground has-[[cmdk-input]:focus-visible]:border-ring',
          className,
        )}
        {...props}
      />
    );
  },
);

export interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  title?: string;
  description?: string;
  className?: string;
}

/** A command palette in a dialog, the usual ⌘K surface. */
function CommandDialog({
  title = 'Command palette',
  description = 'Search for a page or an action',
  children,
  className,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn(
          'top-[20%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl sm:p-0',
          className,
        )}
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The row is the field (icon + input, ruled off from the list); the input
 * itself draws no border or outline, whatever the host page's CSS says.
 */
const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof CommandPrimitive.Input>
>(function CommandInput({ className, ...props }, ref) {
  return (
    <div data-slot="command-input-wrapper" className="flex items-center gap-2 border-b px-3">
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <CommandPrimitive.Input
        ref={ref}
        data-slot="command-input"
        className={cn(
          'flex h-11 w-full rounded-none border-0 bg-transparent py-3 text-base shadow-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm',
          noOutlineClasses,
          className,
        )}
        {...props}
      />
    </div>
  );
});

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.List>
>(function CommandList({ className, ...props }, ref) {
  return (
    <CommandPrimitive.List
      ref={ref}
      data-slot="command-list"
      className={cn('max-h-80 scroll-py-1 overflow-x-hidden overflow-y-auto p-1', className)}
      {...props}
    />
  );
});

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(function CommandEmpty({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      data-slot="command-empty"
      className={cn('py-6 text-center text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Group>
>(function CommandGroup({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      data-slot="command-group"
      className={cn(
        'overflow-hidden py-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-[0.06em] [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase',
        className,
      )}
      {...props}
    />
  );
});

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Separator>
>(function CommandSeparator({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      data-slot="command-separator"
      className={cn('-mx-1 h-px bg-border', className)}
      {...props}
    />
  );
});

/** A row: 32px (44px on touch screens), 8px radius, a fill when active. */
const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Item>
>(function CommandItem({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="command-item"
      className={cn(
        "relative flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 text-[13px] select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-secondary data-[selected=true]:text-foreground pointer-coarse:min-h-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        noOutlineClasses,
        className,
      )}
      {...props}
    />
  );
});

const CommandShortcut = React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(
  function CommandShortcut({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        data-slot="command-shortcut"
        className={cn(
          'ml-auto rounded-xs border border-border bg-surface-muted px-1.5 font-mono text-[11px] leading-5 text-muted-foreground',
          className,
        )}
        {...props}
      />
    );
  },
);

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
