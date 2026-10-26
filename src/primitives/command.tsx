import * as React from 'react';

import { commandScore, normalizeText } from './command-score';
import { useComposedRefs } from './compose-refs';
import { Slot } from './slot';
import { useCallbackRef } from './use-callback-ref';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * A command palette, per the ARIA combobox pattern with a listbox popup
 * that is always shown: the input is the `role="combobox"` with
 * `aria-activedescendant` naming the highlighted option, the list is the
 * `role="listbox"`, each row a `role="option"` with `aria-selected`.
 * Typing filters and ranks the rows (see `command-score`); the best match
 * is highlighted; Up and Down move the highlight (wrapping with `loop`),
 * Home and End jump, Enter runs the highlighted row, and with
 * `vimBindings` Ctrl+N/Ctrl+J and Ctrl+P/Ctrl+K move too. Groups hide when
 * none of their rows match; `CommandEmpty` shows when nothing does.
 *
 * The `cmdk-*` attributes (`cmdk-root`, `cmdk-input`, `cmdk-list`,
 * `cmdk-item`, `cmdk-group`, `cmdk-group-heading`, `cmdk-group-items`,
 * `cmdk-separator`, `cmdk-empty`, `cmdk-loading`) are kept for the kit's
 * class lists and for stylesheets written against them.
 */

export type CommandFilter = (value: string, search: string, keywords?: string[]) => number;

export interface CommandState {
  search: string;
  value: string;
  selectedItemId?: string;
  filtered: { count: number; items: Map<string, number>; groups: Set<string> };
}

interface ItemRecord {
  id: string;
  value: string;
  keywords: string[] | undefined;
  disabled: boolean;
  forceMount: boolean;
  groupId: string | undefined;
  node: HTMLElement;
  /** Registration order: the order rows are shown in when not searching. */
  index: number;
}

interface GroupRecord {
  id: string;
  forceMount: boolean;
  node: HTMLElement;
  index: number;
}

interface Ranked {
  node: HTMLElement;
  score: number;
  index: number;
}

/**
 * The palette's state lives in a small store rather than React state, so a
 * keystroke re-renders only the rows whose visibility or highlight changed,
 * not every row. Components subscribe to the parts they read. Everything
 * that changes the store goes through a method.
 */
class CommandStore {
  search = '';
  value = '';
  items = new Map<string, ItemRecord>();
  groups = new Map<string, GroupRecord>();
  scores = new Map<string, number>();
  visibleGroups = new Set<string>();
  count = 0;
  version = 0;
  private order = 0;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  snapshot = () => this.version;
  notify() {
    this.version += 1;
    for (const listener of this.listeners) listener();
  }

  setSearch(search: string) {
    this.search = search;
  }
  setValue(value: string) {
    this.value = value;
  }
  addItem(record: Omit<ItemRecord, 'index'>) {
    this.items.set(record.id, { ...record, index: this.order++ });
  }
  removeItem(id: string) {
    this.items.delete(id);
    this.scores.delete(id);
  }
  addGroup(record: Omit<GroupRecord, 'index'>) {
    this.groups.set(record.id, { ...record, index: this.order++ });
  }
  removeGroup(id: string) {
    this.groups.delete(id);
  }
  selectedId(): string | undefined {
    for (const item of this.items.values()) if (item.value === this.value) return item.id;
    return undefined;
  }
  isShown(item: ItemRecord): boolean {
    return item.forceMount || (this.scores.get(item.id) ?? 0) > 0;
  }

  /** Scores every row for the search; zero hides it. Groups show when any row does. */
  refilter(filtering: boolean, score: CommandFilter) {
    this.scores.clear();
    this.visibleGroups.clear();
    let count = 0;
    for (const item of this.items.values()) {
      const s = !filtering ? 1 : score(item.value, this.search, item.keywords);
      this.scores.set(item.id, s);
      if (s > 0 || item.forceMount) {
        count += 1;
        if (item.groupId) this.visibleGroups.add(item.groupId);
      }
    }
    for (const group of this.groups.values())
      if (group.forceMount) this.visibleGroups.add(group.id);
    this.count = count;
  }

  /** The enabled, shown rows in the order they appear: by rank while filtering, else as registered. */
  visibleInOrder(filtering: boolean): ItemRecord[] {
    const items = [...this.items.values()].filter((item) => !item.disabled && this.isShown(item));
    if (!filtering) return items.sort((a, b) => a.index - b.index);
    // Groups by their best row, rows by score; registration order breaks ties.
    const groupBest = new Map<string, number>();
    for (const item of items) {
      const key = item.groupId ?? `item:${item.id}`;
      groupBest.set(key, Math.max(groupBest.get(key) ?? 0, this.scores.get(item.id) ?? 0));
    }
    const groupIndex = (item: ItemRecord) =>
      item.groupId ? (this.groups.get(item.groupId)?.index ?? item.index) : item.index;
    return items.sort((a, b) => {
      const ka = a.groupId ?? `item:${a.id}`;
      const kb = b.groupId ?? `item:${b.id}`;
      if (ka !== kb) {
        const diff = (groupBest.get(kb) ?? 0) - (groupBest.get(ka) ?? 0);
        return diff !== 0 ? diff : groupIndex(a) - groupIndex(b);
      }
      const diff = (this.scores.get(b.id) ?? 0) - (this.scores.get(a.id) ?? 0);
      return diff !== 0 ? diff : a.index - b.index;
    });
  }

  /**
   * Moves the DOM rows into ranked order while filtering (and back to the
   * registered order when not), so what is read matches what is seen.
   */
  reorder(list: HTMLElement | null, filtering: boolean) {
    const byRank = (a: Ranked, b: Ranked) => {
      if (filtering && a.score !== b.score) return b.score - a.score;
      return a.index - b.index;
    };
    const byContainer = new Map<HTMLElement, Ranked[]>();
    for (const item of this.items.values()) {
      const parent = item.node.parentElement;
      if (!parent) continue;
      const rows = byContainer.get(parent) ?? [];
      rows.push({ node: item.node, score: this.scores.get(item.id) ?? 0, index: item.index });
      byContainer.set(parent, rows);
    }
    for (const [parent, rows] of byContainer)
      for (const row of rows.sort(byRank)) parent.appendChild(row.node);
    if (!list) return;
    // Groups and loose rows directly in the list, by their best row.
    const entries: Ranked[] = [];
    for (const group of this.groups.values()) {
      if (group.node.parentElement !== list) continue;
      let best = 0;
      for (const item of this.items.values())
        if (item.groupId === group.id) best = Math.max(best, this.scores.get(item.id) ?? 0);
      entries.push({ node: group.node, score: best, index: group.index });
    }
    for (const item of this.items.values())
      if (item.node.parentElement === list)
        entries.push({ node: item.node, score: this.scores.get(item.id) ?? 0, index: item.index });
    for (const entry of entries.sort(byRank)) list.appendChild(entry.node);
  }
}

interface CommandContextValue {
  store: CommandStore;
  listId: string;
  inputId: string;
  labelId: string;
  label: string | undefined;
  disablePointerSelection: boolean;
  registerItem: (record: Omit<ItemRecord, 'index'>) => () => void;
  registerGroup: (record: Omit<GroupRecord, 'index'>) => () => void;
  setSearch: (search: string) => void;
  select: (value: string) => void;
  isVisible: (id: string) => boolean;
  isGroupVisible: (id: string) => boolean;
  listRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommand(component: string): CommandContextValue {
  const context = React.useContext(CommandContext);
  if (!context) throw new Error(`${component} must be inside a Command`);
  return context;
}

/** Re-render when the store changes. */
function useStoreVersion(store: CommandStore) {
  return React.useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);
}

/** The part of the store a selector picks, re-rendering only when it changes. */
export function useCommandState<T>(selector: (state: CommandState) => T): T {
  const { store } = useCommand('useCommandState');
  const select = useCallbackRef(selector);
  const read = useCallbackRef(() =>
    select({
      search: store.search,
      value: store.value,
      selectedItemId: store.selectedId(),
      filtered: { count: store.count, items: store.scores, groups: store.visibleGroups },
    }),
  );
  const lastRef = React.useRef<{ version: number; value: T } | null>(null);
  const snapshot = useCallbackRef(() => {
    const last = lastRef.current;
    if (last && last.version === store.version) return last.value;
    const value = read();
    lastRef.current = { version: store.version, value };
    return value;
  });
  return React.useSyncExternalStore(store.subscribe, snapshot, read);
}

export const defaultFilter: CommandFilter = (value, search, keywords) =>
  commandScore(value, search, keywords);

export interface CommandProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  asChild?: boolean;
  /** Accessible name for the palette. Not shown. */
  label?: string;
  /** `false` turns automatic filtering and ranking off; render the rows that match yourself. */
  shouldFilter?: boolean;
  /** How well a row matches the search, 1 to 0 (hidden). The default is `command-score`. */
  filter?: CommandFilter;
  /** The highlighted row's value. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Up from the first row goes to the last, and back. */
  loop?: boolean;
  /** The pointer does not move the highlight. */
  disablePointerSelection?: boolean;
  /** Ctrl+N / Ctrl+J move down and Ctrl+P / Ctrl+K up. On by default. */
  vimBindings?: boolean;
}

const normalizeValue = (value: string) => normalizeText(value.trim());

const ROOT_ATTR = { 'cmdk-root': '' } as const;
const INPUT_ATTR = { 'cmdk-input': '' } as const;
const LIST_ATTR = { 'cmdk-list': '' } as const;
const SIZER_ATTR = { 'cmdk-list-sizer': '' } as const;
const GROUP_ATTR = { 'cmdk-group': '' } as const;
const GROUP_HEADING_ATTR = { 'cmdk-group-heading': '' } as const;
const GROUP_ITEMS_ATTR = { 'cmdk-group-items': '' } as const;
const ITEM_ATTR = { 'cmdk-item': '' } as const;
const SEPARATOR_ATTR = { 'cmdk-separator': '' } as const;
const EMPTY_ATTR = { 'cmdk-empty': '' } as const;
const LOADING_ATTR = { 'cmdk-loading': '' } as const;

const Command = React.forwardRef<HTMLDivElement, CommandProps>(function Command(
  {
    asChild = false,
    label,
    shouldFilter = true,
    filter,
    value: valueProp,
    defaultValue,
    onValueChange,
    loop = false,
    disablePointerSelection = false,
    vimBindings = true,
    onKeyDown,
    children,
    ...props
  },
  ref,
) {
  const [store] = React.useState(() => new CommandStore());
  const listId = useStableId(undefined, 'bl-command-list');
  const inputId = useStableId(undefined, 'bl-command-input');
  const labelId = useStableId(undefined, 'bl-command-label');
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useControllableState({
    value: valueProp === undefined ? undefined : normalizeValue(valueProp),
    defaultValue: normalizeValue(defaultValue ?? ''),
    onChange: onValueChange,
  });
  const score = useCallbackRef(filter ?? defaultFilter);
  const dirtyRef = React.useRef(false);
  const filtering = useCallbackRef(() => shouldFilter && Boolean(store.search));

  const selectBest = useCallbackRef(() => {
    const first = store.visibleInOrder(filtering())[0];
    const next = first?.value ?? '';
    if (next !== store.value) setValue(next);
  });

  /** One pass over everything registered: scores, order, the highlight. */
  const flush = useCallbackRef(() => {
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    store.refilter(filtering(), score);
    store.reorder(
      listRef.current?.querySelector<HTMLElement>('[cmdk-list-sizer]') ?? null,
      filtering(),
    );
    const current = [...store.items.values()].find((item) => item.value === store.value);
    if (!current || current.disabled || !store.isShown(current)) selectBest();
    store.notify();
  });

  /**
   * Registrations arrive one row at a time from layout effects. They are
   * flushed once: by the root's own layout effect when the root rendered in
   * the same commit (before paint), else by a microtask.
   */
  const schedule = useCallbackRef(() => {
    if (dirtyRef.current) return;
    dirtyRef.current = true;
    queueMicrotask(flush);
  });
  useIsoLayoutEffect(() => {
    flush();
  });

  // Keep the store's value in step with the (possibly controlled) prop.
  useIsoLayoutEffect(() => {
    if (store.value === value) return;
    store.setValue(value);
    store.notify();
  }, [store, value]);

  const context = React.useMemo<CommandContextValue>(
    () => ({
      store,
      listId,
      inputId,
      labelId,
      label,
      disablePointerSelection,
      registerItem: (record) => {
        store.addItem(record);
        schedule();
        return () => {
          store.removeItem(record.id);
          schedule();
        };
      },
      registerGroup: (record) => {
        store.addGroup(record);
        schedule();
        return () => {
          store.removeGroup(record.id);
          schedule();
        };
      },
      setSearch: (search) => {
        if (search === store.search) return;
        store.setSearch(search);
        dirtyRef.current = true;
        flush();
      },
      select: (next) => setValue(next),
      isVisible: (id) => {
        const item = store.items.get(id);
        if (!item) return true;
        if (item.forceMount || !filtering()) return true;
        return (store.scores.get(id) ?? 0) > 0;
      },
      isGroupVisible: (id) => !filtering() || store.visibleGroups.has(id),
      listRef,
      inputRef,
    }),
    [
      store,
      listId,
      inputId,
      labelId,
      label,
      disablePointerSelection,
      schedule,
      flush,
      filtering,
      setValue,
    ],
  );

  // The highlight scrolls into view, with its group heading when it is the first row.
  useIsoLayoutEffect(() => {
    const id = store.selectedId();
    const item = id ? store.items.get(id) : undefined;
    if (!item) return;
    const group = item.groupId ? store.groups.get(item.groupId) : undefined;
    const firstInGroup =
      group && group.node.querySelector('[cmdk-item]:not([hidden])') === item.node;
    if (firstInGroup) group.node.scrollIntoView({ block: 'nearest' });
    else item.node.scrollIntoView({ block: 'nearest' });
  }, [store, value]);

  const moveHighlight = (step: number, edge?: 'first' | 'last') => {
    const items = store.visibleInOrder(filtering());
    if (!items.length) return;
    let index: number;
    if (edge === 'first') index = 0;
    else if (edge === 'last') index = items.length - 1;
    else {
      const current = items.findIndex((item) => item.value === store.value);
      index = current + step;
      if (index < 0) index = loop ? items.length - 1 : 0;
      if (index >= items.length) index = loop ? 0 : items.length - 1;
    }
    const target = items[index];
    if (target) setValue(target.value);
  };

  /** Alt+Arrow: the first row of the next or previous group. */
  const moveGroup = (step: number) => {
    const items = store.visibleInOrder(filtering());
    const current = items.findIndex((item) => item.value === store.value);
    const currentGroup = items[current]?.groupId;
    const range =
      step > 0 ? items.slice(current + 1) : items.slice(0, Math.max(current, 0)).reverse();
    const target = range.find((item) => item.groupId !== currentGroup);
    if (target) setValue(target.value);
    else moveHighlight(step, step > 0 ? 'last' : 'first');
  };

  const Comp = asChild ? Slot : 'div';
  return (
    <CommandContext.Provider value={context}>
      <Comp
        {...ROOT_ATTR}
        {...props}
        ref={ref}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          // Composition (an IME) owns Enter and the arrows until it ends.
          if (event.nativeEvent.isComposing || event.keyCode === 229) return;
          const vim = vimBindings && event.ctrlKey;
          const down =
            event.key === 'ArrowDown' || (vim && (event.key === 'n' || event.key === 'j'));
          const up = event.key === 'ArrowUp' || (vim && (event.key === 'p' || event.key === 'k'));
          if (down || up) {
            event.preventDefault();
            if (event.metaKey) moveHighlight(0, down ? 'last' : 'first');
            else if (event.altKey) moveGroup(down ? 1 : -1);
            else moveHighlight(down ? 1 : -1);
          } else if (event.key === 'Home') {
            event.preventDefault();
            moveHighlight(0, 'first');
          } else if (event.key === 'End') {
            event.preventDefault();
            moveHighlight(0, 'last');
          } else if (event.key === 'Enter') {
            event.preventDefault();
            const id = store.selectedId();
            const item = id ? store.items.get(id) : undefined;
            if (item && !item.disabled) item.node.click();
          }
        }}
      >
        {label && (
          <label htmlFor={inputId} id={labelId} style={srOnly}>
            {label}
          </label>
        )}
        {children}
      </Comp>
    </CommandContext.Provider>
  );
});

const srOnly: React.CSSProperties = {
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

export interface CommandInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> {
  asChild?: boolean;
  /** The search text (controlled). */
  value?: string;
  onValueChange?: (search: string) => void;
}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(function CommandInput(
  { asChild = false, value: valueProp, onValueChange, ...props },
  forwardedRef,
) {
  const context = useCommand('CommandInput');
  const ref = useComposedRefs(forwardedRef, context.inputRef);
  useStoreVersion(context.store);
  const [search, setSearch] = useControllableState({
    value: valueProp,
    defaultValue: '',
    onChange: onValueChange,
  });
  // The store follows the (possibly controlled) search.
  const { setSearch: storeSearch } = context;
  useIsoLayoutEffect(() => {
    storeSearch(search);
  }, [search, storeSearch]);
  const Comp = asChild ? Slot : 'input';
  return (
    <Comp
      {...INPUT_ATTR}
      id={context.inputId}
      type="text"
      role="combobox"
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      aria-autocomplete="list"
      aria-expanded={true}
      aria-controls={context.listId}
      aria-labelledby={context.label ? context.labelId : undefined}
      aria-activedescendant={context.store.selectedId()}
      {...props}
      ref={ref}
      value={search}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
    />
  );
});

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Accessible name for the list. Not shown. */
  label?: string;
}

/**
 * The `role="listbox"`. Its height is published as `--bl-command-list-height`
 * (and `--cmdk-list-height`) so a stylesheet can animate it as results change.
 */
const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(function CommandList(
  { asChild = false, label = 'Suggestions', children, ...props },
  forwardedRef,
) {
  const context = useCommand('CommandList');
  const ref = useComposedRefs(forwardedRef, context.listRef);
  const sizerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const list = context.listRef.current;
    const sizer = sizerRef.current;
    if (!list || !sizer || typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(() => {
      const height = `${sizer.offsetHeight}px`;
      list.style.setProperty('--bl-command-list-height', height);
      list.style.setProperty('--cmdk-list-height', height);
    });
    observer.observe(sizer);
    return () => observer.disconnect();
  }, [context.listRef]);
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      {...LIST_ATTR}
      role="listbox"
      tabIndex={-1}
      aria-label={label}
      id={context.listId}
      {...props}
      ref={ref}
    >
      <div {...SIZER_ATTR} ref={sizerRef}>
        {children}
      </div>
    </Comp>
  );
});

interface GroupContextValue {
  id: string;
  forceMount: boolean;
}
const GroupContext = React.createContext<GroupContextValue | null>(null);

export interface CommandGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'heading'> {
  asChild?: boolean;
  heading?: React.ReactNode;
  /** Names the group when it has no heading. */
  value?: string;
  /** Shown even when none of its rows match. */
  forceMount?: boolean;
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(function CommandGroup(
  { asChild = false, heading, value: _value, forceMount = false, children, ...props },
  forwardedRef,
) {
  const context = useCommand('CommandGroup');
  const id = useStableId(undefined, 'bl-command-group');
  const headingId = useStableId(undefined, 'bl-command-group-heading');
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  useStoreVersion(context.store);
  const { registerGroup } = context;
  useIsoLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    return registerGroup({ id, forceMount, node });
  }, [registerGroup, id, forceMount]);
  const visible = forceMount || context.isGroupVisible(id);
  const group = React.useMemo<GroupContextValue>(() => ({ id, forceMount }), [id, forceMount]);
  const Comp = asChild ? Slot : 'div';
  return (
    <GroupContext.Provider value={group}>
      <Comp
        {...GROUP_ATTR}
        role="presentation"
        hidden={visible ? undefined : true}
        {...props}
        ref={ref}
      >
        {heading !== undefined && (
          <div {...GROUP_HEADING_ATTR} aria-hidden="true" id={headingId}>
            {heading}
          </div>
        )}
        <div
          {...GROUP_ITEMS_ATTR}
          role="group"
          aria-labelledby={heading !== undefined ? headingId : undefined}
        >
          {children}
        </div>
      </Comp>
    </GroupContext.Provider>
  );
});

export interface CommandItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect' | 'value'
> {
  asChild?: boolean;
  disabled?: boolean;
  /** Fired when the row runs, by click or Enter. */
  onSelect?: (value: string) => void;
  /** Identifies the row and is what the search matches; the row's text when omitted. */
  value?: string;
  /** Also matched by the search. */
  keywords?: string[];
  /** Shown even when it does not match. */
  forceMount?: boolean;
}

const KEYWORD_SEPARATOR = '\u0000';

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(function CommandItem(
  {
    asChild = false,
    disabled = false,
    onSelect,
    value: valueProp,
    keywords,
    forceMount = false,
    onPointerMove,
    onClick,
    children,
    ...props
  },
  forwardedRef,
) {
  const context = useCommand('CommandItem');
  const group = React.useContext(GroupContext);
  const id = useStableId(undefined, 'bl-command-item');
  const nodeRef = React.useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  useStoreVersion(context.store);
  // The value: the prop, else the row's text, read while it is shown and
  // kept while it is hidden (a hidden row renders no text).
  const [textValue, setTextValue] = React.useState('');
  const value = normalizeValue(valueProp ?? textValue);
  const keywordKey = keywords?.join(KEYWORD_SEPARATOR);
  const { registerItem } = context;
  const mountForce = forceMount || Boolean(group?.forceMount);
  const groupId = group?.id;
  useIsoLayoutEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    return registerItem({
      id,
      value,
      keywords: keywordKey === undefined ? undefined : keywordKey.split(KEYWORD_SEPARATOR),
      disabled,
      forceMount: mountForce,
      groupId,
      node,
    });
  }, [registerItem, id, value, keywordKey, disabled, mountForce, groupId]);
  const visible = mountForce || context.isVisible(id);
  useIsoLayoutEffect(() => {
    if (valueProp !== undefined || !visible) return;
    const next = (nodeRef.current?.textContent ?? '').trim();
    setTextValue((current) => (current === next ? current : next));
  });
  const selected = context.store.value === value && value !== '';
  const Comp = asChild ? Slot : 'div';
  // A hidden row stays in the tree (its hooks keep it registered) but
  // renders nothing, so it is not read, focused or counted.
  return (
    <Comp
      {...ITEM_ATTR}
      role="option"
      id={id}
      aria-selected={selected || undefined}
      aria-disabled={disabled || undefined}
      data-value={value}
      data-selected={selected ? 'true' : 'false'}
      data-disabled={disabled ? 'true' : 'false'}
      hidden={visible ? undefined : true}
      {...props}
      ref={ref}
      onPointerMove={(event: React.PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (event.defaultPrevented || disabled || context.disablePointerSelection || selected)
          return;
        context.select(value);
      }}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (event.defaultPrevented || disabled) return;
        onSelect?.(value);
      }}
    >
      {visible ? children : null}
    </Comp>
  );
});

export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Shown while searching too (useful with `shouldFilter={false}`). */
  alwaysRender?: boolean;
}

/** A separator between rows or groups, hidden while a search is active. */
const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  function CommandSeparator({ asChild = false, alwaysRender = false, ...props }, ref) {
    const context = useCommand('CommandSeparator');
    useStoreVersion(context.store);
    if (!alwaysRender && context.store.search) return null;
    const Comp = asChild ? Slot : 'div';
    return <Comp {...SEPARATOR_ATTR} role="separator" {...props} ref={ref} />;
  },
);

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** Shown when no row matches. */
const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(function CommandEmpty(
  { asChild = false, ...props },
  ref,
) {
  const context = useCommand('CommandEmpty');
  useStoreVersion(context.store);
  if (context.store.count > 0) return null;
  const Comp = asChild ? Slot : 'div';
  return <Comp {...EMPTY_ATTR} role="presentation" {...props} ref={ref} />;
});

export interface CommandLoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Estimated progress, 0 to 100. */
  progress?: number;
  /** Accessible name for the progress bar. Not shown. */
  label?: string;
}

/** Render while rows load; a progress bar for assistive technology. */
const CommandLoading = React.forwardRef<HTMLDivElement, CommandLoadingProps>(
  function CommandLoading(
    { asChild = false, progress, label = 'Loading...', children, ...props },
    ref,
  ) {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        {...LOADING_ATTR}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        {...props}
        ref={ref}
      >
        <div aria-hidden="true">{children}</div>
      </Comp>
    );
  },
);

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  Command as Root,
  CommandEmpty as Empty,
  CommandGroup as Group,
  CommandInput as Input,
  CommandItem as Item,
  CommandList as List,
  CommandLoading as Loading,
  CommandSeparator as Separator,
};
