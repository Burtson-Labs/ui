import ChevronLeft from '@burtson-labs/icons/react/chevron-left';
import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import * as React from 'react';

import { cn } from '../lib/utils';

import { IconButton } from './icon-button';

/** A span of days; `to` is unset while the second end is being chosen. */
export interface DateRange {
  from?: Date;
  to?: Date;
}

/** 0 is Sunday, 1 Monday … 6 Saturday, as in `Date.getDay()`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Days that cannot be chosen: a test, or a list of dates. */
export type DisabledDates = ((date: Date) => boolean) | Date[];

/* ---------------------------------------------------------------------------
 * Date helpers: local calendar days, no time zone arithmetic. Every date is
 * normalised to local midnight, and months clamp the day (Jan 31 + 1 month is
 * the last day of February), so nothing here needs a date library.
 * ------------------------------------------------------------------------- */

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export function addMonths(d: Date, n: number): Date {
  const y = d.getFullYear();
  const m = d.getMonth() + n;
  const target = new Date(y, m, 1);
  const day = Math.min(d.getDate(), daysInMonth(target.getFullYear(), target.getMonth()));
  return new Date(target.getFullYear(), target.getMonth(), day);
}
export const isSameDay = (a?: Date | null, b?: Date | null) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
const key = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();
const valid = (d?: Date | null): d is Date => d instanceof Date && !Number.isNaN(d.getTime());

/** The local day as YYYY-MM-DD, the form a native date input submits. */
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** The locale's first day of the week, where the runtime knows it; else Sunday. */
export function localeWeekStart(locale?: string): Weekday {
  try {
    const loc = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as
      | (Intl.Locale & {
          getWeekInfo?: () => { firstDay: number };
          weekInfo?: { firstDay: number };
        })
      | undefined;
    const first = loc?.getWeekInfo?.().firstDay ?? loc?.weekInfo?.firstDay;
    if (typeof first === 'number' && first >= 1 && first <= 7) return (first % 7) as Weekday;
  } catch {
    // Unknown locale tags fall through to Sunday.
  }
  return 0;
}

interface CalendarBaseProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onSelect' | 'dir'
> {
  /** The month shown (any day in it). Controlled; pair with onMonthChange. */
  month?: Date;
  /** The month shown first; defaults to the selection, else today. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** BCP 47 tag for month and weekday names ("en-GB", "de"); the browser's by default. */
  locale?: string;
  /** First column of the week; the locale's own where known, else Sunday. */
  weekStartsOn?: Weekday;
  /** Earliest choosable day. */
  min?: Date;
  /** Latest choosable day. */
  max?: Date;
  /** Days that cannot be chosen (weekends, booked days). They stay focusable and say so. */
  disabled?: DisabledDates;
  /** Show the neighbouring months' days, dimmed, in the first and last rows. */
  showOutsideDays?: boolean;
  /** Focus the selected day (or today) when the calendar mounts. */
  autoFocus?: boolean;
  /** "Today", for tests and server rendering; the current date by default. */
  today?: Date;
  /**
   * How many months show side by side, 1 to 3. One pair of month buttons
   * turns them all a month at a time, and the keyboard moves across them.
   * Each month is about 270px wide: choose the count for the space.
   */
  numberOfMonths?: number;
  /** Names for the month buttons, for translation. */
  labels?: CalendarLabels;
}

/** Strings the Calendar reads out, for translation. */
export interface CalendarLabels {
  /** The button that shows the month before ("Previous month"). */
  previousMonth?: string;
  /** The button that shows the month after ("Next month"). */
  nextMonth?: string;
}

export const calendarLabels: Required<CalendarLabels> = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
};

export interface CalendarSingleProps extends CalendarBaseProps {
  /** One day. */
  mode?: 'single';
  selected?: Date | null;
  defaultSelected?: Date | null;
  onSelect?: (date: Date) => void;
}

export interface CalendarRangeProps extends CalendarBaseProps {
  /** Two days and the span between: the first press sets the start, the second the end. */
  mode: 'range';
  selected?: DateRange | null;
  defaultSelected?: DateRange | null;
  onSelect?: (range: DateRange) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

/**
 * A month grid for choosing a day or a range, with the locale's month and
 * weekday names (Intl.DateTimeFormat) and no date library. It follows the
 * WAI-ARIA date picker grid: one Tab stop; arrows move by day and week, Home
 * and End to the ends of the week, Page Up and Page Down by month (with Shift,
 * by year); Enter or Space chooses. Moving past the last month shown turns the
 * page. With `numberOfMonths`, two or three months sit side by side, each its
 * own grid, sharing the one Tab stop and the month buttons.
 */
const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(function Calendar(props, ref) {
  const {
    mode = 'single',
    selected: selectedProp,
    defaultSelected,
    onSelect,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    locale,
    weekStartsOn: weekStartsOnProp,
    min,
    max,
    disabled,
    showOutsideDays = true,
    autoFocus = false,
    today: todayProp,
    numberOfMonths: numberOfMonthsProp = 1,
    labels: labelsProp,
    className,
    ...rest
  } = props;

  const today = startOfDay(valid(todayProp) ? todayProp : new Date());
  const minDay = valid(min) ? startOfDay(min) : undefined;
  const maxDay = valid(max) ? startOfDay(max) : undefined;
  const weekStartsOn = weekStartsOnProp ?? localeWeekStart(locale);
  const count = Math.min(3, Math.max(1, Math.round(Number(numberOfMonthsProp)) || 1));
  const labels = { ...calendarLabels, ...labelsProp };

  // Selection, controlled or not.
  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<
    Date | DateRange | null | undefined
  >(defaultSelected);
  const selected = selectedProp !== undefined ? selectedProp : uncontrolledSelected;
  const single = mode === 'single' && valid(selected as Date) ? (selected as Date) : undefined;
  const range = mode === 'range' && selected && !(selected instanceof Date) ? selected : {};
  const from = valid(range.from) ? startOfDay(range.from) : undefined;
  const to = valid(range.to) ? startOfDay(range.to) : undefined;
  const anchor = single ?? from ?? today;

  // The first visible month, controlled or not.
  const [uncontrolledMonth, setUncontrolledMonth] = React.useState(() =>
    startOfMonth(valid(defaultMonth) ? defaultMonth : anchor),
  );
  const month = startOfMonth(valid(monthProp) ? monthProp : uncontrolledMonth);
  const setMonth = (next: Date) => {
    const m = startOfMonth(next);
    if (sameMonth(m, month)) return;
    if (monthProp === undefined) setUncontrolledMonth(m);
    onMonthChange?.(m);
  };

  const disabledKeys = React.useMemo(
    () => (Array.isArray(disabled) ? new Set(disabled.filter(valid).map(key)) : null),
    [disabled],
  );
  const isDisabled = (d: Date) =>
    (minDay !== undefined && d < minDay) ||
    (maxDay !== undefined && d > maxDay) ||
    (disabledKeys ? disabledKeys.has(key(d)) : typeof disabled === 'function' && disabled(d));

  const months = Array.from({ length: count }, (_, i) => addMonths(month, i));
  const afterLast = addMonths(month, count);
  const inView = (d: Date) => d >= month && d < afterLast;

  // The roving Tab stop: the day last moved to, if it is on view; else the
  // selection, today, or the first choosable day shown.
  const [focused, setFocused] = React.useState<Date>(anchor);
  const [hovered, setHovered] = React.useState<Date | null>(null);
  const tabStop =
    [focused, single, from, today].find((d): d is Date => !!d && inView(d)) ??
    months
      .flatMap((m) =>
        Array.from({ length: daysInMonth(m.getFullYear(), m.getMonth()) }, (_, i) => addDays(m, i)),
      )
      .find((d) => !isDisabled(d)) ??
    month;

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const pendingFocus = React.useRef(autoFocus);
  React.useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    rootRef.current
      ?.querySelector<HTMLElement>('[data-slot=calendar-day][tabindex="0"]')
      ?.focus({ preventScroll: true });
  });

  const choose = (d: Date) => {
    if (isDisabled(d)) return;
    setFocused(d);
    if (!inView(d)) setMonth(d);
    if (mode === 'single') {
      if (selectedProp === undefined) setUncontrolledSelected(d);
      (onSelect as ((date: Date) => void) | undefined)?.(d);
      return;
    }
    let next: DateRange;
    if (!from || to) next = { from: d, to: undefined };
    else if (d < from) next = { from: d, to: from };
    else next = { from, to: d };
    if (selectedProp === undefined) setUncontrolledSelected(next);
    (onSelect as ((r: DateRange) => void) | undefined)?.(next);
  };

  const moveTo = (d: Date) => {
    let next = d;
    if (minDay && next < minDay) next = minDay;
    if (maxDay && next > maxDay) next = maxDay;
    setFocused(next);
    // Turn just far enough that the day is on view: back to its month as the
    // first, or forward until its month is the last.
    if (next < month) setMonth(next);
    else if (next >= afterLast) setMonth(addMonths(startOfMonth(next), 1 - count));
    pendingFocus.current = true;
  };

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === 'rtl' : false;
    const d = tabStop;
    const weekday = (d.getDay() - weekStartsOn + 7) % 7;
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(d, rtl ? 1 : -1);
        break;
      case 'ArrowRight':
        next = addDays(d, rtl ? -1 : 1);
        break;
      case 'ArrowUp':
        next = addDays(d, -7);
        break;
      case 'ArrowDown':
        next = addDays(d, 7);
        break;
      case 'Home':
        next = addDays(d, -weekday);
        break;
      case 'End':
        next = addDays(d, 6 - weekday);
        break;
      case 'PageUp':
        next = addMonths(d, event.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(d, event.shiftKey ? 12 : 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(d);
        return;
      default:
        return;
    }
    event.preventDefault();
    moveTo(next);
  };

  // Names from Intl: "October 2026", "Sun", "Sunday", "Sunday, October 25, 2026".
  const fmt = React.useMemo(
    () => ({
      caption: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      short: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      long: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      day: new Intl.DateTimeFormat(locale, { day: 'numeric' }),
      full: new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }),
    [locale],
  );
  // 2026-01-04 is a Sunday: a reference week for the weekday names.
  const weekdays = Array.from(
    { length: 7 },
    (_, i) => new Date(2026, 0, 4 + ((weekStartsOn + i) % 7)),
  );

  const captionId = React.useId();
  const lastMonth = months[count - 1]!;
  const prevDisabled = minDay !== undefined && addDays(month, -1) < minDay;
  const nextDisabled = maxDay !== undefined && afterLast > maxDay;

  const previewEnd = from && !to && hovered ? hovered : undefined;
  const [spanStart, spanEnd] =
    from && (to ?? previewEnd)
      ? [from, to ?? previewEnd!].sort((a, b) => a.getTime() - b.getTime())
      : [from, from];

  const navButton = (side: 'previous' | 'next') =>
    side === 'previous' ? (
      <IconButton
        label={labels.previousMonth}
        variant="ghost"
        size="icon-sm"
        disabled={prevDisabled}
        onClick={() => setMonth(addMonths(month, -1))}
      >
        <ChevronLeft aria-hidden className="rtl:rotate-180" />
      </IconButton>
    ) : (
      <IconButton
        label={labels.nextMonth}
        variant="ghost"
        size="icon-sm"
        disabled={nextDisabled}
        onClick={() => setMonth(addMonths(month, 1))}
      >
        <ChevronRight aria-hidden className="rtl:rotate-180" />
      </IconButton>
    );
  // Holds a button's place in a month that has none, so its caption stays centred.
  const navSpacer = <span aria-hidden="true" className="size-8 shrink-0 pointer-coarse:size-11" />;

  const renderMonth = (m: Date, index: number) => {
    const lead = (m.getDay() - weekStartsOn + 7) % 7;
    const gridStart = addDays(m, -lead);
    // Six rows always, so the calendar keeps its height as the months turn.
    const weeks = Array.from({ length: 6 }, (_, w) =>
      Array.from({ length: 7 }, (_, i) => addDays(gridStart, w * 7 + i)),
    );
    // Beside another month, a neighbour's days would show twice; leave them out.
    const outsideShown = showOutsideDays && count === 1;
    const id = `${captionId}-${index}`;
    return (
      <div key={key(m)} data-slot="calendar-month" className="grid content-start gap-2">
        <div className="flex items-center justify-between gap-2">
          {index === 0 ? navButton('previous') : navSpacer}
          <div
            id={id}
            data-slot="calendar-caption"
            aria-live={count === 1 ? 'polite' : undefined}
            className="text-sm font-semibold tracking-[-0.01em]"
          >
            {fmt.caption.format(m)}
          </div>
          {index === count - 1 ? navButton('next') : navSpacer}
        </div>
        <table
          role="grid"
          aria-labelledby={id}
          data-slot="calendar-grid"
          className="border-collapse"
          onKeyDown={onGridKeyDown}
        >
          <thead>
            <tr>
              {weekdays.map((w) => (
                <th
                  key={w.getDay()}
                  scope="col"
                  abbr={fmt.long.format(w)}
                  className="h-8 w-9 text-[11px] font-medium text-muted-foreground"
                >
                  <span aria-hidden="true">{fmt.short.format(w)}</span>
                  <span className="sr-only">{fmt.long.format(w)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={key(week[0]!)}>
                {week.map((d) => {
                  const outside = !sameMonth(d, m);
                  if (outside)
                    return (
                      <td
                        key={key(d)}
                        role="gridcell"
                        data-outside=""
                        className="h-9 w-9 p-0 text-center text-muted-foreground pointer-coarse:h-11"
                      >
                        {outsideShown ? <span aria-hidden="true">{fmt.day.format(d)}</span> : null}
                      </td>
                    );
                  const off = isDisabled(d);
                  const isToday = isSameDay(d, today);
                  const isStart = mode === 'range' && isSameDay(d, spanStart);
                  const isEnd = mode === 'range' && isSameDay(d, spanEnd);
                  const inSpan =
                    mode === 'range' && !!spanStart && !!spanEnd && d >= spanStart && d <= spanEnd;
                  const chosen =
                    mode === 'single'
                      ? isSameDay(d, single)
                      : !!from && (to ? d >= from && d <= to : isSameDay(d, from));
                  const preview = mode === 'range' && inSpan && !chosen;
                  const middle = inSpan && !isStart && !isEnd;
                  return (
                    <td
                      key={key(d)}
                      role="gridcell"
                      data-slot="calendar-day"
                      data-date={toISODate(d)}
                      data-today={isToday ? '' : undefined}
                      data-selected={chosen ? '' : undefined}
                      data-range-start={isStart && inSpan ? '' : undefined}
                      data-range-end={isEnd && inSpan ? '' : undefined}
                      data-range-middle={middle ? '' : undefined}
                      data-preview={preview ? '' : undefined}
                      aria-label={fmt.full.format(d)}
                      aria-selected={chosen}
                      aria-current={isToday ? 'date' : undefined}
                      aria-disabled={off || undefined}
                      tabIndex={isSameDay(d, tabStop) ? 0 : -1}
                      onClick={() => choose(d)}
                      onFocus={() => setFocused(d)}
                      onPointerEnter={() => {
                        if (mode === 'range') setHovered(d);
                      }}
                      className={cn(
                        'group/day relative h-9 w-9 cursor-pointer p-0 text-center select-none pointer-coarse:h-11',
                        'rounded-md outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
                        'forced-colors:focus-visible:[outline:2px_solid_Highlight]!',
                        inSpan && 'rounded-none bg-brand-soft/70',
                        inSpan && isStart && 'rounded-s-md',
                        inSpan && isEnd && 'rounded-e-md',
                        off && 'cursor-not-allowed',
                      )}
                    >
                      <span
                        className={cn(
                          'mx-auto flex size-9 items-center justify-center rounded-md tabular-nums transition-colors',
                          !chosen && !off && 'group-hover/day:bg-muted',
                          isToday && !chosen && 'font-semibold text-brand',
                          isToday && 'underline decoration-2 underline-offset-4',
                          middle && 'text-brand-soft-foreground group-hover/day:bg-transparent',
                          chosen &&
                            !middle &&
                            'bg-primary font-semibold text-primary-foreground dark:bg-brand dark:text-background',
                          middle && chosen && 'bg-transparent',
                          off && 'text-muted-foreground line-through opacity-60',
                        )}
                      >
                        {fmt.day.format(d)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="calendar"
      data-mode={mode}
      data-months={count}
      className={cn('w-fit p-3 text-sm pointer-coarse:p-2', className)}
      {...rest}
    >
      {count > 1 && (
        // One announcement for the pages turning, rather than one per month.
        <div aria-live="polite" className="sr-only">
          {typeof fmt.caption.formatRange === 'function'
            ? fmt.caption.formatRange(month, lastMonth)
            : months.map((m) => fmt.caption.format(m)).join(', ')}
        </div>
      )}
      <div className="flex gap-4" onPointerLeave={() => setHovered(null)}>
        {months.map(renderMonth)}
      </div>
    </div>
  );
});

export { Calendar };
