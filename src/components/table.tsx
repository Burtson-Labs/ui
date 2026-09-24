import * as React from 'react';

import { cn } from '../lib/utils';

export interface TableProps extends React.ComponentProps<'table'> {
  /** `compact` for dense ops screens (32px rows), `default` 40px. */
  density?: 'compact' | 'default';
  /** Keep the header visible while the container scrolls; give it a height. */
  stickyHeader?: boolean;
  containerClassName?: string;
}

function Table({
  className,
  density = 'default',
  stickyHeader = false,
  containerClassName,
  ...props
}: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-density={density}
      data-sticky={stickyHeader || undefined}
      className={cn('group/table relative w-full overflow-auto', containerClassName)}
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-[13px]', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        'bg-surface-muted [&_tr]:border-b group-data-[sticky]/table:sticky group-data-[sticky]/table:top-0 group-data-[sticky]/table:z-10',
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn('border-t bg-surface-muted font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

/** Set `data-state="selected"` (or `selected`) to mark a chosen row. */
function TableRow({
  className,
  selected,
  ...props
}: React.ComponentProps<'tr'> & { selected?: boolean }) {
  return (
    <tr
      data-slot="table-row"
      data-state={selected ? 'selected' : undefined}
      aria-selected={selected || undefined}
      className={cn(
        'border-b transition-colors hover:bg-muted/60 data-[state=selected]:bg-brand-soft/60 data-[state=selected]:shadow-[inset_2px_0_0_var(--color-brand)]',
        className,
      )}
      {...props}
    />
  );
}

/** `numeric` right-aligns with tabular figures, for counts, money and durations. */
function TableHead({
  className,
  numeric,
  ...props
}: React.ComponentProps<'th'> & { numeric?: boolean }) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-9 px-3 text-left align-middle text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap text-muted-foreground uppercase group-data-[density=compact]/table:h-8 [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0',
        numeric && 'text-right tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({
  className,
  numeric,
  ...props
}: React.ComponentProps<'td'> & { numeric?: boolean }) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'h-10 px-3 align-middle whitespace-nowrap group-data-[density=compact]/table:h-8 [&:has([role=checkbox])]:pr-0',
        numeric && 'text-right font-mono text-[12.5px] tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-3 text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
