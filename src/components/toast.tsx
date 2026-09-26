import X from '@burtson-labs/icons/react/x';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn, focusRingClasses, touchTargetClasses } from '../lib/utils';
import * as ToastPrimitive from '../primitives/vendor/radix/react-toast';

/**
 * Brief, non-blocking notices ("Message sent", "Update available"). Put one
 * `ToastProvider` + `ToastViewport` near the root and render `Toast`s with
 * `open` state; Radix handles timing, swipe-to-dismiss and the live region.
 */
const ToastProvider = ToastPrimitive.Provider;

/** Bottom right, above every overlay (z 100), full width on phones. */
const ToastViewport = React.forwardRef<
  HTMLOListElement,
  React.ComponentProps<typeof ToastPrimitive.Viewport>
>(function ToastViewport({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Viewport
      ref={ref}
      data-slot="toast-viewport"
      className={cn(
        'fixed right-0 bottom-0 z-[100] flex max-h-dvh w-full flex-col-reverse gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none sm:max-w-sm',
        className,
      )}
      {...props}
    />
  );
});

const toastVariants = cva(
  'group pointer-events-auto relative grid w-full grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1 overflow-hidden rounded-lg border p-4 pr-10 text-sm shadow-lg [--bl-ty:12px] [--bl-scale:0.98] data-[state=closed]:animate-out data-[state=open]:animate-in data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none',
  {
    variants: {
      variant: {
        default: 'border-border-strong bg-surface-raised text-foreground',
        success:
          'border-success/30 bg-surface-raised text-foreground [&_[data-slot=toast-title]]:text-success',
        destructive:
          'border-destructive/30 bg-surface-raised text-foreground [&_[data-slot=toast-title]]:text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface ToastProps
  extends React.ComponentProps<typeof ToastPrimitive.Root>, VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<HTMLLIElement, ToastProps>(function Toast(
  { className, variant, ...props },
  ref,
) {
  return (
    <ToastPrimitive.Root
      ref={ref}
      data-slot="toast"
      data-variant={variant ?? 'default'}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ToastPrimitive.Title>
>(function ToastTitle({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Title
      ref={ref}
      data-slot="toast-title"
      className={cn('col-start-1 font-semibold tracking-[-0.01em]', className)}
      {...props}
    />
  );
});

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ToastPrimitive.Description>
>(function ToastDescription({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Description
      ref={ref}
      data-slot="toast-description"
      className={cn('col-start-1 text-[13px] leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
});

/** A button inside the toast; `altText` tells screen readers how to do it without the toast. */
const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof ToastPrimitive.Action>
>(function ToastAction({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Action
      ref={ref}
      data-slot="toast-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 inline-flex h-8 shrink-0 items-center justify-center self-center rounded-md border border-border-strong bg-surface px-3 text-[13px] font-semibold transition-colors hover:bg-muted pointer-coarse:min-h-11',
        focusRingClasses,
        className,
      )}
      {...props}
    />
  );
});

/** The dismiss X: 24px drawn, 44px to a touch. */
const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof ToastPrimitive.Close>
>(function ToastClose({ className, ...props }, ref) {
  return (
    <ToastPrimitive.Close
      ref={ref}
      data-slot="toast-close"
      aria-label="Dismiss"
      className={cn(
        'absolute top-3 right-3 grid size-6 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&_svg]:size-4',
        focusRingClasses,
        touchTargetClasses,
        'absolute',
        className,
      )}
      {...props}
    >
      <X aria-hidden />
    </ToastPrimitive.Close>
  );
});

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  toastVariants,
  ToastViewport,
};
