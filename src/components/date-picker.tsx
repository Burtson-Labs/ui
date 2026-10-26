import CalendarIcon from '@burtson-labs/icons/react/calendar';
import * as React from 'react';

import { useNarrowerThan } from '../lib/media';
import { cn } from '../lib/utils';

import { Button } from './button';
import {
  Calendar,
  type CalendarLabels,
  type DateRange,
  type DisabledDates,
  startOfDay,
  toISODate,
  type Weekday,
} from './calendar';
import { fieldClasses, type FieldWidth, fieldWidthClasses } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DatePickerBaseProps extends Omit<
  React.ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children'
> {
  /** Shown when nothing is chosen. (The same as `labels.placeholder`.) */
  placeholder?: string;
  /** BCP 47 tag for the calendar and the formatted value; the browser's by default. */
  locale?: string;
  /** How the trigger writes the date (Intl.DateTimeFormat options). */
  formatOptions?: Intl.DateTimeFormatOptions;
  weekStartsOn?: Weekday;
  min?: Date;
  max?: Date;
  /** Days that cannot be chosen. (`disabled` disables the whole picker.) */
  disabledDates?: DisabledDates;
  /** How wide the trigger is from 640px up; full width on phones. */
  width?: FieldWidth;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Strings for the trigger, the popover and the calendar, for translation. */
  labels?: DatePickerLabels;
  /** Show a Clear button in the popover once something is chosen. */
  clearable?: boolean;
}

/** Strings a date picker reads out, for translation. */
export interface DatePickerLabels extends CalendarLabels {
  /** On the trigger while nothing is chosen: "Pick a date" ("Pick dates" for a range). */
  placeholder?: string;
  /** The popover's name: "Choose a date" ("Choose dates" for a range). */
  dialog?: string;
  /** The Clear button shown with `clearable`. */
  clear?: string;
}

export const datePickerLabels: Required<DatePickerLabels> = {
  placeholder: 'Pick a date',
  dialog: 'Choose a date',
  clear: 'Clear',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
};

export const dateRangePickerLabels: Required<DatePickerLabels> = {
  ...datePickerLabels,
  placeholder: 'Pick dates',
  dialog: 'Choose dates',
};

export interface DatePickerProps extends DatePickerBaseProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  /** Submits the day as YYYY-MM-DD with a form, in a hidden input of this name. */
  name?: string;
  /** Months shown side by side in the popover, 1 to 3. */
  numberOfMonths?: number;
}

export interface DateRangePickerProps extends DatePickerBaseProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (range: DateRange) => void;
  /**
   * Submits the range with a form as two YYYY-MM-DD hidden inputs,
   * `{name}From` and `{name}To` (empty until chosen). `startName` and
   * `endName` set the two names outright.
   */
  name?: string;
  /** The hidden input for the first day; `{name}From` by default. */
  startName?: string;
  /** The hidden input for the last day; `{name}To` by default. */
  endName?: string;
  /**
   * Months shown side by side in the popover, 1 to 3. By default two from
   * 1024px wide (the `lg` breakpoint) and one below it, where two would not fit.
   */
  numberOfMonths?: number;
}

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

const iso = toISODate;

function useControlled<T>(value: T | undefined, initial: T) {
  const [state, setState] = React.useState(initial);
  return [value !== undefined ? value : state, setState, value !== undefined] as const;
}

type ButtonProps = Omit<
  React.ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children'
>;

interface ShellProps extends ButtonProps {
  placeholder: string;
  dialogLabel: string;
  width?: FieldWidth;
  text: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  calendar: React.ReactNode;
  formInput?: React.ReactNode;
  /** Present when the chosen value can be cleared; renders the Clear button. */
  onClear?: () => void;
  clearLabel: string;
}

const PickerShell = React.forwardRef<HTMLButtonElement, ShellProps>(function PickerShell(
  {
    text,
    open,
    setOpen,
    calendar,
    formInput,
    placeholder,
    dialogLabel,
    onClear,
    clearLabel,
    width = 'md',
    className,
    'aria-describedby': describedBy,
    ...props
  },
  ref,
) {
  const valueId = React.useId();
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          data-slot="date-picker"
          data-empty={text ? undefined : ''}
          // With a Field label the label is the name; the value is read after it.
          aria-describedby={[describedBy, valueId].filter(Boolean).join(' ')}
          className={cn(
            fieldClasses,
            'flex h-[var(--control-height,2.25rem)] items-center justify-between gap-2 text-left pointer-coarse:min-h-11',
            !text && 'text-muted-foreground',
            fieldWidthClasses[width],
            className,
          )}
          {...props}
        >
          <span id={valueId} className="truncate">
            {text ?? placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      {formInput}
      <PopoverContent
        ref={contentRef}
        align="start"
        aria-label={dialogLabel}
        className="w-auto max-w-[calc(100vw-2rem)] overflow-x-auto p-0"
        onOpenAutoFocus={(event) => {
          // Focus the chosen day (or today), as the date picker dialog pattern asks.
          event.preventDefault();
          contentRef.current
            ?.querySelector<HTMLElement>('[data-slot=calendar-day][tabindex="0"]')
            ?.focus({ preventScroll: true });
        }}
      >
        {calendar}
        {onClear && (
          <div className="flex justify-end border-t border-border p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
            >
              {clearLabel}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

/**
 * A field-like button that shows the chosen date and opens a Calendar in a
 * Popover. Focus moves to the chosen day (or today) on open; choosing a day
 * closes it and returns focus to the button; Escape closes without a change.
 * Label it with Field or aria-labelledby.
 */
const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    name,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    locale,
    formatOptions,
    weekStartsOn,
    min,
    max,
    disabledDates,
    numberOfMonths,
    placeholder,
    labels: labelsProp,
    clearable = false,
    ...props
  },
  ref,
) {
  const labels = { ...datePickerLabels, ...labelsProp };
  const [value, setValue, controlled] = useControlled<Date | null>(valueProp, defaultValue);
  const [open, setOpenState] = useControlled<boolean>(openProp, defaultOpen);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const text = React.useMemo(
    () =>
      value ? new Intl.DateTimeFormat(locale, formatOptions ?? DEFAULT_FORMAT).format(value) : null,
    [value, locale, formatOptions],
  );
  return (
    <PickerShell
      ref={ref}
      {...props}
      placeholder={placeholder ?? labels.placeholder}
      dialogLabel={labels.dialog}
      clearLabel={labels.clear}
      onClear={
        clearable && value
          ? () => {
              if (!controlled) setValue(null);
              onValueChange?.(null);
            }
          : undefined
      }
      text={text}
      open={open}
      setOpen={setOpen}
      formInput={name ? <input type="hidden" name={name} value={value ? iso(value) : ''} /> : null}
      calendar={
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            const day = startOfDay(d);
            if (!controlled) setValue(day);
            onValueChange?.(day);
            setOpen(false);
          }}
          locale={locale}
          weekStartsOn={weekStartsOn}
          min={min}
          max={max}
          disabled={disabledDates}
          numberOfMonths={numberOfMonths}
          labels={labels}
        />
      }
    />
  );
});

/**
 * Two dates in one picker: the first press sets the start, the second the
 * end (pressing an earlier day swaps them), and the popover closes once both
 * are set. The trigger shows the span with Intl's range formatting.
 */
const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      placeholder,
      labels: labelsProp,
      name,
      startName,
      endName,
      numberOfMonths,
      width = 'lg',
      locale,
      formatOptions,
      weekStartsOn,
      min,
      max,
      disabledDates,
      clearable = false,
      ...props
    },
    ref,
  ) {
    const labels = { ...dateRangePickerLabels, ...labelsProp };
    const narrow = useNarrowerThan('lg');
    const months = numberOfMonths ?? (narrow ? 1 : 2);
    const fromName = startName ?? (name ? `${name}From` : undefined);
    const toName = endName ?? (name ? `${name}To` : undefined);
    const [value, setValue, controlled] = useControlled<DateRange | null>(valueProp, defaultValue);
    const [open, setOpenState] = useControlled<boolean>(openProp, defaultOpen);
    const setOpen = (next: boolean) => {
      setOpenState(next);
      onOpenChange?.(next);
    };
    const text = React.useMemo(() => {
      if (!value?.from) return null;
      const f = new Intl.DateTimeFormat(locale, formatOptions ?? DEFAULT_FORMAT);
      if (!value.to) return `${f.format(value.from)} –`;
      return typeof f.formatRange === 'function'
        ? f.formatRange(value.from, value.to)
        : `${f.format(value.from)} – ${f.format(value.to)}`;
    }, [value, locale, formatOptions]);
    return (
      <PickerShell
        ref={ref}
        {...props}
        placeholder={placeholder ?? labels.placeholder}
        dialogLabel={labels.dialog}
        clearLabel={labels.clear}
        onClear={
          clearable && value?.from
            ? () => {
                if (!controlled) setValue(null);
                onValueChange?.({});
              }
            : undefined
        }
        width={width}
        text={text}
        open={open}
        setOpen={setOpen}
        formInput={
          fromName || toName ? (
            <>
              {fromName && (
                <input type="hidden" name={fromName} value={value?.from ? iso(value.from) : ''} />
              )}
              {toName && (
                <input type="hidden" name={toName} value={value?.to ? iso(value.to) : ''} />
              )}
            </>
          ) : null
        }
        calendar={
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range) => {
              if (!controlled) setValue(range);
              onValueChange?.(range);
              if (range.from && range.to) setOpen(false);
            }}
            locale={locale}
            weekStartsOn={weekStartsOn}
            min={min}
            max={max}
            disabled={disabledDates}
            numberOfMonths={months}
            labels={labels}
          />
        }
      />
    );
  },
);

export { DatePicker, DateRangePicker };
