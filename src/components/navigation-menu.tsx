import ChevronDown from '@burtson-labs/icons/react/chevron-down';
import { NavigationMenu as NavigationMenuPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '../lib/utils';

/**
 * Site navigation with dropdown panels (a products menu, docs sections).
 * Keyboard and screen-reader behaviour come from Radix; the panel renders in
 * a shared viewport under the bar, sized to its content.
 */
function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        'group/navigation-menu relative flex max-w-max flex-1 items-center justify-center',
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn('group flex flex-1 list-none items-center justify-center gap-1', className)}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn('relative', className)}
      {...props}
    />
  );
}

/** The look of a top-level entry, for links that sit beside triggers. */
const navigationMenuTriggerStyle =
  'group inline-flex h-9 w-max items-center justify-center gap-1 rounded-md px-3 text-sm font-semibold text-foreground/80 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 data-[active]:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground';

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle, className)}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden
        className="relative top-px size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        'top-0 left-0 w-full p-2 md:absolute md:w-auto data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion=from-end]:[--bl-tx:24px] data-[motion=from-start]:[--bl-tx:-24px] data-[motion=to-end]:[--bl-tx:24px] data-[motion=to-start]:[--bl-tx:-24px] [--bl-scale:1]',
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 z-50 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          'relative mt-2 h-(--radix-navigation-menu-viewport-height) w-full origin-top overflow-hidden rounded-lg border border-border-strong bg-surface-raised text-popover-foreground shadow-[0_16px_48px_rgb(0_0_0_/_0.18)] transition-[width,height] duration-200 [--bl-ty:-6px] data-[state=closed]:animate-out data-[state=open]:animate-in md:w-(--radix-navigation-menu-viewport-width)',
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/20 data-[active=true]:bg-muted data-[active=true]:shadow-[inset_2px_0_0_var(--color-brand)] [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        'top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:animate-out data-[state=visible]:animate-in',
        className,
      )}
      {...props}
    >
      <div className="relative top-[60%] size-2 rotate-45 rounded-tl-sm bg-border-strong" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
};
