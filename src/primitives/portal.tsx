import * as React from 'react';
import { createPortal } from 'react-dom';

import { useIsoLayoutEffect } from './use-layout-effect';

export interface PortalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Where to render; `document.body` by default. */
  container?: Element | DocumentFragment | null;
}

/**
 * Renders its children into another part of the document, in a plain `div`
 * so refs and data attributes have a node. Nothing renders on the server or
 * during hydration: the body is only known once the component has mounted,
 * and the client's first render must match the server's.
 */
const Portal = React.forwardRef<HTMLDivElement, PortalProps>(function Portal(
  { container, ...props },
  ref,
) {
  const [mounted, setMounted] = React.useState(false);
  useIsoLayoutEffect(() => {
    setMounted(true);
  }, []);
  const target = container ?? (mounted ? document.body : null);
  return target ? createPortal(<div data-bl-portal="" {...props} ref={ref} />, target) : null;
});

export { Portal };
