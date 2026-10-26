import * as React from 'react';

import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { usePresence } from './presence';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * A disclosure, per the ARIA disclosure pattern: a button with
 * `aria-expanded` that shows and hides a section. The content measures
 * itself whenever it opens or closes and publishes its natural height and
 * width as CSS variables, so a height animation can run from 0 to the real
 * size (`--bl-collapsible-content-height`, `--bl-collapsible-content-width`;
 * the older `--radix-collapsible-content-*` names are kept, deprecated).
 */

interface CollapsibleContextValue {
  open: boolean;
  disabled: boolean;
  contentId: string;
  toggle: () => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsible(component: string): CollapsibleContextValue {
  const context = React.useContext(CollapsibleContext);
  if (!context) throw new Error(`${component} must be inside a Collapsible`);
  return context;
}

export interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  {
    asChild = false,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    ...props
  },
  ref,
) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const contentId = useStableId(undefined, 'bl-collapsible');
  const value = React.useMemo<CollapsibleContextValue>(
    () => ({ open, disabled, contentId, toggle: () => setOpen((current) => !current) }),
    [open, disabled, contentId, setOpen],
  );
  const Comp = asChild ? Slot : 'div';
  return (
    <CollapsibleContext.Provider value={value}>
      <Comp
        data-state={open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        {...props}
        ref={ref}
      />
    </CollapsibleContext.Provider>
  );
});

export interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ asChild = false, onClick, disabled, ...props }, ref) {
    const context = useCollapsible('CollapsibleTrigger');
    const isDisabled = disabled || context.disabled;
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        type={asChild ? undefined : 'button'}
        aria-controls={context.contentId}
        aria-expanded={context.open}
        data-state={context.open ? 'open' : 'closed'}
        data-disabled={isDisabled ? '' : undefined}
        disabled={isDisabled}
        {...props}
        ref={ref}
        onClick={composeHandlers(onClick, () => {
          if (!isDisabled) context.toggle();
        })}
      />
    );
  },
);

export interface CollapsibleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Keep the content in the DOM while closed (hidden), for a custom animation or SEO. */
  forceMount?: true;
}

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ asChild = false, forceMount, ...props }, forwardedRef) {
    const context = useCollapsible('CollapsibleContent');
    const nodeRef = React.useRef<HTMLDivElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    // Measure before the presence hook looks for an exit animation: the
    // measurement pauses animations, and the animation it then restarts is
    // the one the hook must wait for.
    useIsoLayoutEffect(() => {
      const node = nodeRef.current;
      if (!node) return;
      const animation = node.style.animationName;
      const transition = node.style.transitionDuration;
      node.style.animationName = 'none';
      node.style.transitionDuration = '0s';
      const rect = node.getBoundingClientRect();
      for (const prefix of ['--bl-collapsible-content', '--radix-collapsible-content']) {
        node.style.setProperty(`${prefix}-height`, `${rect.height}px`);
        node.style.setProperty(`${prefix}-width`, `${rect.width}px`);
      }
      node.style.animationName = animation;
      node.style.transitionDuration = transition;
    }, [context.open]);
    const mounted = usePresence(context.open, nodeRef);
    if (!mounted && !forceMount) return null;
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        id={context.contentId}
        data-state={context.open ? 'open' : 'closed'}
        data-disabled={context.disabled ? '' : undefined}
        hidden={!mounted}
        {...props}
        ref={ref}
      />
    );
  },
);

export {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Collapsible as Root,
  CollapsibleContent as Content,
  CollapsibleTrigger as Trigger,
};
