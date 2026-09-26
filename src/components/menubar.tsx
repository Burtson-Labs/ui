import Check from '@burtson-labs/icons/react/check';
import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import * as React from 'react';

import { cn, focusRingClasses, touchTargetRowClasses } from '../lib/utils';
import * as MenubarPrimitive from '../primitives/vendor/radix/react-menubar';

import { menuItemClasses as itemClasses, menuLabelClasses, surfaceClasses } from './popover';

/**
 * An application menu bar (File, Edit, View). Left/Right move between menus,
 * Down opens one, and an open menu follows the pointer across triggers. Rows
 * match DropdownMenu and ContextMenu.
 */
const Menubar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenubarPrimitive.Root>
>(function Menubar({ className, ...props }, ref) {
  return (
    <MenubarPrimitive.Root
      ref={ref}
      data-slot="menubar"
      className={cn('flex h-8 items-center gap-0.5 rounded-md border bg-surface p-0.5', className)}
      {...props}
    />
  );
});

function MenubarMenu(props: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

/** A 28px trigger with a 6px radius (the bar's 10px less its 2px inset); 44px tall to a touch. */
const MenubarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof MenubarPrimitive.Trigger>
>(function MenubarTrigger({ className, ...props }, ref) {
  return (
    <MenubarPrimitive.Trigger
      ref={ref}
      data-slot="menubar-trigger"
      className={cn(
        'flex h-7 items-center rounded-xs px-2.5 text-[13px] font-medium select-none hover:bg-muted data-[state=open]:bg-muted',
        focusRingClasses,
        'focus-visible:outline-offset-[-2px]',
        touchTargetRowClasses,
        className,
      )}
      {...props}
    />
  );
});

function MenubarGroup(props: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

const MenubarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenubarPrimitive.Content>
>(function MenubarContent({ className, align = 'start', sideOffset = 4, ...props }, ref) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        data-slot="menubar-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          surfaceClasses,
          'max-h-(--radix-menubar-content-available-height) min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-x-hidden overflow-y-auto p-1',
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
});

export interface MenubarItemProps extends React.ComponentProps<typeof MenubarPrimitive.Item> {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}

const MenubarItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(function MenubarItem(
  { className, inset, variant = 'default', ...props },
  ref,
) {
  return (
    <MenubarPrimitive.Item
      ref={ref}
      data-slot="menubar-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        itemClasses,
        'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:*:[svg]:!text-destructive',
        className,
      )}
      {...props}
    />
  );
});

const MenubarCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>
>(function MenubarCheckboxItem({ className, children, checked, ...props }, ref) {
  return (
    <MenubarPrimitive.CheckboxItem
      ref={ref}
      data-slot="menubar-checkbox-item"
      className={cn(itemClasses, 'pl-8', className)}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Check className="size-4 text-foreground" aria-hidden />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
});

function MenubarRadioGroup(props: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}

const MenubarRadioItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenubarPrimitive.RadioItem>
>(function MenubarRadioItem({ className, children, ...props }, ref) {
  return (
    <MenubarPrimitive.RadioItem
      ref={ref}
      data-slot="menubar-radio-item"
      className={cn(itemClasses, 'pl-8', className)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <span className="block size-2 rounded-full bg-foreground" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
});

const MenubarLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }
>(function MenubarLabel({ className, inset, ...props }, ref) {
  return (
    <MenubarPrimitive.Label
      ref={ref}
      data-slot="menubar-label"
      data-inset={inset || undefined}
      className={cn(menuLabelClasses, 'data-[inset]:pl-8', className)}
      {...props}
    />
  );
});

const MenubarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenubarPrimitive.Separator>
>(function MenubarSeparator({ className, ...props }, ref) {
  return (
    <MenubarPrimitive.Separator
      ref={ref}
      data-slot="menubar-separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
      {...props}
    />
  );
});

const MenubarShortcut = React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(
  function MenubarShortcut({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        data-slot="menubar-shortcut"
        className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
        {...props}
      />
    );
  },
);

function MenubarSub(props: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const MenubarSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }
>(function MenubarSubTrigger({ className, inset, children, ...props }, ref) {
  return (
    <MenubarPrimitive.SubTrigger
      ref={ref}
      data-slot="menubar-sub-trigger"
      data-inset={inset || undefined}
      className={cn(itemClasses, 'data-[state=open]:bg-secondary', className)}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-4" aria-hidden />
    </MenubarPrimitive.SubTrigger>
  );
});

const MenubarSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof MenubarPrimitive.SubContent>
>(function MenubarSubContent({ className, ...props }, ref) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent
        ref={ref}
        data-slot="menubar-sub-content"
        className={cn(
          surfaceClasses,
          'min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden p-1',
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
});

export {
  Menubar,
  MenubarMenu,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
