import * as React from 'react';

import { useAnchorContext } from './anchor';
import { createCollection } from './collection';
import { useComposedRefs } from './compose-refs';
import {
  type Direction,
  type FocusOnOpen,
  type FocusOnOpenHandle,
  Menu,
  MenuArrow,
  type MenuArrowProps,
  MenuCheckboxItem,
  type MenuCheckboxItemProps,
  MenuContent,
  type MenuContentProps,
  MenuCrossNavigationContext,
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
import { RovingFocusGroup, RovingFocusItem } from './roving-focus';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';

/**
 * A menubar, per the ARIA menubar pattern: a row of `menuitem` buttons that
 * is one Tab stop. Left and Right move between them (wrapping with `loop`),
 * Down, Enter and Space open a menu with its first row focused, Up opens it
 * with the last. While a menu is open, Left and Right at the edges of the
 * menu move to the neighbouring menu, and resting the pointer on another
 * button opens that one instead. Menus are non-modal.
 */

interface MenuRecord {
  value: string;
  disabled: boolean;
}

const { CollectionProvider, useCollection, useCollectionItem } =
  createCollection<MenuRecord>('Menubar');

interface MenubarContextValue {
  value: string;
  setValue: (value: string) => void;
  dir: Direction | undefined;
  loop: boolean;
  /** Set before opening to say where focus goes in the menu that opens. */
  focusOnOpen: FocusOnOpenHandle;
}

const MenubarContext = React.createContext<MenubarContextValue | null>(null);

function useMenubar(component: string): MenubarContextValue {
  const context = React.useContext(MenubarContext);
  if (!context) throw new Error(`${component} must be inside a Menubar`);
  return context;
}

export interface MenubarProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** The open menu's value; `''` when none is open. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  loop?: boolean;
  dir?: Direction;
}

const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(function Menubar(props, ref) {
  return (
    <CollectionProvider>
      <MenubarImpl {...props} ref={ref} />
    </CollectionProvider>
  );
});

const MenubarImpl = React.forwardRef<HTMLDivElement, MenubarProps>(function MenubarImpl(
  { asChild = false, value: valueProp, defaultValue, onValueChange, loop = true, dir, ...props },
  ref,
) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const focusOnOpen = useFocusOnOpen();
  const context = React.useMemo<MenubarContextValue>(
    () => ({ value, setValue, dir, loop, focusOnOpen }),
    [value, setValue, dir, loop, focusOnOpen],
  );
  const Comp = asChild ? Slot : 'div';
  return (
    <MenubarContext.Provider value={context}>
      <RovingFocusGroup asChild orientation="horizontal" loop={loop} dir={dir}>
        <Comp role="menubar" dir={dir} {...props} ref={ref} />
      </RovingFocusGroup>
    </MenubarContext.Provider>
  );
});

interface MenubarMenuContextValue {
  value: string;
  triggerId: string;
  contentId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
}

const MenubarMenuContext = React.createContext<MenubarMenuContextValue | null>(null);

function useMenubarMenu(component: string): MenubarMenuContextValue {
  const context = React.useContext(MenubarMenuContext);
  if (!context) throw new Error(`${component} must be inside a MenubarMenu`);
  return context;
}

export interface MenubarMenuProps {
  value?: string;
  children?: React.ReactNode;
}

function MenubarMenu({ value: valueProp, children }: MenubarMenuProps) {
  const menubar = useMenubar('MenubarMenu');
  const generated = useStableId(undefined, 'bl-menubar-menu');
  const value = valueProp ?? generated;
  const triggerId = useStableId(undefined, 'bl-menubar-trigger');
  const contentId = useStableId(undefined, 'bl-menubar-content');
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const open = menubar.value === value;
  const { getItems } = useCollection();
  const { setValue, focusOnOpen } = menubar;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next) setValue(value);
      else if (open) setValue('');
    },
    [setValue, value, open],
  );
  const cross = React.useMemo(
    () => ({
      next: () => moveTo(getItems(), value, 1, menubar.loop, setValue, focusOnOpen),
      previous: () => moveTo(getItems(), value, -1, menubar.loop, setValue, focusOnOpen),
    }),
    [getItems, value, menubar.loop, setValue, focusOnOpen],
  );
  const context = React.useMemo<MenubarMenuContextValue>(
    () => ({ value, triggerId, contentId, triggerRef, open }),
    [value, triggerId, contentId, open],
  );
  return (
    <MenubarMenuContext.Provider value={context}>
      <MenuCrossNavigationContext.Provider value={cross}>
        <Menu
          open={open}
          onOpenChange={setOpen}
          dir={menubar.dir}
          modal={false}
          triggerRef={triggerRef}
          triggerId={triggerId}
          focusOnOpen={focusOnOpen}
          legacyPrefix="menubar"
        >
          {children}
        </Menu>
      </MenuCrossNavigationContext.Provider>
    </MenubarMenuContext.Provider>
  );
}

/** Opens the menu `step` places from `current` among the enabled ones, with its first row focused. */
function moveTo(
  items: { data: MenuRecord }[],
  current: string,
  step: 1 | -1,
  loop: boolean,
  setValue: (value: string) => void,
  focusOnOpen: FocusOnOpenHandle,
) {
  const enabled = items.filter((item) => !item.data.disabled).map((item) => item.data.value);
  const index = enabled.indexOf(current);
  if (index === -1 || enabled.length < 2) return;
  let next = index + step;
  if (next < 0 || next >= enabled.length) {
    if (!loop) return;
    next = (next + enabled.length) % enabled.length;
  }
  focusOnOpen.set('first');
  setValue(enabled[next]!);
}

export interface MenubarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const MenubarTrigger = React.forwardRef<HTMLButtonElement, MenubarTriggerProps>(
  function MenubarTrigger(
    {
      asChild = false,
      disabled = false,
      onPointerDown,
      onPointerEnter,
      onKeyDown,
      onClick,
      onFocus,
      onBlur,
      ...props
    },
    forwardedRef,
  ) {
    const menubar = useMenubar('MenubarTrigger');
    const menu = useMenubarMenu('MenubarTrigger');
    const { setImplicitAnchor } = useAnchorContext('MenubarTrigger');
    const nodeRef = React.useRef<HTMLButtonElement | null>(null);
    const ref = useComposedRefs(forwardedRef, menu.triggerRef, nodeRef, setImplicitAnchor);
    const [focused, setFocused] = React.useState(false);
    const record = React.useMemo<MenuRecord>(
      () => ({ value: menu.value, disabled }),
      [menu.value, disabled],
    );
    useCollectionItem(nodeRef, record);
    const toggledByPressRef = React.useRef(false);
    const open = (focus: FocusOnOpen) => {
      menubar.focusOnOpen.set(focus);
      menubar.setValue(menu.value);
    };
    const Comp = asChild ? Slot : 'button';
    return (
      <RovingFocusItem asChild focusable={!disabled} tabStopId={menu.value}>
        <Comp
          type={asChild ? undefined : 'button'}
          role="menuitem"
          id={menu.triggerId}
          aria-haspopup="menu"
          aria-expanded={menu.open}
          aria-controls={menu.open ? menu.contentId : undefined}
          data-state={menu.open ? 'open' : 'closed'}
          data-highlighted={focused ? '' : undefined}
          data-disabled={disabled ? '' : undefined}
          disabled={disabled}
          {...props}
          ref={ref}
          onFocus={(event: React.FocusEvent<HTMLButtonElement>) => {
            onFocus?.(event);
            setFocused(true);
          }}
          onBlur={(event: React.FocusEvent<HTMLButtonElement>) => {
            onBlur?.(event);
            setFocused(false);
          }}
          onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
            onPointerDown?.(event);
            if (event.defaultPrevented || disabled || event.button !== 0 || event.ctrlKey) return;
            toggledByPressRef.current = true;
            if (menu.open) menubar.setValue('');
            else open('none');
          }}
          onPointerEnter={(event: React.PointerEvent<HTMLButtonElement>) => {
            onPointerEnter?.(event);
            // An open menu follows the pointer across the bar.
            if (event.defaultPrevented || disabled || menu.open || !menubar.value) return;
            open('none');
          }}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(event);
            const byPress = toggledByPressRef.current;
            toggledByPressRef.current = false;
            if (event.defaultPrevented || disabled || byPress) return;
            if (menu.open) menubar.setValue('');
            else open('first');
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || disabled) return;
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
              event.preventDefault();
              open('first');
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              open('last');
            }
          }}
        />
      </RovingFocusItem>
    );
  },
);

export type MenubarPortalProps = MenuPortalProps;
const MenubarPortal = MenuPortal;

export type MenubarContentProps = Omit<MenuContentProps, 'onEntryFocus'>;

const MenubarContent = React.forwardRef<HTMLDivElement, MenubarContentProps>(
  function MenubarContent({ align = 'start', ...props }, ref) {
    return <MenuContent align={align} {...props} ref={ref} />;
  },
);

export type MenubarGroupProps = MenuGroupProps;
const MenubarGroup = MenuGroup;
export type MenubarLabelProps = MenuLabelProps;
const MenubarLabel = MenuLabel;
export type MenubarItemProps = MenuItemProps;
const MenubarItem = MenuItem;
export type MenubarCheckboxItemProps = MenuCheckboxItemProps;
const MenubarCheckboxItem = MenuCheckboxItem;
export type MenubarRadioGroupProps = MenuRadioGroupProps;
const MenubarRadioGroup = MenuRadioGroup;
export type MenubarRadioItemProps = MenuRadioItemProps;
const MenubarRadioItem = MenuRadioItem;
export type MenubarItemIndicatorProps = MenuItemIndicatorProps;
const MenubarItemIndicator = MenuItemIndicator;
export type MenubarSeparatorProps = MenuSeparatorProps;
const MenubarSeparator = MenuSeparator;
export type MenubarArrowProps = MenuArrowProps;
const MenubarArrow = MenuArrow;

export interface MenubarSubProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function MenubarSub({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
}: MenubarSubProps) {
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

export type MenubarSubTriggerProps = MenuSubTriggerProps;
const MenubarSubTrigger = MenuSubTrigger;
export type MenubarSubContentProps = MenuSubContentProps;
const MenubarSubContent = MenuSubContent;

export {
  Menubar,
  MenubarArrow,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarItemIndicator,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  Menubar as Root,
  MenubarArrow as Arrow,
  MenubarCheckboxItem as CheckboxItem,
  MenubarContent as Content,
  MenubarGroup as Group,
  MenubarItem as Item,
  MenubarItemIndicator as ItemIndicator,
  MenubarLabel as Label,
  MenubarMenu as Menu,
  MenubarPortal as Portal,
  MenubarRadioGroup as RadioGroup,
  MenubarRadioItem as RadioItem,
  MenubarSeparator as Separator,
  MenubarSub as Sub,
  MenubarSubContent as SubContent,
  MenubarSubTrigger as SubTrigger,
  MenubarTrigger as Trigger,
};
