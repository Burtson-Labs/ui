import * as React from 'react';

import { cn } from '../lib/utils';

export interface TableProps extends React.ComponentProps<'table'> {
  /** `compact` for dense ops screens (32px rows), `default` 40px. */
  density?: 'compact' | 'default';
  /** Keep the header visible while the container scrolls; give it a height. */
  stickyHeader?: boolean;
  containerClassName?: string;
  /**
   * Props for the scrolling wrapper (`tabIndex`, `role`, `aria-*`, `ref`, ...).
   * Anything set here wins over what `scrollLabel` sets.
   */
  containerProps?: React.ComponentProps<'div'>;
  /**
   * Accessible name for the scroll container. With it (or an `aria-label` /
   * `aria-labelledby` in `containerProps`) the wrapper becomes a named region
   * that joins the tab order while its content overflows, so keyboard users
   * can scroll it (WCAG 2.1.1, axe scrollable-region-focusable).
   */
  scrollLabel?: string;
}

/** True while the element's content is larger than its box. */
function useOverflows(ref: React.RefObject<HTMLElement | null>, enabled: boolean): boolean {
  const [overflows, setOverflows] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const update = () =>
      setOverflows(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [ref, enabled]);
  return overflows;
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

function Table({
  className,
  density = 'default',
  stickyHeader = false,
  containerClassName,
  containerProps,
  scrollLabel,
  ...props
}: TableProps) {
  const {
    className: containerPropsClassName,
    ref: containerRef,
    ...wrapperProps
  } = containerProps ?? {};
  const local = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      local.current = node;
      assignRef(containerRef, node);
    },
    [containerRef],
  );
  const named = Boolean(
    scrollLabel || wrapperProps['aria-label'] || wrapperProps['aria-labelledby'],
  );
  const overflows = useOverflows(local, named);
  return (
    <div
      data-slot="table-container"
      data-density={density}
      data-sticky={stickyHeader || undefined}
      role={named ? 'region' : undefined}
      aria-label={scrollLabel}
      // A scrollable region must be reachable by keyboard; only while it scrolls.
      tabIndex={named && overflows ? 0 : undefined}
      {...wrapperProps}
      ref={setRef}
      className={cn(
        'group/table relative w-full overflow-auto',
        containerClassName,
        containerPropsClassName,
      )}
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
