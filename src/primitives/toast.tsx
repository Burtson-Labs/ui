import * as React from 'react';
import { createPortal } from 'react-dom';

import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { LayerBranch } from './layer';
import { usePresence } from './presence';
import { Slot } from './slot';
import { useCallbackRef } from './use-callback-ref';
import { useControllableState } from './use-controllable-state';

/**
 * Toasts: brief notices that do not take focus. Built from the ARIA
 * live-region rules (`status` for polite, `alert`-strength `assertive` for
 * urgent) rather than a single pattern, since the Authoring Practices have
 * none for toasts.
 *
 * - **Viewport.** An `<ol>` inside a labelled `region` landmark. The region
 *   is a `LayerBranch` (a press or focus there never dismisses a popover or
 *   dialog) and is marked `data-bl-live`, so a modal's `hideOthers` leaves it
 *   reachable. `hotkey` (F8 by default) focuses the list from anywhere;
 *   Tab then walks the toasts.
 * - **Timing.** Each toast closes after `duration` ms (the provider's,
 *   5000 by default; `Infinity` never). Every timer pauses while the pointer
 *   is over the viewport, while focus is inside it, and while the window is
 *   in the background, and resumes with the time that was left.
 * - **Announcing.** A toast is read once, when it opens: its text (the
 *   provider `label`, then the title, description and each action's
 *   `altText`) is put in a short-lived, visually hidden live region,
 *   `assertive` for `type="foreground"` and `polite` for `"background"`.
 *   The toast itself is not a live region, so nothing reads it twice.
 * - **Swipe.** A drag in `swipeDirection` moves the toast (`data-swipe`
 *   start → move, and `--bl-toast-swipe-move-x/y`); releasing past
 *   `swipeThreshold` px dismisses it (`data-swipe="end"`,
 *   `--bl-toast-swipe-end-x/y`), short of it springs back
 *   (`data-swipe="cancel"`). The `--radix-toast-swipe-*` names are kept as
 *   deprecated aliases.
 * - **Escape** in a focused toast closes it (`onEscapeKeyDown` can prevent
 *   that); focus that was inside a closing toast moves to the viewport.
 */

export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export type SwipeEvent = CustomEvent<{
  originalEvent: PointerEvent;
  delta: { x: number; y: number };
}>;

interface ProviderContextValue {
  label: string;
  duration: number;
  swipeDirection: SwipeDirection;
  swipeThreshold: number;
  announcerContainer?: Element | DocumentFragment;
  viewport: HTMLOListElement | null;
  setViewport: (node: HTMLOListElement | null) => void;
  paused: boolean;
  setHovered: (hovered: boolean) => void;
  setFocusInside: (focused: boolean) => void;
}

const ProviderContext = React.createContext<ProviderContextValue | null>(null);

function useProvider(component: string): ProviderContextValue {
  const context = React.useContext(ProviderContext);
  if (!context) throw new Error(`${component} must be inside a ToastProvider`);
  return context;
}

export interface ToastProviderProps {
  children?: React.ReactNode;
  /**
   * Read before each toast's text, so a screen reader user knows what interrupted them. Localize it.
   * @default 'Notification'
   */
  label?: string;
  /**
   * Time on screen for each toast, in ms.
   * @default 5000
   */
  duration?: number;
  /**
   * The direction a swipe dismisses in.
   * @default 'right'
   */
  swipeDirection?: SwipeDirection;
  /**
   * Distance in px a swipe must travel to dismiss.
   * @default 50
   */
  swipeThreshold?: number;
  /**
   * Where the short-lived announcement regions are rendered.
   * @default document.body
   */
  announcerContainer?: Element | DocumentFragment;
}

function ToastProvider({
  children,
  label = 'Notification',
  duration = 5000,
  swipeDirection = 'right',
  swipeThreshold = 50,
  announcerContainer,
}: ToastProviderProps) {
  const [viewport, setViewport] = React.useState<HTMLOListElement | null>(null);
  const [hovered, setHovered] = React.useState(false);
  const [focusInside, setFocusInside] = React.useState(false);
  const [windowBlurred, setWindowBlurred] = React.useState(false);
  React.useEffect(() => {
    const onBlur = () => setWindowBlurred(true);
    const onFocus = () => setWindowBlurred(false);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, []);
  const paused = hovered || focusInside || windowBlurred;
  const value = React.useMemo<ProviderContextValue>(
    () => ({
      label,
      duration,
      swipeDirection,
      swipeThreshold,
      announcerContainer,
      viewport,
      setViewport,
      paused,
      setHovered,
      setFocusInside,
    }),
    [label, duration, swipeDirection, swipeThreshold, announcerContainer, viewport, paused],
  );
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

const MODIFIERS = new Set(['altKey', 'ctrlKey', 'metaKey', 'shiftKey']);

/** Whether a key event matches a hotkey such as `['F8']` or `['altKey', 'KeyT']`. */
export function matchesHotkey(event: KeyboardEvent, hotkey: string[]): boolean {
  if (!hotkey.length) return false;
  return hotkey.every((key) =>
    MODIFIERS.has(key) ? event[key as 'altKey'] : event.code === key || event.key === key,
  );
}

const hotkeyLabel = (hotkey: string[]) =>
  hotkey
    .map((key) =>
      MODIFIERS.has(key)
        ? key.replace('Key', '').replace(/^\w/, (c) => c.toUpperCase())
        : key.replace(/^Key|^Digit/, ''),
    )
    .join('+');

export interface ToastViewportProps extends React.HTMLAttributes<HTMLOListElement> {
  asChild?: boolean;
  /**
   * Keys that move focus to the toasts from anywhere: `event.code` values and modifier names (`altKey`).
   * @default ['F8']
   */
  hotkey?: string[];
  /**
   * The landmark's name; `{hotkey}` is replaced with the hotkey. Localize it.
   * @default 'Notifications ({hotkey})'
   */
  label?: string;
}

const ToastViewport = React.forwardRef<HTMLOListElement, ToastViewportProps>(function ToastViewport(
  { asChild = false, hotkey = ['F8'], label = 'Notifications ({hotkey})', ...props },
  forwardedRef,
) {
  const context = useProvider('ToastViewport');
  const nodeRef = React.useRef<HTMLOListElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef, context.setViewport);
  const keys = hotkey.join('|');
  React.useEffect(() => {
    const list = keys ? keys.split('|') : [];
    const onKeyDown = (event: KeyboardEvent) => {
      if (!matchesHotkey(event, list)) return;
      event.preventDefault();
      nodeRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [keys]);
  const { setHovered, setFocusInside, viewport } = context;
  // Native listeners: the toasts are portalled in from elsewhere in the
  // React tree, so React's own events from them never reach this element.
  React.useEffect(() => {
    if (!viewport) return;
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') setHovered(true);
    };
    const leave = () => setHovered(false);
    const focusIn = () => setFocusInside(true);
    const focusOut = (event: FocusEvent) => {
      const to = event.relatedTarget;
      if (!(to instanceof Node && viewport.contains(to))) setFocusInside(false);
    };
    viewport.addEventListener('pointerenter', enter);
    viewport.addEventListener('pointerleave', leave);
    viewport.addEventListener('focusin', focusIn);
    viewport.addEventListener('focusout', focusOut);
    return () => {
      viewport.removeEventListener('pointerenter', enter);
      viewport.removeEventListener('pointerleave', leave);
      viewport.removeEventListener('focusin', focusIn);
      viewport.removeEventListener('focusout', focusOut);
      // A viewport that goes away with the pointer or focus inside must not
      // leave every timer paused.
      setHovered(false);
      setFocusInside(false);
    };
  }, [viewport, setHovered, setFocusInside]);
  const Comp = asChild ? Slot : 'ol';
  return (
    <LayerBranch
      role="region"
      aria-label={label.replace('{hotkey}', hotkeyLabel(hotkey))}
      data-bl-live=""
      // The empty parts of the viewport never block the page; each toast
      // takes pointer events back for itself.
      style={{ pointerEvents: 'none' }}
    >
      <Comp tabIndex={-1} {...props} ref={ref} />
    </LayerBranch>
  );
});

interface ToastContextValue {
  close: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

function useToast(component: string): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error(`${component} must be inside a Toast`);
  return context;
}

const ALT_TEXT = 'data-bl-toast-alt';
const SKIP = 'data-bl-toast-skip';

/** The text a toast announces: its readable text, with each action's alt text instead of its label. */
export function announcementText(node: Node): string[] {
  const parts: string[] = [];
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent?.trim();
      if (text) parts.push(text);
    } else if (child instanceof Element) {
      if (child.hasAttribute(SKIP) || child.getAttribute('aria-hidden') === 'true') continue;
      const alt = child.getAttribute(ALT_TEXT);
      if (alt !== null) {
        if (alt.trim()) parts.push(alt.trim());
        continue;
      }
      parts.push(...announcementText(child));
    }
  }
  return parts;
}

const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * A live region that exists before its text arrives (a region inserted
 * with its text already in it is not reliably announced), then goes away.
 */
function Announcement({
  container,
  politeness,
  text,
}: {
  container?: Element | DocumentFragment;
  politeness: 'assertive' | 'polite';
  text: string;
}) {
  const [shown, setShown] = React.useState('');
  React.useEffect(() => {
    const timer = setTimeout(() => setShown(text), 50);
    return () => clearTimeout(timer);
  }, [text]);
  const target = container ?? document.body;
  return createPortal(
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic
      data-bl-toast-announce=""
      style={visuallyHidden}
    >
      {shown}
    </div>,
    target,
  );
}

const ANNOUNCE_FOR = 1000;
const SWIPE_START = 10;

export interface ToastProps extends React.LiHTMLAttributes<HTMLLIElement> {
  asChild?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Keep it in the DOM while closed. */
  forceMount?: true;
  /** `foreground` (the default) is announced assertively, `background` politely. */
  type?: 'foreground' | 'background';
  /** Time on screen in ms; overrides the provider's. */
  duration?: number;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPause?: () => void;
  onResume?: () => void;
  onSwipeStart?: (event: SwipeEvent) => void;
  onSwipeMove?: (event: SwipeEvent) => void;
  onSwipeCancel?: (event: SwipeEvent) => void;
  /** `preventDefault()` keeps the toast open. */
  onSwipeEnd?: (event: SwipeEvent) => void;
}

interface SwipeState {
  pointerId: number;
  x: number;
  y: number;
  started: boolean;
  delta: { x: number; y: number };
  userSelect: string;
}

const Toast = React.forwardRef<HTMLLIElement, ToastProps>(function Toast(
  { open: openProp, defaultOpen = true, onOpenChange, forceMount, ...props },
  forwardedRef,
) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const nodeRef = React.useRef<HTMLLIElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  const mounted = usePresence(open, nodeRef);
  if (!mounted && !forceMount) return null;
  return <ToastImpl {...props} ref={ref} open={open} setOpen={setOpen} />;
});

interface ToastImplProps extends Omit<ToastProps, 'open' | 'defaultOpen' | 'onOpenChange'> {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ToastImpl = React.forwardRef<HTMLLIElement, ToastImplProps>(function ToastImpl(
  {
    asChild = false,
    open,
    setOpen,
    type = 'foreground',
    duration: durationProp,
    onEscapeKeyDown,
    onPause,
    onResume,
    onSwipeStart,
    onSwipeMove,
    onSwipeCancel,
    onSwipeEnd,
    onKeyDown,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    style,
    ...props
  },
  forwardedRef,
) {
  const provider = useProvider('Toast');
  const nodeRef = React.useRef<HTMLLIElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  const duration = durationProp ?? provider.duration;
  const { viewport, paused } = provider;
  const [swiping, setSwiping] = React.useState(false);

  const close = useCallbackRef(() => {
    const node = nodeRef.current;
    if (node && viewport && node.contains(document.activeElement)) viewport.focus();
    setOpen(false);
  });

  // The timer: restarted with the full duration when it changes, paused
  // with what is left and resumed from there.
  const remaining = React.useRef(duration);
  const timedFor = React.useRef(duration);
  const running = open && Boolean(viewport) && !paused && !swiping;
  React.useEffect(() => {
    // After the previous run's cleanup has taken off the time it used.
    if (timedFor.current !== duration) {
      timedFor.current = duration;
      remaining.current = duration;
    }
    if (!running || !Number.isFinite(duration)) return;
    const startedAt = Date.now();
    const timer = setTimeout(close, Math.max(0, remaining.current));
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [running, duration, close]);

  const pause = useCallbackRef(onPause);
  const resume = useCallbackRef(onResume);
  const wasPaused = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    if (paused && !wasPaused.current) pause();
    if (!paused && wasPaused.current) resume();
    wasPaused.current = paused;
  }, [paused, open, pause, resume]);

  // Read once on opening.
  const [announcement, setAnnouncement] = React.useState<string | null>(null);
  React.useEffect(() => {
    const node = nodeRef.current;
    if (!open || !viewport || !node) return;
    const text = [provider.label, ...announcementText(node)].filter(Boolean).join(' ');
    setAnnouncement(text);
    const timer = setTimeout(() => setAnnouncement(null), ANNOUNCE_FOR);
    return () => clearTimeout(timer);
    // Announce on open only, not when the label or text changes afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, viewport]);

  // Swipe.
  const swipe = React.useRef<SwipeState | null>(null);
  const horizontal = provider.swipeDirection === 'left' || provider.swipeDirection === 'right';
  const sign = provider.swipeDirection === 'right' || provider.swipeDirection === 'down' ? 1 : -1;
  const setSwipeVars = (kind: 'move' | 'end', delta: { x: number; y: number } | null) => {
    const node = nodeRef.current;
    if (!node) return;
    for (const prefix of ['--bl-toast-swipe', '--radix-toast-swipe']) {
      for (const axis of ['x', 'y'] as const) {
        const name = `${prefix}-${kind}-${axis}`;
        if (delta) node.style.setProperty(name, `${delta[axis]}px`);
        else node.style.removeProperty(name);
      }
    }
  };
  const fire = (
    handler: ((event: SwipeEvent) => void) | undefined,
    name: string,
    originalEvent: PointerEvent,
    delta: { x: number; y: number },
  ) => {
    const event: SwipeEvent = new CustomEvent(name, {
      cancelable: true,
      detail: { originalEvent, delta },
    });
    handler?.(event);
    return !event.defaultPrevented;
  };
  const finishSwipe = useCallbackRef(
    (event: React.PointerEvent<HTMLLIElement>, cancelled: boolean) => {
      const state = swipe.current;
      swipe.current = null;
      if (!state?.started) return;
      const node = event.currentTarget;
      if (node.hasPointerCapture(state.pointerId)) node.releasePointerCapture?.(state.pointerId);
      setSwiping(false);
      node.style.userSelect = state.userSelect;
      const distance = Math.abs(horizontal ? state.delta.x : state.delta.y);
      const dismiss =
        !cancelled &&
        distance >= provider.swipeThreshold &&
        fire(onSwipeEnd, 'bl-toast-swipe-end', event.nativeEvent, state.delta);
      setSwipeVars('move', null);
      if (dismiss) {
        node.setAttribute('data-swipe', 'end');
        setSwipeVars('end', state.delta);
        close();
      } else {
        node.setAttribute('data-swipe', 'cancel');
        fire(onSwipeCancel, 'bl-toast-swipe-cancel', event.nativeEvent, state.delta);
      }
      // The click that ends a drag is not a press on the toast's buttons.
      // It follows the pointerup in the same task, if it comes at all.
      const swallow = (click: Event) => {
        click.preventDefault();
        click.stopPropagation();
      };
      node.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => node.removeEventListener('click', swallow, { capture: true }), 0);
    },
  );
  const startSwipe = useCallbackRef((event: React.PointerEvent<HTMLLIElement>) => {
    if (event.button !== 0) return;
    swipe.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      started: false,
      delta: { x: 0, y: 0 },
      userSelect: '',
    };
  });
  const moveSwipe = useCallbackRef((event: React.PointerEvent<HTMLLIElement>) => {
    const state = swipe.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    const along = (horizontal ? dx : dy) * sign;
    const across = horizontal ? dy : dx;
    if (!state.started) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_START) return;
      // Mostly across the swipe axis, or backwards: not a swipe (a scroll, a selection).
      if (Math.abs(across) > Math.abs(along) || along <= 0) {
        swipe.current = null;
        return;
      }
      state.started = true;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      // A drag is not a text selection.
      state.userSelect = event.currentTarget.style.userSelect;
      event.currentTarget.style.userSelect = 'none';
      window.getSelection()?.removeAllRanges();
      setSwiping(true);
      event.currentTarget.setAttribute('data-swipe', 'start');
      fire(onSwipeStart, 'bl-toast-swipe-start', event.nativeEvent, { x: 0, y: 0 });
    }
    // Movement only toward the dismissal side; the other axis stays put.
    const travelled = Math.max(0, along) * sign;
    state.delta = horizontal ? { x: travelled, y: 0 } : { x: 0, y: travelled };
    if (!fire(onSwipeMove, 'bl-toast-swipe-move', event.nativeEvent, state.delta)) return;
    event.currentTarget.setAttribute('data-swipe', 'move');
    setSwipeVars('move', state.delta);
  });
  const endSwipe = useCallbackRef((event: React.PointerEvent<HTMLLIElement>) =>
    finishSwipe(event, false),
  );
  const cancelSwipe = useCallbackRef((event: React.PointerEvent<HTMLLIElement>) =>
    finishSwipe(event, true),
  );
  const escape = useCallbackRef((event: React.KeyboardEvent<HTMLLIElement>) => {
    if (event.key !== 'Escape') return;
    const native = event.nativeEvent;
    onEscapeKeyDown?.(native);
    if (native.defaultPrevented) return;
    // Consumed here: a layer underneath (an open dialog) does not close too.
    event.preventDefault();
    close();
  });

  const Comp = asChild ? Slot : 'li';
  const toast = (
    <Comp
      tabIndex={0}
      data-state={open ? 'open' : 'closed'}
      data-swipe-direction={provider.swipeDirection}
      {...props}
      ref={ref}
      style={{ pointerEvents: 'auto', touchAction: horizontal ? 'pan-y' : 'pan-x', ...style }}
      onKeyDown={composeHandlers(onKeyDown, escape)}
      onPointerDown={composeHandlers(onPointerDown, startSwipe)}
      onPointerMove={composeHandlers(onPointerMove, moveSwipe)}
      onPointerUp={composeHandlers(onPointerUp, endSwipe)}
      onPointerCancel={composeHandlers(onPointerCancel, cancelSwipe)}
    />
  );
  const context = React.useMemo(() => ({ close }), [close]);
  if (!viewport) return null;
  return (
    <ToastContext.Provider value={context}>
      {createPortal(toast, viewport)}
      {announcement !== null && (
        <Announcement
          container={provider.announcerContainer}
          politeness={type === 'foreground' ? 'assertive' : 'polite'}
          text={announcement}
        />
      )}
    </ToastContext.Provider>
  );
});

export interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(function ToastTitle(
  { asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} ref={ref} />;
});

export type ToastDescriptionProps = ToastTitleProps;

const ToastDescription = React.forwardRef<HTMLDivElement, ToastDescriptionProps>(
  function ToastDescription({ asChild = false, ...props }, ref) {
    const Comp = asChild ? Slot : 'div';
    return <Comp {...props} ref={ref} />;
  },
);

export interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

/** Closes the toast. Not part of the announcement. */
const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(function ToastClose(
  { asChild = false, onClick, ...props },
  ref,
) {
  const toast = useToast('ToastClose');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      type={asChild ? undefined : 'button'}
      {...{ [SKIP]: '' }}
      {...props}
      ref={ref}
      onClick={composeHandlers(onClick, () => toast.close())}
    />
  );
});

export interface ToastActionProps extends ToastCloseProps {
  /** How to do the same without the toast; read in place of the button's label. */
  altText: string;
}

/** A button that does something and closes the toast. */
const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(function ToastAction(
  { altText, asChild = false, onClick, ...props },
  ref,
) {
  const toast = useToast('ToastAction');
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      type={asChild ? undefined : 'button'}
      {...{ [ALT_TEXT]: altText }}
      {...props}
      ref={ref}
      onClick={composeHandlers(onClick, () => toast.close())}
    />
  );
});

export {
  ToastAction as Action,
  ToastClose as Close,
  ToastDescription as Description,
  ToastProvider as Provider,
  Toast as Root,
  ToastTitle as Title,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastViewport as Viewport,
};
