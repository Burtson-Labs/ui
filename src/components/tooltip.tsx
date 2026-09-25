import { Tooltip as TooltipPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '../lib/utils';

const HasTooltipProvider = React.createContext(false);

function TooltipProvider({
  delayDuration = 200,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <HasTooltipProvider.Provider value={true}>
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delayDuration={delayDuration}
        {...props}
      />
    </HasTooltipProvider.Provider>
  );
}

/** Wraps its own provider, so a lone tooltip works without app-level setup. */
function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const hasProvider = React.useContext(HasTooltipProvider);
  if (hasProvider) return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) animate-in [--bl-scale:0.98] data-[side=bottom]:[--bl-ty:-4px] data-[side=top]:[--bl-ty:4px] data-[side=left]:[--bl-tx:4px] data-[side=right]:[--bl-tx:-4px] rounded-sm border border-white/10 bg-code px-2 py-1 text-[11.5px] leading-4 font-medium text-balance text-code-foreground shadow-md data-[state=closed]:animate-out',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-code" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
