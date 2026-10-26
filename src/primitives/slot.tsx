import * as React from 'react';

import { composeRefs } from './compose-refs';
import { getElementRef } from './element-ref';

export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

type AnyProps = Record<string, unknown>;

const isHandler = (key: string, value: unknown) =>
  typeof value === 'function' && /^on[A-Z]/.test(key);

/**
 * Merges the props a Slot received with the props of the child it renders.
 * The child's own props win for plain values; `className` is joined; `style`
 * is merged with the child on top; and when both sides handle the same
 * event, the child's handler runs first and the slot's second. A child's
 * `preventDefault()` does not stop the slot's handler: whether a component
 * honours a prevented event is decided where that component composes its
 * own handlers (see `composeHandlers`).
 */
export function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const merged: AnyProps = { ...slotProps };
  for (const key of Object.keys(childProps)) {
    const child = childProps[key];
    const slot = slotProps[key];
    if (isHandler(key, child) && isHandler(key, slot)) {
      const childFn = child as (...args: unknown[]) => void;
      const slotFn = slot as (...args: unknown[]) => void;
      merged[key] = (...args: unknown[]) => {
        childFn(...args);
        slotFn(...args);
      };
    } else if (key === 'className' && slot && child) {
      merged[key] = `${slot as string} ${child as string}`;
    } else if (key === 'style' && slot && child) {
      merged[key] = { ...slot, ...child };
    } else if (child !== undefined || !(key in slotProps)) {
      merged[key] = child;
    }
  }
  return merged;
}

/**
 * Marks which child of a Slot receives the merged props when there are
 * several (an icon before and a label after the real control).
 */
function Slottable({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const isSlottable = (
  node: React.ReactNode,
): node is React.ReactElement<{ children: React.ReactNode }> =>
  React.isValidElement(node) && node.type === Slottable;

/**
 * Renders its one element child with the Slot's props merged in, in place of
 * a wrapping element: the `asChild` pattern. The forwarded ref and the
 * child's own ref both receive the node. With several children, exactly one
 * must be wrapped in `Slottable`; the rest are rendered around it inside the
 * element that child renders. Anything that is not an element renders
 * nothing: there is no node to merge onto.
 */
const Slot = React.forwardRef<HTMLElement, SlotProps>(function Slot({ children, ...props }, ref) {
  const list = React.Children.toArray(children);
  const slottable = list.find(isSlottable);
  if (slottable) {
    const target = slottable.props.children;
    if (!React.isValidElement(target)) return null;
    const targetChildren = (target.props as AnyProps).children as React.ReactNode;
    const inner = list.map((node) => (node === slottable ? targetChildren : node));
    return (
      <SlotClone {...props} ref={ref}>
        {React.cloneElement(target, undefined, ...inner)}
      </SlotClone>
    );
  }
  return (
    <SlotClone {...props} ref={ref}>
      {children}
    </SlotClone>
  );
});

const SlotClone = React.forwardRef<HTMLElement, SlotProps>(function SlotClone(
  { children, ...props },
  ref,
) {
  if (!React.isValidElement(children)) return null;
  const child = children as React.ReactElement<AnyProps>;
  const merged = mergeProps(props, child.props);
  const childRef = getElementRef<unknown>(child);
  merged.ref = ref || childRef ? composeRefs(ref, childRef) : undefined;
  return React.cloneElement(child, merged);
});

export { Slot, Slottable };
