import * as React from 'react';

/**
 * Hides everything except the live modal surface from assistive technology:
 * walking from each target up to `<body>`, every sibling of the path that is
 * not itself a target gets `aria-hidden="true"` and, where the browser
 * supports it, `inert`. Live regions (`aria-live`, `role="status"`, `alert`
 * and `log`) are never hidden, so a toast raised behind a dialog is still
 * announced. Calls nest: each element counts how many callers hid it and is
 * restored to its previous attributes only when the last one releases.
 */

interface Hidden {
  count: number;
  ariaHidden: string | null;
  inert: boolean;
}

const hidden = new WeakMap<Element, Hidden>();
const LIVE = '[aria-live], [role="alert"], [role="status"], [role="log"], [data-bl-live]';
const supportsInert = () => typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype;

function hide(element: Element) {
  const record = hidden.get(element);
  if (record) {
    record.count += 1;
    return;
  }
  hidden.set(element, {
    count: 1,
    ariaHidden: element.getAttribute('aria-hidden'),
    inert: element.hasAttribute('inert'),
  });
  element.setAttribute('aria-hidden', 'true');
  if (supportsInert()) element.setAttribute('inert', '');
}

function release(element: Element) {
  const record = hidden.get(element);
  if (!record) return;
  if (--record.count > 0) return;
  hidden.delete(element);
  if (record.ariaHidden === null) element.removeAttribute('aria-hidden');
  else element.setAttribute('aria-hidden', record.ariaHidden);
  if (!record.inert) element.removeAttribute('inert');
}

/** Hides everything outside `targets` until the returned function runs. */
export function hideOthers(targets: Element | Element[]): () => void {
  if (typeof document === 'undefined') return () => undefined;
  const list = Array.isArray(targets) ? targets : [targets];
  const keep = new Set<Element>();
  for (const target of list)
    for (let node: Element | null = target; node; node = node.parentElement) keep.add(node);
  const touched: Element[] = [];
  // A subtree that holds a live region (a toast viewport in its own portal)
  // is not hidden whole: its children are visited instead, so the live part
  // stays reachable and everything beside it is still hidden.
  const hideTree = (element: Element) => {
    if (keep.has(element) || element.matches(LIVE)) return;
    if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
    if (element.querySelector(LIVE)) {
      for (const child of element.children) hideTree(child);
      return;
    }
    hide(element);
    touched.push(element);
  };
  for (const target of list) {
    for (
      let node: Element | null = target;
      node && node !== document.body;
      node = node.parentElement
    ) {
      const parent = node.parentElement;
      if (!parent) break;
      for (const sibling of parent.children) hideTree(sibling);
    }
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    for (const element of touched) release(element);
  };
}

/**
 * `hideOthers` tied to a component: hidden while `active`. The surface's
 * portal node is the target when it has one, so an overlay rendered beside
 * the surface in the same portal stays visible to assistive technology and,
 * as `inert` elements are not hit-tested, keeps receiving the press that
 * dismisses the surface.
 */
export function useHideOthers(active: boolean, targetRef: React.RefObject<Element | null>) {
  React.useEffect(() => {
    const node = targetRef.current;
    if (!active || !node) return;
    return hideOthers(node.closest('[data-bl-portal]') ?? node);
  }, [active, targetRef]);
}
