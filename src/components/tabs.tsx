import * as React from 'react';

import { cn, focusRingClasses, touchTargetRowClasses } from '../lib/utils';
import * as TabsPrimitive from '../primitives/vendor/radix/react-tabs';

const Tabs = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof TabsPrimitive.Root>>(
  function Tabs({ className, ...props }, ref) {
    return (
      <TabsPrimitive.Root
        ref={ref}
        data-slot="tabs"
        className={cn('flex flex-col gap-3', className)}
        {...props}
      />
    );
  },
);

/**
 * A 36px strip with a 10px radius; a strip wider than its container scrolls
 * sideways rather than pushing the layout.
 */
const TabsList = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof TabsPrimitive.List>>(
  function TabsList({ className, ...props }, ref) {
    return (
      <TabsPrimitive.List
        ref={ref}
        data-slot="tabs-list"
        className={cn(
          'inline-flex h-9 w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-md border border-border bg-surface-muted p-1 text-muted-foreground [scrollbar-width:none]',
          className,
        )}
        {...props}
      />
    );
  },
);

/** A 28px tab with a 6px radius (the strip's 10px less its 4px inset); 44px tall to a touch. */
const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex h-7 min-w-0 shrink-0 items-center justify-center gap-1.5 rounded-xs px-2.5 text-[13px] font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-xs hover:text-foreground [&_svg]:size-4',
        focusRingClasses,
        touchTargetRowClasses,
        className,
      )}
      {...props}
    />
  );
});

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tabs-content"
      className={cn(
        'min-w-0 flex-1 data-[state=active]:animate-fade-in',
        focusRingClasses,
        className,
      )}
      {...props}
    />
  );
});

export { Tabs, TabsContent, TabsList, TabsTrigger };
