import * as React from 'react';

import { type VirtualAnchor } from './anchor';
import { useComposedRefs } from './compose-refs';
import {
  type Direction,
  Menu,
  MenuAnchor,
  MenuArrow,
  type MenuArrowProps,
  MenuCheckboxItem,
  type MenuCheckboxItemProps,
  MenuContent,
  type MenuContentProps,
  MenuGroup,
  type MenuGroupProps,
  MenuItem,
  MenuItemIndicator,
  type MenuItemIndicatorProps,
  type MenuItemProps,
  MenuLabel,
  type MenuLabelProps,
  MenuPortal,
  type MenuPortalProps,
  MenuRadioGroup,
  type MenuRadioGroupProps,
  MenuRadioItem,
  type MenuRadioItemProps,
  MenuSeparator,
  type MenuSeparatorProps,
  MenuSub,
  MenuSubContent,
  type MenuSubContentProps,
  MenuSubTrigger,
  type MenuSubTriggerProps,
  useFocusOnOpen,
} from './menu';
import { Slot } from './slot';
import { useCallbackRef } from './use-callback-ref';
import { useControllableState } from './use-controllable-state';

/**
 * A menu at the pointer: opened by the `contextmenu` event (right-click,
 * the Menu key, Shift+F10) or a long press on a touch screen, anchored to a
 * zero-size box at the pointer so it opens where the hand is. Keyboard
 * opens put focus on the first row.
 */

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openAt: (point: { x: number; y: number }, fromKeyboard: boolean) => void;
  triggerRef: React.RefObject<HTMLSpanElement | null>;
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null);

function useContextMenu(component: string): ContextMenuContextValue {
  const context = React.useContext(ContextMenuContext);
  if (!context) throw new Error(`${component} must be inside a ContextMenu`);
  return context;
}

export interface ContextMenuProps {
  children?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  dir?: Direction;
  modal?: boolean;
}

/** Milliseconds a touch holds still before it counts as a long press. */
const LONG_PRESS = 700;

function ContextMenu({ children, onOpenChange, dir, modal = true }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false);
  const report = useCallbackRef((next: boolean) => onOpenChange?.(next));
  // A new anchor object per point, so the positioning engine re-measures.
  const [anchor, setAnchor] = React.useState<React.RefObject<VirtualAnchor>>(() => ({
    current: { getBoundingClientRect: () => rectAt(0, 0) },
  }));
  const triggerRef = React.useRef<HTMLSpanElement | null>(null);
  const focusOnOpen = useFocusOnOpen();
  const change = React.useCallback(
    (next: boolean) => {
      setOpen((current) => {
        if (current !== next) report(next);
        return next;
      });
    },
    [report],
  );
  const openAt = React.useCallback(
    (point: { x: number; y: number }, fromKeyboard: boolean) => {
      setAnchor({ current: { getBoundingClientRect: () => rectAt(point.x, point.y) } });
      focusOnOpen.set(fromKeyboard ? 'first' : 'none');
      change(true);
    },
    [change, focusOnOpen],
  );
  const value = React.useMemo<ContextMenuContextValue>(
    () => ({ open, setOpen: change, openAt, triggerRef }),
    [open, change, openAt],
  );
  return (
    <ContextMenuContext.Provider value={value}>
      <Menu
        open={open}
        onOpenChange={change}
        dir={dir}
        modal={modal}
        triggerRef={triggerRef}
        focusOnOpen={focusOnOpen}
        legacyPrefix="context-menu"
      >
        <MenuAnchor virtualRef={anchor} />
        {children}
      </Menu>
    </ContextMenuContext.Provider>
  );
}

function rectAt(x: number, y: number) {
  return { x, y, width: 0, height: 0 };
}

export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  disabled?: boolean;
}

const ContextMenuTrigger = React.forwardRef<HTMLSpanElement, ContextMenuTriggerProps>(
  function ContextMenuTrigger(
    {
      asChild = false,
      disabled = false,
      onContextMenu,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      ...props
    },
    forwardedRef,
  ) {
    const context = useContextMenu('ContextMenuTrigger');
    const nodeRef = React.useRef<HTMLSpanElement | null>(null);
    const ref = useComposedRefs(forwardedRef, context.triggerRef, nodeRef);
    const pressTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const cancelPress = () => {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = undefined;
    };
    React.useEffect(() => cancelPress, []);
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp
        data-state={context.open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        {...props}
        ref={ref}
        // The touch-action rule keeps a long press from starting a scroll.
        style={{ WebkitTouchCallout: 'none', ...props.style }}
        onContextMenu={(event: React.MouseEvent<HTMLSpanElement>) => {
          onContextMenu?.(event);
          if (event.defaultPrevented || disabled) return;
          cancelPress();
          event.preventDefault();
          // The keyboard (Menu key, Shift+F10) reports no useful position;
          // open at the element instead.
          const node = nodeRef.current;
          const rect = node?.getBoundingClientRect();
          const fromKeyboard =
            event.clientX === 0 &&
            event.clientY === 0 &&
            !!rect &&
            !(rect.left <= 0 && rect.right >= 0 && rect.top <= 0 && rect.bottom >= 0);
          const point = fromKeyboard
            ? { x: rect.left, y: rect.bottom }
            : { x: event.clientX, y: event.clientY };
          context.openAt(point, fromKeyboard);
        }}
        onPointerDown={(event: React.PointerEvent<HTMLSpanElement>) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || disabled || event.pointerType === 'mouse') return;
          cancelPress();
          const point = { x: event.clientX, y: event.clientY };
          pressTimerRef.current = setTimeout(() => {
            pressTimerRef.current = undefined;
            context.openAt(point, false);
          }, LONG_PRESS);
        }}
        onPointerMove={(event: React.PointerEvent<HTMLSpanElement>) => {
          onPointerMove?.(event);
          if (event.pointerType !== 'mouse') cancelPress();
        }}
        onPointerUp={(event: React.PointerEvent<HTMLSpanElement>) => {
          onPointerUp?.(event);
          if (event.pointerType !== 'mouse') cancelPress();
        }}
        onPointerCancel={(event: React.PointerEvent<HTMLSpanElement>) => {
          onPointerCancel?.(event);
          if (event.pointerType !== 'mouse') cancelPress();
        }}
      />
    );
  },
);

export type ContextMenuPortalProps = MenuPortalProps;
const ContextMenuPortal = MenuPortal;

export type ContextMenuContentProps = Omit<
  MenuContentProps,
  'onEntryFocus' | 'side' | 'sideOffset' | 'align'
>;

/** The surface opens below and to the end of the pointer, flipping when there is no room. */
const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  function ContextMenuContent({ alignOffset = 2, ...props }, ref) {
    return (
      <MenuContent
        side="bottom"
        sideOffset={2}
        align="start"
        alignOffset={alignOffset}
        {...props}
        ref={ref}
      />
    );
  },
);

export type ContextMenuGroupProps = MenuGroupProps;
const ContextMenuGroup = MenuGroup;
export type ContextMenuLabelProps = MenuLabelProps;
const ContextMenuLabel = MenuLabel;
export type ContextMenuItemProps = MenuItemProps;
const ContextMenuItem = MenuItem;
export type ContextMenuCheckboxItemProps = MenuCheckboxItemProps;
const ContextMenuCheckboxItem = MenuCheckboxItem;
export type ContextMenuRadioGroupProps = MenuRadioGroupProps;
const ContextMenuRadioGroup = MenuRadioGroup;
export type ContextMenuRadioItemProps = MenuRadioItemProps;
const ContextMenuRadioItem = MenuRadioItem;
export type ContextMenuItemIndicatorProps = MenuItemIndicatorProps;
const ContextMenuItemIndicator = MenuItemIndicator;
export type ContextMenuSeparatorProps = MenuSeparatorProps;
const ContextMenuSeparator = MenuSeparator;
export type ContextMenuArrowProps = MenuArrowProps;
const ContextMenuArrow = MenuArrow;

export interface ContextMenuSubProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ContextMenuSub({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: ContextMenuSubProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  return (
    <MenuSub open={open} onOpenChange={setOpen}>
      {children}
    </MenuSub>
  );
}

export type ContextMenuSubTriggerProps = MenuSubTriggerProps;
const ContextMenuSubTrigger = MenuSubTrigger;
export type ContextMenuSubContentProps = MenuSubContentProps;
const ContextMenuSubContent = MenuSubContent;

export {
  ContextMenu,
  ContextMenuArrow,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuItemIndicator,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenu as Root,
  ContextMenuArrow as Arrow,
  ContextMenuCheckboxItem as CheckboxItem,
  ContextMenuContent as Content,
  ContextMenuGroup as Group,
  ContextMenuItem as Item,
  ContextMenuItemIndicator as ItemIndicator,
  ContextMenuLabel as Label,
  ContextMenuPortal as Portal,
  ContextMenuRadioGroup as RadioGroup,
  ContextMenuRadioItem as RadioItem,
  ContextMenuSeparator as Separator,
  ContextMenuSub as Sub,
  ContextMenuSubContent as SubContent,
  ContextMenuSubTrigger as SubTrigger,
  ContextMenuTrigger as Trigger,
};
