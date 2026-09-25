import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Spinner } from './spinner';

export interface TreeNode {
  /** Stable identity. Keep it across renders (a path, a database id). */
  id: string;
  /** Plain text: the accessible name and the typeahead key. */
  label: string;
  icon?: React.ReactNode;
  /** Undefined: a leaf, unless `hasChildren` says the children load later. */
  children?: TreeNode[];
  /** Expandable before its children are known; expanding calls onLoadChildren. */
  hasChildren?: boolean;
  /** Children are being fetched; shows a loading row while expanded. */
  loading?: boolean;
  disabled?: boolean;
  /** Trailing detail, such as a git status letter or a count. */
  meta?: React.ReactNode;
  /** Extra classes on the row, for app states such as an ignored file or a highlight. */
  className?: string;
}

export interface TreeViewProps extends Omit<
  React.ComponentProps<'div'>,
  'children' | 'onSelect' | 'aria-label'
> {
  nodes: TreeNode[];
  /** Required: what the tree holds, e.g. "Files". */
  'aria-label': string;
  expanded: string[];
  onExpandedChange: (ids: string[]) => void;
  selected: string[];
  onSelectedChange: (ids: string[]) => void;
  /** `multiple`: Shift extends a range, Ctrl/⌘ toggles, Space toggles. */
  selectionMode?: 'single' | 'multiple';
  /** Move selection with focus on arrow keys (a file explorer); default off. */
  selectionFollowsFocus?: boolean;
  /** Enter or double-click: open the file, run the item. */
  onAction?: (id: string) => void;
  /**
   * A plain click on a row without children also runs `onAction`, the way a
   * file explorer opens a file on one click. Default off.
   */
  actionOnClick?: boolean;
  /**
   * A plain click on an expandable row toggles it. Defaults to on for single
   * selection; turn it on for a multi-select explorer, where Shift and Ctrl/⌘
   * clicks still only select.
   */
  expandOnClick?: boolean;
  /** Draw a line per ancestor level while the pointer is over the tree. */
  indentGuides?: boolean;
  /** Called once when a node with `hasChildren` and no children expands. */
  onLoadChildren?: (id: string) => void;
  /** Replace the label, e.g. with a rename input. Keys typed in an input never move focus. */
  renderLabel?: (node: TreeNode) => React.ReactNode;
  /** `compact` 24px rows for desktop explorers, `default` 28px. */
  density?: 'compact' | 'default';
  /** Shown when `nodes` is empty. */
  empty?: React.ReactNode;
  /** Right-click or the context-menu key on a row. */
  onRowContextMenu?: (id: string, event: React.MouseEvent | React.KeyboardEvent) => void;
}

interface Row {
  node: TreeNode;
  level: number;
  parentId: string | null;
  setSize: number;
  posInSet: number;
  expandable: boolean;
  expanded: boolean;
}

const isExpandable = (n: TreeNode) => (n.children?.length ?? 0) > 0 || Boolean(n.hasChildren);

/** The rows a person can see, in order, with the ARIA position data for each. */
export function flattenTree(nodes: TreeNode[], expanded: ReadonlySet<string>): Row[] {
  const rows: Row[] = [];
  const walk = (list: TreeNode[], level: number, parentId: string | null) => {
    list.forEach((node, i) => {
      const expandable = isExpandable(node);
      const open = expandable && expanded.has(node.id);
      rows.push({
        node,
        level,
        parentId,
        setSize: list.length,
        posInSet: i + 1,
        expandable,
        expanded: open,
      });
      if (open && node.children) walk(node.children, level + 1, node.id);
    });
  };
  walk(nodes, 1, null);
  return rows;
}

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * A file-explorer style tree. Everything is controlled: the app owns which
 * nodes are expanded and selected, and file operations are callbacks. Rows
 * render flat (role="treeitem" with aria-level), one tab stop for the tree,
 * arrows to move, Right/Left to open and close, Home/End, typeahead.
 */
function TreeView({
  nodes,
  expanded,
  onExpandedChange,
  selected,
  onSelectedChange,
  selectionMode = 'single',
  selectionFollowsFocus = false,
  onAction,
  actionOnClick = false,
  expandOnClick,
  indentGuides = false,
  onLoadChildren,
  renderLabel,
  density = 'default',
  empty,
  onRowContextMenu,
  className,
  ...props
}: TreeViewProps) {
  const expandedSet = React.useMemo(() => new Set(expanded), [expanded]);
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const rows = React.useMemo(() => flattenTree(nodes, expandedSet), [nodes, expandedSet]);
  const index = React.useMemo(() => new Map(rows.map((r, i) => [r.node.id, i])), [rows]);

  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const anchorId = React.useRef<string | null>(null);
  const rowRefs = React.useRef(new Map<string, HTMLDivElement>());
  const treeRef = React.useRef<HTMLDivElement>(null);
  const hadFocus = React.useRef(false);
  const lastIds = React.useRef<string[]>([]);
  const lastParents = React.useRef(new Map<string, string | null>());
  const typeahead = React.useRef({ text: '', at: 0 });

  // The tab stop: the focused row if it is still visible, else the first
  // selected visible row, else the first row.
  const tabStopId =
    (focusedId && index.has(focusedId) ? focusedId : null) ??
    rows.find((r) => selectedSet.has(r.node.id))?.node.id ??
    rows[0]?.node.id ??
    null;

  const focusRow = React.useCallback((id: string) => {
    setFocusedId(id);
    rowRefs.current.get(id)?.focus();
    rowRefs.current.get(id)?.scrollIntoView?.({ block: 'nearest' });
  }, []);

  // Focus recovery: when the focused row disappears (deleted, or a parent
  // collapsed), move to its nearest visible ancestor, else the row now at its
  // old position. Only takes DOM focus if the tree had it.
  React.useLayoutEffect(() => {
    if (focusedId && !index.has(focusedId)) {
      let next: string | null = null;
      let parent = lastParents.current.get(focusedId) ?? null;
      while (parent && !index.has(parent)) parent = lastParents.current.get(parent) ?? null;
      const was = Math.max(0, lastIds.current.indexOf(focusedId));
      next = parent ?? rows[Math.min(was, rows.length - 1)]?.node.id ?? null;
      setFocusedId(next);
      const active = document.activeElement;
      if (next && hadFocus.current && (!active || active === document.body))
        rowRefs.current.get(next)?.focus();
    }
    lastIds.current = rows.map((r) => r.node.id);
    lastParents.current = new Map(rows.map((r) => [r.node.id, r.parentId]));
  }, [rows, index, focusedId]);

  const setExpanded = (row: Row, open: boolean) => {
    if (!row.expandable || row.expanded === open) return;
    const id = row.node.id;
    onExpandedChange(open ? [...expanded, id] : expanded.filter((e) => e !== id));
    if (open && !row.node.children && row.node.hasChildren) onLoadChildren?.(id);
  };

  const selectRange = (toId: string) => {
    const from = index.get(anchorId.current ?? toId) ?? 0;
    const to = index.get(toId) ?? 0;
    const [a, b] = from < to ? [from, to] : [to, from];
    onSelectedChange(
      rows
        .slice(a, b + 1)
        .filter((r) => !r.node.disabled)
        .map((r) => r.node.id),
    );
  };

  const select = (id: string, mode: 'replace' | 'toggle' | 'range') => {
    if (rows[index.get(id) ?? -1]?.node.disabled) return;
    if (selectionMode === 'single' || mode === 'replace') {
      anchorId.current = id;
      onSelectedChange([id]);
    } else if (mode === 'toggle') {
      anchorId.current = id;
      onSelectedChange(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    } else selectRange(id);
  };

  const moveTo = (i: number, extend: boolean) => {
    const row = rows[Math.max(0, Math.min(rows.length - 1, i))];
    if (!row) return;
    focusRow(row.node.id);
    if (selectionMode === 'multiple' && extend) selectRange(row.node.id);
    else if (selectionFollowsFocus && !row.node.disabled) select(row.node.id, 'replace');
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented || isTypingTarget(event.target)) return;
    const id = tabStopId;
    if (!id) return;
    const i = index.get(id) ?? 0;
    const row = rows[i];
    if (!row) return;
    const mod = event.metaKey || event.ctrlKey;
    let handled = true;
    switch (event.key) {
      case 'ArrowDown':
        moveTo(i + 1, event.shiftKey);
        break;
      case 'ArrowUp':
        moveTo(i - 1, event.shiftKey);
        break;
      case 'Home':
        moveTo(0, event.shiftKey);
        break;
      case 'End':
        moveTo(rows.length - 1, event.shiftKey);
        break;
      case 'ArrowRight':
        if (row.expandable && !row.expanded) setExpanded(row, true);
        else if (row.expanded && rows[i + 1]?.parentId === row.node.id)
          moveTo(i + 1, event.shiftKey);
        break;
      case 'ArrowLeft':
        if (row.expanded) setExpanded(row, false);
        else if (row.parentId) moveTo(index.get(row.parentId) ?? i, event.shiftKey);
        break;
      case 'Enter':
        if (row.node.disabled) break;
        select(row.node.id, 'replace');
        onAction?.(row.node.id);
        break;
      case ' ':
        select(
          row.node.id,
          selectionMode === 'multiple' ? (event.shiftKey ? 'range' : 'toggle') : 'replace',
        );
        break;
      case 'a':
        if (mod && selectionMode === 'multiple') {
          onSelectedChange(rows.filter((r) => !r.node.disabled).map((r) => r.node.id));
        } else handled = false;
        break;
      case 'ContextMenu':
        onRowContextMenu?.(row.node.id, event);
        break;
      default:
        handled = false;
    }
    if (!handled && event.key.length === 1 && !mod && !event.altKey) {
      // Typeahead: jump to the next row whose label starts with what was typed.
      const now = event.timeStamp;
      const t = typeahead.current;
      t.text = now - t.at > 600 ? event.key : t.text + event.key;
      t.at = now;
      const query = t.text.toLowerCase();
      const start = t.text.length === 1 ? i + 1 : i;
      for (let k = 0; k < rows.length; k++) {
        const r = rows[(start + k) % rows.length];
        if (r && r.node.label.toLowerCase().startsWith(query)) {
          moveTo(index.get(r.node.id) ?? 0, false);
          break;
        }
      }
      handled = true;
    }
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  if (rows.length === 0 && empty) {
    return (
      <div data-slot="tree-view" data-empty className={cn('text-[13px]', className)} {...props}>
        {empty}
      </div>
    );
  }

  return (
    <div
      ref={treeRef}
      role="tree"
      tabIndex={-1}
      data-slot="tree-view"
      data-density={density}
      aria-multiselectable={selectionMode === 'multiple' || undefined}
      className={cn('group/tree flex flex-col py-1 text-[13px] select-none', className)}
      {...props}
      onKeyDown={onKeyDown}
      onFocus={(event) => {
        hadFocus.current = true;
        // Focus landing on the tree itself (a click on empty space) goes to the tab stop.
        if (event.target === event.currentTarget && tabStopId)
          rowRefs.current.get(tabStopId)?.focus();
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        if (!treeRef.current?.contains(event.relatedTarget)) hadFocus.current = false;
        props.onBlur?.(event);
      }}
    >
      {rows.map((row) => {
        const { node } = row;
        const isSelected = selectedSet.has(node.id);
        return (
          <React.Fragment key={node.id}>
            {/* Keys are handled once on the tree, for whichever row has focus. */}
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
            <div
              ref={(el) => {
                if (el) rowRefs.current.set(node.id, el);
                else rowRefs.current.delete(node.id);
              }}
              role="treeitem"
              data-slot="tree-item"
              data-id={node.id}
              aria-level={row.level}
              aria-setsize={row.setSize}
              aria-posinset={row.posInSet}
              aria-expanded={row.expandable ? row.expanded : undefined}
              aria-selected={isSelected}
              aria-disabled={node.disabled || undefined}
              aria-busy={(row.expanded && node.loading) || undefined}
              aria-label={node.label}
              tabIndex={node.id === tabStopId ? 0 : -1}
              data-state={isSelected ? 'selected' : undefined}
              style={{ paddingInlineStart: `${(row.level - 1) * 12 + 4}px` }}
              className={cn(
                'relative flex h-7 shrink-0 cursor-default items-center gap-1 rounded-sm pe-2 outline-none group-data-[density=compact]/tree:h-6',
                'hover:bg-muted/70 data-[state=selected]:bg-brand-soft/70 data-[state=selected]:text-foreground',
                'focus-visible:shadow-[inset_0_0_0_1px_var(--ring)] aria-disabled:opacity-50',
                node.className,
              )}
              onFocus={() => setFocusedId(node.id)}
              onClick={(event) => {
                if (isTypingTarget(event.target)) return;
                select(
                  node.id,
                  event.shiftKey ? 'range' : event.metaKey || event.ctrlKey ? 'toggle' : 'replace',
                );
                const plain = !event.shiftKey && !event.metaKey && !event.ctrlKey;
                if (plain && row.expandable && (expandOnClick ?? selectionMode === 'single'))
                  setExpanded(row, !row.expanded);
                if (plain && !row.expandable && actionOnClick && !node.disabled)
                  onAction?.(node.id);
              }}
              onDoubleClick={(event) => {
                if (!isTypingTarget(event.target) && !node.disabled) onAction?.(node.id);
              }}
              onContextMenu={
                onRowContextMenu ? (event) => onRowContextMenu(node.id, event) : undefined
              }
            >
              {indentGuides &&
                Array.from({ length: row.level - 1 }, (_, level) => (
                  <span
                    key={level}
                    aria-hidden
                    data-slot="tree-guide"
                    style={{ insetInlineStart: `${level * 12 + 12}px` }}
                    className="pointer-events-none absolute inset-y-0 w-px bg-border opacity-0 transition-opacity group-hover/tree:opacity-100"
                  />
                ))}
              {/* A pointer shortcut only: Right and Left expand and collapse from the keyboard. */}
              <span
                aria-hidden
                className="flex size-4 shrink-0 items-center justify-center text-muted-foreground"
                onClick={(event) => {
                  if (!row.expandable) return;
                  event.stopPropagation();
                  setExpanded(row, !row.expanded);
                }}
              >
                {row.expandable && (
                  <ChevronRight
                    className={cn(
                      'size-3.5 motion-safe:transition-transform',
                      row.expanded && 'rotate-90',
                    )}
                  />
                )}
              </span>
              {node.icon && (
                <span aria-hidden className="flex shrink-0 text-muted-foreground [&_svg]:size-4">
                  {node.icon}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">
                {renderLabel ? renderLabel(node) : node.label}
              </span>
              {node.meta && (
                <span className="shrink-0 text-xs text-muted-foreground">{node.meta}</span>
              )}
            </div>
            {row.expanded && node.loading && !node.children?.length && (
              <div
                role="presentation"
                data-slot="tree-loading"
                style={{ paddingInlineStart: `${row.level * 12 + 8}px` }}
                className="flex h-7 items-center gap-2 text-muted-foreground group-data-[density=compact]/tree:h-6"
              >
                <Spinner className="size-3.5" label={`Loading ${node.label}`} />
                <span aria-hidden>Loading…</span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export { TreeView };
