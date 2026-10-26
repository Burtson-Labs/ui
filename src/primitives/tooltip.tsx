import * as React from 'react';

import {
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
import { Layer, type LayerProps } from './layer';
import { Portal as PortalPrimitive, type PortalProps as PortalPrimitiveProps } from './portal';
import { usePresence } from './presence';
import { Slot } from './slot';
import { useCallbackRef } from './use-callback-ref';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';

/**
 * A tooltip, per the ARIA tooltip pattern: a `role="tooltip"` label that
 * describes its trigger (`aria-describedby`) while shown. It opens on hover
 * after a delay and on keyboard focus at once; never on touch or a press.
 * It closes when the pointer leaves, on blur, on a press, and on Escape.
 *
 * Group timing: once one tooltip in a provider has shown, the next one opens
 * without the delay if it is reached within `skipDelayDuration` of the last
 * closing, so sweeping along a toolbar reads each label without a pause.
 */

interface ProviderContextValue {
  delayDuration: number;
  disableHoverableContent: boolean;
  /** Whether the next pointer open should wait for the delay. */
  shouldDelay: () => boolean;
  onOpened: () => void;
  onClosed: () => void;
}

const ProviderContext = React.createContext<ProviderContextValue | null>(null);

export interface TooltipProviderProps {
  /** Milliseconds the pointer rests on a trigger before the tooltip shows. */
  delayDuration?: number;
  /** Milliseconds after one tooltip closes during which the next opens at once. */
  skipDelayDuration?: number;
  /** Close when the pointer leaves the trigger, even toward the tooltip. */
  disableHoverableContent?: boolean;
  children?: React.ReactNode;
}

function TooltipProvider({
  delayDuration = 700,
  skipDelayDuration = 300,
  disableHoverableContent = false,
  children,
}: TooltipProviderProps) {
  const delayed = React.useRef(true);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const value = React.useMemo<ProviderContextValue>(
    () => ({
      delayDuration,
      disableHoverableContent,
      shouldDelay: () => delayed.current,
      onOpened: () => {
        clearTimeout(timer.current);
        delayed.current = false;
      },
      onClosed: () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          delayed.current = true;
        }, skipDelayDuration);
      },
    }),
    [delayDuration, disableHoverableContent, skipDelayDuration],
  );
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

function useProvider(component: string): ProviderContextValue {
  const context = React.useContext(ProviderContext);
  if (!context) throw new Error(`${component} must be inside a TooltipProvider`);
  return context;
}

type OpenState = 'closed' | 'delayed-open' | 'instant-open';

interface TooltipContextValue {
  open: boolean;
  state: OpenState;
  contentId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  hoverable: boolean;
  openNow: () => void;
  openAfterDelay: () => void;
  close: () => void;
  /** The pointer left the trigger or the content; close unless it is heading for the other. */
  leave: () => void;
  /** The pointer is over the trigger or the content. */
  enter: () => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function useTooltip(component: string): TooltipContextValue {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error(`${component} must be inside a Tooltip`);
  return context;
}

export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Overrides the provider's delay for this tooltip. */
  delayDuration?: number;
  disableHoverableContent?: boolean;
  children?: React.ReactNode;
}

const union = (a: DOMRect, b: DOMRect) => ({
  left: Math.min(a.left, b.left),
  top: Math.min(a.top, b.top),
  right: Math.max(a.right, b.right),
  bottom: Math.max(a.bottom, b.bottom),
});

function Tooltip({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  delayDuration: delayProp,
  disableHoverableContent: hoverableProp,
  children,
}: TooltipProps) {
  const provider = useProvider('Tooltip');
  const delayDuration = delayProp ?? provider.delayDuration;
  const hoverable = !(hoverableProp ?? provider.disableHoverableContent);
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [instant, setInstant] = React.useState(false);
  const contentId = useStableId(undefined, 'bl-tooltip');
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const openTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stopWatching = React.useRef<(() => void) | undefined>(undefined);

  const wasOpen = React.useRef(open);
  React.useEffect(() => {
    if (open === wasOpen.current) return;
    wasOpen.current = open;
    if (open) provider.onOpened();
    else provider.onClosed();
  }, [open, provider]);
  React.useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      stopWatching.current?.();
    },
    [],
  );

  const clearOpenTimer = () => {
    clearTimeout(openTimer.current);
    openTimer.current = undefined;
  };
  const close = useCallbackRef(() => {
    clearOpenTimer();
    stopWatching.current?.();
    stopWatching.current = undefined;
    setOpen(false);
  });
  const openNow = useCallbackRef(() => {
    clearOpenTimer();
    setInstant(true);
    setOpen(true);
  });
  // The pointer keeps moving while it rests on a trigger; the delay runs
  // from the first move, not the last.
  const openAfterDelay = useCallbackRef(() => {
    if (open || openTimer.current !== undefined) return;
    if (!provider.shouldDelay()) {
      openNow();
      return;
    }
    openTimer.current = setTimeout(() => {
      openTimer.current = undefined;
      setInstant(false);
      setOpen(true);
    }, delayDuration);
  });
  const enter = useCallbackRef(() => {
    stopWatching.current?.();
    stopWatching.current = undefined;
  });
  const leave = useCallbackRef(() => {
    clearOpenTimer();
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!open || !hoverable || !trigger || !content) {
      close();
      return;
    }
    // Keep open while the pointer stays within the box that spans trigger
    // and content (the gap between them included); close once it leaves it.
    const box = union(trigger.getBoundingClientRect(), content.getBoundingClientRect());
    const onMove = (event: PointerEvent) => {
      const inside =
        event.clientX >= box.left &&
        event.clientX <= box.right &&
        event.clientY >= box.top &&
        event.clientY <= box.bottom;
      if (!inside) close();
    };
    stopWatching.current?.();
    document.addEventListener('pointermove', onMove);
    stopWatching.current = () => document.removeEventListener('pointermove', onMove);
  });

  const value = React.useMemo<TooltipContextValue>(
    () => ({
      open,
      state: open ? (instant ? 'instant-open' : 'delayed-open') : 'closed',
      contentId,
      triggerRef,
      contentRef,
      hoverable,
      openNow,
      openAfterDelay,
      close,
      leave,
      enter,
    }),
    [open, instant, contentId, hoverable, openNow, openAfterDelay, close, leave, enter],
  );
  return (
    <TooltipContext.Provider value={value}>
      <AnchorProvider>{children}</AnchorProvider>
    </TooltipContext.Provider>
  );
}

export interface TooltipTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  function TooltipTrigger(
    {
      asChild = false,
      onPointerMove,
      onPointerLeave,
      onPointerDown,
      onFocus,
      onBlur,
      onClick,
      ...props
    },
    forwardedRef,
  ) {
    const context = useTooltip('TooltipTrigger');
    const { setImplicitAnchor } = useAnchorContext('TooltipTrigger');
    const ref = useComposedRefs(forwardedRef, context.triggerRef, setImplicitAnchor);
    // A press keeps focus from opening the tooltip: clicking a button
    // focuses it, and that focus is not the keyboard asking for a label.
    const pressed = React.useRef(false);
    React.useEffect(() => {
      const release = () => {
        pressed.current = false;
      };
      document.addEventListener('pointerup', release);
      return () => document.removeEventListener('pointerup', release);
    }, []);
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        type={asChild ? undefined : 'button'}
        aria-describedby={context.open ? context.contentId : undefined}
        data-state={context.state}
        {...props}
        ref={ref}
        onPointerMove={composeHandlers(
          onPointerMove,
          (event: React.PointerEvent<HTMLButtonElement>) => {
            if (event.pointerType === 'touch') return;
            context.enter();
            context.openAfterDelay();
          },
        )}
        onPointerLeave={composeHandlers(onPointerLeave, () => context.leave())}
        onPointerDown={(event) => {
          onPointerDown?.(event);
          if (event.defaultPrevented) return;
          pressed.current = true;
          context.close();
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (event.defaultPrevented) return;
          if (!pressed.current) context.openNow();
        }}
        onBlur={composeHandlers(onBlur, () => context.close())}
        onClick={composeHandlers(onClick, () => context.close())}
      />
    );
  },
);

export interface TooltipPortalProps extends Omit<PortalPrimitiveProps, 'children'> {
  forceMount?: true;
  children?: React.ReactNode;
}

const ForceMountContext = React.createContext(false);

function TooltipPortal({ forceMount, children, ...props }: TooltipPortalProps) {
  const context = useTooltip('TooltipPortal');
  const mounted = usePresence(Boolean(forceMount) || context.open, context.contentRef);
  if (!mounted) return null;
  return (
    <ForceMountContext.Provider value={Boolean(forceMount)}>
      <PortalPrimitive {...props}>{children}</PortalPrimitive>
    </ForceMountContext.Provider>
  );
}

export interface TooltipContentProps
  extends
    PositionOptions,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'>,
    Pick<LayerProps, 'onEscapeKeyDown' | 'onPointerDownOutside'> {
  asChild?: boolean;
  forceMount?: true;
  dir?: 'ltr' | 'rtl';
  /** Text for assistive technology when the visible content is not plain text. */
  'aria-label'?: string;
}

const LEGACY_VARS = {
  '--radix-tooltip-content-transform-origin': 'transformOrigin',
  '--radix-tooltip-content-available-width': 'availableWidth',
  '--radix-tooltip-content-available-height': 'availableHeight',
  '--radix-tooltip-trigger-width': 'anchorWidth',
  '--radix-tooltip-trigger-height': 'anchorHeight',
  '--radix-popper-transform-origin': 'transformOrigin',
  '--radix-popper-available-width': 'availableWidth',
  '--radix-popper-available-height': 'availableHeight',
  '--radix-popper-anchor-width': 'anchorWidth',
  '--radix-popper-anchor-height': 'anchorHeight',
};

const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent(
    {
      forceMount,
      side = 'top',
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
    const context = useTooltip('TooltipContent');
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
        <TooltipSurface {...props} dir={dir} ref={forwardedRef} />
      </Positioned>
    );
  },
);

type SurfaceProps = Omit<TooltipContentProps, keyof PositionOptions | 'forceMount'>;

const TooltipSurface = React.forwardRef<HTMLDivElement, SurfaceProps>(function TooltipSurface(
  {
    asChild = false,
    onEscapeKeyDown,
    onPointerDownOutside,
    onPointerEnter,
    onPointerLeave,
    ...props
  },
  forwardedRef,
) {
  const context = useTooltip('TooltipContent');
  const { side, align } = useAnchoredPlacement();
  const ref = useComposedRefs(forwardedRef, context.contentRef);
  const Comp = asChild ? Slot : 'div';
  return (
    <Layer
      asChild
      onEscapeKeyDown={onEscapeKeyDown}
      onPointerDownOutside={onPointerDownOutside}
      onDismiss={() => context.close()}
    >
      <Comp
        role="tooltip"
        id={context.contentId}
        data-state={context.state}
        data-side={side}
        data-align={align}
        {...props}
        ref={ref}
        onPointerEnter={composeHandlers(onPointerEnter, () => {
          if (context.hoverable) context.enter();
        })}
        onPointerLeave={composeHandlers(onPointerLeave, (event: React.PointerEvent) => {
          if (event.pointerType === 'touch') return;
          context.leave();
        })}
      />
    </Layer>
  );
});

export type TooltipArrowProps = ArrowProps;
const TooltipArrow = ArrowPrimitive;

export {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
  Tooltip as Root,
  TooltipArrow as Arrow,
  TooltipContent as Content,
  TooltipPortal as Portal,
  TooltipProvider as Provider,
  TooltipTrigger as Trigger,
};
