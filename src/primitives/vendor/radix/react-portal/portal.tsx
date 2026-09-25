// Vendored from Radix Primitives (c) 2022 WorkOS, MIT. See vendor/LICENSE.radix.
// Local modification: package imports resolve to the pinned local source.
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Primitive } from '../react-primitive';
import { useLayoutEffect } from '../react-use-layout-effect';

/* -------------------------------------------------------------------------------------------------
 * Portal
 * -----------------------------------------------------------------------------------------------*/

type PortalElement = React.ComponentRef<typeof Primitive.div>;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>;
interface PortalProps extends PrimitiveDivProps {
  /**
   * An optional container where the portaled content should be appended.
   */
  container?: Element | DocumentFragment | null;
}

const Portal = /* @__PURE__ */ React.forwardRef<PortalElement, PortalProps>(
  function Portal(props, forwardedRef) {
    const { container: containerProp, ...portalProps } = props;
    const [mounted, setMounted] = React.useState(false);
    useLayoutEffect(() => setMounted(true), []);
    const container = containerProp || (mounted && globalThis?.document?.body);
    return container
      ? ReactDOM.createPortal(<Primitive.div {...portalProps} ref={forwardedRef} />, container)
      : null;
  },
);

/* -----------------------------------------------------------------------------------------------*/

const Root = Portal;

export {
  Portal,
  //
  Root,
};
export type { PortalProps };
