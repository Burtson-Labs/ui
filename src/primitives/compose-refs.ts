import * as React from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Assigns `value` to a callback or object ref. A callback ref may return a
 * cleanup (React 19); it is handed back so composed refs can run it.
 */
export function setRef<T>(ref: PossibleRef<T>, value: T | null): (() => void) | undefined {
  if (typeof ref === 'function') {
    const result: unknown = ref(value);
    return typeof result === 'function' ? (result as () => void) : undefined;
  }
  if (ref) (ref as { current: T | null }).current = value;
  return undefined;
}

/**
 * One callback ref that feeds several refs. Works on React 18 (React calls
 * the callback with null on unmount) and React 19 (React runs the returned
 * cleanup instead): the cleanup runs each inner cleanup, or nulls the ref.
 */
export function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    const cleanups = refs.map((ref) => setRef(ref, node));
    return () => {
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index];
        if (cleanup) cleanup();
        else setRef(ref, null);
      });
    };
  };
}

/** `composeRefs` memoised on the refs' identities. */
export function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // The refs themselves are the dependency list: a new ref gets the node.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  return React.useCallback(composeRefs(...refs), refs);
}
