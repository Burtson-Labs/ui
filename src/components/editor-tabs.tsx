import X from '@burtson-labs/icons/react/x';
import * as React from 'react';

import { cn } from '../lib/utils';

export interface EditorTab {
  /** Stable identity, usually the file path. */
  id: string;
  label: string;
  /** Full path or context; the tooltip and the accessible description. */
  description?: string;
  icon?: React.ReactNode;
  /** Unsaved changes: a dot replaces the close button until hover. */
  dirty?: boolean;
  /** Default true. */
  closeable?: boolean;
  /** A preview tab that the next opened file replaces; shown in italics. */
  preview?: boolean;
  /** The id of the panel this tab shows, for aria-controls. */
  controls?: string;
}

export interface EditorTabsProps extends Omit<
  React.ComponentProps<'div'>,
  'children' | 'aria-label'
> {
  tabs: EditorTab[];
  activeId: string | null;
  onActiveChange: (id: string) => void;
  /**
   * A request to close. The component never removes a tab itself: for a dirty
   * tab, ask the person (save, discard, cancel) and then update `tabs`.
   */
  onClose?: (id: string) => void;
  /**
   * Reorder by drag or Ctrl+Shift+PageUp/PageDown. `toIndex` is the new position.
   * Dragging uses pointer events, not HTML5 drag and drop, so it also works in
   * desktop webviews (Tauri, Electron) that intercept native drags.
   */
  onMove?: (id: string, toIndex: number) => void;
  /** Required: e.g. "Open editors". */
  'aria-label': string;
  /** Right-hand slot for split, more and similar buttons. */
  actions?: React.ReactNode;
  /** Right-click on a tab. */
  onTabContextMenu?: (id: string, event: React.MouseEvent) => void;
}

/**
 * The strip of open files above an editor. One tab stop; Left/Right/Home/End
 * move focus, Enter or Space opens, Delete asks to close, Ctrl+Shift+PageUp
 * and PageDown move the tab. Middle-click closes. The strip scrolls when the
 * tabs overflow and keeps the active tab in view.
 */
function EditorTabs({
  tabs,
  activeId,
  onActiveChange,
  onClose,
  onMove,
  actions,
  onTabContextMenu,
  className,
  'aria-label': ariaLabel,
  ...props
}: EditorTabsProps) {
  const baseId = React.useId();
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const listRef = React.useRef<HTMLDivElement>(null);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [dragId, setDragId] = React.useState<string | null>(null);
  // The gap a dragged tab would land in: 0 is before the first tab,
  // tabs.length after the last.
  const [dropGap, setDropGap] = React.useState<number | null>(null);
  // Set once a press becomes a drag, so the click that ends it does nothing.
  const dragged = React.useRef(false);
  const dragCleanup = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => dragCleanup.current?.(), []);
  const lastIds = React.useRef<string[]>([]);
  const hadFocus = React.useRef(false);

  const ids = tabs.map((t) => t.id);
  const idsKey = ids.join('\u0000');
  const tabStop =
    (focusedId && ids.includes(focusedId) ? focusedId : null) ??
    (activeId && ids.includes(activeId) ? activeId : null) ??
    ids[0] ??
    null;

  React.useEffect(() => {
    if (activeId)
      tabRefs.current.get(activeId)?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }, [activeId]);

  // After a close, keep keyboard focus in the strip: the active tab if the
  // app picked one, else the neighbour at the closed tab's position.
  React.useLayoutEffect(() => {
    if (focusedId && !ids.includes(focusedId)) {
      const next =
        (activeId && ids.includes(activeId) ? activeId : null) ??
        ids[Math.min(Math.max(0, lastIds.current.indexOf(focusedId)), ids.length - 1)] ??
        null;
      setFocusedId(next);
      const active = document.activeElement;
      if (next && hadFocus.current && (!active || active === document.body))
        tabRefs.current.get(next)?.focus();
    }
    lastIds.current = ids;
    // ids is derived from tabs each render; idsKey is its stable form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedId, idsKey, activeId]);

  /** Which gap the pointer is over, measured from the rendered tabs. */
  const gapAt = (clientX: number) => {
    const els = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-slot="editor-tab"]') ?? [],
    );
    const rtl = listRef.current ? getComputedStyle(listRef.current).direction === 'rtl' : false;
    for (let i = 0; i < els.length; i++) {
      const rect = els[i]!.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      if (rtl ? clientX > mid : clientX < mid) return i;
    }
    return els.length;
  };

  const startDrag = (event: React.PointerEvent, id: string) => {
    if (!onMove || event.button !== 0) return;
    dragCleanup.current?.();
    dragged.current = false;
    const downX = event.clientX;
    const move = (e: PointerEvent) => {
      // A few pixels of slop so an ordinary click is not read as a drag.
      if (!dragged.current && Math.abs(e.clientX - downX) < 4) return;
      if (!dragged.current) {
        dragged.current = true;
        setDragId(id);
      }
      setDropGap(gapAt(e.clientX));
    };
    const stop = (e: PointerEvent | null) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      dragCleanup.current = null;
      if (e && dragged.current) {
        const from = lastIds.current.indexOf(id);
        const gap = gapAt(e.clientX);
        const to = gap > from ? gap - 1 : gap;
        if (from !== -1 && to !== from) onMove(id, to);
      }
      setDragId(null);
      setDropGap(null);
    };
    const up = (e: PointerEvent) => stop(e);
    const cancel = () => stop(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    dragCleanup.current = () => stop(null);
  };

  const focusTab = (id: string | undefined) => {
    if (!id) return;
    setFocusedId(id);
    tabRefs.current.get(id)?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, tab: EditorTab) => {
    const i = ids.indexOf(tab.id);
    const rtl = listRef.current ? getComputedStyle(listRef.current).direction === 'rtl' : false;
    const [prev, next] = rtl ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight'];
    let handled = true;
    if (event.ctrlKey && event.shiftKey && (event.key === 'PageUp' || event.key === 'PageDown')) {
      const to = event.key === 'PageUp' ? i - 1 : i + 1;
      if (onMove && to >= 0 && to < ids.length) onMove(tab.id, to);
    } else if (event.key === prev) focusTab(ids[(i - 1 + ids.length) % ids.length]);
    else if (event.key === next) focusTab(ids[(i + 1) % ids.length]);
    else if (event.key === 'Home') focusTab(ids[0]);
    else if (event.key === 'End') focusTab(ids[ids.length - 1]);
    else if (event.key === 'Delete' && tab.closeable !== false && onClose) onClose(tab.id);
    else handled = false;
    if (handled) event.preventDefault();
  };

  return (
    <div
      data-slot="editor-tabs"
      className={cn('flex h-9 min-w-0 items-stretch border-b bg-surface-muted', className)}
      {...props}
    >
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:thin]"
        onFocus={() => (hadFocus.current = true)}
        onBlur={(event) => {
          if (!listRef.current?.contains(event.relatedTarget)) hadFocus.current = false;
        }}
      >
        {tabs.map((tab, i) => {
          const active = tab.id === activeId;
          const closeable = tab.closeable !== false && Boolean(onClose);
          const tabId = `${baseId}-tab-${i}`;
          return (
            <div
              key={tab.id}
              data-slot="editor-tab"
              data-state={active ? 'active' : 'inactive'}
              data-dirty={tab.dirty || undefined}
              data-dragging={dragId === tab.id || undefined}
              data-drop={
                dragId === null
                  ? undefined
                  : dropGap === i
                    ? 'before'
                    : dropGap === tabs.length && i === tabs.length - 1
                      ? 'after'
                      : undefined
              }
              onPointerDown={(event) => startDrag(event, tab.id)}
              onClickCapture={(event) => {
                // Swallow the click that ends a drag.
                if (dragged.current) {
                  dragged.current = false;
                  event.stopPropagation();
                  event.preventDefault();
                }
              }}
              onAuxClick={(event) => {
                if (event.button === 1 && closeable) {
                  event.preventDefault();
                  onClose?.(tab.id);
                }
              }}
              onContextMenu={
                onTabContextMenu ? (event) => onTabContextMenu(tab.id, event) : undefined
              }
              className={cn(
                'group/tab relative flex max-w-60 shrink-0 items-center border-e text-[13px] text-muted-foreground',
                'hover:bg-muted/60 data-[state=active]:bg-background data-[state=active]:text-foreground',
                // The active tab's top edge carries the brand colour.
                'data-[state=active]:before:absolute data-[state=active]:before:inset-x-0 data-[state=active]:before:top-0 data-[state=active]:before:h-0.5 data-[state=active]:before:bg-brand data-[state=active]:before:content-[""]',
                'data-[dragging]:opacity-50 data-[dragging]:select-none',
                // Where a dragged tab will land.
                'data-[drop=before]:shadow-[inset_2px_0_0_var(--brand)] data-[drop=after]:shadow-[inset_-2px_0_0_var(--brand)]',
              )}
            >
              <button
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el);
                  else tabRefs.current.delete(tab.id);
                }}
                type="button"
                role="tab"
                id={tabId}
                aria-selected={active}
                aria-controls={tab.controls}
                aria-describedby={tab.description ? `${tabId}-desc` : undefined}
                title={tab.description}
                tabIndex={tab.id === tabStop ? 0 : -1}
                onFocus={() => setFocusedId(tab.id)}
                onClick={() => onActiveChange(tab.id)}
                onKeyDown={(event) => onKeyDown(event, tab)}
                className={cn(
                  'flex h-full min-w-0 items-center gap-1.5 ps-3 outline-none focus-visible:shadow-[inset_0_0_0_1px_var(--ring)]',
                  closeable ? 'pe-1' : 'pe-3',
                )}
              >
                {tab.icon && (
                  <span aria-hidden className="flex shrink-0 [&_svg]:size-4">
                    {tab.icon}
                  </span>
                )}
                <span className={cn('truncate', tab.preview && 'italic')}>{tab.label}</span>
                {tab.dirty && <span className="sr-only">, unsaved changes</span>}
              </button>
              {tab.description && (
                <span id={`${tabId}-desc`} hidden>
                  {tab.description}
                </span>
              )}
              {closeable ? (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`Close ${tab.label}`}
                  title="Close (Delete)"
                  onClick={() => onClose?.(tab.id)}
                  className="me-1 flex size-5 shrink-0 items-center justify-center rounded-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                >
                  {tab.dirty && (
                    <span
                      aria-hidden
                      className="size-2 rounded-full bg-foreground/70 group-hover/tab:hidden"
                    />
                  )}
                  <X
                    aria-hidden
                    className={cn(
                      'size-3.5',
                      tab.dirty
                        ? 'hidden group-hover/tab:block'
                        : 'opacity-0 group-hover/tab:opacity-100 group-data-[state=active]/tab:opacity-100 group-focus-within/tab:opacity-100',
                    )}
                  />
                </button>
              ) : tab.dirty ? (
                <span aria-hidden className="me-3 size-2 shrink-0 rounded-full bg-foreground/70" />
              ) : null}
            </div>
          );
        })}
      </div>
      {actions && (
        <div data-slot="editor-tabs-actions" className="flex shrink-0 items-center gap-0.5 px-1">
          {actions}
        </div>
      )}
    </div>
  );
}

export { EditorTabs };
