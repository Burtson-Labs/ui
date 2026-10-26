import * as React from 'react';

/**
 * Page scroll lock for modal surfaces. Locks are counted: the page is locked
 * by the first caller and released by the last. The viewport's scrollbar
 * gutter is measured before and after `overflow: hidden` is applied and the
 * difference is added to the body's right padding, so content does not jump
 * sideways when the scrollbar disappears (and is not padded when the page
 * reserves the gutter with `scrollbar-gutter: stable`). The width is also
 * published as `--bl-scrollbar-gutter` on `<html>` for fixed headers.
 *
 * Touch scrolling: `overflow: hidden` alone does not stop every touch
 * browser from scrolling the page, so while locked a `touchmove` listener
 * cancels moves that would reach the page. A move inside an allowed element
 * (the open layer) is let through when a scrollable ancestor there can still
 * move in that direction, so lists inside a dialog scroll and the page does
 * not scroll behind them.
 */

const allowed = new Set<Element>();
let count = 0;
let restore: (() => void) | null = null;
let touchStartY = 0;
let touchStartX = 0;

function scrollableAncestor(target: Element, within: Element, dx: number, dy: number) {
  for (
    let node: Element | null = target;
    node && within.contains(node);
    node = node.parentElement
  ) {
    const style = getComputedStyle(node);
    const vertical = /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight;
    const horizontal = /(auto|scroll)/.test(style.overflowX) && node.scrollWidth > node.clientWidth;
    if (Math.abs(dy) >= Math.abs(dx) && vertical) {
      const atTop = node.scrollTop <= 0;
      const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
      if ((dy < 0 && !atBottom) || (dy > 0 && !atTop)) return node;
    } else if (Math.abs(dx) > Math.abs(dy) && horizontal) {
      const atStart = node.scrollLeft <= 0;
      const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 1;
      if ((dx < 0 && !atEnd) || (dx > 0 && !atStart)) return node;
    }
  }
  return null;
}

function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch || event.touches.length > 1) return;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function onTouchMove(event: TouchEvent) {
  if (event.touches.length > 1) return; // pinch zoom
  const touch = event.touches[0];
  const target = event.target;
  if (!touch || !(target instanceof Element)) return;
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  for (const element of allowed) {
    if (element.contains(target) && scrollableAncestor(target, element, dx, dy)) return;
  }
  if (event.cancelable) event.preventDefault();
}

function apply() {
  const html = document.documentElement;
  const body = document.body;
  const previous = {
    overflow: html.style.overflow,
    paddingRight: body.style.paddingRight,
    gutter: html.style.getPropertyValue('--bl-scrollbar-gutter'),
  };
  const before = window.innerWidth - html.clientWidth;
  html.style.overflow = 'hidden';
  const after = window.innerWidth - html.clientWidth;
  const gutter = Math.max(0, before - after);
  if (gutter > 0) {
    const basePadding = parseFloat(getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${basePadding + gutter}px`;
  }
  html.style.setProperty('--bl-scrollbar-gutter', `${gutter}px`);
  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  restore = () => {
    html.style.overflow = previous.overflow;
    body.style.paddingRight = previous.paddingRight;
    if (previous.gutter) html.style.setProperty('--bl-scrollbar-gutter', previous.gutter);
    else html.style.removeProperty('--bl-scrollbar-gutter');
    document.removeEventListener('touchstart', onTouchStart);
    document.removeEventListener('touchmove', onTouchMove);
  };
}

/**
 * Locks page scrolling until the returned function is called. `allowScrollIn`
 * names an element whose own scroll containers keep working on touch.
 */
export function lockScroll(allowScrollIn?: Element | null): () => void {
  if (typeof document === 'undefined') return () => undefined;
  if (count++ === 0) apply();
  if (allowScrollIn) allowed.add(allowScrollIn);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (allowScrollIn) allowed.delete(allowScrollIn);
    if (--count === 0) {
      restore?.();
      restore = null;
    }
  };
}

/** `lockScroll` tied to a component: locked while `active`. */
export function useScrollLock(active: boolean, allowRef?: React.RefObject<Element | null>) {
  React.useEffect(() => {
    if (!active) return;
    return lockScroll(allowRef?.current);
  }, [active, allowRef]);
}

/** For tests and diagnostics: how many locks are held. */
export function scrollLockCount(): number {
  return count;
}
