import * as React from 'react';

import { useIsoLayoutEffect } from './use-layout-effect';

type AnyFunction = (...args: never[]) => unknown;

/**
 * A function whose identity never changes but which always calls the latest
 * `callback`. Event handlers given to document listeners, observers and
 * timers go through this so an effect does not have to re-subscribe every
 * render, and a stale closure never fires.
 */
export function useCallbackRef<T extends AnyFunction>(callback: T | undefined): T {
  const latest = React.useRef(callback);
  useIsoLayoutEffect(() => {
    latest.current = callback;
  });
  return React.useMemo(
    () => ((...args: Parameters<T>) => latest.current?.(...args)) as unknown as T,
    [],
  );
}
