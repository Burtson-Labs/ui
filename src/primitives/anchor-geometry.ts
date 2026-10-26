/**
 * The arithmetic of placing a floating box beside an anchor, with no DOM in
 * sight so it can be tested as plain numbers. Everything is in one
 * coordinate space (the viewport, for fixed positioning): the anchor's
 * rectangle, the floating box's size, and the boundary the box should stay
 * inside.
 */

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PlacementInput {
  anchor: Rect;
  floating: Size;
  /** The area the floating box should stay inside (already shrunk by padding). */
  boundary: Rect;
  side: Side;
  align: Align;
  /** Gap between anchor and box along the side axis. */
  sideOffset?: number;
  /**
   * Shift along the alignment axis. Positive moves the box inward from the
   * aligned edge for `start` and `end`, and toward the end (right, or left in
   * RTL; down for left/right sides) for `center`.
   */
  alignOffset?: number;
  /** Flip to the opposite side, and shift along the alignment axis, to stay inside the boundary. */
  avoidCollisions?: boolean;
  /**
   * `partial`: the box may shift along the alignment axis only while it still
   * touches the anchor. `always`: it may shift as far as needed to stay in view.
   */
  sticky?: 'partial' | 'always';
  /** The arrow's footprint; it sits in the gap, so its height is added to the offset. */
  arrow?: Size & { padding?: number };
  /** The content's writing direction; swaps start and end on top/bottom sides. */
  rtl?: boolean;
}

export interface PlacementResult {
  x: number;
  y: number;
  side: Side;
  align: Align;
  /** `transform-origin` for scale animations: the point on the box nearest the anchor's centre. */
  transformOrigin: string;
  /** Room between the box and the boundary on the chosen side. */
  availableWidth: number;
  availableHeight: number;
  /** The arrow's offset along the box's edge facing the anchor (`x` for top/bottom, `y` for left/right). */
  arrowX?: number;
  arrowY?: number;
  /** The box had to be shifted off its ideal alignment or flipped. */
  shifted: boolean;
}

export const opposite: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const flipAlign = (align: Align): Align =>
  align === 'start' ? 'end' : align === 'end' ? 'start' : 'center';

const isVertical = (side: Side) => side === 'top' || side === 'bottom';

const clamp = (value: number, min: number, max: number) =>
  max < min ? min : Math.min(Math.max(value, min), max);

/** Resolves `collisionPadding` (one number, or a value per side) to four numbers. */
export function resolvePadding(
  padding: number | Partial<Record<Side, number>> | undefined,
): Record<Side, number> {
  if (typeof padding === 'number')
    return { top: padding, right: padding, bottom: padding, left: padding };
  return { top: 0, right: 0, bottom: 0, left: 0, ...padding };
}

/** Shrinks a rectangle by a padding on each side. */
export function insetRect(rect: Rect, padding: Record<Side, number>): Rect {
  return {
    x: rect.x + padding.left,
    y: rect.y + padding.top,
    width: rect.width - padding.left - padding.right,
    height: rect.height - padding.top - padding.bottom,
  };
}

/** The intersection of rectangles, or an empty one at the first's origin. */
export function intersectRects(rects: Rect[]): Rect {
  const first = rects[0];
  if (!first) return { x: 0, y: 0, width: 0, height: 0 };
  let x1 = first.x;
  let y1 = first.y;
  let x2 = first.x + first.width;
  let y2 = first.y + first.height;
  for (const rect of rects.slice(1)) {
    x1 = Math.max(x1, rect.x);
    y1 = Math.max(y1, rect.y);
    x2 = Math.min(x2, rect.x + rect.width);
    y2 = Math.min(y2, rect.y + rect.height);
  }
  return { x: x1, y: y1, width: Math.max(0, x2 - x1), height: Math.max(0, y2 - y1) };
}

/** True when two rectangles share any area. */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

interface Candidate {
  side: Side;
  align: Align;
  x: number;
  y: number;
  mainOverflow: number;
  crossOverflow: number;
  shifted: boolean;
}

function place(input: PlacementInput, side: Side, align: Align): Candidate {
  const { anchor, floating, boundary } = input;
  const gap = (input.sideOffset ?? 0) + (input.arrow?.height ?? 0);
  const alignOffset = input.alignOffset ?? 0;
  const vertical = isVertical(side);
  const rtl = Boolean(input.rtl) && vertical;

  // The side axis.
  let x = 0;
  let y = 0;
  if (side === 'top') y = anchor.y - floating.height - gap;
  if (side === 'bottom') y = anchor.y + anchor.height + gap;
  if (side === 'left') x = anchor.x - floating.width - gap;
  if (side === 'right') x = anchor.x + anchor.width + gap;

  // The alignment axis. In RTL, "start" on a top/bottom side is the right edge.
  const effective = rtl ? flipAlign(align) : align;
  const anchorLength = vertical ? anchor.width : anchor.height;
  const floatingLength = vertical ? floating.width : floating.height;
  const anchorStart = vertical ? anchor.x : anchor.y;
  let along: number;
  if (effective === 'start') along = anchorStart + alignOffset;
  else if (effective === 'end') along = anchorStart + anchorLength - floatingLength - alignOffset;
  else
    along =
      anchorStart + anchorLength / 2 - floatingLength / 2 + (rtl ? -alignOffset : alignOffset);
  if (vertical) x = along;
  else y = along;

  // Shift along the alignment axis to stay inside the boundary.
  let shifted = false;
  if (input.avoidCollisions !== false) {
    const min = vertical ? boundary.x : boundary.y;
    const max =
      (vertical ? boundary.x + boundary.width : boundary.y + boundary.height) - floatingLength;
    let target = clamp(along, min, max);
    if (input.sticky !== 'always') {
      // Partial: never slide so far that the box stops touching the anchor.
      const touchMin = anchorStart - floatingLength;
      const touchMax = anchorStart + anchorLength;
      target = clamp(target, touchMin, touchMax);
    }
    if (target !== along) {
      shifted = true;
      along = target;
      if (vertical) x = along;
      else y = along;
    }
  }

  const right = x + floating.width;
  const bottom = y + floating.height;
  const overflow = {
    top: boundary.y - y,
    bottom: bottom - (boundary.y + boundary.height),
    left: boundary.x - x,
    right: right - (boundary.x + boundary.width),
  };
  const mainOverflow = Math.max(0, overflow[side]);
  const crossOverflow = vertical
    ? Math.max(0, overflow.left, overflow.right)
    : Math.max(0, overflow.top, overflow.bottom);
  return { side, align, x, y, mainOverflow, crossOverflow, shifted };
}

/**
 * Places the box. The preferred side and alignment win when they fit. When
 * they do not and collisions are avoided, the alternatives are tried in
 * order: the opposite alignment on the same side, then the opposite side
 * with each alignment. The first that fits is used; if none fits, the one
 * that overflows least on the side axis.
 */
export function computePlacement(input: PlacementInput): PlacementResult {
  const { side, align } = input;
  const candidates: [Side, Align][] = [[side, align]];
  if (input.avoidCollisions !== false) {
    if (align !== 'center') candidates.push([side, flipAlign(align)]);
    candidates.push([opposite[side], align]);
    if (align !== 'center') candidates.push([opposite[side], flipAlign(align)]);
  }
  const placed = candidates.map(([s, a]) => place(input, s, a));
  const chosen =
    placed.find((c) => c.mainOverflow === 0 && c.crossOverflow === 0) ??
    placed.find((c) => c.mainOverflow === 0) ??
    placed.reduce((best, c) => (c.mainOverflow < best.mainOverflow ? c : best));
  const { anchor, floating, boundary } = input;

  // Available room on the chosen side, inside the boundary.
  let availableWidth = boundary.width;
  let availableHeight = boundary.height;
  if (chosen.side === 'top') availableHeight = chosen.y + floating.height - boundary.y;
  if (chosen.side === 'bottom') availableHeight = boundary.y + boundary.height - chosen.y;
  if (chosen.side === 'left') availableWidth = chosen.x + floating.width - boundary.x;
  if (chosen.side === 'right') availableWidth = boundary.x + boundary.width - chosen.x;

  // The arrow points at the anchor's centre, kept within the box's edge.
  let arrowX: number | undefined;
  let arrowY: number | undefined;
  if (input.arrow) {
    const padding = input.arrow.padding ?? 0;
    if (isVertical(chosen.side)) {
      const centre = anchor.x + anchor.width / 2 - chosen.x - input.arrow.width / 2;
      arrowX = clamp(centre, padding, floating.width - input.arrow.width - padding);
    } else {
      const centre = anchor.y + anchor.height / 2 - chosen.y - input.arrow.width / 2;
      arrowY = clamp(centre, padding, floating.height - input.arrow.width - padding);
    }
  }

  // Scale animations grow out of the point nearest the anchor's centre.
  const originX = clamp(anchor.x + anchor.width / 2 - chosen.x, 0, floating.width);
  const originY = clamp(anchor.y + anchor.height / 2 - chosen.y, 0, floating.height);
  const arrowDepth = input.arrow?.height ?? 0;
  const transformOrigin =
    chosen.side === 'top'
      ? `${originX}px ${floating.height + arrowDepth}px`
      : chosen.side === 'bottom'
        ? `${originX}px ${-arrowDepth}px`
        : chosen.side === 'left'
          ? `${floating.width + arrowDepth}px ${originY}px`
          : `${-arrowDepth}px ${originY}px`;

  return {
    x: chosen.x,
    y: chosen.y,
    side: chosen.side,
    align: chosen.align,
    transformOrigin,
    availableWidth: Math.max(0, availableWidth),
    availableHeight: Math.max(0, availableHeight),
    arrowX,
    arrowY,
    shifted: chosen.shifted || chosen.side !== side || chosen.align !== align,
  };
}
