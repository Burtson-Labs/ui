import ArrowDown from '@burtson-labs/icons/react/arrow-down';
import ArrowUp from '@burtson-labs/icons/react/arrow-up';
import ChevronsUpDown from '@burtson-labs/icons/react/chevrons-up-down';
import Search from '@burtson-labs/icons/react/search';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';
import { Checkbox } from './checkbox';
import { Input } from './input';
import { Pagination } from './pagination';
import { Skeleton } from './skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  /** Right-aligned tabular figures. */
  numeric?: boolean;
  className?: string;
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
  /** e.g. "1–25 of 312". */
  pageSummary?: React.ReactNode;

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
}

const nextSort = (current: DataTableSort | null | undefined, id: string): DataTableSort | null => {
  if (!current || current.columnId !== id) return { columnId: id, direction: 'asc' };
  return current.direction === 'asc' ? { columnId: id, direction: 'desc' } : null;
};

// Clicks and keys aimed at these belong to them, not to the row.
const INTERACTIVE = 'a,button,input,select,textarea,[role="checkbox"],[role="menuitem"]';

/**
 * A table recipe for records: sort, search, select, page, and row actions,
 * with loading, empty and error states. Fully controlled, so the data can
 * come from a server; the table never reorders rows itself.
 */
function DataTable<T>({
  'aria-label': ariaLabel,
  columns,
  rows,
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
  loading = false,
  error,
  onRetry,
  empty = 'No results.',
  toolbar,
  density = 'default',
  stickyHeader,
  className,
  ...props
}: DataTableProps<T>) {
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
  const colCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
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

  const showToolbar = Boolean(onFilterChange || toolbar || (selectable && selectedSet.size));
  let body: React.ReactNode;
  if (error) {
    body = (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={colCount} className="h-auto py-8 text-center whitespace-normal">
          <div role="alert" className="grid justify-items-center gap-3 text-sm">
            <span className="text-destructive">{error}</span>
            {onRetry && (
              <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                Try again
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  } else if (loading && rows.length === 0) {
    body = Array.from({ length: 3 }, (_, r) => (
      <TableRow key={`loading-${r}`} className="hover:bg-transparent" aria-hidden>
        {Array.from({ length: colCount }, (_, c) => (
          <TableCell key={c}>
            <Skeleton className="h-3.5 w-full max-w-40" />
          </TableCell>
        ))}
      </TableRow>
    ));
  } else if (rows.length === 0) {
    body = (
      <TableRow className="hover:bg-transparent">
        <TableCell
          colSpan={colCount}
          className="h-auto py-10 text-center whitespace-normal text-muted-foreground"
        >
          {empty}
        </TableCell>
      </TableRow>
    );
  } else {
    body = rows.map((row, i) => {
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
          {columns.map((col) => (
            <TableCell key={col.id} numeric={col.numeric} className={col.className}>
              {col.cell(row)}
            </TableCell>
          ))}
          {rowActions && <TableCell className="w-12 text-right">{rowActions(row)}</TableCell>}
        </TableRow>
      );
    });
  }

  return (
    <div data-slot="data-table" className={cn('grid min-w-0 gap-3', className)} {...props}>
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          {onFilterChange && (
            <div className="relative w-full max-w-xs min-w-0 flex-1">
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
          {selectable && (
            <span aria-live="polite" className="text-xs text-muted-foreground tabular-nums">
              {selectedSet.size ? `${selectedSet.size} selected` : ''}
            </span>
          )}
          {toolbar && <div className="ml-auto flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}
      <div ref={frameRef} className="rounded-lg border bg-surface">
        <Table
          aria-label={ariaLabel}
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
              {columns.map((col) => {
                const sorted = sort?.columnId === col.id ? sort.direction : undefined;
                return (
                  <TableHead
                    key={col.id}
                    numeric={col.numeric}
                    className={col.className}
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
          <TableBody>{body}</TableBody>
        </Table>
      </div>
      {onPageChange && page !== undefined && pageCount !== undefined && pageCount > 0 && (
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={onPageChange}
          summary={pageSummary}
        />
      )}
    </div>
  );
}

export { DataTable };
