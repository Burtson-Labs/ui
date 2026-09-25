import ArrowDown from '@burtson-labs/icons/react/arrow-down';
import ArrowUp from '@burtson-labs/icons/react/arrow-up';
import ChevronsUpDown from '@burtson-labs/icons/react/chevrons-up-down';
import Search from '@burtson-labs/icons/react/search';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Pagination, pageWindow, paginationSummary, usePagination } from './pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Skeleton } from './skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

/**
 * Where a column goes on a phone card: `title` and `subtitle` head the card,
 * `aside` sits top right (a status badge), `field` is a labelled value in a
 * two-column grid, `footer` is a full-width line at the bottom (links,
 * buttons), `hidden` is left off the card.
 */
export type DataTableCardSlot = 'title' | 'subtitle' | 'aside' | 'field' | 'footer' | 'hidden';

export type DataTableBreakpoint = 'sm' | 'md' | 'lg' | 'xl';

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  /** Right-aligned tabular figures. */
  numeric?: boolean;
  className?: string;
  /**
   * Place on a phone card. With no column marked `title`, the first column
   * is the title; every other column is a `field` unless it says otherwise.
   */
  card?: DataTableCardSlot;
  /** The field's label on a card when `header` is not plain text. */
  cardLabel?: string;
  /** A shorter rendering for the card, e.g. a date without the time. */
  cardCell?: (row: T) => React.ReactNode;
  /** Only on cards, never a table column (e.g. a subtitle the table shows in another cell). */
  cardOnly?: boolean;
  /** Leave the column out of the table below this width (tablets). */
  hideBelow?: DataTableBreakpoint;
}

export interface DataTablePaginateOptions {
  /** Starting rows per page; the first option by default. */
  pageSize?: number;
  /** 25, 50 and 100 by default. */
  pageSizeOptions?: readonly number[];
  /** Remembers the chosen page size in localStorage under this key. */
  storageKey?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface DataTableSort {
  columnId: string;
  direction: SortDirection;
}

export interface DataTableProps<T> extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Required: what the table lists, e.g. "Workspace members". */
  'aria-label': string;
  columns: DataTableColumn<T>[];
  /** The rows to show now: already sorted, filtered and paged by the app or server. */
  rows: T[];
  getRowId: (row: T) => string;
  /** Names a row for screen readers ("Select Ada Lovelace"). Defaults to its id. */
  getRowLabel?: (row: T) => string;

  /** Controlled sort. A sortable header cycles ascending, descending, none. */
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;

  /** Controlled filter text; a search box appears when onFilterChange is set. */
  filter?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;

  /** Controlled selection by row id; checkboxes appear when onSelectedChange is set. */
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;

  /** Enter or a click on the row, e.g. open the record. */
  onRowAction?: (row: T) => void;
  /** Per-row controls in a trailing column, e.g. a DropdownMenu. */
  rowActions?: (row: T) => React.ReactNode;

  /** 1-based; Pagination appears when onPageChange is set. */
  page?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  /** e.g. "1–25 of 312". Worked out from `totalRows` and `pageSize` when left out. */
  pageSummary?: React.ReactNode;
  /** Rows per page, for the page-size menu and the summary. */
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  /** Adds a rows-per-page menu beside the pages. */
  onPageSizeChange?: (pageSize: number) => void;
  /** Every row on every page (server paging), for the summary. */
  totalRows?: number;
  /**
   * Page in the browser: pass every row in `rows` and the table shows one
   * page, with a rows-per-page menu. It goes back to page 1 when `filter` or
   * `sort` changes. Leave out to page in your app or on the server.
   */
  paginate?: boolean | DataTablePaginateOptions;
  /** Plural noun appended to the built-in summary: "1–25 of 312 members". */
  rowNoun?: string;

  loading?: boolean;
  /** A message shown in place of the rows. */
  error?: React.ReactNode;
  onRetry?: () => void;
  /** Shown when there are no rows and nothing failed. */
  empty?: React.ReactNode;
  /** Extra controls beside the search box, e.g. filters or a bulk action. */
  toolbar?: React.ReactNode;
  density?: 'compact' | 'default';
  stickyHeader?: boolean;
  /**
   * Below this width the rows become a list of cards (see DataTableColumn
   * `card`). `md` (768px) by default; `false` keeps the table everywhere.
   */
  cardsBelow?: DataTableBreakpoint | false;
}

const BREAKPOINTS: Record<DataTableBreakpoint, number> = { sm: 640, md: 768, lg: 1024, xl: 1280 };

const hideBelowClass: Record<DataTableBreakpoint, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

const subscribeNone = () => () => undefined;

/**
 * True while the viewport is narrower than `bp`. Without matchMedia (server
 * render, tests) it is false, so the table is the fallback.
 */
function useNarrowerThan(bp: DataTableBreakpoint | false): boolean {
  const query = bp ? `(max-width: ${BREAKPOINTS[bp] - 0.02}px)` : null;
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (!query || typeof matchMedia !== 'function') return () => undefined;
      const mq = matchMedia(query);
      mq.addEventListener?.('change', onChange);
      return () => mq.removeEventListener?.('change', onChange);
    },
    [query],
  );
  return React.useSyncExternalStore(
    query ? subscribe : subscribeNone,
    () => Boolean(query && typeof matchMedia === 'function' && matchMedia(query).matches),
    () => false,
  );
}

const textOf = (node: React.ReactNode): string | undefined =>
  typeof node === 'string' || typeof node === 'number' ? String(node) : undefined;

const nextSort = (current: DataTableSort | null | undefined, id: string): DataTableSort | null => {
  if (!current || current.columnId !== id) return { columnId: id, direction: 'asc' };
  return current.direction === 'asc' ? { columnId: id, direction: 'desc' } : null;
};

// Clicks and keys aimed at these belong to them, not to the row.
const INTERACTIVE = 'a,button,input,select,textarea,[role="checkbox"],[role="menuitem"]';

/**
 * A table recipe for records: sort, search, select, page, and row actions,
 * with loading, empty and error states. Fully controlled, so the data can
 * come from a server; the table never reorders rows itself. On a phone the
 * rows become cards (`cardsBelow`), with the same columns.
 */
function DataTable<T>({
  'aria-label': ariaLabel,
  columns,
  rows: rowsProp,
  getRowId,
  getRowLabel,
  sort,
  onSortChange,
  filter,
  onFilterChange,
  filterPlaceholder = 'Search',
  selected,
  onSelectedChange,
  onRowAction,
  rowActions,
  page,
  pageCount,
  onPageChange,
  pageSummary,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  totalRows,
  paginate,
  rowNoun,
  loading = false,
  error,
  onRetry,
  empty = 'No results.',
  toolbar,
  density = 'default',
  stickyHeader,
  cardsBelow = 'md',
  className,
  ...props
}: DataTableProps<T>) {
  const paginateOptions = paginate === true ? {} : paginate || undefined;
  const paging = usePagination(rowsProp, {
    defaultPageSize: paginateOptions?.pageSize,
    pageSizeOptions: paginateOptions?.pageSizeOptions,
    storageKey: paginateOptions?.storageKey,
    // A new search or sort starts again at page 1.
    resetKey: `${filter ?? ''}\u0000${sort?.columnId ?? ''}\u0000${sort?.direction ?? ''}`,
  });
  const rows = paginateOptions ? paging.rows : rowsProp;
  const cards = useNarrowerThan(cardsBelow);
  const uid = React.useId();

  const selectable = Boolean(onSelectedChange);
  const selectedSet = React.useMemo(() => new Set(selected ?? []), [selected]);
  const ids = rows.map(getRowId);
  const pageSelected = ids.filter((id) => selectedSet.has(id)).length;
  const allState: boolean | 'indeterminate' =
    ids.length > 0 && pageSelected === ids.length
      ? true
      : pageSelected > 0
        ? 'indeterminate'
        : false;
  const tableColumns = columns.filter((c) => !c.cardOnly);
  const colCount = tableColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const interactive = Boolean(onRowAction) || selectable;

  // One tab stop in the body: the active row. Arrows move it.
  const [active, setActive] = React.useState(0);
  const frameRef = React.useRef<HTMLDivElement>(null);
  // Rows can shrink under the active index (a new page, a filter).
  const activeRow = Math.min(active, Math.max(0, rows.length - 1));

  const toggle = (id: string) => {
    if (!onSelectedChange) return;
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedChange([...next]);
  };
  const toggleAll = () => {
    if (!onSelectedChange) return;
    const next = new Set(selectedSet);
    if (allState === true) ids.forEach((id) => next.delete(id));
    else ids.forEach((id) => next.add(id));
    onSelectedChange([...next]);
  };
  const focusRow = (i: number) => {
    const clamped = Math.min(Math.max(i, 0), rows.length - 1);
    setActive(clamped);
    frameRef.current
      ?.querySelectorAll<HTMLElement>('[data-slot="table-body"] > [data-slot="table-row"]')
      [clamped]?.focus();
  };

  const onRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, i: number, row: T) => {
    if (event.target !== event.currentTarget) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusRow(i + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusRow(i - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusRow(0);
        break;
      case 'End':
        event.preventDefault();
        focusRow(rows.length - 1);
        break;
      case 'Enter':
        if (onRowAction) {
          event.preventDefault();
          onRowAction(row);
        }
        break;
      case ' ':
        if (selectable) {
          event.preventDefault();
          toggle(getRowId(row));
        }
        break;
    }
  };

  // Headers are gone on cards, so sorting moves to a menu in the toolbar.
  const sortable = onSortChange ? columns.filter((c) => c.sortable) : [];
  const columnLabel = (c: DataTableColumn<T>) => c.cardLabel ?? textOf(c.header) ?? c.id;
  const cardSort =
    cards && sortable.length > 0 && onSortChange ? (
      <Select
        value={sort ? `${sort.columnId}:${sort.direction}` : 'none'}
        onValueChange={(v) => {
          if (v === 'none') return onSortChange(null);
          const [columnId = '', direction] = v.split(':');
          onSortChange({ columnId, direction: direction === 'desc' ? 'desc' : 'asc' });
        }}
      >
        <SelectTrigger aria-label="Sort by" className="pointer-coarse:h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="none">Default order</SelectItem>
          {sortable.flatMap((c) => [
            <SelectItem key={`${c.id}:asc`} value={`${c.id}:asc`}>
              {columnLabel(c)} ascending
            </SelectItem>,
            <SelectItem key={`${c.id}:desc`} value={`${c.id}:desc`}>
              {columnLabel(c)} descending
            </SelectItem>,
          ])}
        </SelectContent>
      </Select>
    ) : null;
  const cardSelectAll =
    cards && selectable ? (
      <label
        htmlFor={`${uid}-all`}
        className="flex min-h-11 cursor-pointer items-center gap-2.5 pr-1 text-sm sm:min-h-9"
      >
        <Checkbox
          id={`${uid}-all`}
          checked={allState}
          onCheckedChange={toggleAll}
          disabled={rows.length === 0}
          aria-label="Select all rows on this page"
        />
        Select all
      </label>
    ) : null;

  const showToolbar = Boolean(
    onFilterChange || toolbar || (selectable && selectedSet.size) || cardSort || cardSelectAll,
  );

  const withNoun = (summary: string, total: number) =>
    rowNoun && total ? `${summary} ${rowNoun}` : summary;
  let pager: React.ReactNode = null;
  if (paginateOptions) {
    if (paging.hasPages)
      pager = (
        <Pagination {...paging.paginationProps} summary={withNoun(paging.summary, paging.total)} />
      );
  } else if (onPageChange && page !== undefined && pageCount !== undefined && pageCount > 0) {
    pager = (
      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={onPageChange}
        summary={
          pageSummary ??
          (totalRows !== undefined && pageSize
            ? withNoun(
                paginationSummary(pageWindow({ page, pageSize, total: totalRows })),
                totalRows,
              )
            : undefined)
        }
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    );
  }

  const toolbarNode = showToolbar && (
    <div className="flex flex-wrap items-center gap-2">
      {onFilterChange && (
        <div className="relative min-w-0 basis-full sm:max-w-xs sm:flex-1 sm:basis-0">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={filter ?? ''}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder={filterPlaceholder}
            aria-label={`Search ${ariaLabel.toLowerCase()}`}
            className="pl-8"
          />
        </div>
      )}
      {cardSelectAll}
      {selectable && (
        <span aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
          {selectedSet.size ? `${selectedSet.size} selected` : ''}
        </span>
      )}
      {(toolbar || cardSort) && (
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {cardSort}
          {toolbar}
        </div>
      )}
    </div>
  );

  return (
    <div
      data-slot="data-table"
      data-layout={cards ? 'cards' : 'table'}
      // One minmax(0,1fr) track: a wide table scrolls inside its frame instead
      // of stretching a grid or flex parent.
      className={cn('grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3', className)}
      {...props}
    >
      {toolbarNode}
      {cards ? (
        <DataTableCards
          aria-label={ariaLabel}
          columns={columns}
          rows={rows}
          getRowId={getRowId}
          getRowLabel={getRowLabel}
          selectedSet={selectedSet}
          onToggle={selectable ? toggle : undefined}
          onRowAction={onRowAction}
          rowActions={rowActions}
          loading={loading}
          error={error}
          onRetry={onRetry}
          empty={empty}
        />
      ) : (
        <div ref={frameRef} className="rounded-lg border bg-surface">
          <Table
            aria-label={ariaLabel}
            scrollLabel={ariaLabel}
            aria-busy={loading || undefined}
            density={density}
            stickyHeader={stickyHeader}
            className={cn(loading && rows.length > 0 && 'opacity-60 transition-opacity')}
          >
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {selectable && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allState}
                      onCheckedChange={toggleAll}
                      disabled={rows.length === 0}
                      aria-label="Select all rows on this page"
                    />
                  </TableHead>
                )}
                {tableColumns.map((col) => {
                  const sorted = sort?.columnId === col.id ? sort.direction : undefined;
                  return (
                    <TableHead
                      key={col.id}
                      numeric={col.numeric}
                      className={cn(col.hideBelow && hideBelowClass[col.hideBelow], col.className)}
                      aria-sort={
                        col.sortable
                          ? sorted === 'asc'
                            ? 'ascending'
                            : sorted === 'desc'
                              ? 'descending'
                              : 'none'
                          : undefined
                      }
                    >
                      {col.sortable && onSortChange ? (
                        <button
                          type="button"
                          onClick={() => onSortChange(nextSort(sort, col.id))}
                          className={cn(
                            '-mx-1.5 inline-flex h-7 items-center gap-1 rounded-sm px-1.5 uppercase outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/20',
                            sorted && 'text-foreground',
                            col.numeric && 'flex-row-reverse',
                          )}
                        >
                          {col.header}
                          {sorted === 'asc' ? (
                            <ArrowUp className="size-3.5" aria-hidden />
                          ) : sorted === 'desc' ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <ChevronsUpDown className="size-3.5 opacity-50" aria-hidden />
                          )}
                        </button>
                      ) : (
                        col.header
                      )}
                    </TableHead>
                  );
                })}
                {rowActions && (
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {error ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={colCount}
                    className="h-auto py-8 text-center whitespace-normal"
                  >
                    <ErrorMessage error={error} onRetry={onRetry} />
                  </TableCell>
                </TableRow>
              ) : loading && rows.length === 0 ? (
                Array.from({ length: 3 }, (_, r) => (
                  <TableRow key={`loading-${r}`} className="hover:bg-transparent" aria-hidden>
                    {Array.from({ length: colCount }, (_, c) => (
                      <TableCell key={c}>
                        <Skeleton className="h-3.5 w-full max-w-40" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={colCount}
                    className="h-auto py-10 text-center whitespace-normal text-muted-foreground"
                  >
                    {empty}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, i) => {
                  const id = getRowId(row);
                  const isSelected = selectedSet.has(id);
                  const label = getRowLabel?.(row) ?? id;
                  return (
                    <TableRow
                      key={id}
                      selected={isSelected}
                      tabIndex={interactive ? (i === activeRow ? 0 : -1) : undefined}
                      onFocus={() => setActive(i)}
                      onKeyDown={interactive ? (e) => onRowKeyDown(e, i, row) : undefined}
                      onClick={
                        onRowAction
                          ? (e) => {
                              if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
                              onRowAction(row);
                            }
                          : undefined
                      }
                      className={cn(
                        interactive &&
                          'outline-none focus-visible:bg-muted/60 focus-visible:shadow-[inset_2px_0_0_var(--ring)]',
                        onRowAction && 'cursor-pointer',
                      )}
                    >
                      {selectable && (
                        <TableCell className="w-10">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggle(id)}
                            aria-label={`Select ${label}`}
                            tabIndex={-1}
                          />
                        </TableCell>
                      )}
                      {tableColumns.map((col) => (
                        <TableCell
                          key={col.id}
                          numeric={col.numeric}
                          className={cn(
                            col.hideBelow && hideBelowClass[col.hideBelow],
                            col.className,
                          )}
                        >
                          {col.cell(row)}
                        </TableCell>
                      ))}
                      {rowActions && (
                        <TableCell className="w-12 text-right">{rowActions(row)}</TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
      {pager}
    </div>
  );
}

function ErrorMessage({ error, onRetry }: { error: React.ReactNode; onRetry?: () => void }) {
  return (
    <div role="alert" className="grid justify-items-center gap-3 text-sm">
      <span className="text-destructive">{error}</span>
      {onRetry && (
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

const cardLabelClass =
  'text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase';

/**
 * The phone layout: a list of articles, one per row, each named by its title.
 * The title is the row's open button (its hit area covers the card); the
 * checkbox, row actions and footer controls sit above it and keep their own
 * clicks. No roving focus: Tab walks the controls, as in any list of links.
 */
function DataTableCards<T>({
  'aria-label': ariaLabel,
  columns,
  rows,
  getRowId,
  getRowLabel,
  selectedSet,
  onToggle,
  onRowAction,
  rowActions,
  loading,
  error,
  onRetry,
  empty,
}: {
  'aria-label': string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  getRowLabel?: (row: T) => string;
  selectedSet: Set<string>;
  onToggle?: (id: string) => void;
  onRowAction?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  loading: boolean;
  error?: React.ReactNode;
  onRetry?: () => void;
  empty: React.ReactNode;
}) {
  const uid = React.useId();
  if (error)
    return (
      <div className="rounded-lg border bg-surface px-4 py-8">
        <ErrorMessage error={error} onRetry={onRetry} />
      </div>
    );
  if (rows.length === 0 && !loading)
    return (
      <div className="rounded-lg border bg-surface px-4 py-10 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );

  const visible = columns.filter((c) => c.card !== 'hidden');
  // With no column marked as the title, the first unplaced column is it.
  const firstUnplaced = visible.some((c) => c.card === 'title')
    ? undefined
    : visible.find((c) => c.card === undefined);
  const slotOf = (c: DataTableColumn<T>): DataTableCardSlot =>
    c.card ?? (c === firstUnplaced ? 'title' : 'field');
  const inSlot = (s: DataTableCardSlot) => visible.filter((c) => slotOf(c) === s);
  const title = inSlot('title');
  const subtitle = inSlot('subtitle');
  const aside = inSlot('aside');
  const fields = inSlot('field');
  const footer = inSlot('footer');
  const show = (c: DataTableColumn<T>, row: T) => (c.cardCell ?? c.cell)(row);

  return (
    // role="list": Safari drops list semantics from a list with no bullets.
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <ul
      role="list"
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      data-slot="data-table-cards"
      className={cn('grid gap-2', loading && rows.length > 0 && 'opacity-60 transition-opacity')}
    >
      {loading && rows.length === 0
        ? Array.from({ length: 3 }, (_, r) => (
            <li
              key={`loading-${r}`}
              aria-hidden
              className="grid gap-3 rounded-lg border bg-surface p-3.5"
            >
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3.5 w-3/4" />
            </li>
          ))
        : rows.map((row, i) => {
            const id = getRowId(row);
            const label = getRowLabel?.(row) ?? id;
            const isSelected = selectedSet.has(id);
            const titleId = `${uid}-${i}`;
            return (
              <li key={id}>
                <article
                  aria-labelledby={title.length ? titleId : undefined}
                  aria-label={title.length ? undefined : label}
                  data-slot="data-table-card"
                  data-state={isSelected ? 'selected' : undefined}
                  className={cn(
                    'relative grid gap-3 rounded-lg border bg-surface p-3.5 shadow-xs transition-colors',
                    onRowAction &&
                      'hover:bg-muted/40 has-[[data-row-action]:focus-visible]:border-ring has-[[data-row-action]:focus-visible]:inset-ring-1 has-[[data-row-action]:focus-visible]:inset-ring-ring',
                    'data-[state=selected]:border-brand/40 data-[state=selected]:bg-brand-soft/60',
                  )}
                >
                  <div className="flex items-start gap-3">
                    {onToggle && (
                      // A 44px target around the 16px box.
                      <label
                        htmlFor={`${titleId}-select`}
                        className="relative z-10 -mx-3.5 -my-3 grid size-11 shrink-0 cursor-pointer place-items-center"
                      >
                        <Checkbox
                          id={`${titleId}-select`}
                          checked={isSelected}
                          onCheckedChange={() => onToggle(id)}
                          aria-label={`Select ${label}`}
                        />
                      </label>
                    )}
                    <div className="grid min-w-0 flex-1 gap-0.5">
                      {title.map((c, j) => (
                        <div
                          key={c.id}
                          id={j === 0 ? titleId : undefined}
                          className="min-w-0 text-[15px] leading-5 font-semibold [overflow-wrap:anywhere]"
                        >
                          {onRowAction && j === 0 ? (
                            <button
                              type="button"
                              data-row-action=""
                              onClick={() => onRowAction(row)}
                              className="text-left outline-hidden! after:absolute after:inset-0 after:rounded-lg"
                            >
                              {show(c, row)}
                            </button>
                          ) : (
                            show(c, row)
                          )}
                        </div>
                      ))}
                    </div>
                    {aside.length > 0 && (
                      <div className="relative z-10 flex shrink-0 flex-col items-end gap-1">
                        {aside.map((c) => (
                          <div key={c.id}>{show(c, row)}</div>
                        ))}
                      </div>
                    )}
                    {rowActions && (
                      <div className="relative z-10 -my-2.5 -mr-1.5 shrink-0">
                        {rowActions(row)}
                      </div>
                    )}
                  </div>
                  {subtitle.length > 0 && (
                    // Under the header row, not beside the status, so it gets the card's width.
                    <div className={cn('-mt-2 grid min-w-0 gap-0.5', onToggle && 'pl-7')}>
                      {subtitle.map((c) => (
                        <div
                          key={c.id}
                          className="min-w-0 text-sm text-muted-foreground [overflow-wrap:anywhere]"
                        >
                          {show(c, row)}
                        </div>
                      ))}
                    </div>
                  )}
                  {fields.length > 0 && (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                      {fields.map((c) => (
                        <div key={c.id} className="min-w-0">
                          <dt className={cardLabelClass}>{c.cardLabel ?? c.header}</dt>
                          <dd
                            className={cn(
                              'mt-0.5 min-w-0 [overflow-wrap:anywhere]',
                              c.numeric && 'tabular-nums',
                            )}
                          >
                            {show(c, row)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {footer.map((c) => (
                    <div key={c.id} className="relative z-10 flex flex-wrap gap-2">
                      {show(c, row)}
                    </div>
                  ))}
                </article>
              </li>
            );
          })}
    </ul>
  );
}

export { DataTable };
