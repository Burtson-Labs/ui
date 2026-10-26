import * as React from 'react';

/**
 * A stable element id that matches between server and client. The caller's
 * own id wins when given. React's generated ids carry delimiter characters
 * (`:r1:`, `«r1»`); those are stripped so the id is safe in `aria-*`
 * attributes and attribute selectors without escaping.
 */
export function useStableId(explicit?: string, prefix = 'bl'): string {
  const generated = React.useId();
  return explicit ?? `${prefix}-${generated.replace(/[^\w-]/g, '')}`;
}
