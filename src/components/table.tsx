import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';

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
  /**
   * Keep the first column in view while the table scrolls sideways (a name
   * column beside numbers). The pinned cells take the surface colour.
   */
  pinFirstColumn?: boolean;
  /**
   * The line under a table that scrolls sideways, until it is scrolled to the
   * end. Shown on touch screens only (a mouse has a scrollbar). `false`
   * turns it off.
   */
  overflowHint?: React.ReactNode | false;
}

/** How a box overflows sideways: more to the `end`, more to the `start`, or `both`. */
export function overflowState(el: {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
}): 'start' | 'end' | 'both' | undefined {
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 1) return undefined;
  if (el.scrollLeft <= 1) return 'end';
  if (el.scrollLeft >= max - 1) return 'start';
  return 'both';
}

/**
 * Tracks whether the element's content is larger than its box, and which way
 * it scrolls sideways. Nothing is measured on the server or in jsdom.
 */
function useOverflow(ref: React.RefObject<HTMLElement | null>) {
  const [overflows, setOverflows] = React.useState(false);
  const [horizontal, setHorizontal] = React.useState<ReturnType<typeof overflowState>>();
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setOverflows(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight);
      setHorizontal(overflowState(el));
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    if (typeof ResizeObserver === 'undefined')
      return () => el.removeEventListener('scroll', update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, [ref]);
  return { overflows, horizontal };
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) ref.current = node;
}

/**
 * The scroll container fades on the side with more to see (never over a
 * pinned column), shows its focus outline inside the box (the frame around
 * it would clip an offset one), and drops the fade while focused so the
 * whole outline shows.
 */
const containerClasses = cn(
  'group/table relative w-full overflow-auto',
  'data-[overflow=end]:[mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent)]',
  'data-[overflow=start]:[mask-image:linear-gradient(to_left,#000_calc(100%-2rem),transparent)]',
  'data-[overflow=both]:[mask-image:linear-gradient(to_right,transparent,#000_2rem,#000_calc(100%-2rem),transparent)]',
  'data-[pinned]:data-[overflow=start]:[mask-image:none] data-[pinned]:data-[overflow=both]:[mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent)]',
  focusRingClasses,
  'focus-visible:outline-offset-[-2px] focus-visible:[mask-image:none]',
);

const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    className,
    density = 'default',
    stickyHeader = false,
    containerClassName,
    containerProps,
    scrollLabel,
    pinFirstColumn = false,
    overflowHint = 'Swipe for more',
    ...props
  },
  ref,
) {
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
  const { overflows, horizontal } = useOverflow(local);
  const hint = overflowHint !== false && (horizontal === 'end' || horizontal === 'both');
  return (
    <>
      <div
        data-slot="table-container"
        data-density={density}
        data-sticky={stickyHeader || undefined}
        data-pinned={pinFirstColumn || undefined}
        data-overflow={horizontal}
        role={named ? 'region' : undefined}
        aria-label={scrollLabel}
        // A scrollable region must be reachable by keyboard; only while it scrolls.
        tabIndex={named && overflows ? 0 : undefined}
        {...wrapperProps}
        ref={setRef}
        className={cn(containerClasses, containerClassName, containerPropsClassName)}
      >
        <table
          ref={ref}
          data-slot="table"
          className={cn('w-full caption-bottom text-[13px]', className)}
          {...props}
        />
      </div>
      {hint && (
        <p
          data-slot="table-overflow-hint"
          aria-hidden
          className="hidden w-full px-3 py-1.5 text-right text-[11.5px] text-muted-foreground pointer-coarse:block"
        >
          {overflowHint} →
        </p>
      )}
    </>
  );
});

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'thead'>>(
  function TableHeader({ className, ...props }, ref) {
    return (
      <thead
        ref={ref}
        data-slot="table-header"
        className={cn(
          'bg-surface-muted [&_tr]:border-b group-data-[sticky]/table:sticky group-data-[sticky]/table:top-0 group-data-[sticky]/table:z-10',
          className,
        )}
        {...props}
      />
    );
  },
);

const TableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'tbody'>>(
  function TableBody({ className, ...props }, ref) {
    return (
      <tbody
        ref={ref}
        data-slot="table-body"
        className={cn('[&_tr:last-child]:border-0', className)}
        {...props}
      />
    );
  },
);

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<'tfoot'>>(
  function TableFooter({ className, ...props }, ref) {
    return (
      <tfoot
        ref={ref}
        data-slot="table-footer"
        className={cn('border-t bg-surface-muted font-medium [&>tr]:last:border-b-0', className)}
        {...props}
      />
    );
  },
);

/** Set `selected` to mark a chosen row: a soft fill and a brand bar on its left edge. */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.ComponentProps<'tr'> & { selected?: boolean }
>(function TableRow({ className, selected, ...props }, ref) {
  return (
    <tr
      ref={ref}
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
});

// Pinned first cells (Table `pinFirstColumn`): sticky, with the surface
// behind them so scrolled columns pass underneath, and a hairline on their
// right edge.

/** `numeric` right-aligns with tabular figures, for counts, money and durations. */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentProps<'th'> & { numeric?: boolean }
>(function TableHead({ className, numeric, ...props }, ref) {
  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn(
        'h-9 px-3 text-left align-middle text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap text-muted-foreground uppercase group-data-[density=compact]/table:h-8 [&:has([role=checkbox])]:w-10 [&:has([role=checkbox])]:pr-0',
        'first:group-data-[pinned]/table:sticky first:group-data-[pinned]/table:left-0 first:group-data-[pinned]/table:z-[2] first:group-data-[pinned]/table:bg-surface-muted first:group-data-[pinned]/table:shadow-[inset_-1px_0_0_var(--border)]',
        numeric && 'text-right tabular-nums',
        className,
      )}
      {...props}
    />
  );
});

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentProps<'td'> & { numeric?: boolean }
>(function TableCell({ className, numeric, ...props }, ref) {
  return (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        'h-10 px-3 align-middle whitespace-nowrap group-data-[density=compact]/table:h-8 pointer-coarse:group-data-[density=default]/table:h-11 [&:has([role=checkbox])]:pr-0',
        'first:group-data-[pinned]/table:sticky first:group-data-[pinned]/table:left-0 first:group-data-[pinned]/table:z-[1] first:group-data-[pinned]/table:bg-surface first:group-data-[pinned]/table:shadow-[inset_-1px_0_0_var(--border)] first:group-data-[pinned]/table:max-w-[min(11rem,45vw)] first:group-data-[pinned]/table:whitespace-normal',
        numeric && 'text-right font-mono text-[12.5px] tabular-nums',
        className,
      )}
      {...props}
    />
  );
});

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.ComponentProps<'caption'>>(
  function TableCaption({ className, ...props }, ref) {
    return (
      <caption
        ref={ref}
        data-slot="table-caption"
        className={cn('mt-3 text-xs text-muted-foreground', className)}
        {...props}
      />
    );
  },
);

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
