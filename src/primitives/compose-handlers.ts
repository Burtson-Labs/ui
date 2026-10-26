/**
 * Runs the caller's handler, then the component's own, unless the caller's
 * prevented the event. This is how a prop like `onClick` on a trigger can
 * veto the trigger's default (opening) with `event.preventDefault()`.
 */
export function composeHandlers<E extends { defaultPrevented: boolean }>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
): (event: E) => void {
  return (event) => {
    theirs?.(event);
    if (!event.defaultPrevented) ours(event);
  };
}
