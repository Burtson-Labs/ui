// Vendored from Radix Primitives (c) 2022 WorkOS, MIT. See vendor/LICENSE.radix.
// Local modification: package imports resolve to the pinned local source.
import * as React from 'react';

let _isHydrated = false;

export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = React.useState(_isHydrated);
  React.useEffect(() => {
    if (!_isHydrated) {
      _isHydrated = true;
      setIsHydrated(true);
    }
  }, []);
  return isHydrated;
}
