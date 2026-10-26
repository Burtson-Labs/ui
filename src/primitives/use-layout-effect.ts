import * as React from 'react';

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server. Layout
 * effects never run during server rendering, and React 18 logs a warning
 * when one is declared there; picking the hook by environment keeps server
 * output quiet and lets the same module render on both sides.
 */
export const useIsoLayoutEffect: typeof React.useLayoutEffect =
  typeof document === 'undefined' ? React.useEffect : React.useLayoutEffect;
