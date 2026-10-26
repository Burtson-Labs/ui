import * as React from 'react';

import { createCollection } from './collection';
import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * Roving tabindex, as the ARIA Authoring Practices describe it for tab
 * lists, toolbars, radio groups and menus: the group is one Tab stop. The
 * current item has `tabindex="0"`, the others `-1`; arrow keys move the
 * current item (and focus) between them, Home and End jump to the ends. An
 * item that becomes unfocusable hands the tab stop to the first focusable one.
 */

export type Orientation = 'horizontal' | 'vertical';

interface ItemData {
  id: string;
  focusable: boolean;
  active: boolean;
}

const { CollectionProvider, useCollection, useCollectionItem } =
  createCollection<ItemData>('RovingFocusGroup');

interface GroupContextValue {
  orientation?: Orientation;
  dir?: 'ltr' | 'rtl';
  loop: boolean;
  currentId: string | null;
  setCurrentId: (id: string) => void;
}

const GroupContext = React.createContext<GroupContextValue | null>(null);

export interface RovingFocusGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Which arrow keys move: horizontal (Left/Right), vertical (Up/Down), or both when unset. */
  orientation?: Orientation;
  /** Overrides the computed writing direction for Left/Right. */
  dir?: 'ltr' | 'rtl';
  /** Arrow keys wrap from the last item to the first and back. */
  loop?: boolean;
  currentTabStopId?: string | null;
  defaultCurrentTabStopId?: string;
  onCurrentTabStopIdChange?: (id: string | null) => void;
  /** Fired when focus enters the group from outside. */
  onEntryFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
}

const RovingFocusGroup = React.forwardRef<HTMLDivElement, RovingFocusGroupProps>(
  function RovingFocusGroup(props, ref) {
    return (
      <CollectionProvider>
        <Group {...props} ref={ref} />
      </CollectionProvider>
    );
  },
);

const Group = React.forwardRef<HTMLDivElement, RovingFocusGroupProps>(function Group(
  {
    asChild = false,
    orientation,
    dir,
    loop = false,
    currentTabStopId,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    onFocus,
    ...props
  },
  ref,
) {
  const { getItems } = useCollection();
  const [currentId, setCurrentId] = useControllableState<string | null>({
    value: currentTabStopId,
    defaultValue: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
  });
  // After every render: if the current tab stop is missing or unfocusable,
  // hand it to the active item, else the first focusable one.
  useIsoLayoutEffect(() => {
    const items = getItems().filter((item) => item.data.focusable);
    if (items.some((item) => item.data.id === currentId)) return;
    const fallback = items.find((item) => item.data.active) ?? items[0];
    if (fallback) setCurrentId(fallback.data.id);
  });
  const value = React.useMemo<GroupContextValue>(
    () => ({ orientation, dir, loop, currentId, setCurrentId }),
    [orientation, dir, loop, currentId, setCurrentId],
  );
  const Comp = asChild ? Slot : 'div';
  return (
    <GroupContext.Provider value={value}>
      <Comp
        data-orientation={orientation}
        {...props}
        ref={ref}
        onFocus={composeHandlers(onFocus, (event: React.FocusEvent<HTMLDivElement>) => {
          const from = event.relatedTarget;
          if (from instanceof Node && event.currentTarget.contains(from)) return;
          onEntryFocus?.(event);
        })}
      />
    </GroupContext.Provider>
  );
});

function useGroup(component: string): GroupContextValue {
  const context = React.useContext(GroupContext);
  if (!context) throw new Error(`${component} must be inside a RovingFocusGroup`);
  return context;
}

/**
 * Which item a key moves to. `'first'`/`'last'` for Home and End, `'next'`
 * and `'previous'` for the arrows that apply to the orientation, undefined
 * for every other key.
 */
export function movementFor(
  key: string,
  orientation: Orientation | undefined,
  rtl: boolean,
): 'first' | 'last' | 'next' | 'previous' | undefined {
  if (key === 'Home') return 'first';
  if (key === 'End') return 'last';
  const horizontal = orientation !== 'vertical';
  const vertical = orientation !== 'horizontal';
  if (horizontal && key === (rtl ? 'ArrowLeft' : 'ArrowRight')) return 'next';
  if (horizontal && key === (rtl ? 'ArrowRight' : 'ArrowLeft')) return 'previous';
  if (vertical && key === 'ArrowDown') return 'next';
  if (vertical && key === 'ArrowUp') return 'previous';
  return undefined;
}

/** The index to move to from `current`, or -1 when the move is not possible. */
export function nextIndex(
  move: 'first' | 'last' | 'next' | 'previous',
  current: number,
  count: number,
  loop: boolean,
): number {
  if (!count) return -1;
  if (move === 'first') return 0;
  if (move === 'last') return count - 1;
  const step = move === 'next' ? 1 : -1;
  const target = current + step;
  if (target >= 0 && target < count) return target;
  return loop ? (target + count) % count : -1;
}

export interface RovingFocusItemProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  /** `false` takes the item out of the arrow-key sequence (a disabled row). */
  focusable?: boolean;
  /** The item that holds the tab stop before any has been focused. */
  active?: boolean;
  tabStopId?: string;
}

const RovingFocusItem = React.forwardRef<HTMLSpanElement, RovingFocusItemProps>(
  function RovingFocusItem(
    { asChild = false, focusable = true, active = false, tabStopId, onFocus, onKeyDown, ...props },
    forwardedRef,
  ) {
    const id = useStableId(tabStopId);
    const group = useGroup('RovingFocusItem');
    const { getItems } = useCollection();
    const nodeRef = React.useRef<HTMLSpanElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    const data = React.useMemo<ItemData>(
      () => ({ id, focusable, active }),
      [id, focusable, active],
    );
    useCollectionItem(nodeRef, data);
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp
        tabIndex={focusable && group.currentId === id ? 0 : -1}
        data-orientation={group.orientation}
        {...props}
        ref={ref}
        onFocus={composeHandlers(onFocus, () => {
          if (focusable) group.setCurrentId(id);
        })}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          const node = nodeRef.current;
          if (!node) return;
          const rtl = (group.dir ?? getComputedStyle(node).direction) === 'rtl';
          const move = movementFor(event.key, group.orientation, rtl);
          if (!move) return;
          event.preventDefault();
          const items = getItems().filter((item) => item.data.focusable);
          const current = items.findIndex((item) => item.node === node);
          const target = items[nextIndex(move, current, items.length, group.loop)];
          if (target) target.node.focus();
        }}
      />
    );
  },
);

export { RovingFocusGroup, RovingFocusItem };
