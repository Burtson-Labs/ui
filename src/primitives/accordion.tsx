import * as React from 'react';

import {
  Collapsible,
  CollapsibleContent,
  type CollapsibleContentProps,
  CollapsibleTrigger,
  type CollapsibleTriggerProps,
} from './collapsible';
import { createCollection } from './collection';
import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { type Orientation, movementFor, nextIndex } from './roving-focus';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';

/**
 * An accordion, per the ARIA accordion pattern: a stack of headings, each
 * holding a button that shows and hides its section. Every item is a
 * Collapsible, so the sections measure themselves for the height animation.
 *
 * - `type="single"`: one section open at a time; with `collapsible` the open
 *   one can be closed, without it the open section's button reports
 *   `aria-disabled` (it cannot close).
 * - `type="multiple"`: any number open.
 *
 * Every header button is in the Tab sequence. The arrow keys for the
 * orientation (Up/Down, or Left/Right mirrored in RTL) move focus to the
 * next or previous enabled button, wrapping; Home and End go to the first
 * and last. The content is a `region` labelled by its button.
 */

type ItemData = { disabled: boolean };

const { CollectionProvider, useCollection, useCollectionItem } =
  createCollection<ItemData>('Accordion');

interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string, open: boolean) => void;
  /** In single mode without `collapsible`, the open item cannot close. */
  canClose: boolean;
  disabled: boolean;
  orientation: Orientation;
  dir?: 'ltr' | 'rtl';
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function useAccordion(component: string): AccordionContextValue {
  const context = React.useContext(AccordionContext);
  if (!context) throw new Error(`${component} must be inside an Accordion`);
  return context;
}

interface AccordionSharedProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'dir'
> {
  asChild?: boolean;
  disabled?: boolean;
  orientation?: Orientation;
  dir?: 'ltr' | 'rtl';
}

export interface AccordionSingleProps extends AccordionSharedProps {
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The open section can be closed again, leaving none open. */
  collapsible?: boolean;
}

export interface AccordionMultipleProps extends AccordionSharedProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(props, ref) {
  return (
    <CollectionProvider>
      {props.type === 'multiple' ? (
        <AccordionMultiple {...props} ref={ref} />
      ) : (
        <AccordionSingle {...props} ref={ref} />
      )}
    </CollectionProvider>
  );
});

const AccordionSingle = React.forwardRef<HTMLDivElement, AccordionSingleProps>(
  function AccordionSingle(
    { type: _type, value: valueProp, defaultValue, onValueChange, collapsible = false, ...props },
    ref,
  ) {
    const [value, setValue] = useControllableState<string>({
      value: valueProp,
      defaultValue: defaultValue ?? '',
      onChange: onValueChange,
    });
    const isOpen = React.useCallback((item: string) => value === item, [value]);
    const toggle = React.useCallback(
      (item: string, open: boolean) => {
        if (open) setValue(item);
        else if (collapsible) setValue('');
      },
      [collapsible, setValue],
    );
    return (
      <AccordionRoot {...props} ref={ref} isOpen={isOpen} toggle={toggle} canClose={collapsible} />
    );
  },
);

const AccordionMultiple = React.forwardRef<HTMLDivElement, AccordionMultipleProps>(
  function AccordionMultiple(
    { type: _type, value: valueProp, defaultValue, onValueChange, ...props },
    ref,
  ) {
    const [value, setValue] = useControllableState<string[]>({
      value: valueProp,
      defaultValue: defaultValue ?? [],
      onChange: onValueChange,
    });
    const isOpen = React.useCallback((item: string) => value.includes(item), [value]);
    const toggle = React.useCallback(
      (item: string, open: boolean) =>
        setValue((current) =>
          open ? [...current.filter((v) => v !== item), item] : current.filter((v) => v !== item),
        ),
      [setValue],
    );
    return <AccordionRoot {...props} ref={ref} isOpen={isOpen} toggle={toggle} canClose />;
  },
);

interface AccordionRootProps extends AccordionSharedProps {
  isOpen: (value: string) => boolean;
  toggle: (value: string, open: boolean) => void;
  canClose: boolean;
}

const AccordionRoot = React.forwardRef<HTMLDivElement, AccordionRootProps>(function AccordionRoot(
  {
    asChild = false,
    disabled = false,
    orientation = 'vertical',
    dir,
    isOpen,
    toggle,
    canClose,
    onKeyDown,
    ...props
  },
  ref,
) {
  const { getItems } = useCollection();
  const context = React.useMemo<AccordionContextValue>(
    () => ({ isOpen, toggle, canClose, disabled, orientation, dir }),
    [isOpen, toggle, canClose, disabled, orientation, dir],
  );
  const Comp = asChild ? Slot : 'div';
  return (
    <AccordionContext.Provider value={context}>
      <Comp
        dir={dir}
        data-orientation={orientation}
        {...props}
        ref={ref}
        onKeyDown={composeHandlers(onKeyDown, (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
          const target = event.target;
          const triggers = getItems().filter((item) => !item.data.disabled);
          const current = triggers.findIndex((item) => item.node === target);
          if (current === -1) return;
          const rtl = (dir ?? getComputedStyle(event.currentTarget).direction) === 'rtl';
          const move = movementFor(event.key, orientation, rtl);
          if (!move) return;
          event.preventDefault();
          triggers[nextIndex(move, current, triggers.length, true)]?.node.focus();
        })}
      />
    </AccordionContext.Provider>
  );
});

interface ItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
  triggerId: string;
}

const ItemContext = React.createContext<ItemContextValue | null>(null);

function useItem(component: string): ItemContextValue {
  const context = React.useContext(ItemContext);
  if (!context) throw new Error(`${component} must be inside an AccordionItem`);
  return context;
}

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  value: string;
  disabled?: boolean;
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { asChild = false, value, disabled: disabledProp = false, ...props },
  ref,
) {
  const accordion = useAccordion('AccordionItem');
  const open = accordion.isOpen(value);
  const disabled = accordion.disabled || disabledProp;
  const triggerId = useStableId(undefined, 'bl-accordion-trigger');
  const item = React.useMemo(
    () => ({ value, open, disabled, triggerId }),
    [value, open, disabled, triggerId],
  );
  return (
    <ItemContext.Provider value={item}>
      <Collapsible
        asChild={asChild}
        open={open}
        disabled={disabled}
        onOpenChange={(next) => accordion.toggle(value, next)}
        data-orientation={accordion.orientation}
        {...props}
        ref={ref}
      />
    </ItemContext.Provider>
  );
});

export interface AccordionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean;
}

/** The heading around a trigger (`h3`; use `asChild` for another level). */
const AccordionHeader = React.forwardRef<HTMLHeadingElement, AccordionHeaderProps>(
  function AccordionHeader({ asChild = false, ...props }, ref) {
    const accordion = useAccordion('AccordionHeader');
    const item = useItem('AccordionHeader');
    const Comp = asChild ? Slot : 'h3';
    return (
      <Comp
        data-orientation={accordion.orientation}
        data-state={item.open ? 'open' : 'closed'}
        data-disabled={item.disabled ? '' : undefined}
        {...props}
        ref={ref}
      />
    );
  },
);

export type AccordionTriggerProps = CollapsibleTriggerProps;

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ onClick, ...props }, forwardedRef) {
    const accordion = useAccordion('AccordionTrigger');
    const item = useItem('AccordionTrigger');
    const nodeRef = React.useRef<HTMLButtonElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    const data = React.useMemo(() => ({ disabled: item.disabled }), [item.disabled]);
    useCollectionItem(nodeRef, data);
    const locked = item.open && !accordion.canClose;
    return (
      <CollapsibleTrigger
        id={item.triggerId}
        aria-disabled={locked || undefined}
        data-orientation={accordion.orientation}
        {...props}
        ref={ref}
        onClick={composeHandlers(onClick, (event: React.MouseEvent<HTMLButtonElement>) => {
          // The open section of a non-collapsible single accordion stays open.
          if (locked) event.preventDefault();
        })}
      />
    );
  },
);

export type AccordionContentProps = CollapsibleContentProps;

/**
 * The section: a `region` labelled by its button. Publishes its measured
 * size as `--bl-accordion-content-height` / `-width` (and the deprecated
 * `--radix-accordion-content-*`), which the kit's keyframes animate.
 */
const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ style, ...props }, ref) {
    const accordion = useAccordion('AccordionContent');
    const item = useItem('AccordionContent');
    return (
      <CollapsibleContent
        role="region"
        aria-labelledby={item.triggerId}
        data-orientation={accordion.orientation}
        {...props}
        ref={ref}
        style={
          {
            '--bl-accordion-content-height': 'var(--bl-collapsible-content-height)',
            '--bl-accordion-content-width': 'var(--bl-collapsible-content-width)',
            '--radix-accordion-content-height': 'var(--bl-collapsible-content-height)',
            '--radix-accordion-content-width': 'var(--bl-collapsible-content-width)',
            ...style,
          } as React.CSSProperties
        }
      />
    );
  },
);

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  AccordionContent as Content,
  AccordionHeader as Header,
  AccordionItem as Item,
  Accordion as Root,
  AccordionTrigger as Trigger,
};
