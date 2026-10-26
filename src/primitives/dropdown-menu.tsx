import * as React from 'react';

import { useAnchorContext } from './anchor';
import { useComposedRefs } from './compose-refs';
import {
  type Direction,
  type FocusOnOpenHandle,
  Menu,
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
  useMenuContentId,
  useMenuLevel,
} from './menu';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';

/**
 * A menu opened from a button, per the ARIA menu button pattern: the
 * button has `aria-haspopup="menu"` and `aria-expanded`; Enter, Space and
 * Down open the menu with its first row focused; a press opens it with
 * focus on the surface; modal by default.
 */

interface DropdownMenuContextValue {
  triggerId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  focusOnOpen: FocusOnOpenHandle;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu(component: string): DropdownMenuContextValue {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error(`${component} must be inside a DropdownMenu`);
  return context;
}

export interface DropdownMenuProps {
  children?: React.ReactNode;
  dir?: Direction;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

function DropdownMenu({
  children,
  dir,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal = true,
}: DropdownMenuProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const triggerId = useStableId(undefined, 'bl-dropdown-trigger');
  const contentId = useStableId(undefined, 'bl-dropdown-menu');
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const focusOnOpen = useFocusOnOpen();
  const value = React.useMemo<DropdownMenuContextValue>(
    () => ({ triggerId, triggerRef, contentId, open, setOpen, focusOnOpen }),
    [triggerId, contentId, open, setOpen, focusOnOpen],
  );
  return (
    <DropdownMenuContext.Provider value={value}>
      <Menu
        open={open}
        onOpenChange={setOpen}
        dir={dir}
        modal={modal}
        triggerRef={triggerRef}
        triggerId={triggerId}
        contentId={contentId}
        focusOnOpen={focusOnOpen}
        legacyPrefix="dropdown-menu"
      >
        {children}
      </Menu>
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  function DropdownMenuTrigger(
    { asChild = false, disabled = false, onPointerDown, onKeyDown, onClick, ...props },
    forwardedRef,
  ) {
    const context = useDropdownMenu('DropdownMenuTrigger');
    const contentId = useMenuContentId(useMenuLevel('DropdownMenuTrigger'));
    const { setImplicitAnchor } = useAnchorContext('DropdownMenuTrigger');
    const ref = useComposedRefs(forwardedRef, context.triggerRef, setImplicitAnchor);
    // A press toggles on pointerdown so the menu is up before the button's
    // click; that click must not toggle it back.
    const toggledByPressRef = React.useRef(false);
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        type={asChild ? undefined : 'button'}
        id={context.triggerId}
        aria-haspopup="menu"
        aria-expanded={context.open}
        aria-controls={context.open ? contentId : undefined}
        data-state={context.open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        {...props}
        ref={ref}
        onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || disabled || event.button !== 0 || event.ctrlKey) return;
          toggledByPressRef.current = true;
          context.focusOnOpen.set('none');
          context.setOpen(!context.open);
        }}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          const byPress = toggledByPressRef.current;
          toggledByPressRef.current = false;
          if (event.defaultPrevented || disabled || byPress) return;
          // A click with no press first: the keyboard or assistive technology.
          context.focusOnOpen.set('first');
          context.setOpen(!context.open);
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled) return;
          if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') return;
          // Prevent the click a button synthesises for Enter and Space, and
          // the page scroll for Space and Down.
          event.preventDefault();
          context.focusOnOpen.set('first');
          context.setOpen(true);
        }}
      />
    );
  },
);

export type DropdownMenuPortalProps = MenuPortalProps;
const DropdownMenuPortal = MenuPortal;

export type DropdownMenuContentProps = Omit<MenuContentProps, 'onEntryFocus'>;

/** The menu surface; the core exempts a press on the trigger from outside dismissal. */
const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  function DropdownMenuContent(props, ref) {
    return <MenuContent {...props} ref={ref} />;
  },
);

export type DropdownMenuGroupProps = MenuGroupProps;
const DropdownMenuGroup = MenuGroup;
export type DropdownMenuLabelProps = MenuLabelProps;
const DropdownMenuLabel = MenuLabel;
export type DropdownMenuItemProps = MenuItemProps;
const DropdownMenuItem = MenuItem;
export type DropdownMenuCheckboxItemProps = MenuCheckboxItemProps;
const DropdownMenuCheckboxItem = MenuCheckboxItem;
export type DropdownMenuRadioGroupProps = MenuRadioGroupProps;
const DropdownMenuRadioGroup = MenuRadioGroup;
export type DropdownMenuRadioItemProps = MenuRadioItemProps;
const DropdownMenuRadioItem = MenuRadioItem;
export type DropdownMenuItemIndicatorProps = MenuItemIndicatorProps;
const DropdownMenuItemIndicator = MenuItemIndicator;
export type DropdownMenuSeparatorProps = MenuSeparatorProps;
const DropdownMenuSeparator = MenuSeparator;
export type DropdownMenuArrowProps = MenuArrowProps;
const DropdownMenuArrow = MenuArrow;

export interface DropdownMenuSubProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function DropdownMenuSub({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: DropdownMenuSubProps) {
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

export type DropdownMenuSubTriggerProps = MenuSubTriggerProps;
const DropdownMenuSubTrigger = MenuSubTrigger;
export type DropdownMenuSubContentProps = MenuSubContentProps;
const DropdownMenuSubContent = MenuSubContent;

export {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenu as Root,
  DropdownMenuArrow as Arrow,
  DropdownMenuCheckboxItem as CheckboxItem,
  DropdownMenuContent as Content,
  DropdownMenuGroup as Group,
  DropdownMenuItem as Item,
  DropdownMenuItemIndicator as ItemIndicator,
  DropdownMenuLabel as Label,
  DropdownMenuPortal as Portal,
  DropdownMenuRadioGroup as RadioGroup,
  DropdownMenuRadioItem as RadioItem,
  DropdownMenuSeparator as Separator,
  DropdownMenuSub as Sub,
  DropdownMenuSubContent as SubContent,
  DropdownMenuSubTrigger as SubTrigger,
  DropdownMenuTrigger as Trigger,
};
