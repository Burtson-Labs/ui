import { Popover as PopoverPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '../lib/utils';

/**
 * The floating surface shared by popovers, menus and select lists: raised,
 * with a strong border, and the one place a heavy shadow is allowed.
 */
export const surfaceClasses =
  'z-50 animate-in rounded-lg border border-border-strong bg-surface-raised text-popover-foreground shadow-[0_16px_48px_rgb(0_0_0_/_0.18)] data-[state=closed]:animate-out data-[side=bottom]:[--bl-ty:-6px] data-[side=top]:[--bl-ty:6px] data-[side=left]:[--bl-tx:6px] data-[side=right]:[--bl-tx:-6px]';

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
