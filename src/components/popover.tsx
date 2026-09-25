import * as React from 'react';

import { cn } from '../lib/utils';
import * as PopoverPrimitive from '../primitives/vendor/radix/react-popover';

/**
 * The floating surface shared by popovers, menus and select lists: raised,
 * with a strong border, and the one place a heavy shadow is allowed.
 */
export const surfaceClasses =
  'z-50 animate-in rounded-lg border border-border-strong bg-surface-raised text-popover-foreground shadow-[0_16px_48px_rgb(0_0_0_/_0.18)] data-[state=closed]:animate-out data-[side=bottom]:[--bl-ty:-6px] data-[side=top]:[--bl-ty:6px] data-[side=left]:[--bl-tx:6px] data-[side=right]:[--bl-tx:-6px]';

/**
 * A menu row: 32px, 8px radius (the surface's 12px less its 4px padding); the
 * focused row is a quiet secondary fill (muted is too close to the raised
 * surface in dark mode to read). The outline is suppressed
 * with !important so a host page's global focus outline cannot box the row.
 */
export const menuItemClasses =
  "relative flex min-h-8 cursor-default items-center gap-2 rounded-sm px-2 text-[13px] outline-hidden! select-none focus:bg-secondary focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground";

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          surfaceClasses,
          'w-72 max-w-[calc(100vw-2rem)] max-h-(--radix-popover-content-available-height) overflow-y-auto origin-(--radix-popover-content-transform-origin) p-4 outline-hidden',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
