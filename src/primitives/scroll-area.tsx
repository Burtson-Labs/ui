import * as React from 'react';

import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { usePresence } from './presence';
import { Slot } from './slot';
import { useCallbackRef } from './use-callback-ref';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * A scroll container with drawn scrollbars. The viewport is a native
 * scroller (wheel, touch, keyboard, find-in-page, scroll anchoring all
 * stay the browser's); its own scrollbars are hidden with
 * `scrollbar-width: none` and the WebKit pseudo-element, and the drawn ones
 * are positioned over the root.
 *
 * - **Axes.** An axis scrolls only when a Scrollbar for it is rendered; the
 *   other is `overflow: hidden`.
 * - **`type`.** `"hover"` (default): the scrollbars show while the pointer
 *   is over the area or it is scrolling, and hide `scrollHideDelay` ms
 *   after. `"scroll"`: only while scrolling. `"auto"`: whenever the content
 *   overflows. `"always"`: always, even with nothing to scroll (the thumb
 *   is then left out). Hover and scroll also need overflow to show.
 * - **Thumb.** Its length is the visible fraction of the track (18px at
 *   least) and its offset follows the scroll position, both measured from
 *   the viewport and written straight to the DOM on every scroll. Dragging
 *   it scrolls in proportion. A press on the track pages one viewport
 *   toward the press. A wheel over the scrollbar scrolls the viewport.
 * - **RTL** (`dir`, or the computed direction): the vertical scrollbar sits
 *   on the left, and horizontal positions use the negative `scrollLeft`
 *   browsers report for right-to-left scrollers.
 * - **CSS variables.** The scrollbar publishes
 *   `--bl-scroll-area-thumb-width/height`, the root
 *   `--bl-scroll-area-corner-width/height`, with the deprecated
 *   `--radix-scroll-area-*` names as aliases.
 */

type Axis = 'x' | 'y';
type Direction = 'ltr' | 'rtl';

interface ScrollAreaContextValue {
  type: 'auto' | 'always' | 'scroll' | 'hover';
  dir?: Direction;
  scrollHideDelay: number;
  viewport: HTMLDivElement | null;
  setViewport: (node: HTMLDivElement | null) => void;
  content: HTMLDivElement | null;
  setContent: (node: HTMLDivElement | null) => void;
  axes: { x: boolean; y: boolean };
  setAxis: (axis: Axis, enabled: boolean) => void;
  /** Rendered scrollbar thickness per axis (0 when hidden), for the corner. */
  thickness: { x: number; y: number };
  setThickness: (axis: Axis, size: number) => void;
  hovered: boolean;
  root: HTMLDivElement | null;
}

const ScrollAreaContext = React.createContext<ScrollAreaContextValue | null>(null);

function useScrollArea(component: string): ScrollAreaContextValue {
  const context = React.useContext(ScrollAreaContext);
  if (!context) throw new Error(`${component} must be inside a ScrollArea`);
  return context;
}

const directionOf = (context: ScrollAreaContextValue): Direction =>
  context.dir ?? (context.root ? (getComputedStyle(context.root).direction as Direction) : 'ltr');

export interface ScrollAreaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'> {
  asChild?: boolean;
  type?: 'auto' | 'always' | 'scroll' | 'hover';
  dir?: Direction;
  /** For `hover` and `scroll`: how long the scrollbars stay after the pointer leaves or scrolling stops. */
  scrollHideDelay?: number;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    asChild = false,
    type = 'hover',
    dir,
    scrollHideDelay = 600,
    style,
    onPointerEnter,
    onPointerLeave,
    ...props
  },
  forwardedRef,
) {
  const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, setRoot);
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
  const [content, setContent] = React.useState<HTMLDivElement | null>(null);
  const [axes, setAxes] = React.useState({ x: false, y: false });
  const [thickness, setThicknessState] = React.useState({ x: 0, y: 0 });
  const [hovered, setHovered] = React.useState(false);
  const setAxis = React.useCallback(
    (axis: Axis, enabled: boolean) =>
      setAxes((current) => (current[axis] === enabled ? current : { ...current, [axis]: enabled })),
    [],
  );
  const setThickness = React.useCallback(
    (axis: Axis, size: number) =>
      setThicknessState((current) =>
        current[axis] === size ? current : { ...current, [axis]: size },
      ),
    [],
  );
  const context = React.useMemo<ScrollAreaContextValue>(
    () => ({
      type,
      dir,
      scrollHideDelay,
      viewport,
      setViewport,
      content,
      setContent,
      axes,
      setAxis,
      thickness,
      setThickness,
      hovered,
      root,
    }),
    [
      type,
      dir,
      scrollHideDelay,
      viewport,
      content,
      axes,
      setAxis,
      thickness,
      setThickness,
      hovered,
      root,
    ],
  );
  // The corner exists only where both scrollbars are showing.
  const corner = thickness.x && thickness.y ? thickness : { x: 0, y: 0 };
  const Comp = asChild ? Slot : 'div';
  return (
    <ScrollAreaContext.Provider value={context}>
      <Comp
        dir={dir}
        {...props}
        ref={ref}
        style={
          {
            position: 'relative',
            '--bl-scroll-area-corner-width': `${corner.y}px`,
            '--bl-scroll-area-corner-height': `${corner.x}px`,
            '--radix-scroll-area-corner-width': `${corner.y}px`,
            '--radix-scroll-area-corner-height': `${corner.x}px`,
            ...style,
          } as React.CSSProperties
        }
        onPointerEnter={composeHandlers(onPointerEnter, () => setHovered(true))}
        onPointerLeave={composeHandlers(onPointerLeave, () => setHovered(false))}
      />
    </ScrollAreaContext.Provider>
  );
});

const HIDE_NATIVE =
  '[data-bl-scroll-area-viewport]{scrollbar-width:none;-ms-overflow-style:none}' +
  '[data-bl-scroll-area-viewport]::-webkit-scrollbar{display:none}';

export interface ScrollAreaViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** For the small `<style>` that hides the native scrollbars under a CSP. */
  nonce?: string;
}

/**
 * The native scroller. Its children are wrapped in a block that is at least
 * as wide as the viewport and grows with wide content (`display: table`),
 * so horizontal overflow is measured from the content's real width.
 */
const ScrollAreaViewport = React.forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  function ScrollAreaViewport({ asChild = false, nonce, style, children, ...props }, forwardedRef) {
    const { setViewport, setContent, axes } = useScrollArea('ScrollAreaViewport');
    const ref = useComposedRefs(forwardedRef, setViewport);
    const Comp = asChild ? Slot : 'div';
    return (
      <>
        <style nonce={nonce}>{HIDE_NATIVE}</style>
        <Comp
          data-bl-scroll-area-viewport=""
          {...props}
          ref={ref}
          style={{
            overflowX: axes.x ? 'scroll' : 'hidden',
            overflowY: axes.y ? 'scroll' : 'hidden',
            ...style,
          }}
        >
          <div ref={setContent} style={{ minWidth: '100%', display: 'table' }}>
            {children}
          </div>
        </Comp>
      </>
    );
  },
);

interface Metrics {
  /** Visible length of the viewport on the axis. */
  viewport: number;
  /** Scrollable length of the content on the axis. */
  content: number;
  /** Length of the track (the scrollbar less its padding). */
  track: number;
  /** Length of the thumb. */
  thumb: number;
}

const MIN_THUMB = 18;

function measure(axis: Axis, viewport: HTMLElement, scrollbar: HTMLElement): Metrics {
  const view = axis === 'y' ? viewport.clientHeight : viewport.clientWidth;
  const content = axis === 'y' ? viewport.scrollHeight : viewport.scrollWidth;
  const styles = getComputedStyle(scrollbar);
  const padding =
    axis === 'y'
      ? parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
      : parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
  const track = Math.max(
    0,
    (axis === 'y' ? scrollbar.clientHeight : scrollbar.clientWidth) - (padding || 0),
  );
  const ratio = content > 0 ? Math.min(1, view / content) : 1;
  return {
    viewport: view,
    content,
    track,
    thumb: Math.min(track, Math.max(MIN_THUMB, track * ratio)),
  };
}

/** The scroll range on an axis: right-to-left horizontal scrolling runs from -max to 0. */
function scrollRange(axis: Axis, m: Metrics, rtl: boolean): [number, number] {
  const max = Math.max(0, m.content - m.viewport);
  return axis === 'x' && rtl ? [-max, 0] : [0, max];
}

/** Thumb offset along the track for a scroll position. */
export function thumbOffset(position: number, m: Metrics, range: [number, number]): number {
  const [min, max] = range;
  if (max - min <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, (position - min) / (max - min)));
  return ratio * (m.track - m.thumb);
}

/** Scroll position for a thumb offset along the track. */
export function positionForThumb(offset: number, m: Metrics, range: [number, number]): number {
  const [min, max] = range;
  const room = m.track - m.thumb;
  if (room <= 0) return min;
  return min + (Math.min(room, Math.max(0, offset)) / room) * (max - min);
}

interface ScrollbarContextValue {
  axis: Axis;
  overflow: boolean;
  setThumb: (node: HTMLDivElement | null) => void;
  startThumbDrag: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const ScrollbarContext = React.createContext<ScrollbarContextValue | null>(null);

export interface ScrollAreaScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  orientation?: 'horizontal' | 'vertical';
  /** Keep it in the DOM while hidden (for a custom animation). */
  forceMount?: true;
}

const ScrollAreaScrollbar = React.forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(
  function ScrollAreaScrollbar(
    {
      asChild = false,
      orientation = 'vertical',
      forceMount,
      style,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      ...props
    },
    forwardedRef,
  ) {
    const context = useScrollArea('ScrollAreaScrollbar');
    const axis: Axis = orientation === 'horizontal' ? 'x' : 'y';
    const { viewport, content, setAxis, setThickness, type, scrollHideDelay, hovered } = context;
    const nodeRef = React.useRef<HTMLDivElement | null>(null);
    const thumbRef = React.useRef<HTMLDivElement | null>(null);
    const [scrollbar, setScrollbar] = React.useState<HTMLDivElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef, setScrollbar);
    const rtl = directionOf(context) === 'rtl';

    useIsoLayoutEffect(() => {
      setAxis(axis, true);
      return () => setAxis(axis, false);
    }, [axis, setAxis]);

    // Overflow on this axis, from the viewport and the content's size.
    const [overflow, setOverflow] = React.useState(false);
    const checkOverflow = useCallbackRef(() => {
      if (!viewport) return;
      setOverflow(
        axis === 'y'
          ? viewport.scrollHeight > viewport.clientHeight
          : viewport.scrollWidth > viewport.clientWidth,
      );
    });

    // Visibility by type.
    const [scrolling, setScrolling] = React.useState(false);
    // After the pointer leaves, a hover scrollbar lingers for the delay.
    const [lingering, setLingering] = React.useState(false);
    const [wasHovered, setWasHovered] = React.useState(hovered);
    if (wasHovered !== hovered) {
      setWasHovered(hovered);
      setLingering(!hovered);
    }
    React.useEffect(() => {
      if (!lingering) return;
      const timer = setTimeout(() => setLingering(false), scrollHideDelay);
      return () => clearTimeout(timer);
    }, [lingering, scrollHideDelay]);
    const visible =
      type === 'always' ||
      (overflow && (type === 'auto' || scrolling || (type === 'hover' && (hovered || lingering))));

    // Write the thumb's size and position straight to the DOM.
    const update = useCallbackRef(() => {
      const bar = nodeRef.current;
      if (!viewport || !bar) return;
      const metrics = measure(axis, viewport, bar);
      const size = `${metrics.thumb}px`;
      const name = axis === 'y' ? 'height' : 'width';
      bar.style.setProperty(`--bl-scroll-area-thumb-${name}`, size);
      bar.style.setProperty(`--radix-scroll-area-thumb-${name}`, size);
      const thumb = thumbRef.current;
      if (!thumb) return;
      const position = axis === 'y' ? viewport.scrollTop : viewport.scrollLeft;
      const offset = thumbOffset(position, metrics, scrollRange(axis, metrics, rtl));
      // The move is from where the layout put the thumb (in RTL a flex
      // column puts it at the right end), measured without the transform.
      const styles = getComputedStyle(bar);
      const natural =
        axis === 'y'
          ? thumb.offsetTop - (parseFloat(styles.paddingTop) || 0)
          : thumb.offsetLeft - (parseFloat(styles.paddingLeft) || 0);
      const move = offset - natural;
      thumb.style.transform =
        axis === 'y' ? `translate3d(0, ${move}px, 0)` : `translate3d(${move}px, 0, 0)`;
    });

    useIsoLayoutEffect(() => {
      if (!viewport) return;
      checkOverflow();
      update();
      let frame = 0;
      const onResize = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          checkOverflow();
          update();
        });
      };
      const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null;
      observer?.observe(viewport);
      if (content) observer?.observe(content);
      if (scrollbar) observer?.observe(scrollbar);
      return () => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
      };
    }, [viewport, content, scrollbar, checkOverflow, update]);

    const scrollPosition = React.useRef<number | null>(null);
    React.useEffect(() => {
      if (!viewport) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const onScroll = () => {
        update();
        // Only a scroll along this axis reveals this scrollbar.
        const position = axis === 'y' ? viewport.scrollTop : viewport.scrollLeft;
        if (scrollPosition.current === position) return;
        scrollPosition.current = position;
        if (type !== 'scroll' && type !== 'hover') return;
        setScrolling(true);
        clearTimeout(timer);
        timer = setTimeout(() => setScrolling(false), scrollHideDelay);
      };
      scrollPosition.current = axis === 'y' ? viewport.scrollTop : viewport.scrollLeft;
      viewport.addEventListener('scroll', onScroll, { passive: true });
      return () => {
        clearTimeout(timer);
        viewport.removeEventListener('scroll', onScroll);
      };
    }, [viewport, axis, type, scrollHideDelay, update]);

    // A wheel over the scrollbar scrolls the viewport (it is not inside it).
    React.useEffect(() => {
      // A scrollbar rendered among the viewport's children already passes
      // the wheel to it natively.
      if (!scrollbar || !viewport || viewport.contains(scrollbar)) return;
      const onWheel = (event: WheelEvent) => {
        const before = [viewport.scrollLeft, viewport.scrollTop];
        viewport.scrollBy({ left: event.deltaX, top: event.deltaY });
        if (before[0] !== viewport.scrollLeft || before[1] !== viewport.scrollTop)
          event.preventDefault();
      };
      scrollbar.addEventListener('wheel', onWheel, { passive: false });
      return () => scrollbar.removeEventListener('wheel', onWheel);
    }, [scrollbar, viewport]);

    // Report thickness for the corner while visible.
    useIsoLayoutEffect(() => {
      const bar = nodeRef.current;
      const size = visible && bar ? (axis === 'y' ? bar.offsetWidth : bar.offsetHeight) : 0;
      setThickness(axis, size);
    });
    React.useEffect(() => () => setThickness(axis, 0), [axis, setThickness]);

    // Dragging the thumb; pressing the track.
    const drag = React.useRef<{ pointerId: number; grab: number } | null>(null);
    const pointerAlong = (event: { clientX: number; clientY: number; currentTarget: Element }) => {
      const bar = event.currentTarget;
      const rect = bar.getBoundingClientRect();
      const styles = getComputedStyle(bar);
      return axis === 'y'
        ? event.clientY - rect.top - parseFloat(styles.paddingTop || '0')
        : event.clientX - rect.left - parseFloat(styles.paddingLeft || '0');
    };
    const previousUserSelect = React.useRef('');
    const startThumbDrag = useCallbackRef((event: React.PointerEvent<HTMLDivElement>) => {
      const thumb = thumbRef.current;
      const bar = nodeRef.current;
      if (!thumb || !bar || event.button !== 0) return;
      const thumbRect = thumb.getBoundingClientRect();
      const grab = axis === 'y' ? event.clientY - thumbRect.top : event.clientX - thumbRect.left;
      drag.current = { pointerId: event.pointerId, grab };
      bar.setPointerCapture?.(event.pointerId);
      previousUserSelect.current = document.body.style.userSelect;
      document.body.style.userSelect = 'none';
      event.preventDefault();
    });
    const endDrag = useCallbackRef((event: React.PointerEvent<HTMLDivElement>) => {
      if (!drag.current || drag.current.pointerId !== event.pointerId) return;
      drag.current = null;
      const bar = event.currentTarget;
      if (bar.hasPointerCapture(event.pointerId)) bar.releasePointerCapture?.(event.pointerId);
      document.body.style.userSelect = previousUserSelect.current;
    });
    const pressTrack = useCallbackRef((event: React.PointerEvent<HTMLDivElement>) => {
      const bar = nodeRef.current;
      if (event.button !== 0 || !viewport || !bar) return;
      if (thumbRef.current?.contains(event.target as Node)) return;
      // A press on the track pages one viewport toward it.
      const metrics = measure(axis, viewport, bar);
      const position = axis === 'y' ? viewport.scrollTop : viewport.scrollLeft;
      const thumbStart = thumbOffset(position, metrics, scrollRange(axis, metrics, rtl));
      const at = pointerAlong(event);
      if (at >= thumbStart && at <= thumbStart + metrics.thumb) return;
      const step = (at < thumbStart ? -1 : 1) * metrics.viewport;
      viewport.scrollBy(axis === 'y' ? { top: step } : { left: step });
    });
    const moveThumb = useCallbackRef((event: React.PointerEvent<HTMLDivElement>) => {
      const state = drag.current;
      const bar = nodeRef.current;
      if (!state || state.pointerId !== event.pointerId || !viewport || !bar) return;
      const metrics = measure(axis, viewport, bar);
      const position = positionForThumb(
        pointerAlong(event) - state.grab,
        metrics,
        scrollRange(axis, metrics, rtl),
      );
      viewport.scrollTo({ [axis === 'y' ? 'top' : 'left']: position, behavior: 'instant' });
    });

    const scrollbarContext = React.useMemo<ScrollbarContextValue>(
      () => ({
        axis,
        overflow,
        setThumb: (node) => {
          thumbRef.current = node;
          if (node) update();
        },
        startThumbDrag,
      }),
      [axis, overflow, update, startThumbDrag],
    );

    const mounted = usePresence(visible, nodeRef);
    if (!mounted && !forceMount) return null;
    const Comp = asChild ? Slot : 'div';
    const placement: React.CSSProperties =
      axis === 'y'
        ? {
            top: 0,
            bottom: 'var(--bl-scroll-area-corner-height)',
            [rtl ? 'left' : 'right']: 0,
          }
        : {
            bottom: 0,
            left: rtl ? 'var(--bl-scroll-area-corner-width)' : 0,
            right: rtl ? 0 : 'var(--bl-scroll-area-corner-width)',
          };
    return (
      <ScrollbarContext.Provider value={scrollbarContext}>
        <Comp
          data-orientation={orientation}
          data-state={visible ? 'visible' : 'hidden'}
          {...props}
          ref={ref}
          style={{ position: 'absolute', ...placement, ...style }}
          onPointerDown={composeHandlers(onPointerDown, pressTrack)}
          onPointerMove={composeHandlers(onPointerMove, moveThumb)}
          onPointerUp={composeHandlers(onPointerUp, endDrag)}
          onPointerCancel={composeHandlers(onPointerCancel, endDrag)}
        />
      </ScrollbarContext.Provider>
    );
  },
);

export interface ScrollAreaThumbProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Keep it in the DOM when there is nothing to scroll. */
  forceMount?: true;
}

const ScrollAreaThumb = React.forwardRef<HTMLDivElement, ScrollAreaThumbProps>(
  function ScrollAreaThumb(
    { asChild = false, forceMount, style, onPointerDown, ...props },
    forwardedRef,
  ) {
    const scrollbar = React.useContext(ScrollbarContext);
    if (!scrollbar) throw new Error('ScrollAreaThumb must be inside a ScrollAreaScrollbar');
    const nodeRef = React.useRef<HTMLDivElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef, scrollbar.setThumb);
    const mounted = usePresence(scrollbar.overflow, nodeRef);
    if (!mounted && !forceMount) return null;
    const Comp = asChild ? Slot : 'div';
    const length =
      scrollbar.axis === 'y'
        ? { height: 'var(--bl-scroll-area-thumb-height)' }
        : { width: 'var(--bl-scroll-area-thumb-width)' };
    return (
      <Comp
        data-state={scrollbar.overflow ? 'visible' : 'hidden'}
        {...props}
        ref={ref}
        style={{ ...length, ...style }}
        onPointerDown={composeHandlers(onPointerDown, scrollbar.startThumbDrag)}
      />
    );
  },
);

export interface ScrollAreaCornerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** The square where two visible scrollbars meet; not rendered otherwise, nor for `type="scroll"`. */
const ScrollAreaCorner = React.forwardRef<HTMLDivElement, ScrollAreaCornerProps>(
  function ScrollAreaCorner({ asChild = false, style, ...props }, ref) {
    const context = useScrollArea('ScrollAreaCorner');
    const { x, y } = context.thickness;
    if (context.type === 'scroll' || !x || !y) return null;
    const rtl = directionOf(context) === 'rtl';
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        {...props}
        ref={ref}
        style={{
          position: 'absolute',
          bottom: 0,
          [rtl ? 'left' : 'right']: 0,
          width: y,
          height: x,
          ...style,
        }}
      />
    );
  },
);

export {
  ScrollAreaCorner as Corner,
  ScrollArea as Root,
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  ScrollAreaScrollbar as Scrollbar,
  ScrollAreaThumb as Thumb,
  ScrollAreaViewport as Viewport,
};
