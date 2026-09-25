// Vendored from Radix Primitives (c) 2022 WorkOS, MIT. See vendor/LICENSE.radix.
// Local modification: package imports resolve to the pinned local source.
import * as React from 'react';
import { useIsHydrated as useIsHydratedLegacy } from './use-is-hydrated-legacy';

const useReactSyncExternalStore: typeof React.useSyncExternalStore | undefined = (React as any)[
  ' useSyncExternalStore '.trim().toString()
];

function subscribe() {
  return () => {};
}

/**
 * Determines whether or not the component tree has been hydrated.
 */
function useIsHydratedModern() {
  return useReactSyncExternalStore!(
    subscribe,
    () => true,
    () => false,
  );
}

export const useIsHydrated =
  typeof useReactSyncExternalStore === 'function' ? useIsHydratedModern : useIsHydratedLegacy;
