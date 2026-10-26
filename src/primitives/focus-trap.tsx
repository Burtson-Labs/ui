import * as React from 'react';

import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { Slot } from './slot';
import { getTabbables, isFocusable } from './tabbable';
import { useCallbackRef } from './use-callback-ref';

export interface FocusScopeProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /**
   * Focus cannot leave: Tab wraps at both ends and focus that lands outside
   * (a click, a script) is brought back. For modal surfaces.
   */
  trapped?: boolean;
  /** Tab wraps at both ends, but focus may leave by other means. */
  loop?: boolean;
  /**
   * Fired before the scope moves focus into itself on mount. Call
   * `preventDefault()` to keep focus where it is or to place it yourself.
   */
  onMountAutoFocus?: (event: Event) => void;
  /**
   * Fired before the scope returns focus on unmount. Call `preventDefault()`
   * to leave focus alone or to place it yourself.
   */
  onUnmountAutoFocus?: (event: Event) => void;
  /**
   * Where focus returns on unmount. Defaults to the element that had focus
   * when the scope mounted.
   */
  restoreFocusTo?: () => HTMLElement | null | undefined;
}

export const FOCUS_SCOPE_MOUNT = 'bl-focus-scope-mount';
export const FOCUS_SCOPE_UNMOUNT = 'bl-focus-scope-unmount';

/**
 * Scopes stack as they mount. Only the newest enforces its rules, so a
 * trapped dialog does not fight a popover opened from inside it, and when
 * that popover closes the dialog's trap resumes.
 */
interface ScopeRecord {
  node: HTMLElement;
  trapped: boolean;
}
const scopes: ScopeRecord[] = [];
const activeScope = () => scopes[scopes.length - 1];

function focusElement(element: HTMLElement | null | undefined, select = false) {
  if (!element || !element.isConnected) return false;
  const before = document.activeElement;
  element.focus({ preventScroll: true });
  if (select && element instanceof HTMLInputElement && element !== before) {
    try {
      element.select();
    } catch {
      // Some input types (number, email in older engines) refuse select().
    }
  }
  return document.activeElement === element;
}

/**
 * A region that manages focus for an overlay: moves focus in on mount
 * (first tabbable, else the region itself when it is focusable), wraps Tab,
 * holds focus when trapped, and returns it on unmount. Both automatic moves
 * can be prevented or replaced through the mount/unmount events.
 */
const FocusScope = React.forwardRef<HTMLDivElement, FocusScopeProps>(function FocusScope(
  {
    asChild = false,
    trapped = false,
    loop = false,
    onMountAutoFocus,
    onUnmountAutoFocus,
    restoreFocusTo,
    onKeyDown,
    onFocusCapture,
    ...props
  },
  forwardedRef,
) {
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  // Focus events that came through this scope's React subtree, portals
  // included: a menu opened from a dialog is still the dialog's.
  const [seen] = React.useState(() => new WeakSet<Event>());
  const mountAutoFocus = useCallbackRef(onMountAutoFocus);
  const unmountAutoFocus = useCallbackRef(onUnmountAutoFocus);
  const restoreTarget = useCallbackRef(restoreFocusTo);
  const lastFocused = React.useRef<HTMLElement | null>(null);
  const record = React.useRef<ScopeRecord | null>(null);

  // Register in the stack; keep the record's `trapped` current.
  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const entry: ScopeRecord = { node, trapped };
    record.current = entry;
    scopes.push(entry);
    return () => {
      const index = scopes.indexOf(entry);
      if (index !== -1) scopes.splice(index, 1);
      record.current = null;
    };
    // The scope registers once; `trapped` is kept current below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (record.current) record.current.trapped = trapped;
  }, [trapped]);

  // Focus in on mount, back out on unmount.
  React.useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const mountEvent = new Event(FOCUS_SCOPE_MOUNT, { cancelable: true });
    mountAutoFocus(mountEvent);
    if (!mountEvent.defaultPrevented && !node.contains(document.activeElement)) {
      const first = getTabbables(node)[0];
      if (!focusElement(first, true) && isFocusable(node)) focusElement(node);
    }
    return () => {
      const unmountEvent = new Event(FOCUS_SCOPE_UNMOUNT, { cancelable: true });
      unmountAutoFocus(unmountEvent);
      if (unmountEvent.defaultPrevented) return;
      const target = restoreTarget() ?? previouslyFocused;
      // Give the frame that removed the scope a chance to settle (a trigger
      // that was inert while the scope was open is interactive again).
      focusElement(target);
    };
  }, [mountAutoFocus, unmountAutoFocus, restoreTarget]);

  // Trapped: focus that escapes comes back to where it was.
  React.useEffect(() => {
    if (!trapped) return;
    const node = nodeRef.current;
    if (!node) return;
    const onFocusIn = (event: FocusEvent) => {
      if (activeScope()?.node !== node) return;
      const target = event.target;
      if (target instanceof HTMLElement && node.contains(target)) {
        lastFocused.current = target;
        return;
      }
      if (seen.has(event)) return;
      if (!focusElement(lastFocused.current)) {
        if (!focusElement(getTabbables(node)[0]) && isFocusable(node)) focusElement(node);
      }
    };
    // Bubble phase, after React: the scope's own capture handler has marked
    // events from its React subtree by then. Focus leaving the document
    // (browser chrome) fires no focusin; nothing to do until it comes back.
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [trapped, seen]);

  const handleKeyDown = composeHandlers(onKeyDown, (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!trapped && !loop) return;
    const node = nodeRef.current;
    if (!node || activeScope()?.node !== node) return;
    const tabbables = getTabbables(node);
    const first = tabbables[0];
    const last = tabbables[tabbables.length - 1];
    const active = document.activeElement;
    if (!first || !last) {
      // Nothing to move to: keep focus on the scope itself when trapped.
      if (trapped) event.preventDefault();
      return;
    }
    if (event.shiftKey) {
      if (active === first || active === node) {
        event.preventDefault();
        focusElement(last);
      }
    } else if (active === last || active === node) {
      event.preventDefault();
      focusElement(first);
    }
  });

  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...props}
      ref={ref}
      onKeyDown={handleKeyDown}
      onFocusCapture={(event: React.FocusEvent<HTMLDivElement>) => {
        seen.add(event.nativeEvent);
        onFocusCapture?.(event);
      }}
    />
  );
});

export { FocusScope };
