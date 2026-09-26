import X from '@burtson-labs/icons/react/x';
import * as React from 'react';

import { cn } from '../lib/utils';
import * as SheetPrimitive from '../primitives/vendor/radix/react-dialog';

import { overlayClasses, overlayCloseClasses } from './dialog';

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof SheetPrimitive.Trigger>
>(function SheetTrigger(props, ref) {
  return <SheetPrimitive.Trigger ref={ref} data-slot="sheet-trigger" {...props} />;
});

const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof SheetPrimitive.Close>
>(function SheetClose(props, ref) {
  return <SheetPrimitive.Close ref={ref} data-slot="sheet-close" {...props} />;
});

const sideClasses = {
  right: 'inset-y-0 right-0 h-full w-3/4 border-l [--bl-sheet-x:100%] sm:max-w-sm',
  left: 'inset-y-0 left-0 h-full w-3/4 border-r [--bl-sheet-x:-100%] sm:max-w-sm',
  // Top and bottom sheets are the mobile drawers. Each keeps clear of the
  // notch or home indicator on its edge (safe-area insets).
  top: 'inset-x-0 top-0 max-h-[85dvh] rounded-b-xl border-b pt-[env(safe-area-inset-top)] [--bl-sheet-x:0] [--bl-sheet-y:-100%]',
  bottom:
    'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t pb-[env(safe-area-inset-bottom)] [--bl-sheet-x:0] [--bl-sheet-y:100%]',
} as const;

export interface SheetContentProps extends React.ComponentProps<typeof SheetPrimitive.Content> {
  side?: keyof typeof sideClasses;
  /**
   * The X in the corner. Turn it off when the sheet draws its own header
   * with a close control (a SheetClose), so there are not two.
   */
  showCloseButton?: boolean;
  /**
   * A grab bar at the top edge, the cue that this is a drawer. Visual only:
   * it does not drag; close with the button, Escape or the overlay. On by
   * default for bottom sheets.
   */
  handle?: boolean;
}

/** A panel from an edge: 16px radius on the free corners, elevation 5. */
const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(function SheetContent(
  {
    className,
    children,
    side = 'right',
    handle = side === 'bottom',
    showCloseButton = true,
    ...props
  },
  ref,
) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay data-slot="sheet-overlay" className={overlayClasses} />
      <SheetPrimitive.Content
        ref={ref}
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          'fixed z-50 max-h-dvh overflow-y-auto overscroll-contain flex flex-col gap-4 border-border-strong bg-surface-raised text-foreground shadow-xl outline-none data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in',
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
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            className={cn(
              overlayCloseClasses,
              side === 'top' &&
                'top-[calc(env(safe-area-inset-top)+0.75rem)] pointer-coarse:top-[calc(env(safe-area-inset-top)+0.5rem)]',
            )}
          >
            <X aria-hidden />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
});

const SheetHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function SheetHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="sheet-header"
        className={cn('flex flex-col gap-1.5 p-4 pr-12', className)}
        {...props}
      />
    );
  },
);

const SheetFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function SheetFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="sheet-footer"
        className={cn('mt-auto flex flex-col gap-2 p-4', className)}
        {...props}
      />
    );
  },
);

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof SheetPrimitive.Title>
>(function SheetTitle({ className, ...props }, ref) {
  return (
    <SheetPrimitive.Title
      ref={ref}
      data-slot="sheet-title"
      className={cn('text-base font-semibold tracking-[-0.02em] text-foreground', className)}
      {...props}
    />
  );
});

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof SheetPrimitive.Description>
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <SheetPrimitive.Description
      ref={ref}
      data-slot="sheet-description"
      className={cn('text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
});

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
