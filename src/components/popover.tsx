import * as React from 'react';

import { cn, noOutlineClasses } from '../lib/utils';
import * as PopoverPrimitive from '../primitives/vendor/radix/react-popover';

/**
 * The floating surface shared by popovers, menus and select lists: raised,
 * with a strong border, 12px radius and the floating shadow (elevation 4).
 */
export const surfaceClasses =
  'z-50 animate-in rounded-lg border border-border-strong bg-surface-raised text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[side=bottom]:[--bl-ty:-6px] data-[side=top]:[--bl-ty:6px] data-[side=left]:[--bl-tx:6px] data-[side=right]:[--bl-tx:-6px]';

/**
 * A menu row: 32px (44px on touch screens), 8px radius (the surface's 12px
 * less its 4px padding); the focused row is a quiet secondary fill (muted is
 * too close to the raised surface in dark mode to read). The outline is
 * suppressed with !important so a host page's global focus outline cannot box
 * the row; forced-colors mode gets a system outline instead.
 */
export const menuItemClasses = `relative flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 text-[13px] ${noOutlineClasses} select-none focus:bg-secondary focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 pointer-coarse:min-h-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground`;

/** The small uppercase heading over a group of rows, shared by menus and Select. */
export const menuLabelClasses =
  'px-2 pt-2 pb-1 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase';

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof PopoverPrimitive.Trigger>
>(function PopoverTrigger(props, ref) {
  return <PopoverPrimitive.Trigger ref={ref} data-slot="popover-trigger" {...props} />;
});

const PopoverAnchor = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof PopoverPrimitive.Anchor>
>(function PopoverAnchor(props, ref) {
  return <PopoverPrimitive.Anchor ref={ref} data-slot="popover-anchor" {...props} />;
});

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, align = 'center', sideOffset = 6, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          surfaceClasses,
          'w-72 max-w-[calc(100vw-2rem)] max-h-(--radix-popover-content-available-height) overflow-y-auto origin-(--radix-popover-content-transform-origin) p-4 outline-none',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
