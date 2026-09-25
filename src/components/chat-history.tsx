import AlertCircle from '@burtson-labs/icons/react/alert-circle';
import Edit from '@burtson-labs/icons/react/edit';
import MessageSquarePlus from '@burtson-labs/icons/react/message-square-plus';
import MoreHorizontal from '@burtson-labs/icons/react/more-horizontal';
import Pin from '@burtson-labs/icons/react/pin';
import PinOff from '@burtson-labs/icons/react/pin-off';
import Search from '@burtson-labs/icons/react/search';
import Trash from '@burtson-labs/icons/react/trash';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

export interface ChatHistoryItem {
  id: string;
  title: string;
  /** When the conversation last changed; decides its group. */
  updatedAt: Date | string | number;
  pinned?: boolean;
  /** A line of the latest message, searched along with the title. */
  preview?: string;
}

export type ChatHistoryGroupKey = 'pinned' | 'today' | 'yesterday' | 'week' | 'older';

export interface ChatHistoryGroup {
  key: ChatHistoryGroupKey;
  label: string;
  items: ChatHistoryItem[];
}

const LABELS: Record<ChatHistoryGroupKey, string> = {
  pinned: 'Pinned',
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Previous 7 days',
  older: 'Older',
};

const time = (d: ChatHistoryItem['updatedAt']) => new Date(d).getTime();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * Pinned first, then Today, Yesterday, Previous 7 days and Older by the
 * local calendar, newest first in each. Empty groups are left out.
 */
export function groupConversations(
  items: ChatHistoryItem[],
  now: Date = new Date(),
): ChatHistoryGroup[] {
  const today = startOfDay(now);
  const day = 24 * 60 * 60 * 1000;
  const buckets: Record<ChatHistoryGroupKey, ChatHistoryItem[]> = {
    pinned: [],
    today: [],
    yesterday: [],
    week: [],
    older: [],
  };
  for (const item of [...items].sort((a, b) => time(b.updatedAt) - time(a.updatedAt))) {
    if (item.pinned) {
      buckets.pinned.push(item);
      continue;
    }
    const t = startOfDay(new Date(item.updatedAt));
    const key: ChatHistoryGroupKey =
      t >= today
        ? 'today'
        : t >= today - day
          ? 'yesterday'
          : t >= today - 7 * day
            ? 'week'
            : 'older';
    buckets[key].push(item);
  }
  return (Object.keys(buckets) as ChatHistoryGroupKey[])
    .filter((k) => buckets[k].length > 0)
    .map((k) => ({ key: k, label: LABELS[k], items: buckets[k] }));
}

/** Case-insensitive match on every word, across title and preview. */
export function matchesConversation(item: ChatHistoryItem, query: string): boolean {
  const hay = `${item.title} ${item.preview ?? ''}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

export interface ChatHistoryProps extends Omit<React.ComponentProps<'div'>, 'onSelect'> {
  items: ChatHistoryItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  /** Shows a "New chat" button at the top. */
  onNewChat?: () => void;
  /** Adds Rename to the row menu; the title is edited in place. */
  onRename?: (id: string, title: string) => void;
  /** Adds Delete to the row menu. Confirm or offer undo in your app. */
  onDelete?: (id: string) => void;
  /** Adds Pin / Unpin to the row menu. */
  onPinChange?: (id: string, pinned: boolean) => void;
  /** Controlled search text; leave out to let the list keep its own. */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Hides the search box, e.g. when the app searches on the server. */
  searchable?: boolean;
  loading?: boolean;
  /** Why the list could not load. Shown with Retry when `onRetry` is set. */
  error?: React.ReactNode;
  onRetry?: () => void;
  /** Shown when there are no conversations at all. */
  empty?: React.ReactNode;
  /** The clock grouping uses; pass it in tests. */
  now?: Date;
  /**
   * Virtualisation hook for long histories: receives a group's items and the
   * row renderer, returns what to render (e.g. a windowed list). Default
   * renders every row.
   */
  renderItems?: (
    items: ChatHistoryItem[],
    renderItem: (item: ChatHistoryItem) => React.ReactNode,
  ) => React.ReactNode;
  label?: string;
}

/**
 * The conversation list beside a chat: a New chat action, search, and the
 * history grouped by day with pinned chats on top. Up and Down move between
 * rows, Home and End jump, Enter opens; each row has a menu for rename, pin
 * and delete. The app owns the data; this only reports what the person did.
 */
function ChatHistory({
  items,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
  onPinChange,
  query: controlledQuery,
  onQueryChange,
  searchable = true,
  loading = false,
  error,
  onRetry,
  empty,
  now,
  renderItems,
  label = 'Chat history',
  className,
  ...props
}: ChatHistoryProps) {
  const [ownQuery, setOwnQuery] = React.useState('');
  const query = controlledQuery ?? ownQuery;
  const setQuery = (q: string) => {
    if (controlledQuery === undefined) setOwnQuery(q);
    onQueryChange?.(q);
  };
  const [renaming, setRenaming] = React.useState<string | null>(null);
  const list = React.useRef<HTMLDivElement>(null);
  const searchId = React.useId();

  const visible = query.trim() ? items.filter((i) => matchesConversation(i, query)) : items;
  const groups = groupConversations(visible, now);

  const onRowKeyDown = (e: React.KeyboardEvent) => {
    const rows = Array.from(
      list.current?.querySelectorAll<HTMLElement>('[data-slot="chat-history-row"]') ?? [],
    );
    const i = rows.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (e.key === 'ArrowDown') next = Math.min(rows.length - 1, i + 1);
    else if (e.key === 'ArrowUp') next = Math.max(0, i - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = rows.length - 1;
    const row = next >= 0 ? rows[next] : undefined;
    if (row) {
      e.preventDefault();
      row.focus();
    }
  };

  const renderItem = (item: ChatHistoryItem) => (
    <HistoryRow
      key={item.id}
      item={item}
      active={item.id === activeId}
      renaming={renaming === item.id}
      onSelect={() => onSelect(item.id)}
      onStartRename={onRename ? () => setRenaming(item.id) : undefined}
      onRename={(title) => {
        setRenaming(null);
        if (onRename && title.trim() && title.trim() !== item.title)
          onRename(item.id, title.trim());
      }}
      onDelete={onDelete ? () => onDelete(item.id) : undefined}
      onPinChange={onPinChange ? (p) => onPinChange(item.id, p) : undefined}
      onKeyDown={onRowKeyDown}
    />
  );

  return (
    <div
      data-slot="chat-history"
      aria-label={label}
      role="navigation"
      className={cn('flex h-full min-h-0 flex-col', className)}
      {...props}
    >
      {(onNewChat || searchable) && (
        <div className="grid gap-2 p-2">
          {onNewChat && (
            <Button variant="outline" className="justify-start" onClick={onNewChat}>
              <MessageSquarePlus /> New chat
            </Button>
          )}
          {searchable && (
            <label htmlFor={searchId} className="relative block">
              <span className="sr-only">Search chats</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search chats"
                className="h-8 w-full rounded-md border border-input bg-surface pr-2 pl-8 text-base outline-none placeholder:text-muted-foreground focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-ring/15 sm:text-sm"
              />
            </label>
          )}
        </div>
      )}
      <div ref={list} className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {loading ? (
          <div role="status" aria-label="Loading chats" className="grid gap-1.5 pt-1">
            {[72, 56, 64, 48, 60].map((w, i) => (
              <div key={i} className="h-8 rounded-md bg-muted/70 motion-safe:animate-pulse">
                <span className="sr-only">Loading</span>
                <span
                  aria-hidden
                  className="ml-2 inline-block h-2.5 translate-y-3 rounded bg-muted-foreground/15"
                  style={{ width: `${w}%` }}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="grid justify-items-start gap-2 p-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-destructive [&_svg]:size-4">
              <AlertCircle aria-hidden /> Chats could not load
            </span>
            <span className="text-muted-foreground">{error}</span>
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        ) : items.length === 0 ? (
          <div className="p-3 text-sm text-muted-foreground">
            {empty ?? 'No chats yet. Start one and it will appear here.'}
          </div>
        ) : groups.length === 0 ? (
          <p role="status" className="p-3 text-sm text-muted-foreground">
            No chats match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          groups.map((g) => (
            <section key={g.key} aria-label={g.label} className="mt-2 first:mt-0">
              <h3 className="px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {g.label}
              </h3>
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-0.5">
                {renderItems ? renderItems(g.items, renderItem) : g.items.map(renderItem)}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function HistoryRow({
  item,
  active,
  renaming,
  onSelect,
  onStartRename,
  onRename,
  onDelete,
  onPinChange,
  onKeyDown,
}: {
  item: ChatHistoryItem;
  active: boolean;
  renaming: boolean;
  onSelect: () => void;
  onStartRename?: () => void;
  onRename: (title: string) => void;
  onDelete?: () => void;
  onPinChange?: (pinned: boolean) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const hasMenu = Boolean(onStartRename || onDelete || onPinChange);
  if (renaming) return <RenameRow title={item.title} onDone={onRename} />;
  return (
    <li className="group/row relative min-w-0">
      <button
        type="button"
        data-slot="chat-history-row"
        aria-current={active ? 'page' : undefined}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        className={cn(
          'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/20 pointer-coarse:h-11',
          hasMenu && 'pr-9',
          active && 'bg-accent font-medium text-accent-foreground hover:bg-accent',
        )}
      >
        <span className="min-w-0 flex-1 truncate">{item.title || 'Untitled chat'}</span>
      </button>
      {hasMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Actions for ${item.title || 'chat'}`}
            className={cn(
              'absolute top-1/2 right-1 grid size-7 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/20 group-hover/row:opacity-100 data-[state=open]:opacity-100 pointer-coarse:size-9 pointer-coarse:opacity-100 [&_svg]:size-4',
              active && 'opacity-100',
            )}
          >
            <MoreHorizontal aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onStartRename && (
              <DropdownMenuItem onSelect={onStartRename}>
                <Edit aria-hidden /> Rename
              </DropdownMenuItem>
            )}
            {onPinChange && (
              <DropdownMenuItem onSelect={() => onPinChange(!item.pinned)}>
                {item.pinned ? <PinOff aria-hidden /> : <Pin aria-hidden />}
                {item.pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                {(onStartRename || onPinChange) && <DropdownMenuSeparator />}
                <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                  <Trash aria-hidden /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

/** Rename in place: Enter or leaving the field saves, Escape keeps the old title. */
function RenameRow({ title, onDone }: { title: string; onDone: (title: string) => void }) {
  const [draft, setDraft] = React.useState(title);
  const input = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    input.current?.select();
  }, []);
  return (
    <li className="px-1 py-0.5">
      <input
        ref={input}
        aria-label="Chat title"
        value={draft}
        // eslint-disable-next-line jsx-a11y/no-autofocus -- rename was just asked for
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onDone(draft)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;
          if (e.key === 'Enter') {
            e.preventDefault();
            onDone(draft);
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onDone(title);
          }
        }}
        className="h-8 w-full rounded-md border border-brand bg-surface px-2 text-base ring-[3px] ring-ring/15 outline-none sm:text-sm"
      />
    </li>
  );
}

export { ChatHistory };
