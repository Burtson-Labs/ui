import ChevronDown from '@burtson-labs/icons/react/chevron-down';
import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';
import * as NavigationMenuPrimitive from '../primitives/vendor/radix/react-navigation-menu';

/**
 * Site navigation with dropdown panels (a products menu, docs sections).
 * Keyboard and screen-reader behaviour come from Radix; the panel renders in
 * a shared viewport under the bar, sized to its content.
 */
const NavigationMenu = React.forwardRef<
  HTMLElement,
  React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }
>(function NavigationMenu({ className, children, viewport = true, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Root
      ref={ref}
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
});

const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<typeof NavigationMenuPrimitive.List>
>(function NavigationMenuList({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.List
      ref={ref}
      data-slot="navigation-menu-list"
      className={cn('group flex flex-1 list-none items-center justify-center gap-1', className)}
      {...props}
    />
  );
});

const NavigationMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<typeof NavigationMenuPrimitive.Item>
>(function NavigationMenuItem({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Item
      ref={ref}
      data-slot="navigation-menu-item"
      className={cn('relative', className)}
      {...props}
    />
  );
});

/** The look of a top-level entry, for links that sit beside triggers; 44px on touch screens. */
const navigationMenuTriggerStyle = cn(
  'group inline-flex h-9 w-max items-center justify-center gap-1 rounded-md px-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[active]:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground pointer-coarse:h-11',
  focusRingClasses,
);

const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>
>(function NavigationMenuTrigger({ className, children, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle, className)}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden
        className="relative top-px size-4 transition-transform duration-(--duration-standard) group-data-[state=open]:rotate-180"
      />
    </NavigationMenuPrimitive.Trigger>
  );
});

const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof NavigationMenuPrimitive.Content>
>(function NavigationMenuContent({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      data-slot="navigation-menu-content"
      className={cn(
        'top-0 left-0 w-full p-2 md:absolute md:w-auto data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion=from-end]:[--bl-tx:24px] data-[motion=from-start]:[--bl-tx:-24px] data-[motion=to-end]:[--bl-tx:24px] data-[motion=to-start]:[--bl-tx:-24px] [--bl-scale:1]',
        className,
      )}
      {...props}
    />
  );
});

/** The shared panel: the floating surface (12px radius, elevation 4). */
const NavigationMenuViewport = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>
>(function NavigationMenuViewport({ className, ...props }, ref) {
  return (
    <div className="absolute top-full left-0 z-50 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        data-slot="navigation-menu-viewport"
        className={cn(
          'relative mt-2 h-(--radix-navigation-menu-viewport-height) w-full origin-top overflow-hidden rounded-lg border border-border-strong bg-surface-raised text-popover-foreground shadow-lg transition-[width,height] duration-(--duration-standard) [--bl-ty:-6px] data-[state=closed]:animate-out data-[state=open]:animate-in md:w-(--radix-navigation-menu-viewport-width)',
          className,
        )}
        {...props}
      />
    </div>
  );
});

const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof NavigationMenuPrimitive.Link>
>(function NavigationMenuLink({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Link
      ref={ref}
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm transition-colors hover:bg-muted data-[active=true]:bg-muted data-[active=true]:shadow-[inset_2px_0_0_var(--color-brand)] [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        focusRingClasses,
        'focus-visible:outline-offset-[-2px]',
        className,
      )}
      {...props}
    />
  );
});

const NavigationMenuIndicator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>
>(function NavigationMenuIndicator({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Indicator
      ref={ref}
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
});

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
