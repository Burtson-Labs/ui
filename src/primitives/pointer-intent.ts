/**
 * Pointer intent for submenus. When the pointer leaves a submenu's trigger
 * heading for the submenu, it usually travels diagonally across the rows
 * under the trigger. Those rows must not take the highlight (and close the
 * submenu) while the pointer is plausibly on its way. The plausible region is
 * the triangle from the point where the pointer left the trigger to the two
 * corners of the submenu's near edge, widened by a few pixels so a slightly
 * curved path still counts.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Ray casting: whether `point` is inside the polygon (edges count as inside). */
export function pointInPolygon(point: Point, polygon: readonly Point[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!;
    const b = polygon[j]!;
    // On an edge?
    const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    if (
      Math.abs(cross) < 1e-9 &&
      point.x >= Math.min(a.x, b.x) - 1e-9 &&
      point.x <= Math.max(a.x, b.x) + 1e-9 &&
      point.y >= Math.min(a.y, b.y) - 1e-9 &&
      point.y <= Math.max(a.y, b.y) + 1e-9
    )
      return true;
    const crosses =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

/**
 * The grace triangle for a pointer that left a trigger at `exit` toward a
 * submenu occupying `content`. The near edge is the content's left edge when
 * the content lies to the right of the exit point, else its right edge; the
 * exit point is pushed `padding` pixels away from the content and the near
 * edge is extended `padding` pixels past the content's corners.
 */
export function graceTriangle(exit: Point, content: Box, padding = 5): Point[] {
  const toRight = content.left >= exit.x;
  const near = toRight ? content.left : content.right;
  const away = toRight ? -padding : padding;
  return [
    { x: exit.x + away, y: exit.y },
    { x: near, y: content.top - padding },
    { x: near, y: content.bottom + padding },
  ];
}
