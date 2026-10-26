import * as React from 'react';

import { useComposedRefs } from './compose-refs';
import {
  Dialog,
  DialogClose,
  type DialogCloseProps,
  DialogContent,
  type DialogContentProps,
  DialogDescription,
  type DialogDescriptionProps,
  DialogOverlay,
  type DialogOverlayProps,
  DialogPortal,
  type DialogPortalProps,
  type DialogProps,
  DialogTitle,
  type DialogTitleProps,
  DialogTrigger,
  type DialogTriggerProps,
} from './dialog';

/**
 * An alert dialog, per the ARIA alertdialog pattern: a modal that needs an
 * answer. It ignores presses outside (Escape still cancels) and starts with
 * focus on the Cancel button, the least destructive choice, when there is one.
 */

interface AlertDialogContextValue {
  cancelRef: React.RefObject<HTMLButtonElement | null>;
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null);

export type AlertDialogProps = Omit<DialogProps, 'modal'>;

function AlertDialog(props: AlertDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const value = React.useMemo(() => ({ cancelRef }), []);
  return (
    <AlertDialogContext.Provider value={value}>
      <Dialog {...props} modal />
    </AlertDialogContext.Provider>
  );
}

function useAlertDialog(component: string): AlertDialogContextValue {
  const context = React.useContext(AlertDialogContext);
  if (!context) throw new Error(`${component} must be inside an AlertDialog`);
  return context;
}

export type AlertDialogTriggerProps = DialogTriggerProps;
const AlertDialogTrigger = DialogTrigger;

export type AlertDialogPortalProps = DialogPortalProps;
const AlertDialogPortal = DialogPortal;

export type AlertDialogOverlayProps = DialogOverlayProps;
const AlertDialogOverlay = DialogOverlay;

export type AlertDialogContentProps = DialogContentProps;

const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent(
    { onOpenAutoFocus, onPointerDownOutside, onInteractOutside, ...props },
    ref,
  ) {
    const { cancelRef } = useAlertDialog('AlertDialogContent');
    return (
      <DialogContent
        role="alertdialog"
        {...props}
        ref={ref}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (event.defaultPrevented || !cancelRef.current) return;
          event.preventDefault();
          cancelRef.current.focus({ preventScroll: true });
        }}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event);
          event.preventDefault();
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          event.preventDefault();
        }}
      />
    );
  },
);

export type AlertDialogTitleProps = DialogTitleProps;
const AlertDialogTitle = DialogTitle;

export type AlertDialogDescriptionProps = DialogDescriptionProps;
const AlertDialogDescription = DialogDescription;

export type AlertDialogActionProps = DialogCloseProps;
/** The confirming button; closes the dialog. */
const AlertDialogAction = DialogClose;

export type AlertDialogCancelProps = DialogCloseProps;

/** The cancelling button; closes the dialog and receives focus on open. */
const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  function AlertDialogCancel(props, forwardedRef) {
    const { cancelRef } = useAlertDialog('AlertDialogCancel');
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return <DialogClose {...props} ref={ref} />;
  },
);

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialog as Root,
  AlertDialogAction as Action,
  AlertDialogCancel as Cancel,
  AlertDialogContent as Content,
  AlertDialogDescription as Description,
  AlertDialogOverlay as Overlay,
  AlertDialogPortal as Portal,
  AlertDialogTitle as Title,
  AlertDialogTrigger as Trigger,
};
