import * as React from 'react';

import {
  Anchor as AnchorPrimitive,
  AnchorProvider,
  Arrow as ArrowPrimitive,
  type ArrowProps,
  type PositionOptions,
  Positioned,
  useAnchoredPlacement,
  useAnchorContext,
} from './anchor';
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

export type { AnchorProps } from './anchor';

/**
 * A popover: a non-modal surface anchored to its trigger, with a focus
 * scope, dismissal rules and collision-aware positioning. The pieces are
 * unstyled; the kit's components add the classes.
 */

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  modal: boolean;
  contentId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopover(component: string): PopoverContextValue {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error(`${component} must be inside a Popover`);
  return context;
}

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Lock the page, hide the rest from assistive technology and trap focus. */
  modal?: boolean;
  children?: React.ReactNode;
}

function Popover({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = false,
  children,
}: PopoverProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const contentId = useStableId(undefined, 'bl-popover');
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const value = React.useMemo<PopoverContextValue>(
    () => ({ open, setOpen, modal, contentId, triggerRef, contentRef }),
    [open, setOpen, modal, contentId],
  );
  return (
    <PopoverContext.Provider value={value}>
      <AnchorProvider>{children}</AnchorProvider>
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Opens and closes the popover; the anchor unless a PopoverAnchor is present. */
const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger({ asChild = false, onClick, ...props }, forwardedRef) {
    const context = usePopover('PopoverTrigger');
    const { setImplicitAnchor } = useAnchorContext('PopoverTrigger');
    const ref = useComposedRefs(forwardedRef, context.triggerRef, setImplicitAnchor);
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

/** Positions the popover against this element (or a virtual box) instead of the trigger. */
const PopoverAnchor = AnchorPrimitive;

export interface PopoverPortalProps extends Omit<PortalPrimitiveProps, 'children'> {
  /** Keep the content mounted while closed (for a custom exit the stylesheet drives). */
  forceMount?: true;
  children?: React.ReactNode;
}

const ForceMountContext = React.createContext(false);

/**
 * Renders the content into the body. The portal node lives as long as the
 * content: through the exit animation, then it leaves with it.
 */
function PopoverPortal({ forceMount, children, ...props }: PopoverPortalProps) {
  const context = usePopover('PopoverPortal');
  const mounted = usePresence(Boolean(forceMount) || context.open, context.contentRef);
  if (!mounted) return null;
  return (
    <ForceMountContext.Provider value={Boolean(forceMount)}>
      <PortalPrimitive {...props}>{children}</PortalPrimitive>
    </ForceMountContext.Provider>
  );
}

export interface PopoverContentProps
  extends
    PositionOptions,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'>,
    Pick<
      LayerProps,
      'onEscapeKeyDown' | 'onPointerDownOutside' | 'onFocusOutside' | 'onInteractOutside'
    > {
  asChild?: boolean;
  forceMount?: true;
  dir?: 'ltr' | 'rtl';
  onOpenAutoFocus?: FocusScopeProps['onMountAutoFocus'];
  onCloseAutoFocus?: FocusScopeProps['onUnmountAutoFocus'];
}

/** The older variable names the kit's classes and consumer apps still read. Deprecated. */
const LEGACY_VARS = {
  '--radix-popover-content-transform-origin': 'transformOrigin',
  '--radix-popover-content-available-width': 'availableWidth',
  '--radix-popover-content-available-height': 'availableHeight',
  '--radix-popover-trigger-width': 'anchorWidth',
  '--radix-popover-trigger-height': 'anchorHeight',
  '--radix-popper-transform-origin': 'transformOrigin',
  '--radix-popper-available-width': 'availableWidth',
  '--radix-popper-available-height': 'availableHeight',
  '--radix-popper-anchor-width': 'anchorWidth',
  '--radix-popper-anchor-height': 'anchorHeight',
};

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    {
      forceMount,
      side = 'bottom',
      sideOffset = 0,
      align = 'center',
      alignOffset = 0,
      arrowPadding = 0,
      avoidCollisions = true,
      collisionBoundary,
      collisionPadding = 0,
      sticky = 'partial',
      hideWhenDetached = false,
      updatePositionStrategy,
      dir,
      ...props
    },
    forwardedRef,
  ) {
    const context = usePopover('PopoverContent');
    const portalForceMount = React.useContext(ForceMountContext);
    const mounted = usePresence(
      Boolean(forceMount) || portalForceMount || context.open,
      context.contentRef,
    );
    if (!mounted) return null;
    return (
      <Positioned
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        arrowPadding={arrowPadding}
        avoidCollisions={avoidCollisions}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        sticky={sticky}
        hideWhenDetached={hideWhenDetached}
        updatePositionStrategy={updatePositionStrategy}
        aliases={LEGACY_VARS}
        dir={dir}
      >
        <PopoverSurface {...props} dir={dir} ref={forwardedRef} />
      </Positioned>
    );
  },
);

type SurfaceProps = Omit<PopoverContentProps, keyof PositionOptions | 'forceMount'>;

const PopoverSurface = React.forwardRef<HTMLDivElement, SurfaceProps>(function PopoverSurface(
  {
    asChild = false,
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
  const context = usePopover('PopoverContent');
  const { side, align } = useAnchoredPlacement();
  const ref = useComposedRefs(forwardedRef, context.contentRef);
  // A press or focus outside moved attention elsewhere; focus stays there
  // rather than jumping back to the trigger. Escape and the close button do
  // return focus to the trigger.
  const dismissedFromOutside = React.useRef(false);
  useScrollLock(context.modal, context.contentRef);
  useHideOthers(context.modal, context.contentRef);
  const Comp = asChild ? Slot : 'div';
  return (
    <Layer
      asChild
      disableOutsidePointerEvents={context.modal}
      onEscapeKeyDown={onEscapeKeyDown}
      onPointerDownOutside={onPointerDownOutside}
      onFocusOutside={onFocusOutside}
      onInteractOutside={(event) => {
        onInteractOutside?.(event);
        if (event.defaultPrevented) return;
        const target = event.target;
        const press = event.detail.originalEvent.type === 'pointerdown';
        // The trigger's own click toggles; dismissing here too would close and reopen.
        if (press && target instanceof Node && context.triggerRef.current?.contains(target)) {
          event.preventDefault();
          return;
        }
        dismissedFromOutside.current = true;
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
          if (event.defaultPrevented) return;
          const fromOutside = dismissedFromOutside.current;
          dismissedFromOutside.current = false;
          if (!fromOutside) return;
          event.preventDefault();
          // Non-modal: the press or focus elsewhere decides. Modal: back to
          // the trigger, once the browser has run its own focus change.
          if (!context.modal) return;
          const trigger = context.triggerRef.current;
          if (trigger) setTimeout(() => trigger.focus({ preventScroll: true }), 0);
        }}
        restoreFocusTo={() => context.triggerRef.current}
      >
        <Comp
          role="dialog"
          id={context.contentId}
          data-state={context.open ? 'open' : 'closed'}
          data-side={side}
          data-align={align}
          {...props}
          ref={ref}
        />
      </FocusScope>
    </Layer>
  );
});

export interface PopoverCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(function PopoverClose(
  { asChild = false, onClick, ...props },
  ref,
) {
  const context = usePopover('PopoverClose');
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

export type PopoverArrowProps = ArrowProps;
const PopoverArrow = ArrowPrimitive;

export {
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
  Popover as Root,
  PopoverAnchor as Anchor,
  PopoverArrow as Arrow,
  PopoverClose as Close,
  PopoverContent as Content,
  PopoverPortal as Portal,
  PopoverTrigger as Trigger,
};
