import * as React from 'react';

import { cn } from '../lib/utils';
import * as AlertDialogPrimitive from '../primitives/vendor/radix/react-alert-dialog';

import { buttonVariants } from './button';
import { overlayClasses } from './dialog';

/**
 * A confirmation that interrupts: "Delete 3 keys?", "Revoke access?". Unlike
 * Dialog it has no close button and ignores outside clicks, so the person
 * answers it; Escape still cancels. Focus starts on Cancel.
 */
function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

const AlertDialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof AlertDialogPrimitive.Trigger>
>(function AlertDialogTrigger(props, ref) {
  return <AlertDialogPrimitive.Trigger ref={ref} data-slot="alert-dialog-trigger" {...props} />;
});

const AlertDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof AlertDialogPrimitive.Content>
>(function AlertDialogContent({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={overlayClasses} />
      <AlertDialogPrimitive.Content
        ref={ref}
        data-slot="alert-dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 grid [--bl-scale:0.95] [--bl-ty:8px] w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain -translate-x-1/2 -translate-y-1/2 gap-5 rounded-xl border border-border-strong bg-surface-raised p-5 text-foreground shadow-xl outline-none data-[state=closed]:animate-out data-[state=open]:animate-in sm:p-6',
          className,
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
});

const AlertDialogHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function AlertDialogHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="alert-dialog-header"
        className={cn('grid gap-1.5', className)}
        {...props}
      />
    );
  },
);

const AlertDialogFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function AlertDialogFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="alert-dialog-footer"
        className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
        {...props}
      />
    );
  },
);

const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<typeof AlertDialogPrimitive.Title>
>(function AlertDialogTitle({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      data-slot="alert-dialog-title"
      className={cn('text-base font-semibold tracking-[-0.02em]', className)}
      {...props}
    />
  );
});

const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<typeof AlertDialogPrimitive.Description>
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      data-slot="alert-dialog-description"
      className={cn('text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
});

export interface AlertDialogActionProps extends React.ComponentProps<
  typeof AlertDialogPrimitive.Action
> {
  /** Paints the confirming button as a danger action. */
  destructive?: boolean;
}

/** The confirming button. */
const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogAction({ className, destructive = false, ...props }, ref) {
    return (
      <AlertDialogPrimitive.Action
        ref={ref}
        data-slot="alert-dialog-action"
        className={cn(
          buttonVariants({ variant: destructive ? 'destructive' : 'default' }),
          className,
        )}
        {...props}
      />
    );
  },
);

const AlertDialogCancel = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof AlertDialogPrimitive.Cancel>
>(function AlertDialogCancel({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  );
});

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
};
