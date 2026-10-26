import * as React from 'react';

/**
 * Type-to-find, as menus and listboxes do it: letters typed in quick
 * succession form a search string; the next item (after the current one,
 * wrapping) whose text starts with it is the match. Repeating one letter
 * cycles through the items that start with that letter. The search string
 * clears after a pause.
 */

/** The index of the matching item, or -1. Pure, for tests. */
export function findTypeaheadMatch(
  labels: readonly string[],
  search: string,
  currentIndex: number,
): number {
  if (!search || !labels.length) return -1;
  const needle = search.toLowerCase();
  const repeated = needle.length > 1 && [...needle].every((c) => c === needle[0]);
  const query = repeated ? needle[0]! : needle;
  // Start after the current item so repeated letters move on, and so a
  // longer string still prefers the current item when it keeps matching.
  const start = repeated || needle.length === 1 ? currentIndex + 1 : currentIndex;
  for (let step = 0; step < labels.length; step++) {
    const index = (((start + step) % labels.length) + labels.length) % labels.length;
    if (labels[index]!.toLowerCase().startsWith(query)) return index;
  }
  return -1;
}

export interface TypeaheadOptions {
  /** Milliseconds of silence that end the search string. */
  timeout?: number;
}

/**
 * Keeps the search string and timer. Call `handleKey` from a keydown handler
 * with the key, the labels in order and the current index; it returns the
 * index to move to, or -1 when the key was not a printable character or
 * nothing matched.
 */
export function useTypeahead({ timeout = 1000 }: TypeaheadOptions = {}) {
  const search = React.useRef('');
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const reset = React.useCallback(() => {
    search.current = '';
    clearTimeout(timer.current);
  }, []);
  const handleKey = React.useCallback(
    (key: string, labels: readonly string[], currentIndex: number): number => {
      if (key.length !== 1 || (key === ' ' && !search.current)) return -1;
      search.current += key;
      clearTimeout(timer.current);
      timer.current = setTimeout(reset, timeout);
      return findTypeaheadMatch(labels, search.current, currentIndex);
    },
    [reset, timeout],
  );
  return { handleKey, reset };
}
