// Vendored from Radix Primitives (c) 2022 WorkOS, MIT. See vendor/LICENSE.radix.
// Local modification: package imports resolve to the pinned local source.
import * as React from 'react';

/**
 * On the server, React emits a warning when calling `useLayoutEffect`.
 * This is because neither `useLayoutEffect` nor `useEffect` run on the server.
 * We use this safe version which suppresses the warning by replacing it with a noop on the server.
 *
 * See: https://reactjs.org/docs/hooks-reference.html#uselayouteffect
 */
const useLayoutEffect = globalThis?.document ? React.useLayoutEffect : () => {};

export { useLayoutEffect };
