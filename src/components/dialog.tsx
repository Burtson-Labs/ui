import X from '@burtson-labs/icons/react/x';
import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';
import * as DialogPrimitive from '../primitives/vendor/radix/react-dialog';

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof DialogPrimitive.Trigger>
>(function DialogTrigger(props, ref) {
  return <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props} />;
});

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof DialogPrimitive.Close>
>(function DialogClose(props, ref) {
  return <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />;
});

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/** The scrim under every modal surface: shared by Dialog, AlertDialog and Sheet. */
export const overlayClasses =
  'fixed inset-0 z-50 bg-black/55 backdrop-blur-[3px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in';

/**
 * The corner X of a modal surface: 32px with a mouse, 44px on touch screens,
 * with the shared focus outline.
 */
export const overlayCloseClasses = cn(
  'absolute top-3 right-3 grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground pointer-coarse:top-2 pointer-coarse:right-2 pointer-coarse:size-11 [&_svg]:size-4',
  focusRingClasses,
  'focus-visible:outline-offset-[-2px]',
);

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(overlayClasses, className)}
      {...props}
    />
  );
});

// Below 640px the dialog docks to the bottom edge, full width, and slides up:
// thumbs reach its buttons and the keyboard does not cover a centred box.
const bottomSheetClasses =
  'max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:max-h-[92dvh] max-sm:rounded-b-none max-sm:border-x-0 max-sm:border-b-0 max-sm:pb-[max(1.25rem,env(safe-area-inset-bottom))] max-sm:[--bl-scale:1] max-sm:[--bl-ty:100%]';

export interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
  /**
   * `sheet`: on phones (below 640px) the dialog is a bottom sheet, full
   * width with a grab bar. Larger screens keep the centred window.
   */
  mobile?: 'center' | 'sheet';
}

/** A centred window, 16px radius, elevation 5 (the modal shadow). */
const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { className, children, showCloseButton = true, mobile = 'center', ...props },
  ref,
) {
  const sheet = mobile === 'sheet';
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        data-mobile={mobile}
        className={cn(
          'fixed top-1/2 left-1/2 z-50 grid [--bl-scale:0.95] [--bl-ty:8px] w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain -translate-x-1/2 -translate-y-1/2 gap-5 rounded-xl border border-border-strong bg-surface-raised p-5 text-foreground shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in sm:p-6',
          sheet && bottomSheetClasses,
          className,
        )}
        {...props}
      >
        {sheet && (
          <div
            data-slot="dialog-handle"
            aria-hidden
            className="mx-auto -mt-2 -mb-3 hidden h-1 w-10 shrink-0 rounded-full bg-border-strong max-sm:block"
          />
        )}
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close data-slot="dialog-close" className={overlayCloseClasses}>
            <X aria-hidden />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

const DialogHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function DialogHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="dialog-header"
        className={cn('grid gap-1.5 pr-7', className)}
        {...props}
      />
    );
  },
);

const DialogFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function DialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="dialog-footer"
        className={cn(
          'flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end',
          className,
        )}
        {...props}
      />
    );
  },
);

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      data-slot="dialog-title"
      className={cn('text-base font-semibold tracking-[-0.02em]', className)}
      {...props}
    />
  );
});

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn('text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
});

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
