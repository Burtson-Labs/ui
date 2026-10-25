import CalendarIcon from '@burtson-labs/icons/react/calendar';
import * as React from 'react';

import { cn } from '../lib/utils';

import { Calendar, type DateRange, type DisabledDates, startOfDay, type Weekday } from './calendar';
import { fieldClasses, type FieldWidth, fieldWidthClasses } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DatePickerBaseProps extends Omit<
  React.ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children'
> {
  /** Shown when nothing is chosen. */
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
}

export interface DatePickerProps extends DatePickerBaseProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  /** Submits the day as YYYY-MM-DD with a form, in a hidden input of this name. */
  name?: string;
}

export interface DateRangePickerProps extends DatePickerBaseProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (range: DateRange) => void;
}

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function useControlled<T>(value: T | undefined, initial: T) {
  const [state, setState] = React.useState(initial);
  return [value !== undefined ? value : state, setState, value !== undefined] as const;
}

type ButtonProps = Omit<
  React.ComponentProps<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children'
>;

interface ShellProps extends ButtonProps {
  placeholder?: string;
  width?: FieldWidth;
  text: string | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  calendar: React.ReactNode;
  formInput?: React.ReactNode;
}

const PickerShell = React.forwardRef<HTMLButtonElement, ShellProps>(function PickerShell(
  {
    text,
    open,
    setOpen,
    calendar,
    formInput,
    placeholder = 'Pick a date',
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
        className="w-auto p-0"
        onOpenAutoFocus={(event) => {
          // Focus the chosen day (or today), as the date picker dialog pattern asks.
          event.preventDefault();
          contentRef.current
            ?.querySelector<HTMLElement>('[data-slot=calendar-day][tabindex="0"]')
            ?.focus({ preventScroll: true });
        }}
      >
        {calendar}
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
    ...props
  },
  ref,
) {
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
      placeholder = 'Pick dates',
      width = 'lg',
      locale,
      formatOptions,
      weekStartsOn,
      min,
      max,
      disabledDates,
      ...props
    },
    ref,
  ) {
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
        placeholder={placeholder}
        width={width}
        text={text}
        open={open}
        setOpen={setOpen}
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
          />
        }
      />
    );
  },
);

export { DatePicker, DateRangePicker };
