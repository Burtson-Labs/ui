import X from '@burtson-labs/icons/react/x';
import { Dialog as SheetPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '../lib/utils';

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

const sideClasses = {
  right: 'inset-y-0 right-0 h-full w-3/4 border-l [--bl-sheet-x:100%] sm:max-w-sm',
  left: 'inset-y-0 left-0 h-full w-3/4 border-r [--bl-sheet-x:-100%] sm:max-w-sm',
  // Top and bottom sheets are the mobile drawers. Each keeps clear of the
  // notch or home indicator on its edge (safe-area insets).
  top: 'inset-x-0 top-0 max-h-[85dvh] rounded-b-xl border-b pt-[env(safe-area-inset-top)] [--bl-sheet-x:0] [--bl-sheet-y:-100%]',
  bottom:
    'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t pb-[env(safe-area-inset-bottom)] [--bl-sheet-x:0] [--bl-sheet-y:100%]',
} as const;

function SheetContent({
  className,
  children,
  side = 'right',
  handle = side === 'bottom',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: keyof typeof sideClasses;
  /**
   * A grab bar at the top edge, the cue that this is a drawer. Visual only:
   * it does not drag; close with the button, Escape or the overlay. On by
   * default for bottom sheets.
   */
  handle?: boolean;
}) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        data-slot="sheet-overlay"
        className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in"
      />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 max-h-dvh overflow-y-auto overscroll-contain flex flex-col gap-4 border-border-strong bg-surface-raised text-foreground shadow-[0_24px_80px_rgb(0_0_0_/_0.28)] outline-none data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in',
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {handle && (
          <div
            data-slot="sheet-handle"
            aria-hidden
            className="mx-auto mt-2 -mb-2 h-1 w-10 shrink-0 rounded-full bg-border-strong"
          />
        )}
        {children}
        {/* 44px on touch screens, 32px with a mouse. */}
        <SheetPrimitive.Close
          className={cn(
            'absolute right-3 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/20 pointer-coarse:size-11 [&_svg]:size-4 pointer-coarse:[&_svg]:size-5',
            side === 'top' ? 'top-[calc(env(safe-area-inset-top)+0.75rem)]' : 'top-3',
          )}
        >
          <X aria-hidden />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-base font-semibold tracking-[-0.02em] text-foreground', className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
