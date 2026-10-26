import * as React from 'react';

import { useComposedRefs } from './compose-refs';
import { Slot } from './slot';
import { useCallbackRef } from './use-callback-ref';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * A layer is something that can be dismissed: a popover, a dialog, a menu.
 * Layers stack in the order they open. Three things dismiss the newest one:
 * Escape, a pointer press outside it, and focus moving outside it. Each is
 * announced to the layer first, and `preventDefault()` on that announcement
 * keeps the layer open.
 *
 * "Inside" means inside the layer's element, inside any branch, or inside a
 * React descendant of the layer rendered through a portal (a menu opened
 * from a dialog renders far away in the DOM but is still the dialog's). The
 * document listeners run in the bubble phase, after React's own handlers,
 * so the layer's capture handlers have already marked events that came
 * through its React subtree.
 *
 * Rules, from the top of the stack down:
 * - Escape goes to the top layer only, and not when it was pressed inside a
 *   nested overlay the layer did not open itself.
 * - A press or focus inside a layer belongs to that layer; the layers under
 *   it never hear about it.
 * - A press or focus outside a layer is announced to it, and then to the
 *   next layer down, so one press on the page closes the popover and the
 *   dialog it was opened from. The walk stops at the top modal layer:
 *   anything under a modal layer is covered and never dismissed by what
 *   happens above it.
 * - A modal layer (`disableOutsidePointerEvents`) turns pointer events off
 *   for the whole body and back on for itself and the layers above it.
 */

export type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
export type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;

export interface LayerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Turns pointer events off outside the layer (the modal behaviour). */
  disableOutsidePointerEvents?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onFocusOutside?: (event: FocusOutsideEvent) => void;
  /** Either of the two outside interactions. */
  onInteractOutside?: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  /** The layer should close. */
  onDismiss?: () => void;
}

interface LayerRecord {
  node: HTMLElement;
  modal: boolean;
  /** Native events that passed through this layer's React subtree. */
  seen: WeakSet<Event>;
  escape: (event: KeyboardEvent) => void;
  pointerDownOutside: (event: PointerDownOutsideEvent) => void;
  focusOutside: (event: FocusOutsideEvent) => void;
  interactOutside: (event: PointerDownOutsideEvent | FocusOutsideEvent) => void;
  dismiss: () => void;
}

const layers: LayerRecord[] = [];
const branches = new Set<HTMLElement>();
let listening = false;
let bodyPointerEvents: string | null = null;

const inBranch = (target: Node) => [...branches].some((branch) => branch.contains(target));

/** Whether `target` is inside a `LayerBranch` (focus traps leave such focus alone). */
export function isInLayerBranch(target: EventTarget | null): boolean {
  return target instanceof Node && inBranch(target);
}

const contains = (layer: LayerRecord, event: Event) =>
  (event.target instanceof Node && layer.node.contains(event.target)) || layer.seen.has(event);

function outsideEvent<E extends Event>(name: string, originalEvent: E) {
  const event = new CustomEvent(name, { cancelable: true, detail: { originalEvent } });
  // Handlers read `event.target` as the element that was pressed or focused.
  Object.defineProperty(event, 'target', { value: originalEvent.target, configurable: true });
  return event as CustomEvent<{ originalEvent: E }>;
}

const topModalIndex = () =>
  layers.reduce((found, layer, index) => (layer.modal ? index : found), -1);

function walk(event: Event, announce: (layer: LayerRecord) => CustomEvent<unknown>) {
  if (!(event.target instanceof Node)) return;
  if (inBranch(event.target)) return;
  for (let index = layers.length - 1; index >= Math.max(topModalIndex(), 0); index--) {
    const layer = layers[index]!;
    if (contains(layer, event)) return;
    const outside = announce(layer);
    if (!outside.defaultPrevented) layer.dismiss();
  }
}

function onPointerDown(event: PointerEvent) {
  walk(event, (layer) => {
    const outside = outsideEvent('bl-pointerdown-outside', event);
    layer.pointerDownOutside(outside);
    layer.interactOutside(outside);
    return outside;
  });
}

function onFocusIn(event: FocusEvent) {
  walk(event, (layer) => {
    const outside = outsideEvent('bl-focus-outside', event);
    layer.focusOutside(outside);
    layer.interactOutside(outside);
    return outside;
  });
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  const top = layers[layers.length - 1];
  if (!top) return;
  // A branch (the toast region) handles its own Escape.
  if (isInLayerBranch(event.target)) return;
  // Pressed inside something the layer contains only through React (a
  // nested overlay with its own dismissal): that overlay's Escape, not ours.
  if (top.seen.has(event) && !(event.target instanceof Node && top.node.contains(event.target)))
    return;
  top.escape(event);
  if (!event.defaultPrevented) top.dismiss();
}

function listen() {
  if (listening) return;
  listening = true;
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('focusin', onFocusIn);
  document.addEventListener('keydown', onKeyDown);
}

function unlisten() {
  if (!listening || layers.length) return;
  listening = false;
  document.removeEventListener('pointerdown', onPointerDown);
  document.removeEventListener('focusin', onFocusIn);
  document.removeEventListener('keydown', onKeyDown);
}

/** Body pointer events off while any modal layer is open; layers above the top modal stay live. */
function syncPointerEvents() {
  const topModal = topModalIndex();
  if (topModal === -1) {
    if (bodyPointerEvents !== null) {
      // Another overlay stack (a vendored menu, until every component is on this
      // layer) may have set 'none' before this stack saved the value; putting
      // that back would leave the page ignoring every click.
      document.body.style.pointerEvents = bodyPointerEvents === 'none' ? '' : bodyPointerEvents;
      bodyPointerEvents = null;
    }
    for (const layer of layers) layer.node.style.removeProperty('pointer-events');
    return;
  }
  if (bodyPointerEvents === null) {
    bodyPointerEvents = document.body.style.pointerEvents;
    document.body.style.pointerEvents = 'none';
  }
  layers.forEach((layer, index) => {
    layer.node.style.pointerEvents = index >= topModal ? 'auto' : 'none';
  });
}

/** For tests and diagnostics. */
export function layerCount(): number {
  return layers.length;
}

const Layer = React.forwardRef<HTMLDivElement, LayerProps>(function Layer(
  {
    asChild = false,
    disableOutsidePointerEvents = false,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onDismiss,
    onPointerDownCapture,
    onFocusCapture,
    onKeyDownCapture,
    ...props
  },
  forwardedRef,
) {
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  const escape = useCallbackRef(onEscapeKeyDown);
  const pointerDownOutside = useCallbackRef(onPointerDownOutside);
  const focusOutside = useCallbackRef(onFocusOutside);
  const interactOutside = useCallbackRef(onInteractOutside);
  const dismiss = useCallbackRef(onDismiss);
  const [seen] = React.useState(() => new WeakSet<Event>());
  const record = React.useRef<LayerRecord | null>(null);

  useIsoLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const entry: LayerRecord = {
      node,
      modal: disableOutsidePointerEvents,
      seen,
      escape,
      pointerDownOutside,
      focusOutside,
      interactOutside,
      dismiss,
    };
    record.current = entry;
    layers.push(entry);
    listen();
    syncPointerEvents();
    return () => {
      const index = layers.indexOf(entry);
      if (index !== -1) layers.splice(index, 1);
      record.current = null;
      node.style.removeProperty('pointer-events');
      syncPointerEvents();
      unlisten();
    };
    // Registered once per mount; the modal flag is kept current below.
  }, []);

  useIsoLayoutEffect(() => {
    if (!record.current || record.current.modal === disableOutsidePointerEvents) return;
    record.current.modal = disableOutsidePointerEvents;
    syncPointerEvents();
  }, [disableOutsidePointerEvents]);

  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...props}
      ref={ref}
      onPointerDownCapture={(event: React.PointerEvent<HTMLDivElement>) => {
        seen.add(event.nativeEvent);
        onPointerDownCapture?.(event);
      }}
      onFocusCapture={(event: React.FocusEvent<HTMLDivElement>) => {
        seen.add(event.nativeEvent);
        onFocusCapture?.(event);
      }}
      onKeyDownCapture={(event: React.KeyboardEvent<HTMLDivElement>) => {
        seen.add(event.nativeEvent);
        onKeyDownCapture?.(event);
      }}
    />
  );
});

export interface LayerBranchProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/**
 * A subtree that counts as inside every layer: a press, focus or Escape
 * there never dismisses anything, and a trapping FocusScope lets focus go
 * there. For things that live beside layers, such as a toast region.
 */
const LayerBranch = React.forwardRef<HTMLDivElement, LayerBranchProps>(function LayerBranch(
  { asChild = false, ...props },
  forwardedRef,
) {
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  useIsoLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    branches.add(node);
    return () => {
      branches.delete(node);
    };
  }, []);
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} ref={ref} />;
});

export { Layer, LayerBranch };
