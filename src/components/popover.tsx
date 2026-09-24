import { Popover as PopoverPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '../lib/utils';

/** The floating-surface look shared by popovers, menus and select lists. */
export const surfaceClasses =
  'z-50 animate-in rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=closed]:animate-out';

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
          'w-72 origin-(--radix-popover-content-transform-origin) p-4 outline-hidden',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
