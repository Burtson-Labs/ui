import * as React from 'react';

/** Tailwind's breakpoints, for layout that has to change in script, not only in CSS. */
export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;

export type Breakpoint = keyof typeof breakpoints;

const noop = () => undefined;

/**
 * True while the media query matches. Server-side and without `matchMedia`
 * (old browsers, jsdom) it is false, so ask the question whose "false" is the
 * desktop layout: `useMediaQuery('(max-width: 767px)')` rather than
 * `(min-width: 768px)`. The value is read with useSyncExternalStore, so it is
 * right on the first client render and never flashes the wrong layout.
 */
export function useMediaQuery(query: string | null): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!query || typeof matchMedia !== 'function') return noop;
      const mq = matchMedia(query);
      mq.addEventListener?.('change', onChange);
      return () => mq.removeEventListener?.('change', onChange);
    },
    [query],
  );
  return React.useSyncExternalStore(
    subscribe,
    () => Boolean(query && typeof matchMedia === 'function' && matchMedia(query).matches),
    () => false,
  );
}

/** True while the viewport is narrower than the breakpoint; false with no `matchMedia`. */
export function useNarrowerThan(breakpoint: Breakpoint | false): boolean {
  return useMediaQuery(breakpoint ? `(max-width: ${breakpoints[breakpoint] - 0.02}px)` : null);
}
