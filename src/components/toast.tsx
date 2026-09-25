import X from '@burtson-labs/icons/react/x';
import { cva, type VariantProps } from 'class-variance-authority';
import { Toast as ToastPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '../lib/utils';

/**
 * Brief, non-blocking notices ("Message sent", "Update available"). Put one
 * `ToastProvider` + `ToastViewport` near the root and render `Toast`s with
 * `open` state; Radix handles timing, swipe-to-dismiss and the live region.
 */
const ToastProvider = ToastPrimitive.Provider;

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'fixed right-0 bottom-0 z-[100] flex max-h-dvh w-full flex-col-reverse gap-2 p-4 outline-none sm:max-w-sm',
        className,
      )}
      {...props}
    />
  );
}

const toastVariants = cva(
  'group pointer-events-auto relative grid w-full grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1 overflow-hidden rounded-lg border p-4 pr-10 text-sm shadow-[0_16px_48px_rgb(0_0_0_/_0.18)] [--bl-ty:12px] [--bl-scale:0.98] data-[state=closed]:animate-out data-[state=open]:animate-in data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none',
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

function Toast({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
}

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn('col-start-1 font-semibold tracking-[-0.01em]', className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn('col-start-1 text-[13px] leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
}

/** A button inside the toast; `altText` tells screen readers how to do it without the toast. */
function ToastAction({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 inline-flex h-8 shrink-0 items-center justify-center self-center rounded-md border border-border-strong bg-surface px-3 text-[13px] font-semibold transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/20',
        className,
      )}
      {...props}
    />
  );
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Dismiss"
      className={cn(
        'absolute top-3 right-3 grid size-6 place-items-center rounded-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/20 [&_svg]:size-3.5',
        className,
      )}
      {...props}
    >
      <X aria-hidden />
    </ToastPrimitive.Close>
  );
}

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
