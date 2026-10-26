import * as React from 'react';

import { cn } from '../lib/utils';

import { type DisabledDates, isSameDay, startOfDay, toISODate, type Weekday } from './calendar';
import { DatePicker, type DatePickerLabels, datePickerLabels } from './date-picker';
import { type FieldWidth, fieldWidthClasses } from './input';
import {
  formatTime,
  type HourCycle,
  parseTime,
  TimePicker,
  type TimePickerLabels,
  timePickerLabels,
} from './time-picker';

/** Strings the DateTimePicker reads out, for translation. */
export interface DateTimePickerLabels extends DatePickerLabels, TimePickerLabels {
  /** The date button's name inside the group ("Date"). */
  date?: string;
  /** The time segments' group name ("Time"). */
  time?: string;
}

export const dateTimePickerLabels: Required<DateTimePickerLabels> = {
  ...datePickerLabels,
  ...timePickerLabels,
  date: 'Date',
  time: 'Time',
};

export interface DateTimePickerProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'dir'
> {
  /** A local date and time; null until both are chosen. Controlled. */
  value?: Date | null;
  defaultValue?: Date | null;
  /** The new date and time once both parts are set; null when either is cleared. */
  onValueChange?: (value: Date | null) => void;
  /**
   * Submits the local date and time as YYYY-MM-DDTHH:mm (with :ss when
   * `seconds`), the form of a native datetime-local input, in a hidden input.
   */
  name?: string;
  /** BCP 47 tag for the calendar, the date and the clock; the browser's by default. */
  locale?: string;
  /** How the date button writes the day (Intl.DateTimeFormat options). */
  formatOptions?: Intl.DateTimeFormatOptions;
  weekStartsOn?: Weekday;
  /** Earliest moment: its day bounds the calendar and its time bounds that day. */
  min?: Date;
  /** Latest moment. */
  max?: Date;
  /** Days that cannot be chosen. */
  disabledDates?: DisabledDates;
  /** Months shown side by side in the calendar, 1 to 3. */
  numberOfMonths?: number;
  /** 12 or 24; the locale's own by default. */
  hourCycle?: HourCycle;
  seconds?: boolean;
  /** Minutes between choices for the time arrows and list. */
  step?: number;
  /** A list of times beside the time segments. */
  slots?: boolean;
  disabled?: boolean;
  /** How wide the pair is from 640px up; `lg` by default. */
  width?: FieldWidth;
  labels?: DateTimePickerLabels;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-required'?: boolean | 'true' | 'false';
}

const valid = (d?: Date | null): d is Date => d instanceof Date && !Number.isNaN(d.getTime());
const timeOf = (d: Date, withSeconds: boolean) =>
  formatTime(
    { hours: d.getHours(), minutes: d.getMinutes(), seconds: d.getSeconds() },
    withSeconds,
  );

const secondsOf = (p: { hours: number; minutes: number; seconds: number }) =>
  p.hours * 3600 + p.minutes * 60 + p.seconds;
const fromSeconds = (s: number) => ({
  hours: Math.floor(s / 3600),
  minutes: Math.floor((s % 3600) / 60),
  seconds: s % 60,
});

/** `time` pulled inside min and max (whole minutes inside them without seconds). */
function clampTime(
  time: string | null,
  bounds: { min?: string; max?: string },
  withSeconds: boolean,
): string | null {
  const t = parseTime(time);
  if (!t) return time;
  const lo = parseTime(bounds.min);
  const hi = parseTime(bounds.max);
  let s = secondsOf(t);
  if (lo && s < secondsOf(lo)) s = withSeconds ? secondsOf(lo) : Math.ceil(secondsOf(lo) / 60) * 60;
  if (hi && s > secondsOf(hi))
    s = withSeconds ? secondsOf(hi) : Math.floor(secondsOf(hi) / 60) * 60;
  return formatTime(fromSeconds(s), withSeconds);
}

/**
 * A date and a time of day in one labelled group: a DatePicker for the day
 * and a TimePicker for the time, reported together as a local Date once both
 * are set. On the first and last allowed days, min and max also bound the
 * time.
 */
const DateTimePicker = React.forwardRef<HTMLDivElement, DateTimePickerProps>(
  function DateTimePicker(
    {
      value: valueProp,
      defaultValue = null,
      onValueChange,
      name,
      locale,
      formatOptions,
      weekStartsOn,
      min,
      max,
      disabledDates,
      numberOfMonths,
      hourCycle,
      seconds = false,
      step,
      slots,
      disabled,
      width = 'lg',
      labels: labelsProp,
      id: idProp,
      className,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-invalid': ariaInvalid,
      'aria-required': ariaRequired,
      ...props
    },
    ref,
  ) {
    const labels = { ...dateTimePickerLabels, ...labelsProp };
    const controlled = valueProp !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState<Date | null>(
      valid(defaultValue) ? defaultValue : null,
    );
    const value = controlled ? (valid(valueProp) ? valueProp : null) : uncontrolled;
    const stamp = value ? value.getTime() : null;

    // The two halves; a half may be set while the other is still empty.
    const [day, setDay] = React.useState<Date | null>(value ? startOfDay(value) : null);
    const [time, setTime] = React.useState<string | null>(value ? timeOf(value, seconds) : null);
    const [synced, setSynced] = React.useState(stamp);
    if (stamp !== synced) {
      setSynced(stamp);
      setDay(value ? startOfDay(value) : null);
      setTime(value ? timeOf(value, seconds) : null);
    }

    const emit = (nextDay: Date | null, nextTime: string | null) => {
      const t = parseTime(nextTime);
      const next =
        nextDay && t
          ? new Date(
              nextDay.getFullYear(),
              nextDay.getMonth(),
              nextDay.getDate(),
              t.hours,
              t.minutes,
              t.seconds,
            )
          : null;
      const nextStamp = next ? next.getTime() : null;
      if (nextStamp === stamp) return;
      setSynced(nextStamp);
      if (!controlled) setUncontrolled(next);
      onValueChange?.(next);
    };

    const minDay = valid(min) ? startOfDay(min) : undefined;
    const maxDay = valid(max) ? startOfDay(max) : undefined;
    const boundsFor = (d: Date | null) => ({
      min: d && valid(min) && isSameDay(d, min) ? timeOf(min, true) : undefined,
      max: d && valid(max) && isSameDay(d, max) ? timeOf(max, true) : undefined,
    });
    const timeBounds = boundsFor(day);

    const autoId = React.useId();
    const id = idProp ?? `dtp${autoId.replace(/:/g, '')}`;
    // A <label for> (a Field's label) cannot name a group: the group points at it.
    const [labelledBy, setLabelledBy] = React.useState<string | undefined>(undefined);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
      if (ariaLabel || ariaLabelledBy) return;
      const label = [...document.querySelectorAll('label')].find((l) => l.htmlFor === id);
      if (!label) return;
      if (!label.id) label.id = `${id}-label`;
      setLabelledBy(label.id);
      const onClick = (e: MouseEvent) => {
        e.preventDefault();
        rootRef.current?.querySelector<HTMLElement>('[data-slot=date-picker]')?.focus();
      };
      label.addEventListener('click', onClick);
      return () => label.removeEventListener('click', onClick);
    }, [id, ariaLabel, ariaLabelledBy]);

    const iso = day && time ? `${toISODate(day)}T${time}` : '';

    return (
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        id={id}
        role="group"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? labelledBy}
        data-slot="date-time-picker"
        className={cn('flex min-w-0 gap-2', fieldWidthClasses[width], className)}
        {...props}
      >
        <DatePicker
          aria-label={labels.date}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          width="full"
          className="min-w-0 flex-1"
          value={day}
          onValueChange={(d) => {
            setDay(d);
            // A time outside the new day's bounds is pulled into them.
            const nextTime = clampTime(time, boundsFor(d), seconds);
            if (nextTime !== time) setTime(nextTime);
            emit(d, nextTime);
          }}
          locale={locale}
          formatOptions={formatOptions}
          weekStartsOn={weekStartsOn}
          min={minDay}
          max={maxDay}
          disabledDates={disabledDates}
          numberOfMonths={numberOfMonths}
          disabled={disabled}
          labels={labels}
        />
        <TimePicker
          aria-label={labels.time}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          className="w-auto shrink-0 sm:w-auto"
          value={time}
          onValueChange={(t) => {
            setTime(t);
            emit(day, t);
          }}
          locale={locale}
          hourCycle={hourCycle}
          seconds={seconds}
          step={step}
          slots={slots}
          min={timeBounds.min}
          max={timeBounds.max}
          disabled={disabled}
          labels={labels}
        />
        {name && <input type="hidden" name={name} value={iso} />}
      </div>
    );
  },
);

export { DateTimePicker };
