import * as React from 'react';

import {
  Anchor as AnchorPrimitive,
  AnchorProvider,
  Arrow as ArrowPrimitive,
  type ArrowProps,
  holdPlacement,
  type PositionOptions,
  Positioned,
  useAnchoredPlacement,
  useAnchorContext,
} from './anchor';
import { createCollection } from './collection';
import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { FocusScope, type FocusScopeProps } from './focus-trap';
import { useHideOthers } from './hide-others';
import { Layer, type LayerProps } from './layer';
import { graceTriangle, type Point, pointInPolygon } from './pointer-intent';
import { Portal as PortalPrimitive, type PortalProps as PortalPrimitiveProps } from './portal';
import { usePresence } from './presence';
import { nextIndex } from './roving-focus';
import { useScrollLock } from './scroll-lock';
import { Slot } from './slot';
import { useTypeahead } from './typeahead';
import { useCallbackRef } from './use-callback-ref';
import { useStableId } from './use-id';
import { useIsoLayoutEffect } from './use-layout-effect';

export type { AnchorProps } from './anchor';

/**
 * The menu core, per the ARIA menu and menu button patterns: a `role="menu"`
 * surface of `menuitem`, `menuitemcheckbox` and `menuitemradio` rows, one
 * of which has focus at a time. Arrows move the focus (wrapping with
 * `loop`), Home and End jump, typing finds a row by its text, Enter and
 * Space activate, Escape closes one level and Tab closes everything. Rows
 * open submenus with the arrow that points into them (Right, or Left in
 * RTL), Enter, Space, or by resting the pointer on them; the arrow pointing
 * back closes the submenu and returns to its trigger.
 *
 * DropdownMenu, ContextMenu and Menubar are thin layers over this module:
 * they own the trigger and the open state and pass both in through `Menu`.
 */

export type Direction = 'ltr' | 'rtl';

/** Where focus goes when a menu opens: its first row, its last row, or the surface itself. */
export type FocusOnOpen = 'first' | 'last' | 'none';

/**
 * A trigger says where focus should go before it opens a level; the content
 * takes the answer once when it mounts. Kept behind two stable functions so
 * the value can live in a ref that only event handlers touch.
 */
export interface FocusOnOpenHandle {
  set: (where: FocusOnOpen) => void;
  take: () => FocusOnOpen;
}

export function useFocusOnOpen(): FocusOnOpenHandle {
  const whereRef = React.useRef<FocusOnOpen>('none');
  const set = useCallbackRef((where: FocusOnOpen) => {
    whereRef.current = where;
  });
  const take = useCallbackRef(() => {
    const where = whereRef.current;
    whereRef.current = 'none';
    return where;
  });
  return React.useMemo(() => ({ set, take }), [set, take]);
}

/** The event an item dispatches when activated; `preventDefault()` keeps the menu open. */
export const MENU_ITEM_SELECT = 'bl-menu-item-select';

/*
 * Root context: the whole tree shares the open state, modality, direction,
 * and the knowledge of how the root was opened (keyboard opens put focus on
 * the first row, a press leaves it on the surface).
 */
interface MenuRootContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  modal: boolean;
  dir: Direction | undefined;
  /** The trigger that opened the root menu, for focus return and `aria-labelledby`. */
  triggerRef: React.RefObject<HTMLElement | null>;
  triggerId: string | undefined;
  /** Prefix for the deprecated `--radix-<prefix>-*` variable aliases. */
  legacyPrefix: string;
}

const MenuRootContext = React.createContext<MenuRootContextValue | null>(null);

function useMenuRoot(component: string): MenuRootContextValue {
  const context = React.useContext(MenuRootContext);
  if (!context) throw new Error(`${component} must be inside a Menu`);
  return context;
}

/*
 * Level context: the root menu and each submenu have one. It carries that
 * level's open state, its content and trigger, and, for a submenu, the
 * parent content it sits in.
 */
interface MenuLevelContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  isSub: boolean;
  contentId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLElement | null>;
  triggerId: string | undefined;
  /** Set by a trigger before it opens this level; taken once when the content mounts. */
  focusOnOpen: FocusOnOpenHandle;
}

const MenuLevelContext = React.createContext<MenuLevelContextValue | null>(null);

function useMenuLevel(component: string): MenuLevelContextValue {
  const context = React.useContext(MenuLevelContext);
  if (!context) throw new Error(`${component} must be inside a Menu`);
  return context;
}

/**
 * Keyboard moves that leave a menu sideways: a menubar provides this so Left
 * and Right at the edges of a menu move to the neighbouring menu.
 */
export interface MenuCrossNavigation {
  next: () => void;
  previous: () => void;
  /** Whether a node belongs to the bar: presses and focus there never dismiss its menus. */
  owns: (target: Node) => boolean;
}
export const MenuCrossNavigationContext = React.createContext<MenuCrossNavigation | null>(null);

interface ItemData {
  disabled: boolean;
  textValue: string;
}

const { CollectionProvider, useCollection, useCollectionItem } = createCollection<ItemData>('Menu');

/*
 * Content context: what the rows of one menu surface need from it. A
 * submenu's rows see their own content, not the parent's, because the
 * provider nests with the React tree even though the submenu is portaled.
 */
interface SubRecord {
  trigger: HTMLElement;
  close: () => void;
}

interface MenuContentContextValue {
  node: React.RefObject<HTMLDivElement | null>;
  loop: boolean;
  /** A row the pointer moved over; it takes the highlight unless a submenu's grace area says otherwise. */
  onItemPointerMove: (item: HTMLElement, event: React.PointerEvent, disabled: boolean) => void;
  /** The pointer left a row: the highlight returns to the surface. */
  onItemPointerLeave: (event: React.PointerEvent) => void;
  /** A row took focus: submenus of other rows close. */
  onItemFocus: (item: HTMLElement) => void;
  registerSub: (record: SubRecord) => () => void;
  setGrace: (grace: { polygon: Point[]; content: HTMLElement } | null) => void;
  /** Whether a typeahead search is in progress (Space then continues it). */
  isSearching: () => boolean;
  focusFirst: () => void;
  focusLast: () => void;
}

const MenuContentContext = React.createContext<MenuContentContextValue | null>(null);

function useMenuContent(component: string): MenuContentContextValue {
  const context = React.useContext(MenuContentContext);
  if (!context) throw new Error(`${component} must be inside a MenuContent`);
  return context;
}

export interface MenuProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  dir?: Direction;
  /** Lock the page, hide the rest from assistive technology and trap focus. */
  modal?: boolean;
  /** The trigger that opened the menu (focus returns to it). Set by DropdownMenu and Menubar. */
  triggerRef?: React.RefObject<HTMLElement | null>;
  triggerId?: string;
  /** The content's id, when the trigger's `aria-controls` already names one. */
  contentId?: string;
  /** Set before opening to say where focus goes (keyboard opens focus a row). */
  focusOnOpen?: FocusOnOpenHandle;
  /** Prefix for the deprecated `--radix-<prefix>-content-*` / `-trigger-*` aliases. */
  legacyPrefix?: string;
}

/**
 * The root. Controlled only: the component above owns `open` and passes it
 * in, since what opens a menu (a button, a right-click, a menubar's
 * current value) differs.
 */
function Menu({
  children,
  open = false,
  onOpenChange,
  dir,
  modal = true,
  triggerRef: triggerRefProp,
  triggerId,
  contentId: contentIdProp,
  focusOnOpen: focusOnOpenProp,
  legacyPrefix = 'menu',
}: MenuProps) {
  const setOpen = useCallbackRef((next: boolean) => onOpenChange?.(next));
  const ownTriggerRef = React.useRef<HTMLElement | null>(null);
  const ownFocusOnOpen = useFocusOnOpen();
  const triggerRef = triggerRefProp ?? ownTriggerRef;
  const focusOnOpen = focusOnOpenProp ?? ownFocusOnOpen;
  const contentId = useStableId(contentIdProp, 'bl-menu');
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const root = React.useMemo<MenuRootContextValue>(
    () => ({ open, setOpen, modal, dir, triggerRef, triggerId, legacyPrefix }),
    [open, setOpen, modal, dir, triggerRef, triggerId, legacyPrefix],
  );
  const level = React.useMemo<MenuLevelContextValue>(
    () => ({
      open,
      setOpen,
      isSub: false,
      contentId,
      contentRef,
      triggerRef,
      triggerId,
      focusOnOpen,
    }),
    [open, setOpen, contentId, triggerRef, triggerId, focusOnOpen],
  );
  return (
    <MenuRootContext.Provider value={root}>
      <MenuLevelContext.Provider value={level}>
        <AnchorProvider>{children}</AnchorProvider>
      </MenuLevelContext.Provider>
    </MenuRootContext.Provider>
  );
}

/** Positions the menu against this element (or a virtual box) instead of the trigger. */
const MenuAnchor = AnchorPrimitive;

export interface MenuPortalProps extends Omit<PortalPrimitiveProps, 'children'> {
  forceMount?: true;
  children?: React.ReactNode;
}

const ForceMountContext = React.createContext(false);

/** The portal lives as long as this level's content: through its exit animation. */
function MenuPortal({ forceMount, children, ...props }: MenuPortalProps) {
  const level = useMenuLevel('MenuPortal');
  const mounted = usePresence(Boolean(forceMount) || level.open, level.contentRef);
  if (!mounted) return null;
  return (
    <ForceMountContext.Provider value={Boolean(forceMount)}>
      <PortalPrimitive {...props}>{children}</PortalPrimitive>
    </ForceMountContext.Provider>
  );
}

type LayerCallbacks = Pick<
  LayerProps,
  'onEscapeKeyDown' | 'onPointerDownOutside' | 'onFocusOutside' | 'onInteractOutside'
>;

export interface MenuContentProps
  extends PositionOptions, Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'>, LayerCallbacks {
  asChild?: boolean;
  forceMount?: true;
  /** Arrow keys wrap from the last row to the first and back. */
  loop?: boolean;
  /** Fired when focus enters the menu from outside. */
  onEntryFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onCloseAutoFocus?: FocusScopeProps['onUnmountAutoFocus'];
}

function legacyVars(prefix: string) {
  return {
    [`--radix-${prefix}-content-transform-origin`]: 'transformOrigin',
    [`--radix-${prefix}-content-available-width`]: 'availableWidth',
    [`--radix-${prefix}-content-available-height`]: 'availableHeight',
    [`--radix-${prefix}-trigger-width`]: 'anchorWidth',
    [`--radix-${prefix}-trigger-height`]: 'anchorHeight',
    '--radix-popper-transform-origin': 'transformOrigin',
    '--radix-popper-available-width': 'availableWidth',
    '--radix-popper-available-height': 'availableHeight',
    '--radix-popper-anchor-width': 'anchorWidth',
    '--radix-popper-anchor-height': 'anchorHeight',
  };
}

/** The root menu surface: positioned against the trigger (or anchor), dismissable, modal when the root is. */
const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(function MenuContent(
  {
    forceMount,
    side = 'bottom',
    sideOffset = 0,
    align = 'center',
    alignOffset = 0,
    arrowPadding = 0,
    avoidCollisions = true,
    collisionBoundary,
    collisionPadding = 0,
    sticky = 'partial',
    hideWhenDetached = false,
    updatePositionStrategy,
    ...props
  },
  forwardedRef,
) {
  const root = useMenuRoot('MenuContent');
  const level = useMenuLevel('MenuContent');
  const portalForceMount = React.useContext(ForceMountContext);
  const mounted = usePresence(
    Boolean(forceMount) || portalForceMount || level.open,
    level.contentRef,
  );
  const aliases = React.useMemo(() => legacyVars(root.legacyPrefix), [root.legacyPrefix]);
  if (!mounted) return null;
  return (
    <Positioned
      side={side}
      sideOffset={sideOffset}
      align={align}
      alignOffset={alignOffset}
      arrowPadding={arrowPadding}
      avoidCollisions={avoidCollisions}
      collisionBoundary={collisionBoundary}
      collisionPadding={collisionPadding}
      sticky={sticky}
      hideWhenDetached={hideWhenDetached}
      updatePositionStrategy={updatePositionStrategy}
      aliases={aliases}
      dir={root.dir}
    >
      <MenuSurface {...props} ref={forwardedRef} />
    </Positioned>
  );
});

type SurfaceProps = Omit<MenuContentProps, keyof PositionOptions | 'forceMount'> & {
  /** Submenu surfaces are never modal and keep focus where the pointer left it. */
  sub?: boolean;
};

/**
 * What a root menu and a submenu share: the `role="menu"` element with its
 * collection of rows, the keyboard handling, the layer and the focus scope.
 */
const MenuSurface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  function MenuSurface(props, forwardedRef) {
    return (
      <CollectionProvider>
        <Surface {...props} ref={forwardedRef} />
      </CollectionProvider>
    );
  },
);

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  {
    asChild = false,
    sub = false,
    loop = false,
    onEntryFocus,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    onKeyDown,
    onFocus,
    onPointerMove,
    onPointerEnter,
    onPointerDownCapture,
    ...props
  },
  forwardedRef,
) {
  const root = useMenuRoot('MenuContent');
  const level = useMenuLevel('MenuContent');
  const cross = React.useContext(MenuCrossNavigationContext);
  const parentContent = React.useContext(MenuContentContext);
  const { getItems } = useCollection();
  const { side, align } = useAnchoredPlacement();
  const ref = useComposedRefs(forwardedRef, level.contentRef);
  const typeahead = useTypeahead();
  const subsRef = React.useRef(new Set<SubRecord>());
  const graceRef = React.useRef<{ polygon: Point[]; content: HTMLElement } | null>(null);
  const dismissedFromOutsideRef = React.useRef(false);
  const modal = root.modal && !sub;

  useScrollLock(modal, level.contentRef);
  useHideOthers(modal, level.contentRef);

  const enabledItems = React.useCallback(
    () => getItems().filter((item) => !item.data.disabled),
    [getItems],
  );
  const focusAt = React.useCallback(
    (index: number) => {
      const items = enabledItems();
      const target = items[index === -1 ? items.length - 1 : index];
      if (target) target.node.focus({ preventScroll: true });
      else level.contentRef.current?.focus({ preventScroll: true });
    },
    [enabledItems, level.contentRef],
  );

  const closeSubsExcept = React.useCallback((item: HTMLElement | null) => {
    for (const record of subsRef.current) if (record.trigger !== item) record.close();
  }, []);

  const content = React.useMemo<MenuContentContextValue>(
    () => ({
      node: level.contentRef,
      loop,
      onItemPointerMove: (item, event, disabled) => {
        const current = graceRef.current;
        if (current && pointInPolygon({ x: event.clientX, y: event.clientY }, current.polygon))
          return;
        graceRef.current = null;
        if (disabled) {
          // A disabled row shows no highlight: the surface holds focus.
          if (document.activeElement !== level.contentRef.current)
            level.contentRef.current?.focus({ preventScroll: true });
          closeSubsExcept(null);
          return;
        }
        if (document.activeElement !== item) item.focus({ preventScroll: true });
      },
      onItemPointerLeave: () => {
        if (graceRef.current) return;
        const node = level.contentRef.current;
        if (node && document.activeElement !== node && node.contains(document.activeElement))
          node.focus({ preventScroll: true });
      },
      onItemFocus: (item) => closeSubsExcept(item),
      registerSub: (record) => {
        subsRef.current.add(record);
        return () => {
          subsRef.current.delete(record);
        };
      },
      setGrace: (next) => {
        graceRef.current = next;
      },
      isSearching: typeahead.isSearching,
      focusFirst: () => focusAt(0),
      focusLast: () => focusAt(-1),
    }),
    [level.contentRef, loop, closeSubsExcept, typeahead.isSearching, focusAt],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const node = level.contentRef.current;
    // Keys pressed in a submenu bubble here through React; the submenu
    // handled them.
    if (!node || !(event.target instanceof Node) || !node.contains(event.target)) return;
    if (event.key === 'Tab') {
      event.preventDefault();
      root.setOpen(false);
      return;
    }
    const items = enabledItems();
    const current = items.findIndex((item) => item.node === document.activeElement);
    let move: 'first' | 'last' | 'next' | 'previous' | undefined;
    if (event.key === 'ArrowDown') move = current === -1 ? 'first' : 'next';
    else if (event.key === 'ArrowUp') move = current === -1 ? 'last' : 'previous';
    else if (event.key === 'Home') move = 'first';
    else if (event.key === 'End') move = 'last';
    if (move) {
      event.preventDefault();
      const target = items[nextIndex(move, current, items.length, loop)];
      if (target) target.node.focus({ preventScroll: true });
      return;
    }
    const rtl = (root.dir ?? getComputedStyle(node).direction) === 'rtl';
    const closeKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    if (event.key === closeKey) {
      if (level.isSub) {
        event.preventDefault();
        level.setOpen(false);
        level.triggerRef.current?.focus({ preventScroll: true });
      } else if (cross) {
        event.preventDefault();
        cross.previous();
      }
      return;
    }
    if (event.key === openKey) {
      // A submenu trigger opened its menu already (and prevented the event).
      if (cross) {
        event.preventDefault();
        cross.next();
      }
      return;
    }
    if (event.key === 'Escape' || event.altKey || event.ctrlKey || event.metaKey) return;
    // Space activates a row (the row handles it) unless a search is running.
    if (event.key === ' ' && !typeahead.isSearching()) return;
    const index = typeahead.handleKey(
      event.key,
      items.map((item) => item.data.textValue),
      current,
    );
    if (index !== -1) {
      event.preventDefault();
      items[index]?.node.focus({ preventScroll: true });
    }
  };

  const Comp = asChild ? Slot : 'div';
  return (
    <MenuContentContext.Provider value={content}>
      <Layer
        asChild
        disableOutsidePointerEvents={modal}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
        onFocusOutside={(event) => {
          onFocusOutside?.(event);
          if (event.defaultPrevented) return;
          // Focus moving to this level's own trigger (the submenu's row, a
          // menubar button) is not a dismissal; nor is the parent surface
          // taking focus back when the pointer crosses its background. A
          // submenu closes when another row of its parent is highlighted.
          const target = event.target;
          if (target instanceof Node && level.triggerRef.current?.contains(target))
            event.preventDefault();
          else if (sub && target === parentContent?.node.current) event.preventDefault();
          else if (!sub && target instanceof Node && cross?.owns(target)) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          if (event.defaultPrevented) return;
          const target = event.target;
          const press = event.detail.originalEvent.type === 'pointerdown';
          // The trigger's own press toggles; dismissing here too would close
          // and reopen. The same for the other buttons of a menubar.
          if (
            press &&
            target instanceof Node &&
            (level.triggerRef.current?.contains(target) || (!sub && cross?.owns(target)))
          ) {
            event.preventDefault();
            return;
          }
          if (press) dismissedFromOutsideRef.current = true;
        }}
        onDismiss={() => level.setOpen(false)}
      >
        <FocusScope
          asChild
          trapped={modal}
          onMountAutoFocus={(event) => {
            event.preventDefault();
            const where = level.focusOnOpen.take();
            if (where === 'first') focusAt(0);
            else if (where === 'last') focusAt(-1);
            else if (!sub) level.contentRef.current?.focus({ preventScroll: true });
            // A submenu opened by the pointer leaves focus on its trigger
            // until the pointer reaches it.
          }}
          onUnmountAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            if (event.defaultPrevented) return;
            const fromOutside = dismissedFromOutsideRef.current;
            dismissedFromOutsideRef.current = false;
            // Focus already moved somewhere live (another row took the
            // highlight and closed this submenu): leave it there.
            const active = document.activeElement;
            const lost =
              !active || active === document.body || level.contentRef.current?.contains(active);
            if (!lost) {
              event.preventDefault();
              return;
            }
            if (!fromOutside) return;
            event.preventDefault();
            // Non-modal: the press elsewhere decides where focus goes.
            // Modal: the press landed on nothing; back to the trigger once
            // the browser has run its own focus change.
            if (!modal) return;
            const trigger = level.triggerRef.current;
            if (trigger) setTimeout(() => trigger.focus({ preventScroll: true }), 0);
          }}
          restoreFocusTo={() => level.triggerRef.current}
        >
          <Comp
            role="menu"
            aria-orientation="vertical"
            id={level.contentId}
            aria-labelledby={level.triggerId}
            tabIndex={-1}
            dir={root.dir}
            data-state={level.open ? 'open' : 'closed'}
            data-side={side}
            data-align={align}
            {...props}
            ref={ref}
            onKeyDown={handleKeyDown}
            onFocus={composeHandlers(onFocus, (event: React.FocusEvent<HTMLDivElement>) => {
              const from = event.relatedTarget;
              if (from instanceof Node && event.currentTarget.contains(from)) return;
              onEntryFocus?.(event);
            })}
            onPointerEnter={composeHandlers(onPointerEnter, () => {
              // The pointer reached a submenu: its parent's grace area is spent.
              parentContent?.setGrace(null);
            })}
            onPointerDownCapture={(event: React.PointerEvent<HTMLDivElement>) => {
              onPointerDownCapture?.(event);
              // The surface stays put until the pointer is released.
              const release = holdPlacement(event.currentTarget);
              const done = () => {
                release();
                document.removeEventListener('pointerup', done, true);
                document.removeEventListener('pointercancel', done, true);
              };
              document.addEventListener('pointerup', done, true);
              document.addEventListener('pointercancel', done, true);
            }}
            onPointerMove={(event: React.PointerEvent<HTMLDivElement>) => {
              onPointerMove?.(event);
              if (event.defaultPrevented || event.pointerType === 'touch') return;
              const node = level.contentRef.current;
              const target = event.target;
              if (!node || !(target instanceof Element)) return;
              // Over the surface itself, not a row: no row is highlighted,
              // unless the pointer is on its way to an open submenu.
              const row = target.closest('[role^="menuitem"]');
              if (row && node.contains(row)) return;
              const current = graceRef.current;
              if (
                current &&
                pointInPolygon({ x: event.clientX, y: event.clientY }, current.polygon)
              )
                return;
              if (document.activeElement !== node && node.contains(document.activeElement))
                node.focus({ preventScroll: true });
            }}
          />
        </FocusScope>
      </Layer>
    </MenuContentContext.Provider>
  );
});

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(function MenuGroup(
  { asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return <Comp role="group" {...props} ref={ref} />;
});

export interface MenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const MenuLabel = React.forwardRef<HTMLDivElement, MenuLabelProps>(function MenuLabel(
  { asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return <Comp {...props} ref={ref} />;
});

/*
 * Rows. The base row registers in its menu's collection with its text
 * (for typeahead), takes the highlight when the pointer rests on it, and
 * reports focus so sibling submenus close.
 */
interface ItemBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  disabled?: boolean;
  /** The text typeahead matches, when the row's text content is not it. */
  textValue?: string;
}

function useMenuItemBase(
  { disabled = false, textValue, onPointerMove, onPointerLeave, onFocus, onBlur }: ItemBaseProps,
  nodeRef: React.RefObject<HTMLDivElement | null>,
) {
  const content = useMenuContent('MenuItem');
  const [focused, setFocused] = React.useState(false);
  const [text, setText] = React.useState('');
  // The row's own text, read after render, unless `textValue` says otherwise.
  useIsoLayoutEffect(() => {
    if (textValue !== undefined) return;
    const next = (nodeRef.current?.textContent ?? '').trim();
    setText((current) => (current === next ? current : next));
  });
  const data = React.useMemo<ItemData>(
    () => ({ disabled, textValue: textValue ?? text }),
    [disabled, textValue, text],
  );
  useCollectionItem(nodeRef, data);
  const handlePointerMove = useCallbackRef((event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (event.defaultPrevented || event.pointerType === 'touch') return;
    const node = nodeRef.current;
    if (node) content.onItemPointerMove(node, event, disabled);
  });
  const handlePointerLeave = useCallbackRef((event: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(event);
    if (event.defaultPrevented || event.pointerType === 'touch') return;
    content.onItemPointerLeave(event);
  });
  const handleFocus = useCallbackRef((event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    if (event.defaultPrevented) return;
    setFocused(true);
    const node = nodeRef.current;
    if (node) content.onItemFocus(node);
  });
  const handleBlur = useCallbackRef((event: React.FocusEvent<HTMLDivElement>) => {
    onBlur?.(event);
    if (event.defaultPrevented) return;
    setFocused(false);
  });
  return {
    attributes: {
      'aria-disabled': disabled || undefined,
      'data-disabled': disabled ? '' : undefined,
      'data-highlighted': focused ? '' : undefined,
      tabIndex: -1,
    },
    handlers: {
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    content,
  };
}

export interface MenuItemProps extends Omit<ItemBaseProps, 'onSelect'> {
  /** Fired when the row is activated. `preventDefault()` keeps the menu open. */
  onSelect?: (event: Event) => void;
}

const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { asChild = false, onSelect, onClick, onPointerDown, onKeyDown, ...props },
  forwardedRef,
) {
  const root = useMenuRoot('MenuItem');
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  const { attributes, handlers, content } = useMenuItemBase(props, nodeRef);
  const { disabled = false, textValue: _textValue, ...rest } = props;
  /*
   * Pointer activation is the release, not the click. The press records the
   * row's box; the release (heard at the document, so it counts even when
   * the row moved or the browser lost pointer capture) activates the row
   * when it lands inside that box or the row's box now. The click a browser
   * then fires is ignored; a click with no press (a long press that opened
   * the menu under the finger, released on a row) is ignored too; a click
   * with no pointer at all (keyboard, assistive technology) activates.
   */
  const pressRef = React.useRef<{ rect: DOMRect; pointerId: number } | null>(null);
  const releasedRef = React.useRef(false);
  const stopListeningRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => stopListeningRef.current?.(), []);
  const select = () => {
    const node = nodeRef.current;
    if (!node || disabled) return;
    const event = new CustomEvent(MENU_ITEM_SELECT, { bubbles: true, cancelable: true });
    const handler = (selectEvent: Event) => onSelect?.(selectEvent);
    node.addEventListener(MENU_ITEM_SELECT, handler, { once: true });
    node.dispatchEvent(event);
    node.removeEventListener(MENU_ITEM_SELECT, handler);
    if (!event.defaultPrevented) root.setOpen(false);
  };
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      role="menuitem"
      {...attributes}
      {...rest}
      ref={ref}
      {...handlers}
      onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || event.button !== 0) return;
        const node = event.currentTarget;
        pressRef.current = { rect: node.getBoundingClientRect(), pointerId: event.pointerId };
        releasedRef.current = false;
        try {
          node.setPointerCapture(event.pointerId);
        } catch {
          // Capture is best effort; the document listener below is what counts.
        }
        stopListeningRef.current?.();
        const inside = (rect: DOMRect, x: number, y: number) =>
          x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        const onRelease = (release: PointerEvent) => {
          stop();
          const press = pressRef.current;
          pressRef.current = null;
          if (!press || release.type !== 'pointerup' || release.button !== 0) return;
          if (release.pointerId !== press.pointerId) return;
          const now = node.getBoundingClientRect();
          if (
            !inside(press.rect, release.clientX, release.clientY) &&
            !inside(now, release.clientX, release.clientY)
          )
            return;
          releasedRef.current = true;
          // The click that follows (if any) comes in the same task.
          setTimeout(() => {
            releasedRef.current = false;
          }, 0);
          select();
        };
        const stop = () => {
          document.removeEventListener('pointerup', onRelease, true);
          document.removeEventListener('pointercancel', onRelease, true);
          stopListeningRef.current = null;
        };
        document.addEventListener('pointerup', onRelease, true);
        document.addEventListener('pointercancel', onRelease, true);
        stopListeningRef.current = stop;
      }}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        const byPointer = event.detail > 0;
        const released = releasedRef.current;
        releasedRef.current = false;
        const pressed = pressRef.current !== null;
        pressRef.current = null;
        stopListeningRef.current?.();
        if (event.defaultPrevented || disabled || released) return;
        // A pointer click whose release was not heard (an old browser): the
        // press on this row vouches for it.
        if (byPointer && !pressed) return;
        select();
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.key === ' ' && content.isSearching()) return;
        event.preventDefault();
        select();
      }}
    />
  );
});

export type CheckedState = boolean | 'indeterminate';

const checkedState = (checked: CheckedState) =>
  checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked';

interface ItemIndicatorContextValue {
  checked: CheckedState;
}
const ItemIndicatorContext = React.createContext<ItemIndicatorContextValue>({ checked: false });

export interface MenuCheckboxItemProps extends MenuItemProps {
  checked?: CheckedState;
  onCheckedChange?: (checked: boolean) => void;
}

const MenuCheckboxItem = React.forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  function MenuCheckboxItem({ checked = false, onCheckedChange, onSelect, ...props }, ref) {
    return (
      <ItemIndicatorContext.Provider value={{ checked }}>
        <MenuItem
          role="menuitemcheckbox"
          aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
          data-state={checkedState(checked)}
          {...props}
          ref={ref}
          onSelect={(event) => {
            onSelect?.(event);
            // Toggling keeps the menu open? No: the row decides through
            // preventDefault, as every row does.
            onCheckedChange?.(checked === 'indeterminate' ? true : !checked);
          }}
        />
      </ItemIndicatorContext.Provider>
    );
  },
);

interface RadioGroupContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
}
const RadioGroupContext = React.createContext<RadioGroupContextValue>({
  value: undefined,
  onValueChange: () => undefined,
});

export interface MenuRadioGroupProps extends MenuGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

const MenuRadioGroup = React.forwardRef<HTMLDivElement, MenuRadioGroupProps>(
  function MenuRadioGroup({ value, onValueChange, ...props }, ref) {
    const onChange = useCallbackRef((next: string) => onValueChange?.(next));
    const context = React.useMemo<RadioGroupContextValue>(
      () => ({ value, onValueChange: onChange }),
      [value, onChange],
    );
    return (
      <RadioGroupContext.Provider value={context}>
        <MenuGroup {...props} ref={ref} />
      </RadioGroupContext.Provider>
    );
  },
);

export interface MenuRadioItemProps extends MenuItemProps {
  value: string;
}

const MenuRadioItem = React.forwardRef<HTMLDivElement, MenuRadioItemProps>(function MenuRadioItem(
  { value, onSelect, ...props },
  ref,
) {
  const group = React.useContext(RadioGroupContext);
  const checked = group.value === value;
  return (
    <ItemIndicatorContext.Provider value={{ checked }}>
      <MenuItem
        role="menuitemradio"
        aria-checked={checked}
        data-state={checkedState(checked)}
        {...props}
        ref={ref}
        onSelect={(event) => {
          onSelect?.(event);
          group.onValueChange(value);
        }}
      />
    </ItemIndicatorContext.Provider>
  );
});

export interface MenuItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  forceMount?: true;
}

/** Rendered while the row is checked (or indeterminate); carries `data-state`. */
const MenuItemIndicator = React.forwardRef<HTMLSpanElement, MenuItemIndicatorProps>(
  function MenuItemIndicator({ asChild = false, forceMount, ...props }, ref) {
    const { checked } = React.useContext(ItemIndicatorContext);
    if (!forceMount && !checked) return null;
    const Comp = asChild ? Slot : 'span';
    return <Comp data-state={checkedState(checked)} {...props} ref={ref} />;
  },
);

export interface MenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(function MenuSeparator(
  { asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'div';
  return <Comp role="separator" aria-orientation="horizontal" {...props} ref={ref} />;
});

export type MenuArrowProps = ArrowProps;
const MenuArrow = ArrowPrimitive;

/*
 * Submenus. A MenuSub is a level of its own with its trigger row in the
 * parent menu and its content in a portal, anchored to that row.
 */
export interface MenuSubProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function MenuSub({ children, open = false, onOpenChange }: MenuSubProps) {
  const setOpen = useCallbackRef((next: boolean) => onOpenChange?.(next));
  const parent = useMenuLevel('MenuSub');
  const contentId = useStableId(undefined, 'bl-menu-sub');
  const triggerId = useStableId(undefined, 'bl-menu-sub-trigger');
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const focusOnOpen = useFocusOnOpen();
  // A submenu closes with its parent.
  React.useEffect(() => {
    if (!parent.open) setOpen(false);
  }, [parent.open, setOpen]);
  const level = React.useMemo<MenuLevelContextValue>(
    () => ({
      open,
      setOpen,
      isSub: true,
      contentId,
      contentRef,
      triggerRef,
      triggerId,
      focusOnOpen,
    }),
    [open, setOpen, contentId, triggerId, focusOnOpen],
  );
  return (
    <MenuLevelContext.Provider value={level}>
      <AnchorProvider>{children}</AnchorProvider>
    </MenuLevelContext.Provider>
  );
}

export type MenuSubTriggerProps = ItemBaseProps;

/** Milliseconds the pointer rests on a submenu's row before it opens. */
const SUB_OPEN_DELAY = 100;

const MenuSubTrigger = React.forwardRef<HTMLDivElement, MenuSubTriggerProps>(
  function MenuSubTrigger(
    { asChild = false, onClick, onKeyDown, onPointerMove, onPointerLeave, ...props },
    forwardedRef,
  ) {
    const root = useMenuRoot('MenuSubTrigger');
    const sub = useMenuLevel('MenuSubTrigger');
    const parentContent = useMenuContent('MenuSubTrigger');
    const { setImplicitAnchor } = useAnchorContext('MenuSubTrigger');
    const nodeRef = React.useRef<HTMLDivElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef, sub.triggerRef, setImplicitAnchor);
    const { attributes, handlers } = useMenuItemBase(
      { ...props, onPointerMove, onPointerLeave },
      nodeRef,
    );
    const { disabled = false, textValue: _textValue, ...rest } = props;
    const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const clearOpenTimer = () => {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = undefined;
    };
    React.useEffect(() => clearOpenTimer, []);
    // Registered with the parent surface so a highlight on another row closes this submenu.
    const { registerSub } = parentContent;
    const { setOpen } = sub;
    React.useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;
      return registerSub({ trigger: node, close: () => setOpen(false) });
    }, [registerSub, setOpen]);

    const openWithFocus = () => {
      if (disabled) return;
      sub.focusOnOpen.set('first');
      if (sub.open) {
        // Already open (by the pointer): the keyboard now wants the first row.
        const first = sub.contentRef.current?.querySelector<HTMLElement>(
          '[role^="menuitem"]:not([data-disabled])',
        );
        first?.focus({ preventScroll: true });
      } else sub.setOpen(true);
    };

    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        role="menuitem"
        id={sub.triggerId}
        aria-haspopup="menu"
        aria-expanded={sub.open}
        aria-controls={sub.open ? sub.contentId : undefined}
        data-state={sub.open ? 'open' : 'closed'}
        {...attributes}
        {...rest}
        ref={ref}
        {...handlers}
        onPointerMove={(event: React.PointerEvent<HTMLDivElement>) => {
          handlers.onPointerMove(event);
          if (event.defaultPrevented || event.pointerType === 'touch' || disabled) return;
          if (sub.open || openTimerRef.current !== undefined) return;
          // Only when this row holds the highlight: a grace area may have
          // kept the highlight elsewhere.
          if (document.activeElement !== nodeRef.current) return;
          openTimerRef.current = setTimeout(() => {
            openTimerRef.current = undefined;
            sub.focusOnOpen.set('none');
            sub.setOpen(true);
          }, SUB_OPEN_DELAY);
        }}
        onPointerLeave={(event: React.PointerEvent<HTMLDivElement>) => {
          clearOpenTimer();
          const content = sub.contentRef.current;
          if (sub.open && content && event.pointerType !== 'touch') {
            const box = content.getBoundingClientRect();
            parentContent.setGrace({
              polygon: graceTriangle({ x: event.clientX, y: event.clientY }, box),
              content,
            });
          }
          handlers.onPointerLeave(event);
        }}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          if (event.detail === 0) openWithFocus();
          else if (!sub.open) {
            sub.focusOnOpen.set('none');
            sub.setOpen(true);
          }
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const node = nodeRef.current;
          if (!node) return;
          const rtl = (root.dir ?? getComputedStyle(node).direction) === 'rtl';
          const openKey = rtl ? 'ArrowLeft' : 'ArrowRight';
          if (event.key === ' ' && parentContent.isSearching()) return;
          if (event.key !== openKey && event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          openWithFocus();
        }}
      />
    );
  },
);

export interface MenuSubContentProps
  extends
    Omit<PositionOptions, 'side' | 'align'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'>,
    LayerCallbacks {
  asChild?: boolean;
  forceMount?: true;
  loop?: boolean;
  /** Which end of the trigger row the submenu lines up with. */
  align?: 'start' | 'end';
}

/**
 * A submenu's surface: beside its trigger row on the side the writing
 * direction reads toward (flipped when there is no room), its first row
 * level with the trigger.
 */
const MenuSubContent = React.forwardRef<HTMLDivElement, MenuSubContentProps>(
  function MenuSubContent(
    {
      forceMount,
      align = 'start',
      sideOffset = 0,
      alignOffset = -4,
      arrowPadding = 0,
      avoidCollisions = true,
      collisionBoundary,
      collisionPadding = 0,
      sticky = 'partial',
      hideWhenDetached = false,
      updatePositionStrategy,
      ...props
    },
    forwardedRef,
  ) {
    const root = useMenuRoot('MenuSubContent');
    const sub = useMenuLevel('MenuSubContent');
    const parentContent = useMenuContent('MenuSubContent');
    const portalForceMount = React.useContext(ForceMountContext);
    const mounted = usePresence(
      Boolean(forceMount) || portalForceMount || sub.open,
      sub.contentRef,
    );
    const aliases = React.useMemo(() => legacyVars(root.legacyPrefix), [root.legacyPrefix]);
    if (!mounted) return null;
    const parentNode = parentContent.node.current;
    const rtl =
      (root.dir ?? (parentNode ? getComputedStyle(parentNode).direction : 'ltr')) === 'rtl';
    return (
      <Positioned
        side={rtl ? 'left' : 'right'}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        arrowPadding={arrowPadding}
        avoidCollisions={avoidCollisions}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        sticky={sticky}
        hideWhenDetached={hideWhenDetached}
        updatePositionStrategy={updatePositionStrategy}
        aliases={aliases}
        dir={root.dir}
      >
        <MenuSurface sub {...props} ref={forwardedRef} />
      </Positioned>
    );
  },
);

export {
  Menu,
  MenuAnchor,
  MenuArrow,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuItemIndicator,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  useMenuRoot,
  useMenuLevel,
  Menu as Root,
  MenuAnchor as Anchor,
  MenuArrow as Arrow,
  MenuCheckboxItem as CheckboxItem,
  MenuContent as Content,
  MenuGroup as Group,
  MenuItem as Item,
  MenuItemIndicator as ItemIndicator,
  MenuLabel as Label,
  MenuPortal as Portal,
  MenuRadioGroup as RadioGroup,
  MenuRadioItem as RadioItem,
  MenuSeparator as Separator,
  MenuSub as Sub,
  MenuSubContent as SubContent,
  MenuSubTrigger as SubTrigger,
};
