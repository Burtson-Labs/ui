import { describe, expect, it } from 'vitest';

import {
  computePlacement,
  insetRect,
  intersectRects,
  type PlacementInput,
  rectsOverlap,
  resolvePadding,
} from '../src/primitives/anchor-geometry';

// A 1000x800 viewport, a 100x40 anchor and a 200x100 floating box.
const base: PlacementInput = {
  anchor: { x: 450, y: 380, width: 100, height: 40 },
  floating: { width: 200, height: 100 },
  boundary: { x: 0, y: 0, width: 1000, height: 800 },
  side: 'bottom',
  align: 'center',
};

describe('computePlacement', () => {
  it('places each side with the gap and centres by default', () => {
    expect(computePlacement({ ...base, sideOffset: 8 })).toMatchObject({
      x: 400,
      y: 428,
      side: 'bottom',
      align: 'center',
    });
    expect(computePlacement({ ...base, side: 'top', sideOffset: 8 })).toMatchObject({
      x: 400,
      y: 272,
      side: 'top',
    });
    expect(computePlacement({ ...base, side: 'right', sideOffset: 8 })).toMatchObject({
      x: 558,
      y: 350,
      side: 'right',
    });
    expect(computePlacement({ ...base, side: 'left', sideOffset: 8 })).toMatchObject({
      x: 242,
      y: 350,
      side: 'left',
    });
  });

  it('aligns to the start and end edges, with alignOffset moving inward', () => {
    expect(computePlacement({ ...base, align: 'start' }).x).toBe(450);
    expect(computePlacement({ ...base, align: 'end' }).x).toBe(350);
    expect(computePlacement({ ...base, align: 'start', alignOffset: 10 }).x).toBe(460);
    expect(computePlacement({ ...base, align: 'end', alignOffset: 10 }).x).toBe(340);
    expect(computePlacement({ ...base, side: 'right', align: 'start' }).y).toBe(380);
    expect(computePlacement({ ...base, side: 'right', align: 'end' }).y).toBe(320);
  });

  it('swaps start and end in RTL on the top and bottom sides only', () => {
    expect(computePlacement({ ...base, align: 'start', rtl: true }).x).toBe(350);
    expect(computePlacement({ ...base, align: 'end', rtl: true }).x).toBe(450);
    expect(computePlacement({ ...base, align: 'start', rtl: true, alignOffset: 10 }).x).toBe(340);
    expect(computePlacement({ ...base, side: 'right', align: 'start', rtl: true }).y).toBe(380);
  });

  it('flips to the opposite side when the preferred one has no room', () => {
    const nearBottom = { ...base, anchor: { ...base.anchor, y: 740 } };
    const result = computePlacement(nearBottom);
    expect(result.side).toBe('top');
    expect(result.y).toBe(640);
    expect(result.shifted).toBe(true);
    // Not when collisions are allowed.
    expect(computePlacement({ ...nearBottom, avoidCollisions: false }).side).toBe('bottom');
  });

  it('keeps the preferred side when neither fits and it has more room', () => {
    const tight = {
      ...base,
      boundary: { x: 0, y: 0, width: 1000, height: 480 },
      anchor: { ...base.anchor, y: 60 },
      floating: { width: 200, height: 450 },
    };
    // Below: 380px of room; above: 60px. Below overflows less.
    expect(computePlacement(tight).side).toBe('bottom');
  });

  it('shifts along the alignment axis to stay inside, but stays attached by default', () => {
    const nearRight = { ...base, anchor: { ...base.anchor, x: 950 } };
    const partial = computePlacement(nearRight);
    // Would be 900; the boundary allows 800; sticking to the anchor allows down to 750.
    expect(partial.x).toBe(800);
    expect(partial.shifted).toBe(true);
    const farRight = { ...base, anchor: { ...base.anchor, x: 1100 } };
    // Partial: the box may not leave the anchor (anchor starts at 1100, box ends at 1100 at most... box left >= 900).
    expect(computePlacement(farRight).x).toBe(900);
    // Always: it slides fully into view.
    expect(computePlacement({ ...farRight, sticky: 'always' }).x).toBe(800);
  });

  it('reports the room available on the chosen side', () => {
    const result = computePlacement({ ...base, sideOffset: 8 });
    expect(result.availableHeight).toBe(800 - 428);
    expect(result.availableWidth).toBe(1000);
    const top = computePlacement({ ...base, side: 'top', sideOffset: 8 });
    expect(top.availableHeight).toBe(380 - 8);
  });

  it('puts the transform origin on the edge facing the anchor, at the anchor centre', () => {
    expect(computePlacement(base).transformOrigin).toBe('100px 0px');
    expect(computePlacement({ ...base, side: 'top' }).transformOrigin).toBe('100px 100px');
    expect(computePlacement({ ...base, side: 'left' }).transformOrigin).toBe('200px 50px');
    expect(computePlacement({ ...base, side: 'right' }).transformOrigin).toBe('0px 50px');
    // With an arrow the origin sits at the arrow's tip.
    expect(computePlacement({ ...base, arrow: { width: 10, height: 5 } }).transformOrigin).toBe(
      '100px -5px',
    );
  });

  it('positions the arrow under the anchor centre, within padding', () => {
    const arrow = { width: 10, height: 5, padding: 4 };
    expect(computePlacement({ ...base, arrow }).arrowX).toBe(95);
    expect(computePlacement({ ...base, arrow }).y).toBe(425);
    const nearRight = { ...base, anchor: { ...base.anchor, x: 950 }, arrow };
    // Box shifted to 800..1000; anchor centre 1000 -> arrow clamped to 200 - 10 - 4.
    expect(computePlacement(nearRight).arrowX).toBe(186);
    expect(computePlacement({ ...base, side: 'right', arrow }).arrowY).toBe(45);
  });
});

describe('rect helpers', () => {
  it('resolves padding and insets rectangles', () => {
    expect(resolvePadding(8)).toEqual({ top: 8, right: 8, bottom: 8, left: 8 });
    expect(resolvePadding({ top: 4 })).toEqual({ top: 4, right: 0, bottom: 0, left: 0 });
    expect(insetRect({ x: 0, y: 0, width: 100, height: 50 }, resolvePadding(10))).toEqual({
      x: 10,
      y: 10,
      width: 80,
      height: 30,
    });
  });

  it('intersects and tests overlap', () => {
    expect(
      intersectRects([
        { x: 0, y: 0, width: 100, height: 100 },
        { x: 50, y: 25, width: 100, height: 100 },
      ]),
    ).toEqual({ x: 50, y: 25, width: 50, height: 75 });
    expect(intersectRects([])).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    expect(
      rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 10, y: 0, width: 10, height: 10 }),
    ).toBe(false);
    expect(
      rectsOverlap({ x: 0, y: 0, width: 10, height: 10 }, { x: 9, y: 9, width: 10, height: 10 }),
    ).toBe(true);
  });
});
