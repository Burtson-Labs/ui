import * as React from 'react';
import { createPortal } from 'react-dom';

import { useComposedRefs } from './compose-refs';
import { Layer, type LayerProps } from './layer';
import { usePresence } from './presence';
import { Slot } from './slot';
import { getTabbables } from './tabbable';
import { useCallbackRef } from './use-callback-ref';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * Site navigation with panels, per the ARIA disclosure navigation pattern:
 * a `<nav>` of links and buttons; each button (`aria-expanded`,
 * `aria-controls`) shows a panel of links. One panel is open at a time.
 * The pointer opens a panel after `delayDuration` and switches between
 * panels at once; leaving both the button and the panel closes it after a
 * moment. Enter and Space toggle; Down (Right in a vertical bar) moves into
 * an open panel; Left and Right (Up and Down) move along the bar; Escape
 * closes and returns to the button; Tab leaves the panel in document
 * order.
 *
 * With a `NavigationMenuViewport`, every panel renders inside that one
 * surface, which takes the open panel's size (`--bl-navigation-menu-viewport-width`
 * and `-height`; the `--radix-navigation-menu-viewport-*` aliases are kept)
 * and tells each panel which way it is coming from or going
 * (`data-motion="from-start" | "from-end" | "to-start" | "to-end"`).
 */

export type Orientation = 'horizontal' | 'vertical';
export type Direction = 'ltr' | 'rtl';

export const LINK_SELECT = 'bl-navigation-menu-link-select';

interface MenuContextValue {
  isRoot: boolean;
  value: string;
  previousValue: string;
  baseId: string;
  dir: Direction | undefined;
  orientation: Orientation;
  rootRef: React.RefObject<HTMLElement | null>;
  /** The viewport, when the menu has one. Panels render into it. */
  viewport: HTMLElement | null;
  setViewport: (node: HTMLElement | null) => void;
  indicatorTrack: HTMLElement | null;
  setIndicatorTrack: (node: HTMLElement | null) => void;
  /** The open panel's element, for the viewport to size itself to. */
  activeContent: HTMLElement | null;
  setActiveContent: (node: HTMLElement | null) => void;
  /** Items in order, for the direction a panel moves in. */
  itemValues: () => string[];
  registerItem: (value: string, node: HTMLElement, trigger: () => HTMLElement | null) => () => void;
  triggerFor: (value: string) => HTMLElement | null;
  onTriggerEnter: (value: string) => void;
  onTriggerLeave: () => void;
  onContentEnter: () => void;
  onContentLeave: () => void;
  onItemSelect: (value: string) => void;
  onItemDismiss: () => void;
}

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenu(component: string): MenuContextValue {
  const context = React.useContext(MenuContext);
  if (!context) throw new Error(`${component} must be inside a NavigationMenu`);
  return context;
}

interface ProviderProps {
  isRoot: boolean;
  value: string;
  onValueChange: (value: string) => void;
  dir: Direction | undefined;
  orientation: Orientation;
  rootRef: React.RefObject<HTMLElement | null>;
  delayDuration: number;
  skipDelayDuration: number;
  children: React.ReactNode;
}

/** Milliseconds the pointer may be away from a panel and its button before the panel closes. */
const CLOSE_DELAY = 150;

function MenuProvider({
  isRoot,
  value,
  onValueChange,
  dir,
  orientation,
  rootRef,
  delayDuration,
  skipDelayDuration,
  children,
}: ProviderProps) {
  const baseId = useStableId(undefined, 'bl-nav');
  const [viewport, setViewport] = React.useState<HTMLElement | null>(null);
  const [indicatorTrack, setIndicatorTrack] = React.useState<HTMLElement | null>(null);
  const [activeContent, setActiveContent] = React.useState<HTMLElement | null>(null);
  const itemsRef = React.useRef(
    new Map<string, { node: HTMLElement; trigger: () => HTMLElement | null }>(),
  );
  // The value before this one, derived during render, for the panels' motion.
  const [history, setHistory] = React.useState({ previous: '', current: value });
  if (history.current !== value) setHistory({ previous: history.current, current: value });
  const previousValue = history.current === value ? history.previous : history.current;
  const setValue = useCallbackRef(onValueChange);
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const skipUntilRef = React.useRef(0);
  const clearTimers = useCallbackRef(() => {
    clearTimeout(openTimerRef.current);
    clearTimeout(closeTimerRef.current);
    openTimerRef.current = undefined;
    closeTimerRef.current = undefined;
  });
  React.useEffect(() => clearTimers, [clearTimers]);
  const closeAfterDelay = useCallbackRef(() => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = undefined;
      skipUntilRef.current = Date.now() + skipDelayDuration;
      setValue('');
    }, CLOSE_DELAY);
  });
  const onTriggerEnter = useCallbackRef((next: string) => {
    clearTimers();
    // Another panel is open, or one closed a moment ago: switch at once.
    if (value || Date.now() < skipUntilRef.current) {
      setValue(next);
      return;
    }
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = undefined;
      setValue(next);
    }, delayDuration);
  });
  const onTriggerLeave = useCallbackRef(() => {
    clearTimeout(openTimerRef.current);
    openTimerRef.current = undefined;
    closeAfterDelay();
  });
  const onContentEnter = useCallbackRef(() => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = undefined;
  });
  const onItemSelect = useCallbackRef((next: string) => {
    clearTimers();
    setValue(value === next ? '' : next);
  });
  const onItemDismiss = useCallbackRef(() => {
    clearTimers();
    setValue('');
  });
  const itemValues = useCallbackRef(() =>
    [...itemsRef.current.entries()]
      .sort(([, a], [, b]) =>
        a.node === b.node
          ? 0
          : a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
      )
      .map(([itemValue]) => itemValue),
  );
  const registerItem = useCallbackRef(
    (itemValue: string, node: HTMLElement, trigger: () => HTMLElement | null) => {
      itemsRef.current.set(itemValue, { node, trigger });
      return () => {
        itemsRef.current.delete(itemValue);
      };
    },
  );
  const triggerFor = useCallbackRef(
    (itemValue: string) => itemsRef.current.get(itemValue)?.trigger() ?? null,
  );

  const context = React.useMemo<MenuContextValue>(
    () => ({
      isRoot,
      value,
      previousValue,
      baseId,
      dir,
      orientation,
      rootRef,
      viewport,
      setViewport,
      indicatorTrack,
      setIndicatorTrack,
      activeContent,
      setActiveContent,
      itemValues,
      registerItem,
      triggerFor,
      onTriggerEnter,
      onTriggerLeave,
      onContentEnter,
      onContentLeave: closeAfterDelay,
      onItemSelect,
      onItemDismiss,
    }),
    [
      isRoot,
      value,
      previousValue,
      baseId,
      dir,
      orientation,
      rootRef,
      viewport,
      indicatorTrack,
      activeContent,
      itemValues,
      registerItem,
      triggerFor,
      onTriggerEnter,
      onTriggerLeave,
      onContentEnter,
      closeAfterDelay,
      onItemSelect,
      onItemDismiss,
    ],
  );
  return <MenuContext.Provider value={context}>{children}</MenuContext.Provider>;
}

export interface NavigationMenuProps extends Omit<React.HTMLAttributes<HTMLElement>, 'dir'> {
  asChild?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  dir?: Direction;
  orientation?: Orientation;
  /** Milliseconds the pointer rests on a button before its panel opens. */
  delayDuration?: number;
  /** Milliseconds after a panel closes during which the next opens at once. */
  skipDelayDuration?: number;
}

const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu(
  {
    asChild = false,
    value: valueProp,
    defaultValue,
    onValueChange,
    dir,
    orientation = 'horizontal',
    delayDuration = 200,
    skipDelayDuration = 300,
    ...props
  },
  forwardedRef,
) {
  const rootRef = React.useRef<HTMLElement | null>(null);
  const ref = useComposedRefs(forwardedRef, rootRef);
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const Comp = asChild ? Slot : 'nav';
  return (
    <MenuProvider
      isRoot
      value={value}
      onValueChange={setValue}
      dir={dir}
      orientation={orientation}
      rootRef={rootRef}
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      <Comp aria-label="Main" data-orientation={orientation} dir={dir} {...props} ref={ref} />
    </MenuProvider>
  );
});

export interface NavigationMenuSubProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'> {
  asChild?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
}

/** A menu nested in a panel, with its own open value. */
const NavigationMenuSub = React.forwardRef<HTMLDivElement, NavigationMenuSubProps>(
  function NavigationMenuSub(
    {
      asChild = false,
      value: valueProp,
      defaultValue,
      onValueChange,
      orientation = 'horizontal',
      ...props
    },
    forwardedRef,
  ) {
    const parent = useMenu('NavigationMenuSub');
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const ref = useComposedRefs(forwardedRef, rootRef);
    const [value, setValue] = useControllableState({
      value: valueProp,
      defaultValue: defaultValue ?? '',
      onChange: onValueChange,
    });
    const Comp = asChild ? Slot : 'div';
    return (
      <MenuProvider
        isRoot={false}
        value={value}
        onValueChange={setValue}
        dir={parent.dir}
        orientation={orientation}
        rootRef={rootRef}
        delayDuration={200}
        skipDelayDuration={300}
      >
        <Comp data-orientation={orientation} {...props} ref={ref} />
      </MenuProvider>
    );
  },
);

export interface NavigationMenuListProps extends React.HTMLAttributes<HTMLUListElement> {
  asChild?: boolean;
}

/** The bar. Arrow keys along its axis move between its buttons and links. */
const NavigationMenuList = React.forwardRef<HTMLUListElement, NavigationMenuListProps>(
  function NavigationMenuList({ asChild = false, onKeyDown, ...props }, forwardedRef) {
    const menu = useMenu('NavigationMenuList');
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const trackRef = React.useRef<HTMLDivElement | null>(null);
    const ref = useComposedRefs(forwardedRef, listRef);
    const { setIndicatorTrack } = menu;
    useIsoLayoutEffect(() => {
      setIndicatorTrack(trackRef.current);
      return () => setIndicatorTrack(null);
    }, [setIndicatorTrack]);
    const Comp = asChild ? Slot : 'ul';
    return (
      <div style={{ position: 'relative' }} ref={trackRef}>
        <Comp
          data-orientation={menu.orientation}
          {...props}
          ref={ref}
          onKeyDown={(event: React.KeyboardEvent<HTMLUListElement>) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            const list = listRef.current;
            if (!list || !(event.target instanceof HTMLElement)) return;
            // Keys from inside a panel rendered in place are the panel's.
            if (event.target.closest('[data-bl-nav-content]')) return;
            const rtl = (menu.dir ?? getComputedStyle(list).direction) === 'rtl';
            const horizontal = menu.orientation === 'horizontal';
            const nextKey = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';
            const previousKey = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
            let move: number | 'first' | 'last' | undefined;
            if (event.key === nextKey) move = 1;
            else if (event.key === previousKey) move = -1;
            else if (event.key === 'Home') move = 'first';
            else if (event.key === 'End') move = 'last';
            if (move === undefined) return;
            // The bar's own controls: a button or link in each item, not the panels'.
            const controls = getTabbables(list).filter(
              (element) =>
                !element.closest('[data-bl-nav-content]') &&
                !element.hasAttribute('data-bl-nav-proxy'),
            );
            if (!controls.length) return;
            event.preventDefault();
            const current = controls.indexOf(event.target);
            let index =
              move === 'first'
                ? 0
                : move === 'last'
                  ? controls.length - 1
                  : Math.min(Math.max(current + move, 0), controls.length - 1);
            if (current === -1) index = move === -1 || move === 'last' ? controls.length - 1 : 0;
            controls[index]?.focus();
          }}
        />
      </div>
    );
  },
);

interface ItemContextValue {
  value: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  triggerId: string;
  contentId: string;
  /** Escape closed the panel: the pointer must leave the button before it reopens. */
  setEscapeClosed: (closed: boolean) => void;
  wasEscapeClosed: () => boolean;
  focusContent: () => void;
}

const ItemContext = React.createContext<ItemContextValue | null>(null);

function useItem(component: string): ItemContextValue {
  const context = React.useContext(ItemContext);
  if (!context) throw new Error(`${component} must be inside a NavigationMenuItem`);
  return context;
}

export interface NavigationMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  asChild?: boolean;
  value?: string;
}

const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  function NavigationMenuItem({ asChild = false, value: valueProp, ...props }, forwardedRef) {
    const menu = useMenu('NavigationMenuItem');
    const generated = useStableId(undefined, 'bl-nav-item');
    const value = valueProp ?? generated;
    const nodeRef = React.useRef<HTMLLIElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement | null>(null);
    const triggerId = `${menu.baseId}-trigger-${value}`;
    const contentId = `${menu.baseId}-content-${value}`;
    const escapeClosedRef = React.useRef(false);
    const setEscapeClosed = useCallbackRef((closed: boolean) => {
      escapeClosedRef.current = closed;
    });
    const wasEscapeClosed = useCallbackRef(() => escapeClosedRef.current);
    const focusContent = useCallbackRef(() => {
      const content = contentRef.current;
      const first = content ? getTabbables(content)[0] : undefined;
      (first ?? content)?.focus();
    });
    const { registerItem } = menu;
    useIsoLayoutEffect(() => {
      const node = nodeRef.current;
      if (!node) return;
      return registerItem(value, node, () => triggerRef.current);
    }, [registerItem, value]);
    const item = React.useMemo<ItemContextValue>(
      () => ({
        value,
        triggerRef,
        contentRef,
        triggerId,
        contentId,
        setEscapeClosed,
        wasEscapeClosed,
        focusContent,
      }),
      [value, triggerId, contentId, setEscapeClosed, wasEscapeClosed, focusContent],
    );
    const Comp = asChild ? Slot : 'li';
    return (
      <ItemContext.Provider value={item}>
        <Comp {...props} ref={ref} />
      </ItemContext.Provider>
    );
  },
);

export interface NavigationMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const proxyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, NavigationMenuTriggerProps>(
  function NavigationMenuTrigger(
    {
      asChild = false,
      disabled = false,
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
      onClick,
      onKeyDown,
      ...props
    },
    forwardedRef,
  ) {
    const menu = useMenu('NavigationMenuTrigger');
    const item = useItem('NavigationMenuTrigger');
    const ref = useComposedRefs(forwardedRef, item.triggerRef);
    const open = menu.value === item.value;
    const hoveringRef = React.useRef(false);
    const Comp = asChild ? Slot : 'button';
    return (
      <>
        <Comp
          type={asChild ? undefined : 'button'}
          id={item.triggerId}
          aria-expanded={open}
          aria-controls={item.contentId}
          data-state={open ? 'open' : 'closed'}
          data-disabled={disabled ? '' : undefined}
          disabled={disabled}
          {...props}
          ref={ref}
          onPointerEnter={(event: React.PointerEvent<HTMLButtonElement>) => {
            onPointerEnter?.(event);
            hoveringRef.current = false;
          }}
          onPointerMove={(event: React.PointerEvent<HTMLButtonElement>) => {
            onPointerMove?.(event);
            if (event.defaultPrevented || disabled || event.pointerType !== 'mouse') return;
            if (hoveringRef.current) return;
            // Escape closed this panel; the pointer must leave and come back.
            if (item.wasEscapeClosed()) return;
            hoveringRef.current = true;
            menu.onTriggerEnter(item.value);
          }}
          onPointerLeave={(event: React.PointerEvent<HTMLButtonElement>) => {
            onPointerLeave?.(event);
            if (event.defaultPrevented || disabled || event.pointerType !== 'mouse') return;
            hoveringRef.current = false;
            item.setEscapeClosed(false);
            menu.onTriggerLeave();
          }}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(event);
            if (event.defaultPrevented || disabled) return;
            menu.onItemSelect(item.value);
            item.setEscapeClosed(false);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || disabled) return;
            const horizontal = menu.orientation === 'horizontal';
            const rtl = (menu.dir ?? 'ltr') === 'rtl';
            const into = horizontal ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
            if (event.key !== into) return;
            event.preventDefault();
            if (open) item.focusContent();
            else menu.onItemSelect(item.value);
          }}
        />
        {/*
         * Tab from the button goes into the open panel even though it
         * renders elsewhere (the viewport); Shift+Tab from the panel's first
         * link comes back to the button.
         */}
        {open && !disabled && (
          <span
            aria-hidden="true"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the Tab stop that leads into the portaled panel
            tabIndex={0}
            data-bl-nav-proxy=""
            data-bl-focus-guard=""
            style={proxyStyle}
            onFocus={(event) => {
              const from = event.relatedTarget;
              const fromTrigger = from === item.triggerRef.current;
              const content = item.contentRef.current;
              const fromContent = from instanceof Node && content?.contains(from);
              if (fromTrigger || !fromContent) item.focusContent();
              else item.triggerRef.current?.focus();
            }}
          />
        )}
      </>
    );
  },
);

export interface NavigationMenuLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'onSelect'
> {
  asChild?: boolean;
  /** The current page's link. */
  active?: boolean;
  /** Fired when the link is activated; `preventDefault()` keeps the panel open. */
  onSelect?: (event: Event) => void;
}

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink(
    { asChild = false, active = false, onSelect, onClick, ...props },
    ref,
  ) {
    const menu = React.useContext(MenuContext);
    const Comp = asChild ? Slot : 'a';
    return (
      <Comp
        data-active={active ? 'true' : undefined}
        aria-current={active ? 'page' : undefined}
        {...props}
        ref={ref}
        onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const target = event.currentTarget;
          const selectEvent = new CustomEvent(LINK_SELECT, { bubbles: true, cancelable: true });
          const handler = (e: Event) => onSelect?.(e);
          target.addEventListener(LINK_SELECT, handler, { once: true });
          target.dispatchEvent(selectEvent);
          target.removeEventListener(LINK_SELECT, handler);
          if (selectEvent.defaultPrevented) {
            event.preventDefault();
            return;
          }
          // Following the link closes the panel, unless it opens elsewhere.
          if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey)
            menu?.onItemDismiss();
        }}
      />
    );
  },
);

export interface NavigationMenuIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: true;
}

/** A marker under the open panel's button, positioned along the bar. */
const NavigationMenuIndicator = React.forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  function NavigationMenuIndicator({ forceMount, ...props }, ref) {
    const menu = useMenu('NavigationMenuIndicator');
    if (!menu.indicatorTrack) return null;
    return createPortal(
      <IndicatorImpl forceMount={forceMount} {...props} ref={ref} />,
      menu.indicatorTrack,
    );
  },
);

const IndicatorImpl = React.forwardRef<HTMLDivElement, NavigationMenuIndicatorProps>(
  function IndicatorImpl({ asChild = false, forceMount, style, ...props }, forwardedRef) {
    const menu = useMenu('NavigationMenuIndicator');
    const nodeRef = React.useRef<HTMLDivElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    const visible = Boolean(menu.value);
    const mounted = usePresence(Boolean(forceMount) || visible, nodeRef);
    const [position, setPosition] = React.useState<{ size: number; offset: number } | null>(null);
    const horizontal = menu.orientation === 'horizontal';
    const trigger = menu.value ? menu.triggerFor(menu.value) : null;
    useIsoLayoutEffect(() => {
      if (!trigger) return;
      const measure = () =>
        setPosition({
          size: horizontal ? trigger.offsetWidth : trigger.offsetHeight,
          offset: horizontal ? trigger.offsetLeft : trigger.offsetTop,
        });
      measure();
      const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
      observer?.observe(trigger);
      return () => observer?.disconnect();
    }, [trigger, horizontal]);
    if (!mounted) return null;
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        aria-hidden="true"
        data-state={visible ? 'visible' : 'hidden'}
        data-orientation={menu.orientation}
        {...props}
        ref={ref}
        style={{
          position: 'absolute',
          ...(horizontal
            ? {
                left: 0,
                width: position?.size,
                transform: `translateX(${position?.offset ?? 0}px)`,
              }
            : {
                top: 0,
                height: position?.size,
                transform: `translateY(${position?.offset ?? 0}px)`,
              }),
          ...style,
        }}
      />
    );
  },
);

export interface NavigationMenuContentProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    Pick<
      LayerProps,
      'onEscapeKeyDown' | 'onPointerDownOutside' | 'onFocusOutside' | 'onInteractOutside'
    > {
  asChild?: boolean;
  forceMount?: true;
}

/**
 * A panel. In the viewport when the menu has one (kept mounted through its
 * exit so the viewport can animate between panels); in place otherwise.
 */
const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>(
  function NavigationMenuContent({ forceMount, ...props }, forwardedRef) {
    const menu = useMenu('NavigationMenuContent');
    const item = useItem('NavigationMenuContent');
    const open = menu.value === item.value;
    const mounted = usePresence(Boolean(forceMount) || open, item.contentRef);
    if (!mounted) return null;
    const content = <ContentImpl {...props} ref={forwardedRef} />;
    return menu.viewport ? createPortal(content, menu.viewport) : content;
  },
);

type ContentImplProps = Omit<NavigationMenuContentProps, 'forceMount'>;

const ContentImpl = React.forwardRef<HTMLDivElement, ContentImplProps>(function ContentImpl(
  {
    asChild = false,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onKeyDown,
    onPointerEnter,
    onPointerLeave,
    ...props
  },
  forwardedRef,
) {
  const menu = useMenu('NavigationMenuContent');
  const item = useItem('NavigationMenuContent');
  const ref = useComposedRefs(forwardedRef, item.contentRef);
  const open = menu.value === item.value;

  // Which way this panel moves, from the order of the items and which was open before.
  const values = menu.itemValues();
  const index = values.indexOf(item.value);
  const currentIndex = values.indexOf(menu.value);
  const previousIndex = values.indexOf(menu.previousValue);
  const rtl = menu.dir === 'rtl';
  let motion: 'from-start' | 'from-end' | 'to-start' | 'to-end' | undefined;
  if (open && previousIndex !== -1 && previousIndex !== index) {
    const fromAfter = previousIndex > index;
    motion = fromAfter !== rtl ? 'from-start' : 'from-end';
  } else if (!open && menu.previousValue === item.value && currentIndex !== -1) {
    const toAfter = currentIndex > index;
    motion = toAfter !== rtl ? 'to-start' : 'to-end';
  }

  const { setActiveContent } = menu;
  useIsoLayoutEffect(() => {
    if (!open) return;
    setActiveContent(item.contentRef.current);
  }, [open, setActiveContent, item.contentRef]);

  const Comp = asChild ? Slot : 'div';
  return (
    <Layer
      asChild
      onEscapeKeyDown={onEscapeKeyDown}
      onPointerDownOutside={(event) => {
        onPointerDownOutside?.(event);
        if (event.defaultPrevented) return;
        // Presses on the bar's own controls are theirs (a button toggles).
        const target = event.target;
        if (target instanceof Node && menu.rootRef.current?.contains(target))
          event.preventDefault();
      }}
      onFocusOutside={(event) => {
        onFocusOutside?.(event);
        if (event.defaultPrevented) return;
        // Focus on the bar (its buttons, the Tab proxy) keeps the panel.
        const target = event.target;
        if (target instanceof Node && menu.rootRef.current?.contains(target))
          event.preventDefault();
      }}
      onInteractOutside={onInteractOutside}
      onDismiss={() => {
        if (open) menu.onItemDismiss();
      }}
    >
      <Comp
        id={item.contentId}
        aria-labelledby={item.triggerId}
        data-bl-nav-content=""
        data-state={open ? 'open' : 'closed'}
        data-orientation={menu.orientation}
        data-motion={motion}
        {...props}
        ref={ref}
        onPointerEnter={(event: React.PointerEvent<HTMLDivElement>) => {
          onPointerEnter?.(event);
          menu.onContentEnter();
        }}
        onPointerLeave={(event: React.PointerEvent<HTMLDivElement>) => {
          onPointerLeave?.(event);
          if (event.defaultPrevented || event.pointerType !== 'mouse') return;
          // In a viewport the viewport's edge is the panel's edge, and the
          // viewport's own leave (which the app may prevent) decides.
          if (menu.viewport) return;
          menu.onContentLeave();
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const content = item.contentRef.current;
          if (!content || !(event.target instanceof HTMLElement)) return;
          if (event.key === 'Escape') {
            // The panel closes; focus goes back to the button.
            event.preventDefault();
            item.setEscapeClosed(true);
            menu.onItemDismiss();
            item.triggerRef.current?.focus();
            return;
          }
          const tabbables = getTabbables(content);
          const current = tabbables.indexOf(event.target);
          if (event.key === 'Tab') {
            if (event.shiftKey && (current === 0 || current === -1)) {
              event.preventDefault();
              item.triggerRef.current?.focus();
            } else if (!event.shiftKey && current === tabbables.length - 1) {
              // Past the panel: the control after the button in the page.
              event.preventDefault();
              const all = getTabbables(document.body).filter((el) => !content.contains(el));
              const trigger = item.triggerRef.current;
              const at = trigger ? all.indexOf(trigger) : -1;
              const next = all[at + 1];
              menu.onItemDismiss();
              (next ?? trigger)?.focus();
            }
            return;
          }
          const horizontal = menu.orientation === 'horizontal';
          const rtl = (menu.dir ?? getComputedStyle(content).direction) === 'rtl';
          const nextKey = horizontal ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
          const previousKey = horizontal ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
          let target: HTMLElement | undefined;
          if (event.key === nextKey)
            target = tabbables[Math.min(current + 1, tabbables.length - 1)];
          else if (event.key === previousKey) target = tabbables[Math.max(current - 1, 0)];
          else if (event.key === 'Home') target = tabbables[0];
          else if (event.key === 'End') target = tabbables[tabbables.length - 1];
          if (!target) return;
          event.preventDefault();
          target.focus();
        }}
      />
    </Layer>
  );
});

export interface NavigationMenuViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  forceMount?: true;
}

/**
 * The one surface every panel renders into. It is present while a panel is
 * open (and through the last one's exit) and takes the open panel's size.
 */
const NavigationMenuViewport = React.forwardRef<HTMLDivElement, NavigationMenuViewportProps>(
  function NavigationMenuViewport(
    { asChild = false, forceMount, style, onPointerEnter, onPointerLeave, ...props },
    forwardedRef,
  ) {
    const menu = useMenu('NavigationMenuViewport');
    const nodeRef = React.useRef<HTMLDivElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    const open = Boolean(menu.value);
    const mounted = usePresence(Boolean(forceMount) || open, nodeRef);
    const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);
    const { setViewport } = menu;
    useIsoLayoutEffect(() => {
      if (!mounted) return;
      setViewport(nodeRef.current);
      return () => setViewport(null);
    }, [mounted, setViewport]);
    const content = menu.activeContent;
    useIsoLayoutEffect(() => {
      if (!content || !content.isConnected) return;
      const measure = () => setSize({ width: content.offsetWidth, height: content.offsetHeight });
      measure();
      const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
      observer?.observe(content);
      return () => observer?.disconnect();
    }, [content, open]);
    if (!mounted) return null;
    const vars = size
      ? {
          '--bl-navigation-menu-viewport-width': `${size.width}px`,
          '--bl-navigation-menu-viewport-height': `${size.height}px`,
          '--radix-navigation-menu-viewport-width': `${size.width}px`,
          '--radix-navigation-menu-viewport-height': `${size.height}px`,
        }
      : {};
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        data-state={open ? 'open' : 'closed'}
        data-orientation={menu.orientation}
        {...props}
        ref={ref}
        style={{ pointerEvents: open ? undefined : 'none', ...vars, ...style }}
        onPointerEnter={(event: React.PointerEvent<HTMLDivElement>) => {
          onPointerEnter?.(event);
          menu.onContentEnter();
        }}
        onPointerLeave={(event: React.PointerEvent<HTMLDivElement>) => {
          onPointerLeave?.(event);
          if (event.defaultPrevented || event.pointerType !== 'mouse') return;
          menu.onContentLeave();
        }}
      />
    );
  },
);

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSub,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  NavigationMenu as Root,
  NavigationMenuContent as Content,
  NavigationMenuIndicator as Indicator,
  NavigationMenuItem as Item,
  NavigationMenuLink as Link,
  NavigationMenuList as List,
  NavigationMenuSub as Sub,
  NavigationMenuTrigger as Trigger,
  NavigationMenuViewport as Viewport,
};
