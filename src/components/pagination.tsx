import ChevronLeft from '@burtson-labs/icons/react/chevron-left';
import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

/**
 * The page numbers to show: always the first and last page, `siblings` pages
 * either side of the current one, and 'ellipsis' for the gaps.
 */
export function paginationRange(
  page: number,
  pageCount: number,
  siblings = 1,
): (number | 'ellipsis')[] {
  pageCount = Number.isFinite(pageCount) ? Math.max(0, Math.floor(pageCount)) : 0;
  siblings = Number.isFinite(siblings) ? Math.min(5, Math.max(0, Math.floor(siblings))) : 1;
  page = Number.isFinite(page) ? Math.max(1, Math.min(pageCount, Math.floor(page))) : 1;
  if (pageCount <= 0) return [];
  const window = siblings * 2 + 5; // first, last, current, siblings, two gaps
  if (pageCount <= window) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const start = Math.max(2, page - siblings);
  const end = Math.min(pageCount - 1, page + siblings);
  const out: (number | 'ellipsis')[] = [1];
  if (start > 2) out.push('ellipsis');
  for (let p = start; p <= end; p += 1) out.push(p);
  if (end < pageCount - 1) out.push('ellipsis');
  out.push(pageCount);
  return out;
}

/* ------------------------------------------------------------------------ */
/* Paging arithmetic: no React, for any list, table or server query.        */
/* ------------------------------------------------------------------------ */

/** The page sizes offered by default: 25, 50 or 100 rows. */
export const DEFAULT_PAGE_SIZES: readonly number[] = [25, 50, 100];

export interface PageWindow {
  /** 1-based, clamped to the pages that exist (1 when there are no rows). */
  page: number;
  /** At least 1, so "Page 1 of 1" reads sensibly for an empty list. */
  pageCount: number;
  pageSize: number;
  total: number;
  /** 1-based index of the first row on this page; 0 when there are none. */
  from: number;
  /** 1-based index of the last row on this page; 0 when there are none. */
  to: number;
}

/** Pages needed for `total` rows, never less than 1. */
export function pageCountFor(total: number, pageSize: number): number {
  if (!Number.isFinite(total) || total <= 0) return 1;
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 1;
  return Math.max(1, Math.ceil(total / size));
}

/** A requested page clamped to 1…pageCount. Anything unreadable ("abc", NaN) is page 1. */
export function clampPage(page: unknown, pageCount: number): number {
  const n = typeof page === 'number' ? page : Number(page);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(1, Math.floor(n)), Math.max(1, Math.floor(pageCount) || 1));
}

/** Where page `page` of `total` rows starts and ends, for server-side paging. */
export function pageWindow({
  page,
  pageSize,
  total,
}: {
  page: unknown;
  pageSize: number;
  total: number;
}): PageWindow {
  const size = Number.isFinite(pageSize) ? Math.max(1, Math.floor(pageSize)) : 1;
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const pageCount = pageCountFor(safeTotal, size);
  const p = clampPage(page, pageCount);
  const start = (p - 1) * size;
  const to = Math.min(start + size, safeTotal);
  return {
    page: p,
    pageCount,
    pageSize: size,
    total: safeTotal,
    from: safeTotal ? start + 1 : 0,
    to: safeTotal ? to : 0,
  };
}

/** One page of `rows`, with the numbers for the page controls. */
export function paginate<T>(
  rows: readonly T[],
  page: unknown,
  pageSize: number,
): PageWindow & { rows: T[] } {
  const w = pageWindow({ page, pageSize, total: rows.length });
  return { ...w, rows: rows.slice(w.from ? w.from - 1 : 0, w.to) };
}

/**
 * "1–25 of 312", "7 of 7" when everything fits, "0 of 0" when empty. Numbers
 * use the locale's grouping ("1,025"); pass `locale` to pin it.
 */
export function paginationSummary(
  { from, to, total }: Pick<PageWindow, 'from' | 'to' | 'total'>,
  locale?: string,
): string {
  const fmt = new Intl.NumberFormat(locale);
  if (!total) return '0 of 0';
  if (from === 1 && to === total) return `${fmt.format(total)} of ${fmt.format(total)}`;
  return `${fmt.format(from)}–${fmt.format(to)} of ${fmt.format(total)}`;
}

const storedSizeKey = (key: string) => `bl-page-size:${key}`;

function readStoredSize(key: string | undefined, options: readonly number[]): number | undefined {
  if (!key) return undefined;
  try {
    const n = Number(globalThis.localStorage?.getItem(storedSizeKey(key)));
    return options.includes(n) ? n : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredSize(key: string | undefined, size: number) {
  if (!key) return;
  try {
    globalThis.localStorage?.setItem(storedSizeKey(key), String(size));
  } catch {
    // Storage blocked (private mode, a sandboxed frame): the size is not remembered.
  }
}

export interface UsePaginationOptions {
  /** Controlled page (e.g. read from the URL). Leave out to let the hook keep it. */
  page?: number;
  /** Starting page when uncontrolled. */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Controlled page size. */
  pageSize?: number;
  /** Starting page size when uncontrolled; the first option by default. */
  defaultPageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  /** Sizes offered by the page-size menu. */
  pageSizeOptions?: readonly number[];
  /**
   * Whatever decides which rows are listed (search text, a filter, a tab).
   * When it changes, paging goes back to page 1. The first render never
   * resets, so a link to page 3 stays on page 3.
   */
  resetKey?: unknown;
  /** Remembers the chosen page size in localStorage under this key. */
  storageKey?: string;
  /**
   * The full row count when the server pages: `rows` is then already the
   * current page and is not sliced.
   */
  total?: number;
  /** Locale for the summary's numbers. */
  locale?: string;
}

export interface UsePaginationResult<T> extends PageWindow {
  /** The rows to render on this page. */
  rows: T[];
  pageSizeOptions: readonly number[];
  /** "1–25 of 312". */
  summary: string;
  /** More rows than the smallest page size: worth showing controls for. */
  hasPages: boolean;
  setPage: (page: number) => void;
  /** Changes the size and goes back to page 1. */
  setPageSize: (pageSize: number) => void;
  /** Spread onto Pagination (or pass to DataTable's paging props). */
  paginationProps: Pick<
    PaginationProps,
    'page' | 'pageCount' | 'onPageChange' | 'pageSize' | 'pageSizeOptions' | 'onPageSizeChange'
  > & { summary: string };
}

/**
 * Headless paging for a list or table: slices `rows`, clamps the page,
 * returns to page 1 when `resetKey` changes, and optionally remembers the
 * page size. Controlled `page` / `pageSize` let an app keep them in the URL.
 */
export function usePagination<T>(
  rows: readonly T[],
  options: UsePaginationOptions = {},
): UsePaginationResult<T> {
  const {
    page: pageProp,
    defaultPage = 1,
    onPageChange,
    pageSize: pageSizeProp,
    defaultPageSize,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    resetKey,
    storageKey,
    total: serverTotal,
    locale,
  } = options;

  const [pageState, setPageState] = React.useState(defaultPage);
  const [sizeState, setSizeState] = React.useState<number>(
    () =>
      readStoredSize(storageKey, pageSizeOptions) ?? defaultPageSize ?? pageSizeOptions[0] ?? 25,
  );
  const page = pageProp ?? pageState;
  const pageSize = pageSizeProp ?? sizeState;

  // Keep the latest callbacks without making the setters change every render.
  const latest = React.useRef({ onPageChange, onPageSizeChange, pageProp, storageKey });
  React.useEffect(() => {
    latest.current = { onPageChange, onPageSizeChange, pageProp, storageKey };
  });

  const setPage = React.useCallback((next: number) => {
    setPageState(next);
    latest.current.onPageChange?.(next);
  }, []);
  const setPageSize = React.useCallback((next: number) => {
    writeStoredSize(latest.current.storageKey, next);
    setSizeState(next);
    setPageState(1);
    latest.current.onPageSizeChange?.(next);
    latest.current.onPageChange?.(1);
  }, []);

  // A new filter starts again at page 1: during render for local state (no
  // flash of an empty page), and after it for a controlled page.
  const [lastKey, setLastKey] = React.useState(resetKey);
  if (!Object.is(lastKey, resetKey)) {
    setLastKey(resetKey);
    setPageState(1);
  }
  const committedKey = React.useRef(resetKey);
  React.useEffect(() => {
    if (Object.is(committedKey.current, resetKey)) return;
    committedKey.current = resetKey;
    const { pageProp: controlled, onPageChange: report } = latest.current;
    if (controlled !== undefined && controlled !== 1) report?.(1);
  }, [resetKey]);

  const w =
    serverTotal === undefined
      ? paginate(rows, page, pageSize)
      : { ...pageWindow({ page, pageSize, total: serverTotal }), rows: [...rows] };
  const summary = paginationSummary(w, locale);
  const hasPages = w.total > Math.min(...pageSizeOptions, w.pageSize);

  return {
    ...w,
    pageSizeOptions,
    summary,
    hasPages,
    setPage,
    setPageSize,
    paginationProps: {
      page: w.page,
      pageCount: w.pageCount,
      onPageChange: setPage,
      pageSize: w.pageSize,
      pageSizeOptions,
      onPageSizeChange: setPageSize,
      summary,
    },
  };
}

/* ------------------------------------------------------------------------ */
/* The controls.                                                             */
/* ------------------------------------------------------------------------ */

export interface PaginationProps extends Omit<React.ComponentProps<'nav'>, 'onChange'> {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  /** Summary on the left, e.g. "1–25 of 312". Worked out from `total` when left out. */
  summary?: React.ReactNode;
  /** Total rows: with `pageSize`, gives the default summary. */
  total?: number;
  /** Rows per page, shown in the page-size menu. */
  pageSize?: number;
  /** Sizes in the page-size menu (25, 50, 100 by default). */
  pageSizeOptions?: readonly number[];
  /** Adds a rows-per-page menu. */
  onPageSizeChange?: (pageSize: number) => void;
  /** The page-size menu's accessible name. */
  pageSizeLabel?: string;
  /** An option's text, e.g. "25 per page". */
  formatPageSize?: (size: number) => string;
}

/**
 * Page controls for a table or list: a summary, the pages, and optionally a
 * rows-per-page menu. Below 640px it becomes "Page 2 of 13" between large
 * previous and next buttons. Buttons are real buttons, keyboard-reachable,
 * and 44px on touch screens.
 */
function Pagination({
  page: requestedPage,
  pageCount: requestedCount,
  onPageChange,
  siblings = 1,
  summary,
  total,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageSizeChange,
  pageSizeLabel = 'Rows per page',
  formatPageSize = (size) => `${size} per page`,
  className,
  ...props
}: PaginationProps) {
  const pageCount = Number.isFinite(requestedCount) ? Math.max(0, Math.floor(requestedCount)) : 0;
  const page =
    pageCount === 0
      ? 0
      : Number.isFinite(requestedPage)
        ? Math.max(1, Math.min(pageCount, Math.floor(requestedPage)))
        : 1;
  const pages = paginationRange(page, pageCount, siblings);
  const go = (p: number) => onPageChange(Math.min(Math.max(1, p), Math.max(1, pageCount)));
  const shownSummary =
    summary ??
    (total !== undefined && pageSize
      ? paginationSummary(pageWindow({ page: page || 1, pageSize, total }))
      : null);
  const sizes =
    pageSize !== undefined && !pageSizeOptions.includes(pageSize)
      ? [...pageSizeOptions, pageSize].sort((a, b) => a - b)
      : pageSizeOptions;
  const position = `Page ${page} of ${pageCount}`;
  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn('flex flex-wrap items-center justify-between gap-x-3 gap-y-2', className)}
      {...props}
    >
      <div
        data-slot="pagination-summary"
        className="min-w-0 text-xs text-muted-foreground tabular-nums max-sm:order-2"
      >
        {shownSummary}
      </div>
      {/* Announced when the page changes; the visible "Page 2 of 13" is for phones. */}
      <span role="status" className="sr-only">
        {pageCount > 0 ? position : ''}
      </span>
      <ul className="flex items-center gap-1 max-sm:order-1 max-sm:w-full max-sm:justify-between">
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => go(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="max-sm:size-11 max-sm:border max-sm:border-border max-sm:px-0"
          >
            <ChevronLeft aria-hidden />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        </li>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <li key={`e${i}`} aria-hidden className="hidden px-1 text-muted-foreground sm:block">
              …
            </li>
          ) : (
            <li key={p} className="hidden sm:block">
              <Button
                variant={p === page ? 'outline' : 'ghost'}
                size="icon-sm"
                onClick={() => go(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                className={cn('tabular-nums', p === page && 'border-brand/40 text-brand')}
              >
                {p}
              </Button>
            </li>
          ),
        )}
        <li
          aria-hidden
          data-slot="pagination-position"
          className="px-2 text-sm font-medium tabular-nums sm:hidden"
        >
          {position}
        </li>
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => go(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
            className="max-sm:size-11 max-sm:border max-sm:border-border max-sm:px-0"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight aria-hidden />
          </Button>
        </li>
      </ul>
      {onPageSizeChange && (
        <Select
          value={pageSize !== undefined ? String(pageSize) : undefined}
          onValueChange={(v) => onPageSizeChange(Number(v))}
        >
          <SelectTrigger
            size="sm"
            aria-label={pageSizeLabel}
            className="w-auto gap-1.5 text-xs tabular-nums max-sm:order-3 pointer-coarse:h-11"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {sizes.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {formatPageSize(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </nav>
  );
}

export { Pagination };
