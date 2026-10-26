import * as React from 'react';

import { useComposedRefs } from './compose-refs';
import { getElementRef } from './element-ref';
import { useIsoLayoutEffect } from './use-layout-effect';

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The element's own animations and transitions that are still playing and
 * will end on their own. Infinite animations (a pulse) are left out, or the
 * exit would never finish; descendants are not consulted, so a spinner inside
 * a dialog never holds the dialog open.
 */
function endTimeOf(animation: Animation): number {
  const end = animation.effect?.getComputedTiming().endTime;
  return typeof end === 'number' ? end : Number.POSITIVE_INFINITY;
}

function pendingAnimations(node: Element): Animation[] {
  if (typeof node.getAnimations !== 'function') return [];
  return node.getAnimations().filter((animation) => {
    if (animation.playState === 'finished' || animation.playState === 'idle') return false;
    return Number.isFinite(endTimeOf(animation));
  });
}

/**
 * Keeps an element mounted after `present` turns false for as long as an
 * exit animation or transition runs on it. The consumer renders
 * `data-state="closed"` as soon as its own state closes; the stylesheet
 * starts the exit animation from that attribute; this hook watches the
 * animations the element reports and unmounts when the last one ends. With
 * no animation (or under reduced motion, where the kit shortens every
 * animation to a millisecond anyway) the element unmounts at once.
 *
 * Returns whether the element should be rendered right now.
 */
export function usePresence(
  present: boolean,
  nodeRef: React.RefObject<HTMLElement | null>,
): boolean {
  const [exiting, setExiting] = React.useState(false);
  const [seen, setSeen] = React.useState(present);
  if (seen !== present) {
    // Derived during render so the closing render keeps the node mounted.
    setSeen(present);
    setExiting(!present);
  }
  useIsoLayoutEffect(() => {
    if (present || !exiting) return;
    const node = nodeRef.current;
    const running = node && !prefersReducedMotion() ? pendingAnimations(node) : [];
    if (!running.length) {
      setExiting(false);
      return;
    }
    let live = true;
    const finish = () => {
      if (!live) return;
      live = false;
      setExiting(false);
    };
    void Promise.all(running.map((animation) => animation.finished.catch(() => undefined))).then(
      finish,
    );
    // A safety net for an animation whose promise never settles (the element
    // was hidden mid-flight): the longest computed end time, plus a margin.
    const longest = Math.max(...running.map(endTimeOf));
    const timer = setTimeout(finish, longest + 100);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [present, exiting, nodeRef]);
  return present || exiting;
}

export interface PresenceProps {
  present: boolean;
  /** One element that forwards its ref to a DOM node. */
  children: React.ReactElement<{ ref?: React.Ref<HTMLElement> }>;
}

/**
 * `usePresence` as a component: renders the child while it is present or
 * still animating out, and gives it the ref the hook needs.
 */
function Presence({ present, children }: PresenceProps) {
  const nodeRef = React.useRef<HTMLElement | null>(null);
  const mounted = usePresence(present, nodeRef);
  const ref = useComposedRefs(nodeRef, getElementRef<HTMLElement>(children));
  if (!mounted) return null;
  return React.cloneElement(children, { ref });
}

export { Presence };
