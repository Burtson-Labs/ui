import * as React from 'react';

import {
  type Align,
  computePlacement,
  insetRect,
  intersectRects,
  type Rect,
  rectsOverlap,
  resolvePadding,
  type Side,
} from './anchor-geometry';
import { useComposedRefs } from './compose-refs';
import { Slot } from './slot';
import { useIsoLayoutEffect } from './use-layout-effect';

export type { Align, Side } from './anchor-geometry';

/** Something with a box: an element, or an object that reports one (a text selection, a tour target). */
export interface VirtualAnchor {
  getBoundingClientRect: () => Rect;
}
export type AnchorTarget = Element | VirtualAnchor;

/**
 * Positioning options, shared by every floating surface. The names are the
 * kit's public props on PopoverContent, TooltipContent and the menus.
 */
export interface PositionOptions {
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
  arrowPadding?: number;
  avoidCollisions?: boolean;
  /** Elements whose boxes the surface stays inside, besides the viewport. */
  collisionBoundary?: Element | null | (Element | null)[];
  collisionPadding?: number | Partial<Record<Side, number>>;
  sticky?: 'partial' | 'always';
  /** Hide the surface while its anchor is scrolled out of its clipping ancestors. */
  hideWhenDetached?: boolean;
  /** `always` re-measures every frame (for anchors that move without scrolling or resizing). */
  updatePositionStrategy?: 'optimized' | 'always';
}

/*
 * The anchor registry. A Trigger registers itself as the anchor unless an
 * explicit Anchor (an element or a virtual box) is present.
 */
interface AnchorContextValue {
  anchor: AnchorTarget | null;
  setImplicitAnchor: (target: Element | null) => void;
  setExplicitAnchor: (target: AnchorTarget | null) => void;
}

const AnchorContext = React.createContext<AnchorContextValue | null>(null);

function AnchorProvider({ children }: { children: React.ReactNode }) {
  const [implicit, setImplicitAnchor] = React.useState<Element | null>(null);
  const [explicit, setExplicitAnchor] = React.useState<AnchorTarget | null>(null);
  const value = React.useMemo<AnchorContextValue>(
    () => ({ anchor: explicit ?? implicit, setImplicitAnchor, setExplicitAnchor }),
    [explicit, implicit],
  );
  return <AnchorContext.Provider value={value}>{children}</AnchorContext.Provider>;
}

function useAnchorContext(component: string): AnchorContextValue {
  const context = React.useContext(AnchorContext);
  if (!context) throw new Error(`${component} must be inside an AnchorProvider`);
  return context;
}

/** Registers the host element as the anchor while mounted, unless an explicit Anchor exists. */
function useImplicitAnchor(): (node: Element | null) => void {
  const { setImplicitAnchor } = useAnchorContext('useImplicitAnchor');
  return React.useCallback(
    (node: Element | null) => {
      setImplicitAnchor(node);
    },
    [setImplicitAnchor],
  );
}

export interface AnchorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** A box to anchor to instead of this element. */
  virtualRef?: React.RefObject<VirtualAnchor | null>;
}

/**
 * The element a floating surface is positioned against, when it is not the
 * trigger. With `virtualRef` nothing is rendered; the box comes from the ref.
 */
const Anchor = React.forwardRef<HTMLDivElement, AnchorProps>(function Anchor(
  { asChild = false, virtualRef, ...props },
  forwardedRef,
) {
  const { setExplicitAnchor } = useAnchorContext('Anchor');
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  // A new ref object means a new box (a tour step moved); a mutated
  // `current` on the same object is not noticed until the next render.
  useIsoLayoutEffect(() => {
    setExplicitAnchor(virtualRef?.current ?? nodeRef.current);
    return () => setExplicitAnchor(null);
  }, [virtualRef, setExplicitAnchor]);
  if (virtualRef) return null;
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} ref={ref} />;
});

/*
 * Placement for the content: which side and alignment were used after
 * collision handling, so the content can carry data-side and data-align.
 */
interface PlacementContextValue {
  side: Side;
  align: Align;
  /** The arrow registers its element and size here. */
  setArrow: (element: HTMLElement | null, size: { width: number; height: number }) => void;
}
const PlacementContext = React.createContext<PlacementContextValue | null>(null);

export function useAnchoredPlacement(): { side: Side; align: Align } {
  const context = React.useContext(PlacementContext);
  return context ?? { side: 'bottom', align: 'center' };
}

const ROOT_CLIP_PROPS = ['overflow', 'overflow-x', 'overflow-y'];

/** The intersection of every scroll or clip ancestor's box with the viewport. */
function clippingRect(element: Element, viewport: Rect): Rect {
  const rects = [viewport];
  for (
    let node = element.parentElement;
    node && node !== document.body;
    node = node.parentElement
  ) {
    const style = getComputedStyle(node);
    if (ROOT_CLIP_PROPS.some((p) => /(auto|scroll|hidden|clip)/.test(style.getPropertyValue(p))))
      rects.push(node.getBoundingClientRect());
  }
  return intersectRects(rects);
}

/**
 * A `position: fixed` box is placed against the viewport unless an ancestor
 * establishes a containing block (a transform, perspective, filter, or
 * paint/layout containment). Then its coordinates are relative to that
 * ancestor's padding box, which may also scroll.
 */
function containingBlockOffset(element: Element): { x: number; y: number } {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    const makes =
      (style.transform && style.transform !== 'none') ||
      (style.perspective && style.perspective !== 'none') ||
      (style.filter && style.filter !== 'none') ||
      (style.getPropertyValue('backdrop-filter') &&
        style.getPropertyValue('backdrop-filter') !== 'none') ||
      /transform|perspective|filter/.test(style.willChange) ||
      /paint|layout|strict|content/.test(style.getPropertyValue('contain')) ||
      ['size', 'inline-size'].includes(style.getPropertyValue('container-type'));
    if (makes) {
      const rect = node.getBoundingClientRect();
      return {
        x: rect.left + node.clientLeft - node.scrollLeft,
        y: rect.top + node.clientTop - node.scrollTop,
      };
    }
  }
  return { x: 0, y: 0 };
}

const viewportRect = (): Rect => ({
  x: 0,
  y: 0,
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight,
});

export interface PositionedProps extends PositionOptions, React.HTMLAttributes<HTMLDivElement> {
  /** The anchor; defaults to the one registered in the nearest AnchorProvider. */
  anchor?: AnchorTarget | null;
  /**
   * Extra CSS variables to set on the wrapper, each aliasing one of the
   * canonical names. Lets a component keep older variable names alive.
   */
  aliases?: Record<string, string>;
  children?: React.ReactNode;
}

const CANONICAL = {
  anchorWidth: '--bl-anchor-width',
  anchorHeight: '--bl-anchor-height',
  availableWidth: '--bl-available-width',
  availableHeight: '--bl-available-height',
  transformOrigin: '--bl-transform-origin',
} as const;

/**
 * The positioning wrapper. It is `position: fixed` at the viewport's origin
 * and moved with a transform, so the content inside keeps its own transform
 * free for enter and exit animations. Position updates write straight to
 * the DOM (one animation frame coalesces anchor resizes, content resizes,
 * scrolling anywhere and window resizes); only a change of side or
 * alignment re-renders, so the content's data attributes follow.
 *
 * CSS variables on the wrapper (inherited by the content):
 * `--bl-anchor-width`, `--bl-anchor-height`, `--bl-available-width`,
 * `--bl-available-height` and `--bl-transform-origin`.
 */
const Positioned = React.forwardRef<HTMLDivElement, PositionedProps>(function Positioned(
  {
    anchor: anchorProp,
    side = 'bottom',
    sideOffset = 0,
    align = 'center',
    alignOffset = 0,
    arrowPadding = 0,
    avoidCollisions = true,
    collisionBoundary = [],
    collisionPadding = 0,
    sticky = 'partial',
    hideWhenDetached = false,
    updatePositionStrategy = 'optimized',
    aliases,
    style,
    children,
    ...props
  },
  forwardedRef,
) {
  const context = React.useContext(AnchorContext);
  const anchor = anchorProp !== undefined ? anchorProp : (context?.anchor ?? null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, wrapperRef);
  const [placed, setPlaced] = React.useState<{ side: Side; align: Align }>({ side, align });
  const arrowRef = React.useRef<{
    element: HTMLElement | null;
    size: { width: number; height: number };
  }>({ element: null, size: { width: 0, height: 0 } });
  const setArrow = React.useCallback(
    (element: HTMLElement | null, size: { width: number; height: number }) => {
      arrowRef.current = { element, size };
    },
    [],
  );

  const boundaries = React.useMemo(
    () =>
      (Array.isArray(collisionBoundary) ? collisionBoundary : [collisionBoundary]).filter(
        (b): b is Element => b instanceof Element,
      ),
    [collisionBoundary],
  );
  const padding = React.useMemo(() => resolvePadding(collisionPadding), [collisionPadding]);

  const update = React.useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !anchor) return;
    // Held (a pointer is down on the surface): the box stays where the
    // press found it, so the release lands on the same row.
    if (wrapper.hasAttribute(HOLD_ATTRIBUTE)) return;
    const anchorRect = anchor.getBoundingClientRect();
    const viewport = viewportRect();
    const boundary = insetRect(
      intersectRects([viewport, ...boundaries.map((b) => b.getBoundingClientRect())]),
      padding,
    );
    const arrow = arrowRef.current;
    const result = computePlacement({
      anchor: {
        x: anchorRect.x,
        y: anchorRect.y,
        width: anchorRect.width,
        height: anchorRect.height,
      },
      floating: { width: wrapper.offsetWidth, height: wrapper.offsetHeight },
      boundary,
      side,
      align,
      sideOffset,
      alignOffset,
      avoidCollisions,
      sticky,
      arrow: arrow.element ? { ...arrow.size, padding: arrowPadding } : undefined,
      rtl: getComputedStyle(wrapper).direction === 'rtl',
    });
    const offset = containingBlockOffset(wrapper);
    const x = Math.round(result.x - offset.x);
    const y = Math.round(result.y - offset.y);
    wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    wrapper.style.setProperty(CANONICAL.anchorWidth, `${anchorRect.width}px`);
    wrapper.style.setProperty(CANONICAL.anchorHeight, `${anchorRect.height}px`);
    wrapper.style.setProperty(CANONICAL.availableWidth, `${result.availableWidth}px`);
    wrapper.style.setProperty(CANONICAL.availableHeight, `${result.availableHeight}px`);
    wrapper.style.setProperty(CANONICAL.transformOrigin, result.transformOrigin);
    if (arrow.element) {
      arrow.element.style.left = result.arrowX === undefined ? '' : `${result.arrowX}px`;
      arrow.element.style.top = result.arrowY === undefined ? '' : `${result.arrowY}px`;
    }
    let detached = false;
    if (hideWhenDetached && anchor instanceof Element) {
      detached = !rectsOverlap(anchorRect, clippingRect(anchor, viewport));
    }
    wrapper.style.visibility = detached ? 'hidden' : '';
    wrapper.style.pointerEvents = detached ? 'none' : '';
    if (detached) wrapper.setAttribute('data-detached', '');
    else wrapper.removeAttribute('data-detached');
    setPlaced((current) =>
      current.side === result.side && current.align === result.align
        ? current
        : { side: result.side, align: result.align },
    );
  }, [
    anchor,
    boundaries,
    padding,
    side,
    align,
    sideOffset,
    alignOffset,
    avoidCollisions,
    sticky,
    arrowPadding,
    hideWhenDetached,
  ]);

  // First placement before paint; afterwards one frame per burst of changes.
  useIsoLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const content = wrapper.firstElementChild;
    if (content) {
      const z = getComputedStyle(content).zIndex;
      wrapper.style.zIndex = z && z !== 'auto' ? z : '';
    }
    update();
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
    observer?.observe(wrapper);
    if (anchor instanceof Element) observer?.observe(anchor);
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    let loop = 0;
    if (updatePositionStrategy === 'always') {
      const tick = () => {
        update();
        loop = requestAnimationFrame(tick);
      };
      loop = requestAnimationFrame(tick);
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (loop) cancelAnimationFrame(loop);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, [update, anchor, updatePositionStrategy]);

  const placement = React.useMemo<PlacementContextValue>(
    () => ({ side: placed.side, align: placed.align, setArrow }),
    [placed, setArrow],
  );
  const aliasStyle = React.useMemo(() => {
    const vars: Record<string, string> = {};
    for (const [name, canonical] of Object.entries(aliases ?? {}))
      vars[name] = `var(${CANONICAL[canonical as keyof typeof CANONICAL] ?? canonical})`;
    return vars;
  }, [aliases]);

  return (
    <PlacementContext.Provider value={placement}>
      <div
        data-bl-anchored=""
        {...props}
        ref={ref}
        style={{
          ...aliasStyle,
          ...style,
          position: 'fixed',
          left: 0,
          top: 0,
          minWidth: 'max-content',
          // Placement is instant, whatever a page's global transition rules
          // say: a transitioned transform would lag behind scrolling and
          // leave the box at the viewport origin for its first frame.
          transition: 'none',
          // No transform until measured: the first paint already has one
          // (the layout effect runs before it), so nothing flashes at 0,0.
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        {children}
      </div>
    </PlacementContext.Provider>
  );
});

export interface ArrowProps extends React.SVGAttributes<SVGSVGElement> {
  width?: number;
  height?: number;
}

const rotation: Record<Side, string> = {
  top: '0deg',
  right: '90deg',
  bottom: '180deg',
  left: '-90deg',
};

/**
 * A triangle on the edge of the surface facing the anchor, pointing at the
 * anchor's centre. Style the SVG (`fill-*`) to match the surface.
 */
const Arrow = React.forwardRef<SVGSVGElement, ArrowProps>(function Arrow(
  { width = 10, height = 5, style, ...props },
  forwardedRef,
) {
  const context = React.useContext(PlacementContext);
  const side = context?.side ?? 'bottom';
  const setArrow = context?.setArrow;
  const hostRef = React.useRef<HTMLSpanElement | null>(null);
  useIsoLayoutEffect(() => {
    setArrow?.(hostRef.current, { width, height });
    return () => setArrow?.(null, { width: 0, height: 0 });
  }, [setArrow, width, height]);
  // The host sits on the edge; the triangle is drawn pointing down and rotated.
  const edge: React.CSSProperties =
    side === 'top'
      ? { top: '100%' }
      : side === 'bottom'
        ? { bottom: '100%' }
        : side === 'left'
          ? { left: '100%' }
          : { right: '100%' };
  const box =
    side === 'top' || side === 'bottom' ? { width, height } : { width: height, height: width };
  return (
    <span
      ref={hostRef}
      aria-hidden="true"
      data-bl-arrow=""
      data-side={side}
      style={{ position: 'absolute', ...edge, ...box, lineHeight: 0, pointerEvents: 'none' }}
    >
      <svg
        {...props}
        ref={forwardedRef}
        width={width}
        height={height}
        viewBox="0 0 30 10"
        preserveAspectRatio="none"
        style={{
          ...style,
          display: 'block',
          transform: `rotate(${rotation[side]})`,
          transformOrigin:
            side === 'top' || side === 'bottom' ? 'center' : `${height / 2}px ${height / 2}px`,
        }}
      >
        <polygon points="0,0 30,0 15,10" />
      </svg>
    </span>
  );
});

const HOLD_ATTRIBUTE = 'data-bl-hold';

/**
 * Keeps the positioned surface that contains `node` where it is until the
 * returned function runs: while a pointer is down on a row, the surface must
 * not move or flip under it, or the release lands somewhere else.
 */
function holdPlacement(node: Element): () => void {
  const wrapper = node.closest<HTMLElement>('[data-bl-anchored]');
  if (!wrapper) return () => undefined;
  wrapper.setAttribute(HOLD_ATTRIBUTE, '');
  return () => wrapper.removeAttribute(HOLD_ATTRIBUTE);
}

export {
  Anchor,
  AnchorProvider,
  Arrow,
  holdPlacement,
  Positioned,
  useAnchorContext,
  useImplicitAnchor,
};
