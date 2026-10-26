import * as React from 'react';

import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { FocusScope, type FocusScopeProps } from './focus-trap';
import { useHideOthers } from './hide-others';
import { Layer, type LayerProps } from './layer';
import { Portal as PortalPrimitive, type PortalProps as PortalPrimitiveProps } from './portal';
import { usePresence } from './presence';
import { useScrollLock } from './scroll-lock';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * A dialog, per the ARIA dialog pattern. Modal by default: the page behind
 * it is inert to pointers, hidden from assistive technology and does not
 * scroll; focus is trapped inside and returns to the trigger on close. The
 * title and description register themselves, so `aria-labelledby` and
 * `aria-describedby` point only at elements that exist; pass
 * `aria-describedby={undefined}` to leave the description out on purpose.
 */

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  modal: boolean;
  contentId: string;
  titleId: string | undefined;
  descriptionId: string | undefined;
  setTitleId: (id: string | undefined) => void;
  setDescriptionId: (id: string | undefined) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog(component: string): DialogContextValue {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error(`${component} must be inside a Dialog`);
  return context;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `false`: no overlay, no trap, no page lock; the page stays usable. */
  modal?: boolean;
  children?: React.ReactNode;
}

function Dialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
  children,
}: DialogProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const contentId = useStableId(undefined, 'bl-dialog');
  const [titleId, setTitleId] = React.useState<string | undefined>(undefined);
  const [descriptionId, setDescriptionId] = React.useState<string | undefined>(undefined);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const value = React.useMemo<DialogContextValue>(
    () => ({
      open,
      setOpen,
      modal,
      contentId,
      titleId,
      descriptionId,
      setTitleId,
      setDescriptionId,
      triggerRef,
      contentRef,
    }),
    [open, setOpen, modal, contentId, titleId, descriptionId],
  );
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ asChild = false, onClick, ...props }, forwardedRef) {
    const context = useDialog('DialogTrigger');
    const ref = useComposedRefs(forwardedRef, context.triggerRef);
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        type={asChild ? undefined : 'button'}
        aria-haspopup="dialog"
        aria-expanded={context.open}
        aria-controls={context.contentId}
        data-state={context.open ? 'open' : 'closed'}
        {...props}
        ref={ref}
        onClick={composeHandlers(onClick, () => context.setOpen(!context.open))}
      />
    );
  },
);

export interface DialogPortalProps extends Omit<PortalPrimitiveProps, 'children'> {
  forceMount?: true;
  children?: React.ReactNode;
}

const ForceMountContext = React.createContext(false);

/** The portal lives as long as the content: through its exit animation. */
function DialogPortal({ forceMount, children, ...props }: DialogPortalProps) {
  const context = useDialog('DialogPortal');
  const mounted = usePresence(Boolean(forceMount) || context.open, context.contentRef);
  if (!mounted) return null;
  return (
    <ForceMountContext.Provider value={Boolean(forceMount)}>
      <PortalPrimitive {...props}>{children}</PortalPrimitive>
    </ForceMountContext.Provider>
  );
}

export interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: true;
}

/** The scrim. Only a modal dialog has one; it animates out on its own. */
const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(function DialogOverlay(
  { asChild = false, forceMount, style, ...props },
  forwardedRef,
) {
  const context = useDialog('DialogOverlay');
  const portalForceMount = React.useContext(ForceMountContext);
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  const mounted = usePresence(Boolean(forceMount) || portalForceMount || context.open, nodeRef);
  if (!context.modal || !mounted) return null;
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-state={context.open ? 'open' : 'closed'}
      {...props}
      ref={ref}
      // The body's pointer events are off while the dialog is open; the
      // overlay must still receive the press that dismisses.
      style={{ pointerEvents: 'auto', ...style }}
    />
  );
});

export interface DialogContentProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    Pick<
      LayerProps,
      'onEscapeKeyDown' | 'onPointerDownOutside' | 'onFocusOutside' | 'onInteractOutside'
    > {
  asChild?: boolean;
  forceMount?: true;
  onOpenAutoFocus?: FocusScopeProps['onMountAutoFocus'];
  onCloseAutoFocus?: FocusScopeProps['onUnmountAutoFocus'];
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  {
    asChild = false,
    forceMount,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    ...props
  },
  forwardedRef,
) {
  const context = useDialog('DialogContent');
  const portalForceMount = React.useContext(ForceMountContext);
  const ref = useComposedRefs(forwardedRef, context.contentRef);
  const mounted = usePresence(
    Boolean(forceMount) || portalForceMount || context.open,
    context.contentRef,
  );
  // How the dialog was dismissed decides where focus goes on unmount.
  const dismissedByPress = React.useRef(false);
  useScrollLock(context.modal && mounted, context.contentRef);
  useHideOthers(context.modal && mounted, context.contentRef);
  if (!mounted) return null;
  const describedBy =
    'aria-describedby' in props ? props['aria-describedby'] : context.descriptionId;
  const Comp = asChild ? Slot : 'div';
  return (
    <Layer
      asChild
      disableOutsidePointerEvents={context.modal}
      onEscapeKeyDown={onEscapeKeyDown}
      onPointerDownOutside={onPointerDownOutside}
      onFocusOutside={(event) => {
        onFocusOutside?.(event);
        // A modal dialog traps focus. Focus that lands outside (a closing menu
        // handing focus back to its trigger as the dialog opens) is pulled back
        // by the scope; it is never a dismissal.
        if (context.modal) event.preventDefault();
      }}
      onInteractOutside={(event) => {
        onInteractOutside?.(event);
        if (event.defaultPrevented) return;
        if (event.detail.originalEvent.type !== 'pointerdown') return;
        const target = event.target;
        // A non-modal dialog's trigger toggles on click; a press on it is not a dismissal.
        if (
          !context.modal &&
          target instanceof Node &&
          context.triggerRef.current?.contains(target)
        ) {
          event.preventDefault();
          return;
        }
        dismissedByPress.current = true;
      }}
      onDismiss={() => context.setOpen(false)}
    >
      <FocusScope
        asChild
        trapped={context.modal}
        loop
        onMountAutoFocus={onOpenAutoFocus}
        onUnmountAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          const byPress = dismissedByPress.current;
          dismissedByPress.current = false;
          if (event.defaultPrevented || !byPress) return;
          event.preventDefault();
          // Non-modal: the press elsewhere decides where focus goes. Modal:
          // the press landed on the overlay, so focus returns to the trigger
          // once the browser has run the press's own focus change (a
          // mousedown on nothing focusable blurs to the body).
          if (!context.modal) return;
          const trigger = context.triggerRef.current;
          if (trigger) setTimeout(() => trigger.focus({ preventScroll: true }), 0);
        }}
        restoreFocusTo={() => context.triggerRef.current}
      >
        <Comp
          role="dialog"
          id={context.contentId}
          aria-modal={context.modal || undefined}
          aria-labelledby={context.titleId}
          tabIndex={-1}
          data-state={context.open ? 'open' : 'closed'}
          {...props}
          aria-describedby={describedBy}
          ref={ref}
        />
      </FocusScope>
    </Layer>
  );
});

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { asChild = false, id: idProp, ...props },
  ref,
) {
  const context = useDialog('DialogTitle');
  const id = useStableId(idProp, 'bl-dialog-title');
  const { setTitleId } = context;
  useIsoLayoutEffect(() => {
    setTitleId(id);
    return () => setTitleId(undefined);
  }, [id, setTitleId]);
  const Comp = asChild ? Slot : 'h2';
  return <Comp id={id} {...props} ref={ref} />;
});

export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ asChild = false, id: idProp, ...props }, ref) {
    const context = useDialog('DialogDescription');
    const id = useStableId(idProp, 'bl-dialog-description');
    const { setDescriptionId } = context;
    useIsoLayoutEffect(() => {
      setDescriptionId(id);
      return () => setDescriptionId(undefined);
    }, [id, setDescriptionId]);
    const Comp = asChild ? Slot : 'p';
    return <Comp id={id} {...props} ref={ref} />;
  },
);

export interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(function DialogClose(
  { asChild = false, onClick, ...props },
  ref,
) {
  const context = useDialog('DialogClose');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      type={asChild ? undefined : 'button'}
      {...props}
      ref={ref}
      onClick={composeHandlers(onClick, () => context.setOpen(false))}
    />
  );
});

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  useDialog,
  Dialog as Root,
  DialogClose as Close,
  DialogContent as Content,
  DialogDescription as Description,
  DialogOverlay as Overlay,
  DialogPortal as Portal,
  DialogTitle as Title,
  DialogTrigger as Trigger,
};
