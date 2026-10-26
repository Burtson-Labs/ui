import * as React from 'react';
import { createPortal } from 'react-dom';

import {
  AnchorProvider,
  Arrow as ArrowPrimitive,
  type ArrowProps,
  type PositionOptions,
  Positioned,
  useAnchorContext,
  useAnchoredPlacement,
} from './anchor';
import { createCollection } from './collection';
import { useComposedRefs } from './compose-refs';
import { FocusScope, type FocusScopeProps } from './focus-trap';
import { useHideOthers } from './hide-others';
import { Layer, type LayerProps } from './layer';
import { Portal as PortalPrimitive, type PortalProps as PortalPrimitiveProps } from './portal';
import { usePresence } from './presence';
import { nextIndex } from './roving-focus';
import { useScrollLock } from './scroll-lock';
import { Slot } from './slot';
import { useTypeahead } from './typeahead';
import { useCallbackRef } from './use-callback-ref';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * A select, per the ARIA select-only combobox and listbox patterns: a
 * `role="combobox"` button that shows the chosen option and opens a
 * `role="listbox"` of `role="option"` rows, one of which has focus. Enter,
 * Space, Up and Down open it with the chosen row focused; typing while it
 * is closed chooses the matching option directly, typing while open moves
 * to it; Enter and Space choose; Escape closes. The list is modal while
 * open: the page does not scroll and the pointer cannot reach it.
 *
 * Two placements. `popper` puts the list beside the trigger like any
 * floating surface. `item-aligned` (the default) opens it so the chosen
 * row sits over the trigger, as a native select does, scrolling the list
 * when the screen edge is near; the scroll buttons appear when there is
 * more above or below.
 *
 * Forms: with `name`, `form`, `required` or inside a `<form>`, a visually
 * hidden native `<select>` carries the value, so FormData, validation and
 * browser autofill (`autoComplete`) work.
 */

export type Direction = 'ltr' | 'rtl';

interface ItemData {
  value: string;
  disabled: boolean;
  textValue: string;
}

const { CollectionProvider, useCollection, useCollectionItem } =
  createCollection<ItemData>('Select');

/*
 * The text of each option, kept by value so the trigger can show the chosen
 * one while the list is closed. ItemText writes it; SelectValue subscribes.
 * Plain subscriptions (not React state) so an option re-rendering never
 * re-renders the root.
 */
interface TextRecord {
  node: React.ReactNode;
  text: string;
}

class TextStore {
  private records = new Map<string, TextRecord>();
  private listeners = new Set<() => void>();
  private version = 0;
  set(value: string, record: TextRecord) {
    this.records.set(value, record);
    this.notify();
  }
  delete(value: string, record: TextRecord) {
    if (this.records.get(value) === record) {
      this.records.delete(value);
      this.notify();
    }
  }
  get(value: string | undefined) {
    return value === undefined ? undefined : this.records.get(value);
  }
  values() {
    return [...this.records.entries()];
  }
  snapshot = () => this.version;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private notify() {
    this.version += 1;
    for (const listener of this.listeners) listener();
  }
}

interface Point {
  x: number;
  y: number;
}

interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string | undefined;
  setValue: (value: string) => void;
  dir: Direction | undefined;
  disabled: boolean;
  required: boolean;
  name: string | undefined;
  form: string | undefined;
  autoComplete: string | undefined;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentId: string;
  texts: TextStore;
  /** Where the pointer pressed the trigger, for press-drag-release selection. */
  setPressPoint: (point: Point | null) => void;
  getPressPoint: () => Point | null;
}

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelect(component: string): SelectContextValue {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error(`${component} must be inside a Select`);
  return context;
}

export interface SelectProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  dir?: Direction;
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
  form?: string;
  /** The chosen option's value; `''` shows the placeholder. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function Select({
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  dir,
  name,
  autoComplete,
  disabled = false,
  required = false,
  form,
  value: valueProp,
  defaultValue,
  onValueChange,
}: SelectProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [value, setValue] = useControllableState<string | undefined>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange as ((value: string | undefined) => void) | undefined,
  });
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const contentId = useStableId(undefined, 'bl-select');
  const [texts] = React.useState(() => new TextStore());
  const pressPointRef = React.useRef<Point | null>(null);
  const setPressPoint = useCallbackRef((point: Point | null) => {
    pressPointRef.current = point;
  });
  const getPressPoint = useCallbackRef(() => pressPointRef.current);
  const context = React.useMemo<SelectContextValue>(
    () => ({
      open,
      setOpen,
      value,
      setValue,
      dir,
      disabled,
      required,
      name,
      form,
      autoComplete,
      triggerRef,
      contentRef,
      contentId,
      texts,
      setPressPoint,
      getPressPoint,
    }),
    [
      open,
      setOpen,
      value,
      setValue,
      dir,
      disabled,
      required,
      name,
      form,
      autoComplete,
      contentId,
      texts,
      setPressPoint,
      getPressPoint,
    ],
  );
  return (
    <SelectContext.Provider value={context}>
      <AnchorProvider>
        <CollectionProvider>
          {children}
          <NativeSelect />
        </CollectionProvider>
      </AnchorProvider>
    </SelectContext.Provider>
  );
}

const hiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
  pointerEvents: 'none',
};

/**
 * The form control: rendered when the select names itself for a form or
 * sits in one. Options mirror the registered items so the browser can
 * autofill; a change from the browser becomes the select's value.
 */
function NativeSelect() {
  const context = useSelect('Select');
  const [inForm, setInForm] = React.useState(false);
  useIsoLayoutEffect(() => {
    setInForm(Boolean(context.triggerRef.current?.closest('form')));
  }, [context.triggerRef]);
  const version = React.useSyncExternalStore(
    context.texts.subscribe,
    context.texts.snapshot,
    context.texts.snapshot,
  );
  const options = React.useMemo(() => {
    void version;
    const entries = context.texts.values();
    if (context.value && !entries.some(([value]) => value === context.value))
      entries.push([context.value, { node: null, text: context.value }]);
    return entries;
  }, [context.texts, context.value, version]);
  const wanted =
    inForm ||
    context.name !== undefined ||
    context.form !== undefined ||
    context.required ||
    context.autoComplete !== undefined;
  if (!wanted) return null;
  return (
    <select
      aria-hidden="true"
      tabIndex={-1}
      name={context.name}
      form={context.form}
      required={context.required}
      disabled={context.disabled}
      autoComplete={context.autoComplete}
      value={context.value ?? ''}
      onChange={(event) => context.setValue(event.target.value)}
      style={hiddenStyle}
    >
      <option value="" />
      {options.map(([value, record]) => (
        <option key={value} value={value}>
          {record.text}
        </option>
      ))}
    </select>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(
    { asChild = false, disabled: disabledProp, onPointerDown, onKeyDown, onClick, ...props },
    forwardedRef,
  ) {
    const context = useSelect('SelectTrigger');
    const { setImplicitAnchor } = useAnchorContext('SelectTrigger');
    const { getItems } = useCollection();
    const ref = useComposedRefs(forwardedRef, context.triggerRef, setImplicitAnchor);
    const typeahead = useTypeahead();
    const disabled = context.disabled || Boolean(disabledProp);
    const showPlaceholder = context.value === undefined || context.value === '';
    const openedByPressRef = React.useRef(false);
    const open = () => {
      if (!disabled) context.setOpen(true);
    };
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        type={asChild ? undefined : 'button'}
        role="combobox"
        aria-controls={context.contentId}
        aria-expanded={context.open}
        aria-required={context.required || undefined}
        aria-autocomplete="none"
        dir={context.dir}
        data-state={context.open ? 'open' : 'closed'}
        data-disabled={disabled ? '' : undefined}
        data-placeholder={showPlaceholder ? '' : undefined}
        disabled={disabled}
        {...props}
        ref={ref}
        onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => {
          onPointerDown?.(event);
          if (event.defaultPrevented || disabled || event.button !== 0 || event.ctrlKey) return;
          // Open on the press so a drag onto a row and release can choose it.
          // The trigger is focused by hand (the browser's own focus change
          // on mousedown is cancelled, as is the text selection a drag starts).
          event.preventDefault();
          context.setPressPoint({ x: event.clientX, y: event.clientY });
          openedByPressRef.current = true;
          event.currentTarget.focus({ preventScroll: true });
          open();
        }}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          const byPress = openedByPressRef.current;
          openedByPressRef.current = false;
          if (event.defaultPrevented || byPress || disabled) return;
          // The keyboard or assistive technology.
          open();
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled) return;
          const searching = typeahead.isSearching();
          if (event.key === ' ' && searching) {
            // Part of a search string.
          } else if (
            event.key === 'Enter' ||
            event.key === ' ' ||
            event.key === 'ArrowDown' ||
            event.key === 'ArrowUp'
          ) {
            event.preventDefault();
            open();
            return;
          }
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          // Closed: typing chooses the matching option straight away.
          const items = getItems().filter((item) => !item.data.disabled);
          const current = items.findIndex((item) => item.data.value === context.value);
          const index = typeahead.handleKey(
            event.key,
            items.map((item) => item.data.textValue),
            current,
          );
          if (index === -1) return;
          event.preventDefault();
          const target = items[index];
          if (target && target.data.value !== context.value) context.setValue(target.data.value);
        }}
      />
    );
  },
);

export interface SelectValueProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  'placeholder'
> {
  asChild?: boolean;
  /** Shown while nothing is chosen. */
  placeholder?: React.ReactNode;
}

/** The chosen option's text (its ItemText) or the placeholder, inside the trigger. */
const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(function SelectValue(
  { asChild = false, placeholder, children, style, ...props },
  ref,
) {
  const context = useSelect('SelectValue');
  React.useSyncExternalStore(
    context.texts.subscribe,
    context.texts.snapshot,
    context.texts.snapshot,
  );
  const empty = context.value === undefined || context.value === '';
  const record = empty ? undefined : context.texts.get(context.value);
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp {...props} ref={ref} style={{ pointerEvents: 'none', ...style }}>
      {children !== undefined ? children : empty ? placeholder : (record?.node ?? context.value)}
    </Comp>
  );
});

export interface SelectIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

const SelectIcon = React.forwardRef<HTMLSpanElement, SelectIconProps>(function SelectIcon(
  { asChild = false, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp aria-hidden="true" {...props} ref={ref}>
      {children ?? '▼'}
    </Comp>
  );
});

export interface SelectPortalProps extends Omit<PortalPrimitiveProps, 'children'> {
  forceMount?: true;
  children?: React.ReactNode;
}

const ForceMountContext = React.createContext(false);

/** Present while open or animating out; otherwise the content renders off-document (see SelectContent). */
function SelectPortal({ forceMount, children, ...props }: SelectPortalProps) {
  const context = useSelect('SelectPortal');
  const mounted = usePresence(Boolean(forceMount) || context.open, context.contentRef);
  // Closed: the content still needs to render its options off-document so
  // the trigger knows their text. SelectContent does that itself.
  if (!mounted)
    return <ForceMountContext.Provider value={false}>{children}</ForceMountContext.Provider>;
  return (
    <ForceMountContext.Provider value={Boolean(forceMount)}>
      <PortalPrimitive {...props}>{children}</PortalPrimitive>
    </ForceMountContext.Provider>
  );
}

/*
 * Content context: what the rows need from the open list.
 */
interface ContentContextValue {
  /** Rendering off-document while closed: no focus, no positioning. */
  detached: boolean;
  position: 'item-aligned' | 'popper';
  viewportRef: React.RefObject<HTMLDivElement | null>;
  onItemLeave: () => void;
  isSearching: () => boolean;
  /** The chosen row registers itself for item-aligned placement. */
  setSelectedItem: (node: HTMLElement | null) => void;
  /** Scroll buttons report whether they are shown; placement accounts for them. */
  onScrollButtonChange: () => void;
}

const ContentContext = React.createContext<ContentContextValue | null>(null);

function useSelectContent(component: string): ContentContextValue {
  const context = React.useContext(ContentContext);
  if (!context) throw new Error(`${component} must be inside a SelectContent`);
  return context;
}

export interface SelectContentProps
  extends
    PositionOptions,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'dir'>,
    Pick<LayerProps, 'onEscapeKeyDown' | 'onPointerDownOutside'> {
  asChild?: boolean;
  forceMount?: true;
  position?: 'item-aligned' | 'popper';
  onCloseAutoFocus?: FocusScopeProps['onUnmountAutoFocus'];
}

const LEGACY_VARS = {
  '--radix-select-content-transform-origin': 'transformOrigin',
  '--radix-select-content-available-width': 'availableWidth',
  '--radix-select-content-available-height': 'availableHeight',
  '--radix-select-trigger-width': 'anchorWidth',
  '--radix-select-trigger-height': 'anchorHeight',
  '--radix-popper-transform-origin': 'transformOrigin',
  '--radix-popper-available-width': 'availableWidth',
  '--radix-popper-available-height': 'availableHeight',
  '--radix-popper-anchor-width': 'anchorWidth',
  '--radix-popper-anchor-height': 'anchorHeight',
};

const CANONICAL: Record<string, string> = {
  anchorWidth: '--bl-anchor-width',
  anchorHeight: '--bl-anchor-height',
  availableWidth: '--bl-available-width',
  availableHeight: '--bl-available-height',
  transformOrigin: '--bl-transform-origin',
};

const aliasStyle = Object.fromEntries(
  Object.entries(LEGACY_VARS).map(([name, canonical]) => [
    name,
    `var(${CANONICAL[canonical] ?? canonical})`,
  ]),
);

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent(
  { forceMount, position = 'item-aligned', ...props },
  forwardedRef,
) {
  const context = useSelect('SelectContent');
  const portalForceMount = React.useContext(ForceMountContext);
  const mounted = usePresence(
    Boolean(forceMount) || portalForceMount || context.open,
    context.contentRef,
  );
  // Off-document rendering while closed: a fragment holds the rows so their
  // text registers and the native select has its options.
  const [fragment, setFragment] = React.useState<DocumentFragment | null>(null);
  useIsoLayoutEffect(() => {
    setFragment(document.createDocumentFragment());
  }, []);
  if (!mounted) {
    if (!fragment) return null;
    return createPortal(<DetachedContent>{props.children}</DetachedContent>, fragment);
  }
  if (position === 'popper') {
    const {
      side = 'bottom',
      sideOffset = 0,
      align = 'start',
      alignOffset = 0,
      arrowPadding = 0,
      avoidCollisions = true,
      collisionBoundary,
      collisionPadding = 10,
      sticky = 'partial',
      hideWhenDetached = false,
      updatePositionStrategy,
      ...rest
    } = props;
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
        aliases={LEGACY_VARS}
        dir={context.dir}
      >
        <ContentImpl position="popper" padding={0} {...rest} ref={forwardedRef} />
      </Positioned>
    );
  }
  const {
    side: _side,
    sideOffset: _sideOffset,
    align: _align,
    alignOffset: _alignOffset,
    arrowPadding: _arrowPadding,
    avoidCollisions: _avoidCollisions,
    collisionBoundary: _collisionBoundary,
    collisionPadding = 10,
    sticky: _sticky,
    hideWhenDetached: _hideWhenDetached,
    updatePositionStrategy: _updatePositionStrategy,
    ...rest
  } = props;
  const padding =
    typeof collisionPadding === 'number' ? collisionPadding : (collisionPadding.top ?? 10);
  return <ContentImpl position="item-aligned" padding={padding} {...rest} ref={forwardedRef} />;
});

const noop = () => undefined;

/** The rows while the list is closed: registered, not interactive. */
function DetachedContent({ children }: { children?: React.ReactNode }) {
  const value = React.useMemo<ContentContextValue>(
    () => ({
      detached: true,
      position: 'item-aligned',
      viewportRef: { current: null },
      onItemLeave: noop,
      isSearching: () => false,
      setSelectedItem: noop,
      onScrollButtonChange: noop,
    }),
    [],
  );
  return (
    <ContentContext.Provider value={value}>
      <div>{children}</div>
    </ContentContext.Provider>
  );
}

type ContentImplProps = Omit<SelectContentProps, keyof PositionOptions | 'forceMount'> & {
  position: 'item-aligned' | 'popper';
  /** Item-aligned: how far the list stays from the window's edges. */
  padding: number;
};

/**
 * The list itself. For item-aligned placement it also renders its own fixed
 * wrapper: once the rows have rendered, the chosen row's centre is put on
 * the trigger's centre, the list is kept `padding` pixels inside the window,
 * and when it cannot both fit and align, the viewport is scrolled so the
 * chosen row still aligns and the scroll buttons take over. The wrapper
 * publishes the same CSS variables as a positioned surface.
 */
const ContentImpl = React.forwardRef<HTMLDivElement, ContentImplProps>(function ContentImpl(
  {
    asChild = false,
    position,
    padding,
    onCloseAutoFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    onKeyDown,
    onPointerUp,
    style,
    ...props
  },
  forwardedRef,
) {
  const context = useSelect('SelectContent');
  const { contentRef, triggerRef, value: chosenValue, dir } = context;
  const { getItems } = useCollection();
  const { side, align } = useAnchoredPlacement();
  const contentNodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, contentRef, contentNodeRef);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const selectedItemRef = React.useRef<HTMLElement | null>(null);
  const { isSearching, handleKey } = useTypeahead();
  const [buttonsVersion, setButtonsVersion] = React.useState(0);
  const placementsRef = React.useRef(0);
  const aligned = position === 'item-aligned';

  useScrollLock(true, contentRef);
  useHideOthers(true, contentRef);

  const enabledItems = React.useCallback(
    () => getItems().filter((item) => !item.data.disabled),
    [getItems],
  );

  // Focus the chosen row (else the first) once open.
  const focusInitial = useCallbackRef(() => {
    const items = enabledItems();
    const chosen = items.find((item) => item.data.value === chosenValue) ?? items[0];
    if (chosen) chosen.node.focus({ preventScroll: true });
    else contentNodeRef.current?.focus({ preventScroll: true });
  });

  const place = useCallbackRef(() => {
    const wrapper = wrapperRef.current;
    const content = contentNodeRef.current;
    const viewport = viewportRef.current;
    const trigger = triggerRef.current;
    if (!aligned || !wrapper || !content || !viewport || !trigger) return;
    const triggerRect = trigger.getBoundingClientRect();
    const items = getItems();
    const selected =
      items.find((item) => item.data.value === chosenValue)?.node ??
      selectedItemRef.current ??
      items[0]?.node;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const rtl = (dir ?? getComputedStyle(content).direction) === 'rtl';

    // Width: at least the trigger's, inside the window.
    wrapper.style.minWidth = `${triggerRect.width}px`;
    content.style.maxHeight = '';
    const width = wrapper.offsetWidth;
    let left = rtl ? triggerRect.right - width : triggerRect.left;
    left = Math.max(padding, Math.min(left, viewportWidth - width - padding));

    if (!selected) {
      wrapper.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(triggerRect.bottom)}px, 0)`;
      return;
    }
    // Vertical: the chosen row's centre on the trigger's centre.
    const contentRect = content.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const itemRect = selected.getBoundingClientRect();
    const topInset = viewportRect.top - wrapperRect.top;
    const itemOffset = itemRect.top - viewportRect.top + viewport.scrollTop;
    const itemTopWanted = triggerRect.top + (triggerRect.height - itemRect.height) / 2;
    // Scroll so the part above the row fits above the trigger.
    const roomAbove = itemTopWanted - padding - topInset;
    let scrollTop = Math.max(0, itemOffset - roomAbove);
    const top = itemTopWanted - topInset - (itemOffset - scrollTop);
    // Height: everything below the row that fits, the rest scrolls.
    const maxHeight = viewportHeight - padding - top;
    const height = Math.min(contentRect.height, maxHeight);
    content.style.maxHeight = `${Math.max(0, Math.floor(height))}px`;
    const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    scrollTop = Math.min(scrollTop, maxScroll);
    viewport.scrollTop = scrollTop;
    wrapper.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`;
    wrapper.style.setProperty('--bl-anchor-width', `${triggerRect.width}px`);
    wrapper.style.setProperty('--bl-anchor-height', `${triggerRect.height}px`);
    wrapper.style.setProperty('--bl-available-width', `${viewportWidth - 2 * padding}px`);
    wrapper.style.setProperty('--bl-available-height', `${Math.floor(maxHeight)}px`);
    wrapper.style.setProperty(
      '--bl-transform-origin',
      `${rtl ? 'right' : 'left'} ${Math.round(itemTopWanted - top + itemRect.height / 2)}px`,
    );
  });

  useIsoLayoutEffect(() => {
    if (!aligned) return;
    // The first pass places the list; the buttons that appear change the
    // insets, so the next passes correct for them, then the list is left
    // alone for the person to scroll.
    if (placementsRef.current >= 3) return;
    placementsRef.current += 1;
    place();
  }, [aligned, place, buttonsVersion]);

  useIsoLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentNodeRef.current;
    if (!aligned || !wrapper || !content) return;
    const z = getComputedStyle(content).zIndex;
    wrapper.style.zIndex = z && z !== 'auto' ? z : '';
  }, [aligned]);

  const setSelectedItem = useCallbackRef((node: HTMLElement | null) => {
    selectedItemRef.current = node;
  });
  const onItemLeave = useCallbackRef(() => {
    contentNodeRef.current?.focus({ preventScroll: true });
  });
  const onScrollButtonChange = useCallbackRef(() => setButtonsVersion((v) => v + 1));
  const content = React.useMemo<ContentContextValue>(
    () => ({
      detached: false,
      position,
      viewportRef,
      onItemLeave,
      isSearching,
      setSelectedItem,
      onScrollButtonChange,
    }),
    [position, onItemLeave, isSearching, setSelectedItem, onScrollButtonChange],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Tab') {
      event.preventDefault();
      return;
    }
    const items = enabledItems();
    const current = items.findIndex((item) => item.node === document.activeElement);
    let move: 'first' | 'last' | 'next' | 'previous' | undefined;
    if (event.key === 'ArrowDown') move = current === -1 ? 'first' : 'next';
    else if (event.key === 'ArrowUp') move = current === -1 ? 'last' : 'previous';
    else if (event.key === 'Home' || event.key === 'PageUp') move = 'first';
    else if (event.key === 'End' || event.key === 'PageDown') move = 'last';
    if (move) {
      event.preventDefault();
      const target = items[nextIndex(move, current, items.length, false)];
      target?.node.focus({ preventScroll: true });
      target?.node.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === ' ' && !isSearching()) return;
    const index = handleKey(
      event.key,
      items.map((item) => item.data.textValue),
      current,
    );
    if (index !== -1) {
      event.preventDefault();
      const target = items[index];
      target?.node.focus({ preventScroll: true });
      target?.node.scrollIntoView({ block: 'nearest' });
    }
  };

  const Comp = asChild ? Slot : 'div';
  const list = (
    <ContentContext.Provider value={content}>
      <Layer
        asChild
        disableOutsidePointerEvents
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
        onInteractOutside={(event) => {
          // Focus cannot leave (trapped), so only a press outside closes; and
          // not the press on the trigger that opened the list, which the
          // layer hears as it mounts in that same event.
          const target = event.target;
          if (
            event.detail.originalEvent.type !== 'pointerdown' ||
            (target instanceof Node && triggerRef.current?.contains(target))
          )
            event.preventDefault();
        }}
        onDismiss={() => context.setOpen(false)}
      >
        <FocusScope
          asChild
          trapped
          onMountAutoFocus={(event) => {
            event.preventDefault();
            focusInitial();
          }}
          onUnmountAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            if (event.defaultPrevented) return;
            event.preventDefault();
            // The page behind was inert; focus always returns to the
            // trigger, after the browser's own change for a press.
            const trigger = context.triggerRef.current;
            if (trigger) setTimeout(() => trigger.focus({ preventScroll: true }), 0);
          }}
          restoreFocusTo={() => context.triggerRef.current}
        >
          <Comp
            role="listbox"
            id={context.contentId}
            tabIndex={-1}
            dir={context.dir}
            data-state={context.open ? 'open' : 'closed'}
            data-side={position === 'popper' ? side : undefined}
            data-align={position === 'popper' ? align : undefined}
            {...props}
            ref={ref}
            style={{
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              outline: 'none',
              ...style,
            }}
            onKeyDown={handleKeyDown}
            onPointerUp={(event: React.PointerEvent<HTMLDivElement>) => {
              onPointerUp?.(event);
              context.setPressPoint(null);
            }}
          />
        </FocusScope>
      </Layer>
    </ContentContext.Provider>
  );
  if (!aligned) return list;
  return (
    <div
      ref={wrapperRef}
      data-bl-anchored=""
      style={{
        ...aliasStyle,
        position: 'fixed',
        left: 0,
        top: 0,
        minWidth: 'max-content',
        transition: 'none',
        transform: 'translate3d(0, 0, 0)',
      }}
    >
      {list}
    </div>
  );
});

export interface SelectViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** For the inline style that hides the viewport's scrollbar, under a CSP. */
  nonce?: string;
}

/** The scrolling part of the list, between the scroll buttons. */
const SelectViewport = React.forwardRef<HTMLDivElement, SelectViewportProps>(
  function SelectViewport({ asChild = false, nonce, style, ...props }, forwardedRef) {
    const content = useSelectContent('SelectViewport');
    const ref = useComposedRefs(forwardedRef, content.viewportRef);
    const Comp = asChild ? Slot : 'div';
    return (
      <>
        {!content.detached && (
          <style
            nonce={nonce}
          >{`[data-bl-select-viewport]::-webkit-scrollbar{display:none}`}</style>
        )}
        <Comp
          data-bl-select-viewport=""
          role="presentation"
          {...props}
          ref={ref}
          style={{
            position: 'relative',
            flex: 1,
            overflow: 'hidden auto',
            scrollbarWidth: 'none',
            ...style,
          }}
        />
      </>
    );
  },
);

interface GroupContextValue {
  id: string;
}
const GroupContext = React.createContext<GroupContextValue | null>(null);

export interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(function SelectGroup(
  { asChild = false, ...props },
  ref,
) {
  const id = useStableId(undefined, 'bl-select-group');
  const value = React.useMemo(() => ({ id }), [id]);
  const Comp = asChild ? Slot : 'div';
  return (
    <GroupContext.Provider value={value}>
      <Comp role="group" aria-labelledby={id} {...props} ref={ref} />
    </GroupContext.Provider>
  );
});

export interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(function SelectLabel(
  { asChild = false, ...props },
  ref,
) {
  const group = React.useContext(GroupContext);
  const Comp = asChild ? Slot : 'div';
  return <Comp id={group?.id} {...props} ref={ref} />;
});

interface ItemContextValue {
  value: string;
  selected: boolean;
  disabled: boolean;
  textId: string;
  setText: (text: string) => void;
}
const ItemContext = React.createContext<ItemContextValue | null>(null);

export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  value: string;
  disabled?: boolean;
  textValue?: string;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  {
    asChild = false,
    value,
    disabled = false,
    textValue,
    onFocus,
    onBlur,
    onPointerMove,
    onPointerLeave,
    onPointerUp,
    onClick,
    onKeyDown,
    ...props
  },
  forwardedRef,
) {
  const context = useSelect('SelectItem');
  const content = useSelectContent('SelectItem');
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  const textId = useStableId(undefined, 'bl-select-item-text');
  const [text, setText] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const selected = context.value === value;
  const data = React.useMemo<ItemData>(
    () => ({ value, disabled, textValue: textValue ?? text }),
    [value, disabled, textValue, text],
  );
  useCollectionItem(nodeRef, data);
  if (value === '')
    throw new Error('A SelectItem must have a value; "" is reserved for the placeholder.');
  // The chosen row is what item-aligned placement lines up with the trigger.
  const { setSelectedItem, detached } = content;
  useIsoLayoutEffect(() => {
    if (selected && !detached) setSelectedItem(nodeRef.current);
  }, [selected, detached, setSelectedItem]);
  const choose = () => {
    if (disabled) return;
    context.setValue(value);
    context.setOpen(false);
  };
  const item = React.useMemo<ItemContextValue>(
    () => ({ value, selected, disabled, textId, setText }),
    [value, selected, disabled, textId],
  );
  const Comp = asChild ? Slot : 'div';
  return (
    <ItemContext.Provider value={item}>
      <Comp
        role="option"
        aria-labelledby={textId}
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        data-state={selected ? 'checked' : 'unchecked'}
        data-highlighted={focused ? '' : undefined}
        data-disabled={disabled ? '' : undefined}
        tabIndex={disabled ? undefined : -1}
        {...props}
        ref={ref}
        onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
          onFocus?.(event);
          setFocused(true);
        }}
        onBlur={(event: React.FocusEvent<HTMLDivElement>) => {
          onBlur?.(event);
          setFocused(false);
        }}
        onPointerMove={(event: React.PointerEvent<HTMLDivElement>) => {
          onPointerMove?.(event);
          if (event.defaultPrevented || content.detached || event.pointerType === 'touch') return;
          if (disabled) {
            content.onItemLeave();
            return;
          }
          if (document.activeElement !== nodeRef.current)
            nodeRef.current?.focus({ preventScroll: true });
        }}
        onPointerLeave={(event: React.PointerEvent<HTMLDivElement>) => {
          onPointerLeave?.(event);
          if (event.defaultPrevented || content.detached || event.pointerType === 'touch') return;
          if (document.activeElement === nodeRef.current) content.onItemLeave();
        }}
        onPointerUp={(event: React.PointerEvent<HTMLDivElement>) => {
          onPointerUp?.(event);
          if (event.defaultPrevented) return;
          // Pressed on the trigger, dragged here, released: choose.
          const press = context.getPressPoint();
          if (!press || event.button !== 0) return;
          const moved = Math.abs(event.clientX - press.x) + Math.abs(event.clientY - press.y);
          if (moved > 10) choose();
        }}
        onClick={(event: React.MouseEvent<HTMLDivElement>) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          choose();
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === ' ' && content.isSearching()) return;
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          choose();
        }}
      />
    </ItemContext.Provider>
  );
});

export interface SelectItemTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The option's text: what the trigger shows when it is chosen, and what typeahead matches. */
const SelectItemText = React.forwardRef<HTMLSpanElement, SelectItemTextProps>(
  function SelectItemText({ asChild = false, children, ...props }, forwardedRef) {
    const context = useSelect('SelectItemText');
    const item = React.useContext(ItemContext);
    if (!item) throw new Error('SelectItemText must be inside a SelectItem');
    const nodeRef = React.useRef<HTMLSpanElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    const { setText } = item;
    const { texts } = context;
    useIsoLayoutEffect(() => {
      const text = (nodeRef.current?.textContent ?? '').trim();
      setText(text);
      const record: TextRecord = { node: children, text };
      texts.set(item.value, record);
      return () => texts.delete(item.value, record);
    }, [children, item.value, setText, texts]);
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp id={item.textId} {...props} ref={ref}>
        {children}
      </Comp>
    );
  },
);

export interface SelectItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** Rendered only in the chosen option. */
const SelectItemIndicator = React.forwardRef<HTMLSpanElement, SelectItemIndicatorProps>(
  function SelectItemIndicator({ asChild = false, ...props }, ref) {
    const item = React.useContext(ItemContext);
    if (!item?.selected) return null;
    const Comp = asChild ? Slot : 'span';
    return <Comp aria-hidden="true" {...props} ref={ref} />;
  },
);

/*
 * Scroll buttons: shown when the viewport can scroll that way; resting the
 * pointer on one scrolls steadily.
 */
export interface SelectScrollButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

function useCanScroll(direction: 'up' | 'down') {
  const content = useSelectContent('SelectScrollButton');
  const [can, setCan] = React.useState(false);
  const { onScrollButtonChange } = content;
  React.useEffect(() => {
    if (content.detached) return;
    const viewport = content.viewportRef.current;
    if (!viewport) return;
    const check = () => {
      const next =
        direction === 'up'
          ? viewport.scrollTop > 0
          : Math.ceil(viewport.scrollTop + viewport.clientHeight) < viewport.scrollHeight;
      setCan((current) => (current === next ? current : next));
    };
    check();
    viewport.addEventListener('scroll', check);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(check) : null;
    observer?.observe(viewport);
    return () => {
      viewport.removeEventListener('scroll', check);
      observer?.disconnect();
    };
  }, [content, direction]);
  const firstRef = React.useRef(true);
  useIsoLayoutEffect(() => {
    if (firstRef.current) {
      firstRef.current = false;
      return;
    }
    onScrollButtonChange();
  }, [can, onScrollButtonChange]);
  return { can, content };
}

const ScrollButton = React.forwardRef<
  HTMLDivElement,
  SelectScrollButtonProps & { direction: 'up' | 'down' }
>(function ScrollButton(
  { direction, asChild = false, onPointerMove, onPointerLeave, style, ...props },
  ref,
) {
  const { can, content } = useCanScroll(direction);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const stop = useCallbackRef(() => {
    clearInterval(timerRef.current);
    timerRef.current = undefined;
  });
  React.useEffect(() => stop, [stop]);
  if (!can) return null;
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      aria-hidden="true"
      {...props}
      ref={ref}
      style={{ flexShrink: 0, ...style }}
      onPointerMove={(event: React.PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (event.defaultPrevented) return;
        // Rows under the pointer keep no highlight while scrolling by button.
        content.onItemLeave();
        if (timerRef.current !== undefined) return;
        timerRef.current = setInterval(() => {
          const viewport = content.viewportRef.current;
          if (viewport) viewport.scrollTop += direction === 'up' ? -8 : 8;
        }, 16);
      }}
      onPointerLeave={(event: React.PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        stop();
      }}
    />
  );
});

const SelectScrollUpButton = React.forwardRef<HTMLDivElement, SelectScrollButtonProps>(
  function SelectScrollUpButton(props, ref) {
    return <ScrollButton direction="up" {...props} ref={ref} />;
  },
);

const SelectScrollDownButton = React.forwardRef<HTMLDivElement, SelectScrollButtonProps>(
  function SelectScrollDownButton(props, ref) {
    return <ScrollButton direction="down" {...props} ref={ref} />;
  },
);

export interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const SelectSeparator = React.forwardRef<HTMLDivElement, SelectSeparatorProps>(
  function SelectSeparator({ asChild = false, ...props }, ref) {
    const Comp = asChild ? Slot : 'div';
    return <Comp aria-hidden="true" {...props} ref={ref} />;
  },
);

export type SelectArrowProps = ArrowProps;

/** Only a `popper` placed list has an arrow. */
const SelectArrow = React.forwardRef<SVGSVGElement, SelectArrowProps>(
  function SelectArrow(props, ref) {
    const content = React.useContext(ContentContext);
    if (!content || content.detached || content.position !== 'popper') return null;
    return <ArrowPrimitive {...props} ref={ref} />;
  },
);

export {
  Select,
  SelectArrow,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  Select as Root,
  SelectArrow as Arrow,
  SelectContent as Content,
  SelectGroup as Group,
  SelectIcon as Icon,
  SelectItem as Item,
  SelectItemIndicator as ItemIndicator,
  SelectItemText as ItemText,
  SelectLabel as Label,
  SelectPortal as Portal,
  SelectScrollDownButton as ScrollDownButton,
  SelectScrollUpButton as ScrollUpButton,
  SelectSeparator as Separator,
  SelectTrigger as Trigger,
  SelectValue as Value,
  SelectViewport as Viewport,
};
