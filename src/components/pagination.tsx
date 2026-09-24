import ChevronLeft from '@burtson-labs/icons/react/chevron-left';
import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Button } from './button';

/**
 * The page numbers to show: always the first and last page, `siblings` pages
 * either side of the current one, and 'ellipsis' for the gaps.
 */
export function paginationRange(
  page: number,
  pageCount: number,
  siblings = 1,
): (number | 'ellipsis')[] {
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

export interface PaginationProps extends Omit<React.ComponentProps<'nav'>, 'onChange'> {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  siblings?: number;
  /** Optional summary on the left, e.g. "1–25 of 312". */
  summary?: React.ReactNode;
}

/** Page controls for a table or list. Buttons are real buttons, keyboard-reachable. */
function Pagination({
  page,
  pageCount,
  onPageChange,
  siblings = 1,
  summary,
  className,
  ...props
}: PaginationProps) {
  const pages = paginationRange(page, pageCount, siblings);
  const go = (p: number) => onPageChange(Math.min(Math.max(1, p), Math.max(1, pageCount)));
  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
      {...props}
    >
      <div className="text-xs text-muted-foreground tabular-nums">{summary}</div>
      <ul className="flex items-center gap-1">
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => go(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        </li>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <li key={`e${i}`} aria-hidden className="px-1 text-muted-foreground">
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
        <li className="px-2 text-xs text-muted-foreground tabular-nums sm:hidden">
          {page} / {pageCount}
        </li>
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => go(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight aria-hidden />
          </Button>
        </li>
      </ul>
    </nav>
  );
}

export { Pagination };
