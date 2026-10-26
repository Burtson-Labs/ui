import ClockIcon from '@burtson-labs/icons/react/clock';
import * as React from 'react';

import { cn, noOutlineClasses, touchTargetRowClasses } from '../lib/utils';

import { IconButton } from './icon-button';
import { type FieldWidth, fieldWidthClasses } from './input';
import { menuItemClasses, Popover, PopoverContent, PopoverTrigger } from './popover';

/** 12-hour (with AM and PM) or 24-hour clock. */
export type HourCycle = 12 | 24;

/** A time of day as numbers: hours 0–23, minutes and seconds 0–59. */
export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

/** Reads "HH:mm" or "HH:mm:ss" (24-hour, as a native time input submits); null if it is not one. */
export function parseTime(value?: string | null): TimeParts | null {
  const m = typeof value === 'string' ? TIME_RE.exec(value.trim()) : null;
  if (!m) return null;
  return { hours: Number(m[1]), minutes: Number(m[2]), seconds: Number(m[3] ?? 0) };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Writes "HH:mm", or "HH:mm:ss" with `withSeconds`. */
export function formatTime(parts: TimeParts, withSeconds = false): string {
  const hm = `${pad(parts.hours)}:${pad(parts.minutes)}`;
  return withSeconds ? `${hm}:${pad(parts.seconds)}` : hm;
}

/** The locale's clock: 12 where it writes AM and PM ("en-US"), else 24 ("en-GB", "de"). */
export function localeHourCycle(locale?: string): HourCycle {
  try {
    const o = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions();
    if (o.hourCycle) return o.hourCycle === 'h11' || o.hourCycle === 'h12' ? 12 : 24;
    return o.hour12 ? 12 : 24;
  } catch {
    return 24;
  }
}

/** Strings the TimePicker reads out, for translation. */
export interface TimePickerLabels {
  hours?: string;
  minutes?: string;
  seconds?: string;
  /** The AM/PM segment. */
  dayPeriod?: string;
  /** Read for a segment with nothing in it. */
  empty?: string;
  /** The button that opens the list of times. */
  showTimes?: string;
}

export const timePickerLabels: Required<TimePickerLabels> = {
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
  dayPeriod: 'AM/PM',
  empty: 'Empty',
  showTimes: 'Show times',
};

export interface TimePickerProps extends Omit<
  React.ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'dir'
> {
  /** "HH:mm" (or "HH:mm:ss" with `seconds`), 24-hour; null when empty. Controlled. */
  value?: string | null;
  defaultValue?: string | null;
  /** The new time, or null once a segment is cleared. Only times within min and max arrive. */
  onValueChange?: (value: string | null) => void;
  /** Submits the time as HH:mm (HH:mm:ss with `seconds`) in a hidden input of this name. */
  name?: string;
  /** BCP 47 tag: the segment order, separators, AM/PM names and the clock. */
  locale?: string;
  /** 12 or 24; the locale's own by default. */
  hourCycle?: HourCycle;
  /** Show and submit seconds. */
  seconds?: boolean;
  /**
   * Minutes between choices: the arrows on the minutes move by it, and the
   * list of times uses it. 1 by default (30 with `slots`).
   */
  step?: number;
  /** Earliest time, "HH:mm". A typed time outside the range is pulled into it on blur. */
  min?: string;
  /** Latest time, "HH:mm". */
  max?: string;
  /** A button that opens a list of times, every `step` minutes from min to max. */
  slots?: boolean;
  /** Whether the list of times is open (with `slots`). Controlled; pair with onOpenChange. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  /** How wide the field is from 640px up; `sm` by default (`md` with seconds). */
  width?: FieldWidth;
  labels?: TimePickerLabels;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-required'?: boolean | 'true' | 'false';
}

type SegmentType = 'hour' | 'minute' | 'second' | 'dayPeriod';

interface Segments {
  /** 0–23 on a 24-hour clock, 1–12 on a 12-hour one. */
  hour: number | null;
  minute: number | null;
  second: number | null;
  pm: boolean | null;
}

const total = (t: TimeParts) => t.hours * 3600 + t.minutes * 60 + t.seconds;
const fromTotal = (s: number): TimeParts => ({
  hours: Math.floor(s / 3600),
  minutes: Math.floor((s % 3600) / 60),
  seconds: s % 60,
});

/**
 * A time of day typed segment by segment, like a native time input: each of
 * hours, minutes, (seconds) and AM/PM is a WAI-ARIA spinbutton and a Tab
 * stop. Type digits (the next segment takes over once one is full), Up and
 * Down step, Home and End go to the ends, Left and Right move between
 * segments, Backspace clears. The order, separators and AM/PM names come
 * from Intl for `locale`, and so does the clock unless `hourCycle` is set.
 * With `slots`, a button opens a list of times every `step` minutes.
 */
const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(function TimePicker(
  {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    name,
    locale,
    hourCycle: hourCycleProp,
    seconds = false,
    step: stepProp,
    min,
    max,
    slots = false,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    width,
    labels: labelsProp,
    id: idProp,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalidProp,
    'aria-required': ariaRequired,
    onBlur,
    ...props
  },
  ref,
) {
  const labels = { ...timePickerLabels, ...labelsProp };
  const cycle: HourCycle = hourCycleProp ?? localeHourCycle(locale);
  const h12 = cycle === 12;
  const step = Math.max(1, Math.round(stepProp ?? (slots ? 30 : 1)));
  const minuteStep = step < 60 ? step : 1;

  // The range in seconds; without seconds shown, whole minutes inside it.
  const [lo, hi] = React.useMemo(() => {
    const a = parseTime(min);
    const b = parseTime(max);
    let l = a ? total(a) : 0;
    let h = b ? total(b) : 86399;
    if (!seconds) {
      l = Math.ceil(l / 60) * 60;
      h = Math.floor(h / 60) * 60;
    }
    return l <= h ? [l, h] : [0, 86399];
  }, [min, max, seconds]);

  const toSegments = React.useCallback(
    (v: string | null | undefined): Segments => {
      const t = parseTime(v);
      if (!t) return { hour: null, minute: null, second: null, pm: null };
      return {
        hour: h12 ? t.hours % 12 || 12 : t.hours,
        minute: t.minutes,
        second: seconds ? t.seconds : null,
        pm: h12 ? t.hours >= 12 : null,
      };
    },
    [h12, seconds],
  );
  const toParts = (s: Segments): TimeParts | null => {
    if (s.hour === null || s.minute === null) return null;
    if (seconds && s.second === null) return null;
    if (h12 && s.pm === null) return null;
    return {
      hours: h12 ? (s.hour % 12) + (s.pm ? 12 : 0) : s.hour,
      minutes: s.minute,
      seconds: seconds ? (s.second ?? 0) : 0,
    };
  };

  // The committed value, controlled or not.
  const normalise = (v: string | null | undefined) => {
    const t = parseTime(v);
    return t ? formatTime(t, seconds) : null;
  };
  const [uncontrolled, setUncontrolled] = React.useState(() => normalise(defaultValue));
  const controlled = valueProp !== undefined;
  const value = controlled ? normalise(valueProp) : uncontrolled;

  // What the segments show; a value from outside replaces them.
  const [segs, setSegs] = React.useState<Segments>(() => toSegments(value));
  const [synced, setSynced] = React.useState(value);
  if (value !== synced) {
    setSynced(value);
    const shown = toParts(segs);
    if ((shown ? formatTime(shown, seconds) : null) !== value) setSegs(toSegments(value));
  }

  const emit = (v: string | null) => {
    if (v === value) return;
    setSynced(v);
    if (!controlled) setUncontrolled(v);
    onValueChange?.(v);
  };

  /** Shows `next`; a whole time inside the range is committed. `clamp` pulls one outside it in. */
  const commit = (next: Segments, clamp: boolean) => {
    const parts = toParts(next);
    if (!parts) {
      // Until every segment is filled (or once one is cleared) there is no value.
      setSegs(next);
      emit(null);
      return;
    }
    const t = total(parts);
    if (t < lo || t > hi) {
      if (!clamp) {
        setSegs(next);
        return;
      }
      const v = formatTime(fromTotal(t < lo ? lo : hi), seconds);
      setSegs(toSegments(v));
      emit(v);
      return;
    }
    setSegs(next);
    emit(formatTime(parts, seconds));
  };

  // Segment order, separators and AM/PM names, from Intl.
  const layout = React.useMemo(() => {
    const opts: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: seconds ? '2-digit' : undefined,
      hourCycle: h12 ? 'h12' : 'h23',
    };
    let f: Intl.DateTimeFormat;
    try {
      f = new Intl.DateTimeFormat(locale, opts);
    } catch {
      f = new Intl.DateTimeFormat(undefined, opts);
    }
    const period = (h: number) =>
      f.formatToParts(new Date(2000, 0, 1, h)).find((p) => p.type === 'dayPeriod')?.value ??
      (h < 12 ? 'AM' : 'PM');
    const parts: Array<{ type: SegmentType } | { type: 'literal'; value: string }> = [];
    for (const p of f.formatToParts(new Date(2000, 0, 1, 13, 45, 30))) {
      if (p.type === 'hour' || p.type === 'minute' || p.type === 'second')
        parts.push({ type: p.type });
      else if (p.type === 'dayPeriod' && h12) parts.push({ type: 'dayPeriod' });
      else if (p.type === 'literal') parts.push({ type: 'literal', value: p.value });
    }
    if (h12 && !parts.some((p) => p.type === 'dayPeriod')) {
      parts.push({ type: 'literal', value: ' ' }, { type: 'dayPeriod' });
    }
    let numbers: Intl.NumberFormat;
    try {
      numbers = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
    } catch {
      numbers = new Intl.NumberFormat(undefined, { minimumIntegerDigits: 2, useGrouping: false });
    }
    return { parts, am: period(9), pm: period(21), numbers, list: f };
  }, [locale, h12, seconds]);

  const order = layout.parts
    .filter((p): p is { type: SegmentType } => p.type !== 'literal')
    .map((p) => p.type);
  const refs = React.useRef<Partial<Record<SegmentType, HTMLElement | null>>>({});
  const focusSegment = (type: SegmentType | undefined) => {
    if (type) refs.current[type]?.focus();
  };
  const neighbour = (type: SegmentType, delta: number) => order[order.indexOf(type) + delta];

  // Digits typed into one segment, until it is full or the person pauses.
  const typing = React.useRef<{ type: SegmentType | null; text: string; at: number }>({
    type: null,
    text: '',
    at: 0,
  });
  const resetTyping = () => {
    typing.current = { type: null, text: '', at: 0 };
  };

  const bounds = (type: SegmentType): [number, number] => {
    if (type === 'hour') return h12 ? [1, 12] : [0, 23];
    if (type === 'dayPeriod') return [0, 1];
    return [0, 59];
  };
  const read = (type: SegmentType) =>
    type === 'dayPeriod' ? (segs.pm === null ? null : Number(segs.pm)) : segs[type];
  const write = (type: SegmentType, n: number | null): Segments =>
    type === 'dayPeriod' ? { ...segs, pm: n === null ? null : n === 1 } : { ...segs, [type]: n };

  const typeDigit = (type: SegmentType, digit: string) => {
    const [, maxN] = bounds(type);
    const now = Date.now();
    const prev =
      typing.current.type === type && now - typing.current.at < 1500 ? typing.current.text : '';
    let text = prev + digit;
    if (Number(text) > maxN) text = digit;
    let n = Number(text);
    // "0" on a 12-hour clock waits for a second digit; "00" is 12.
    if (type === 'hour' && h12 && n === 0) n = 12;
    const full = text.length === 2 || Number(digit) > Math.floor(maxN / 10);
    commit(write(type, n), false);
    if (full) {
      resetTyping();
      focusSegment(neighbour(type, 1));
    } else typing.current = { type, text, at: now };
  };

  const typePeriod = (char: string) => {
    const c = char.toLocaleLowerCase(locale);
    const am = layout.am.toLocaleLowerCase(locale);
    const pm = layout.pm.toLocaleLowerCase(locale);
    let next: boolean | null = null;
    if (am.startsWith(c) && !pm.startsWith(c)) next = false;
    else if (pm.startsWith(c) && !am.startsWith(c)) next = true;
    else if (c === 'a') next = false;
    else if (c === 'p') next = true;
    if (next === null) return;
    commit({ ...segs, pm: next }, false);
    focusSegment(neighbour('dayPeriod', 1));
  };

  const stepSegment = (type: SegmentType, dir: 1 | -1) => {
    const [minN, maxN] = bounds(type);
    const cur = read(type);
    let n: number;
    if (type === 'dayPeriod') n = cur === null ? 0 : 1 - cur;
    else if (cur === null) n = dir > 0 ? minN : maxN;
    else if (type === 'minute' && minuteStep > 1) {
      if (dir > 0) n = (Math.floor(cur / minuteStep) + 1) * minuteStep;
      else n = cur % minuteStep ? Math.floor(cur / minuteStep) * minuteStep : cur - minuteStep;
      if (n > maxN) n = 0;
      if (n < 0) n = Math.floor(maxN / minuteStep) * minuteStep;
    } else {
      n = cur + dir;
      if (n > maxN) n = minN;
      if (n < minN) n = maxN;
    }
    commit(write(type, n), true);
  };

  const onSegmentKeyDown = (type: SegmentType) => (event: React.KeyboardEvent<HTMLElement>) => {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return;
    const [minN, maxN] = bounds(type);
    switch (event.key) {
      case 'ArrowUp':
        stepSegment(type, 1);
        break;
      case 'ArrowDown':
        stepSegment(type, -1);
        break;
      case 'Home':
        commit(write(type, minN), true);
        break;
      case 'End':
        commit(write(type, maxN), true);
        break;
      case 'ArrowLeft':
        // The segments are always laid out left to right, as times are written.
        focusSegment(neighbour(type, -1));
        break;
      case 'ArrowRight':
        focusSegment(neighbour(type, 1));
        break;
      case 'Backspace':
      case 'Delete':
        if (read(type) === null && event.key === 'Backspace') focusSegment(neighbour(type, -1));
        else commit(write(type, null), false);
        resetTyping();
        break;
      case 'Tab':
      case 'Escape':
        return;
      default:
        // Printable keys are handled here; phone keyboards that send no key
        // name arrive in onBeforeInput instead.
        if (event.key.length !== 1) return;
        if (/\d/.test(event.key)) {
          if (type !== 'dayPeriod') typeDigit(type, event.key);
        } else if (type === 'dayPeriod') typePeriod(event.key);
        break;
    }
    event.preventDefault();
  };

  const onSegmentBeforeInput = (type: SegmentType) => (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();
    const data = (event.nativeEvent as InputEvent).data ?? '';
    if (disabled || !data) return;
    for (const ch of data) {
      if (type === 'dayPeriod') typePeriod(ch);
      else if (/\d/.test(ch)) typeDigit(type, ch);
    }
  };

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const autoId = React.useId();
  const id = idProp ?? `tp${autoId.replace(/:/g, '')}`;

  // A <label for> (a Field's label) cannot name a group, so the group points
  // at it, and a click on it focuses the first segment.
  const [labelledBy, setLabelledBy] = React.useState<string | undefined>(undefined);
  const firstSegment = order[0];
  React.useEffect(() => {
    if (ariaLabel || ariaLabelledBy) return;
    const label = [...document.querySelectorAll('label')].find((l) => l.htmlFor === id);
    if (!label) return;
    if (!label.id) label.id = `${id}-label`;
    setLabelledBy(label.id);
    const onClick = (e: MouseEvent) => {
      e.preventDefault();
      if (firstSegment) refs.current[firstSegment]?.focus();
    };
    label.addEventListener('click', onClick);
    return () => label.removeEventListener('click', onClick);
  }, [id, ariaLabel, ariaLabelledBy, firstSegment]);

  const parts = toParts(segs);
  const outOfRange = !!parts && (total(parts) < lo || total(parts) > hi);
  const invalid = ariaInvalidProp === true || ariaInvalidProp === 'true' || outOfRange;

  const display = (type: SegmentType) => {
    const n = read(type);
    if (n === null) return null;
    if (type === 'dayPeriod') return n ? layout.pm : layout.am;
    return layout.numbers.format(n);
  };

  // The list of times, every `step` minutes from min to max.
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const listOpen = openProp ?? uncontrolledOpen;
  const setListOpen = (next: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const options = React.useMemo(() => {
    if (!slots) return [];
    const out: Array<{ value: string; label: string }> = [];
    // Two-digit hours, the same as the field's segments ("09:00 PM" in both).
    const listFormat = new Intl.DateTimeFormat(layout.list.resolvedOptions().locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: h12 ? 'h12' : 'h23',
    });
    for (let t = Math.ceil(lo / 60) * 60; t <= hi && out.length < 1440; t += step * 60) {
      const p = fromTotal(t);
      out.push({
        value: formatTime(p, seconds),
        label: listFormat.format(new Date(2000, 0, 1, p.hours, p.minutes)),
      });
    }
    return out;
  }, [slots, lo, hi, step, seconds, h12, layout.list]);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const items = [...(listRef.current?.querySelectorAll<HTMLElement>('[role=option]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    let next = -1;
    if (event.key === 'ArrowDown') next = Math.min(items.length - 1, i + 1);
    else if (event.key === 'ArrowUp') next = Math.max(0, i - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = items.length - 1;
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      items[i]?.click();
      return;
    } else return;
    event.preventDefault();
    items[next]?.focus();
  };

  // The option for the current time, else the first at or after it.
  const current = parts ? formatTime(parts, seconds) : null;
  const activeOption =
    options.find((o) => o.value === current) ??
    (current ? options.find((o) => o.value > current) : undefined) ??
    options[0];

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
      aria-describedby={ariaDescribedBy}
      data-slot="time-picker"
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      {...props}
      onBlur={(event) => {
        onBlur?.(event);
        // Leaving the field pulls a typed time outside min and max into range.
        if (rootRef.current?.contains(event.relatedTarget)) return;
        resetTyping();
        if (outOfRange) commit(segs, true);
      }}
      className={cn(
        'flex h-[var(--control-height,2.25rem)] min-w-0 items-stretch rounded-md border border-input bg-surface pr-2 pl-[11px] text-base text-foreground shadow-xs transition-[border-color,box-shadow,background-color] hover:border-border-strong pointer-coarse:h-11 sm:text-sm dark:bg-surface-raised',
        'has-[[data-slot=time-picker-segment]:focus]:border-ring has-[[data-slot=time-picker-segment]:focus]:inset-ring-1 has-[[data-slot=time-picker-segment]:focus]:inset-ring-ring',
        'data-[invalid]:border-destructive data-[invalid]:has-[[data-slot=time-picker-segment]:focus]:inset-ring-destructive',
        'data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted data-[disabled]:opacity-60',
        fieldWidthClasses[width ?? (seconds ? 'md' : 'sm')],
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-stretch tabular-nums" dir="ltr">
        {layout.parts.map((p, i) => {
          if (p.type === 'literal')
            return (
              <span
                key={`l${i}`}
                aria-hidden="true"
                className="self-center whitespace-pre text-muted-foreground"
              >
                {p.value}
              </span>
            );
          const type = p.type;
          const text = display(type);
          const n = read(type);
          const [minN, maxN] = bounds(type);
          const label = {
            hour: labels.hours,
            minute: labels.minutes,
            second: labels.seconds,
            dayPeriod: labels.dayPeriod,
          }[type];
          return (
            <span
              key={type}
              ref={(node) => {
                refs.current[type] = node;
              }}
              role="spinbutton"
              data-slot="time-picker-segment"
              data-segment={type}
              data-placeholder={text === null ? '' : undefined}
              tabIndex={disabled ? -1 : 0}
              aria-label={label}
              aria-valuemin={minN}
              aria-valuemax={maxN}
              aria-valuenow={n ?? undefined}
              aria-valuetext={text ?? labels.empty}
              aria-disabled={disabled || undefined}
              aria-invalid={invalid || undefined}
              aria-required={ariaRequired}
              // An editable box brings up the phone keyboard; every edit is
              // intercepted, so the text never changes underneath React.
              contentEditable={!disabled}
              suppressContentEditableWarning
              spellCheck={false}
              autoCorrect="off"
              inputMode={type === 'dayPeriod' ? 'text' : 'numeric'}
              enterKeyHint="next"
              onKeyDown={onSegmentKeyDown(type)}
              onBeforeInput={onSegmentBeforeInput(type)}
              onPaste={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              onFocus={resetTyping}
              className={cn(
                'flex min-w-[2ch] cursor-text items-center justify-center self-center rounded-sm px-px py-0.5 caret-transparent select-none pointer-coarse:min-w-6 pointer-coarse:self-stretch',
                noOutlineClasses,
                // 44px tall to a touch, over the field's border.
                touchTargetRowClasses,
                'focus:bg-brand-soft focus:text-brand-soft-foreground',
                text === null && 'text-muted-foreground',
                disabled && 'cursor-not-allowed',
              )}
            >
              {text ?? '--'}
            </span>
          );
        })}
      </div>
      {slots && (
        <Popover open={listOpen} onOpenChange={setListOpen}>
          <PopoverTrigger asChild>
            <IconButton
              label={labels.showTimes}
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              className="-me-1.5 self-center"
            >
              <ClockIcon aria-hidden />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            aria-label={labels.showTimes}
            className="max-h-72 w-40 overflow-y-auto p-1"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              const el = listRef.current?.querySelector<HTMLElement>('[role=option][tabindex="0"]');
              el?.scrollIntoView?.({ block: 'center' });
              el?.focus({ preventScroll: true });
            }}
          >
            <div
              ref={listRef}
              role="listbox"
              aria-label={labels.showTimes}
              data-slot="time-picker-list"
              tabIndex={-1}
              onKeyDown={onListKeyDown}
            >
              {options.map((o) => (
                <div
                  key={o.value}
                  role="option"
                  aria-selected={o.value === current}
                  data-value={o.value}
                  tabIndex={o === activeOption ? 0 : -1}
                  onClick={() => {
                    commit(toSegments(o.value), true);
                    setListOpen(false);
                  }}
                  onKeyDown={() => undefined}
                  className={cn(
                    menuItemClasses,
                    'justify-between tabular-nums aria-selected:font-semibold aria-selected:text-brand',
                  )}
                >
                  {o.label}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {name && <input type="hidden" name={name} value={value ?? ''} />}
    </div>
  );
});

export { TimePicker };
