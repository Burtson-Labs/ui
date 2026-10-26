/* eslint-disable jsx-a11y/no-autofocus -- the Calendar autoFocus prop is under test */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Calendar,
  DatePicker,
  type DateRange,
  DateRangePicker,
  DateTimePicker,
  Field,
  formatTime,
  localeHourCycle,
  parseTime,
  TimePicker,
} from '@burtson-labs/ui';

const today = new Date(2026, 9, 25); // Sunday, 25 October 2026
const focusedDate = () => (document.activeElement as HTMLElement).dataset.date;
const grids = () => screen.getAllByRole('grid').map((g) => g.getAttribute('aria-labelledby'));
const gridNames = () =>
  screen
    .getAllByRole('grid')
    .map((g) => document.getElementById(g.getAttribute('aria-labelledby')!)?.textContent);
const segment = (name: string) => screen.getByRole('spinbutton', { name });
const formValues = (form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries());

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Calendar with several months', () => {
  it('shows the months side by side with one pair of month buttons and one Tab stop', () => {
    render(<Calendar locale="en-US" today={today} numberOfMonths={2} />);
    expect(gridNames()).toEqual(['October 2026', 'November 2026']);
    expect(screen.getAllByRole('button', { name: 'Previous month' }).length).toBe(1);
    expect(screen.getAllByRole('button', { name: 'Next month' }).length).toBe(1);
    expect(document.querySelectorAll('[data-slot=calendar-day][tabindex="0"]').length).toBe(1);
    // Every month keeps six rows; a neighbour's days are left out beside another month.
    for (const grid of screen.getAllByRole('grid'))
      expect(grid.querySelectorAll('tbody tr').length).toBe(6);
    expect(document.querySelector('[data-outside] span')).toBeNull();
  });

  it('clamps the count to 1–3', () => {
    const { rerender } = render(<Calendar locale="en-US" today={today} numberOfMonths={7} />);
    expect(grids().length).toBe(3);
    rerender(<Calendar locale="en-US" today={today} numberOfMonths={0} />);
    expect(grids().length).toBe(1);
  });

  it('moves across month boundaries and turns only when leaving the months shown', async () => {
    const onMonthChange = vi.fn();
    render(
      <Calendar
        locale="en-US"
        today={new Date(2026, 9, 31)}
        weekStartsOn={0}
        numberOfMonths={2}
        onMonthChange={onMonthChange}
        autoFocus
      />,
    );
    expect(focusedDate()).toBe('2026-10-31');
    // Into the second grid without turning the page.
    await userEvent.keyboard('{ArrowRight}');
    expect(focusedDate()).toBe('2026-11-01');
    expect(gridNames()).toEqual(['October 2026', 'November 2026']);
    expect(onMonthChange).not.toHaveBeenCalled();
    // Back into the first.
    await userEvent.keyboard('{ArrowLeft}');
    expect(focusedDate()).toBe('2026-10-31');
    // Past the last month shown: it becomes the last, so the page turns by one.
    // (Page Down keeps the day where it can: 31 October, 30 November, 30 December.)
    await userEvent.keyboard('{PageDown}{PageDown}');
    expect(focusedDate()).toBe('2026-12-30');
    expect(gridNames()).toEqual(['November 2026', 'December 2026']);
    expect(onMonthChange).toHaveBeenLastCalledWith(new Date(2026, 10, 1));
    // Before the first month shown: it becomes the first.
    await userEvent.keyboard('{PageUp}{PageUp}');
    expect(focusedDate()).toBe('2026-10-30');
    expect(gridNames()).toEqual(['October 2026', 'November 2026']);
    await userEvent.keyboard('{Home}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(focusedDate()).toBe('2026-09-20');
    expect(gridNames()).toEqual(['September 2026', 'October 2026']);
    expect(document.querySelectorAll('[data-slot=calendar-day][tabindex="0"]').length).toBe(1);
  });

  it('selects a range across months and shows it in both grids', async () => {
    const ranges: DateRange[] = [];
    render(
      <Calendar
        mode="range"
        locale="en-US"
        today={today}
        numberOfMonths={2}
        onSelect={(r) => ranges.push(r)}
      />,
    );
    await userEvent.click(screen.getByRole('gridcell', { name: 'Wednesday, October 28, 2026' }));
    // The preview spans the months while the end is chosen.
    fireEvent.pointerEnter(screen.getByRole('gridcell', { name: 'Tuesday, November 3, 2026' }));
    expect(document.querySelectorAll('[data-preview]').length).toBe(6);
    await userEvent.click(screen.getByRole('gridcell', { name: 'Tuesday, November 3, 2026' }));
    expect(ranges.at(-1)).toEqual({ from: new Date(2026, 9, 28), to: new Date(2026, 10, 3) });
    const [oct, nov] = screen.getAllByRole('grid');
    expect(oct!.querySelectorAll('[aria-selected=true]').length).toBe(4);
    expect(nov!.querySelectorAll('[aria-selected=true]').length).toBe(3);
    expect(oct!.querySelector('[data-range-start]')?.getAttribute('data-date')).toBe('2026-10-28');
    expect(nov!.querySelector('[data-range-end]')?.getAttribute('data-date')).toBe('2026-11-03');
  });

  it('disables the next button when max falls inside the months shown', () => {
    render(
      <Calendar
        locale="en-US"
        today={today}
        numberOfMonths={2}
        max={new Date(2026, 10, 20)}
        min={new Date(2026, 9, 1)}
      />,
    );
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next month' }).disabled).toBe(
      true,
    );
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Previous month' }).disabled).toBe(
      true,
    );
  });
});

describe('Date picker labels and forms', () => {
  it('reads every string from labels', async () => {
    render(
      <DatePicker
        aria-label="Abholung"
        locale="de-DE"
        labels={{
          placeholder: 'Datum wählen',
          dialog: 'Abholdatum wählen',
          previousMonth: 'Vorheriger Monat',
          nextMonth: 'Nächster Monat',
        }}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Abholung' });
    expect(trigger.textContent).toContain('Datum wählen');
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Abholdatum wählen' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Vorheriger Monat' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nächster Monat' })).toBeTruthy();
  });

  it('defaults the placeholders and the popover name', async () => {
    render(
      <>
        <DatePicker aria-label="One" />
        <DateRangePicker aria-label="Two" />
      </>,
    );
    expect(screen.getByRole('button', { name: 'One' }).textContent).toContain('Pick a date');
    expect(screen.getByRole('button', { name: 'Two' }).textContent).toContain('Pick dates');
    await userEvent.click(screen.getByRole('button', { name: 'Two' }));
    expect(screen.getByRole('dialog', { name: 'Choose dates' })).toBeTruthy();
  });

  it('the range picker submits both days', async () => {
    render(
      <form data-testid="form">
        <DateRangePicker
          aria-label="Stay"
          locale="en-US"
          name="stay"
          numberOfMonths={1}
          defaultValue={{ from: new Date(2026, 9, 3) }}
        />
        <DateRangePicker
          aria-label="Trip"
          startName="depart"
          endName="return"
          defaultValue={{ from: new Date(2026, 0, 30), to: new Date(2026, 1, 2) }}
        />
      </form>,
    );
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect(formValues(form)).toEqual({
      stayFrom: '2026-10-03',
      stayTo: '',
      depart: '2026-01-30',
      return: '2026-02-02',
    });
    await userEvent.click(screen.getByRole('button', { name: 'Stay' }));
    await userEvent.click(screen.getByRole('gridcell', { name: 'Friday, October 9, 2026' }));
    expect(formValues(form).stayTo).toBe('2026-10-09');
  });

  it('the range picker shows two months from lg up and one below', () => {
    const narrow = { matches: false };
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('max-width') ? narrow.matches : !narrow.matches,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    const { unmount } = render(<DateRangePicker aria-label="Wide" defaultOpen />);
    expect(grids().length).toBe(2);
    unmount();
    narrow.matches = true;
    render(<DateRangePicker aria-label="Narrow" defaultOpen />);
    expect(grids().length).toBe(1);
  });

  it('the single picker takes numberOfMonths', () => {
    render(<DatePicker aria-label="Due" defaultOpen numberOfMonths={3} />);
    expect(grids().length).toBe(3);
  });
});

describe('TimePicker', () => {
  it('parses and writes HH:mm[:ss]', () => {
    expect(parseTime('09:05')).toEqual({ hours: 9, minutes: 5, seconds: 0 });
    expect(parseTime('23:59:30')).toEqual({ hours: 23, minutes: 59, seconds: 30 });
    expect(parseTime('24:00')).toBeNull();
    expect(parseTime('9:5')).toBeNull();
    expect(formatTime({ hours: 7, minutes: 3, seconds: 9 }, true)).toBe('07:03:09');
    expect(localeHourCycle('en-US')).toBe(12);
    expect(localeHourCycle('en-GB')).toBe(24);
    expect(localeHourCycle('de-DE')).toBe(24);
  });

  it('follows the locale clock: AM/PM in en-US, 24-hour in en-GB and de-DE', () => {
    const { unmount } = render(
      <TimePicker aria-label="Start" locale="en-US" defaultValue="14:05" />,
    );
    const group = screen.getByRole('group', { name: 'Start' });
    expect(segment('Hours').getAttribute('aria-valuetext')).toBe('02');
    expect(segment('Hours').getAttribute('aria-valuemax')).toBe('12');
    expect(segment('AM/PM').getAttribute('aria-valuetext')).toBe('PM');
    expect(group.textContent).toMatch(/^02:05\sPM$/);
    unmount();

    const gb = render(<TimePicker aria-label="Start" locale="en-GB" defaultValue="14:05" />);
    expect(segment('Hours').getAttribute('aria-valuetext')).toBe('14');
    expect(segment('Hours').getAttribute('aria-valuemax')).toBe('23');
    expect(screen.queryByRole('spinbutton', { name: 'AM/PM' })).toBeNull();
    gb.unmount();

    const de = render(<TimePicker aria-label="Start" locale="de-DE" defaultValue="09:30" />);
    expect(screen.getByRole('group', { name: 'Start' }).textContent).toBe('09:30');
    de.unmount();

    // An explicit hourCycle wins over the locale.
    render(<TimePicker aria-label="Start" locale="en-US" hourCycle={24} defaultValue="14:05" />);
    expect(segment('Hours').getAttribute('aria-valuetext')).toBe('14');
    expect(screen.queryByRole('spinbutton', { name: 'AM/PM' })).toBeNull();
  });

  it('types segment by segment, moving on when one is full', async () => {
    const onValueChange = vi.fn();
    render(<TimePicker aria-label="Start" locale="en-US" onValueChange={onValueChange} />);
    expect(segment('Hours').getAttribute('aria-valuetext')).toBe('Empty');
    segment('Hours').focus();
    // 9 cannot start a two-digit hour on a 12-hour clock, so it moves on.
    await userEvent.keyboard('9');
    expect(document.activeElement).toBe(segment('Minutes'));
    await userEvent.keyboard('3');
    expect(document.activeElement).toBe(segment('Minutes'));
    await userEvent.keyboard('0');
    expect(document.activeElement).toBe(segment('AM/PM'));
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('p');
    expect(onValueChange).toHaveBeenLastCalledWith('21:30');
    // Two digits for 10, 11, 12; 1 then 3 starts over at 3.
    segment('Hours').focus();
    await userEvent.keyboard('12');
    expect(onValueChange).toHaveBeenLastCalledWith('12:30');
    segment('Hours').focus();
    await userEvent.keyboard('13');
    expect(onValueChange).toHaveBeenLastCalledWith('15:30');
    // Backspace clears the segment and the value.
    segment('Minutes').focus();
    await userEvent.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(segment('Minutes').getAttribute('aria-valuetext')).toBe('Empty');
  });

  it('24-hour typing and arrow keys per segment, wrapping', async () => {
    const onValueChange = vi.fn();
    render(
      <TimePicker
        aria-label="Start"
        locale="en-GB"
        defaultValue="23:58"
        onValueChange={onValueChange}
      />,
    );
    segment('Hours').focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('00:58');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith('22:58');
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(segment('Minutes'));
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('22:00');
    await userEvent.keyboard('{End}');
    expect(onValueChange).toHaveBeenLastCalledWith('22:59');
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(segment('Hours'));
    // 2 waits for a second digit; 5 would make 25, so it starts over at 05.
    await userEvent.keyboard('25');
    expect(onValueChange).toHaveBeenLastCalledWith('05:59');
    expect(segment('Hours').getAttribute('aria-valuenow')).toBe('5');
  });

  it('steps minutes by step', async () => {
    const onValueChange = vi.fn();
    render(
      <TimePicker
        aria-label="Start"
        locale="en-GB"
        step={15}
        defaultValue="10:07"
        onValueChange={onValueChange}
      />,
    );
    segment('Minutes').focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('10:15');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith('10:45');
  });

  it('clamps to min and max: arrows at once, typing on blur', async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <TimePicker
          aria-label="Shift"
          locale="en-GB"
          min="09:00"
          max="17:30"
          defaultValue="17:00"
          onValueChange={onValueChange}
        />
        <button type="button">After</button>
      </>,
    );
    segment('Hours').focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('17:30');
    await userEvent.keyboard('08');
    // Out of range while typing: shown and marked invalid, but not reported.
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(segment('Hours').getAttribute('aria-invalid')).toBe('true');
    await userEvent.click(screen.getByRole('button', { name: 'After' }));
    expect(onValueChange).toHaveBeenLastCalledWith('09:00');
    expect(segment('Hours').getAttribute('aria-valuenow')).toBe('9');
    expect(segment('Hours').getAttribute('aria-invalid')).toBeNull();
  });

  it('submits HH:mm, or HH:mm:ss with seconds', async () => {
    render(
      <form data-testid="form">
        <TimePicker aria-label="Start" locale="en-GB" name="start" defaultValue="08:15" />
        <TimePicker aria-label="Lap" locale="en-GB" name="lap" seconds defaultValue="00:01:30" />
        <TimePicker aria-label="Empty" name="empty" />
      </form>,
    );
    const form = screen.getByTestId<HTMLFormElement>('form');
    expect(formValues(form)).toEqual({ start: '08:15', lap: '00:01:30', empty: '' });
    screen.getAllByRole('spinbutton', { name: 'Seconds' })[0]!.focus();
    await userEvent.keyboard('45');
    expect(formValues(form).lap).toBe('00:01:45');
  });

  it('keeps a controlled value', async () => {
    function Controlled() {
      const [value, setValue] = React.useState<string | null>('10:00');
      return (
        <>
          <TimePicker aria-label="Start" locale="en-GB" value={value} onValueChange={setValue} />
          <output>{value ?? 'none'}</output>
          <button type="button" onClick={() => setValue('06:45')}>
            Early
          </button>
        </>
      );
    }
    render(<Controlled />);
    segment('Minutes').focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('status').textContent).toBe('10:01');
    await userEvent.click(screen.getByRole('button', { name: 'Early' }));
    expect(segment('Hours').getAttribute('aria-valuenow')).toBe('6');
    expect(segment('Minutes').getAttribute('aria-valuenow')).toBe('45');
  });

  it('is named by a Field label, which focuses the first segment', async () => {
    render(
      <Field label="Start time" description="Local time.">
        <TimePicker locale="en-GB" />
      </Field>,
    );
    const group = screen.getByRole('group', { name: 'Start time' });
    expect(group.getAttribute('aria-describedby')).toBeTruthy();
    await userEvent.click(screen.getByText('Start time'));
    expect(document.activeElement).toBe(segment('Hours'));
  });

  it('lists times every step from min to max', async () => {
    const onValueChange = vi.fn();
    render(
      <TimePicker
        aria-label="Slot"
        locale="en-US"
        slots
        min="09:00"
        max="11:00"
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Show times' }));
    const options = screen.getAllByRole('option');
    expect(options.map((o) => o.textContent)).toEqual([
      '9:00 AM',
      '9:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
    ]);
    expect(document.activeElement).toBe(options[0]);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('10:00');
    expect(screen.queryByRole('listbox')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Show times' }));
    const chosen = screen.getByRole('option', { selected: true });
    expect(chosen.textContent).toBe('10:00 AM');
    expect(document.activeElement).toBe(chosen);
    await userEvent.click(screen.getByRole('option', { name: '11:00 AM' }));
    expect(onValueChange).toHaveBeenLastCalledWith('11:00');
  });

  it('disabled segments leave the Tab order', () => {
    render(<TimePicker aria-label="Start" disabled defaultValue="10:00" />);
    for (const s of screen.getAllByRole('spinbutton')) {
      expect(s.tabIndex).toBe(-1);
      expect(s.getAttribute('aria-disabled')).toBe('true');
    }
  });
});

describe('DateTimePicker', () => {
  it('reports a local Date once both halves are set and submits YYYY-MM-DDTHH:mm', async () => {
    const onValueChange = vi.fn();
    render(
      <form data-testid="form">
        <DateTimePicker
          aria-label="Pickup"
          locale="en-US"
          name="pickup"
          numberOfMonths={1}
          onValueChange={onValueChange}
        />
      </form>,
    );
    const form = screen.getByTestId<HTMLFormElement>('form');
    const group = screen.getByRole('group', { name: 'Pickup' });
    expect(formValues(form).pickup).toBe('');
    // The time first: nothing to report without a day.
    segment('Hours').focus();
    await userEvent.keyboard('230p');
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Date' }));
    await userEvent.keyboard('{Enter}');
    const now = new Date();
    expect(onValueChange).toHaveBeenLastCalledWith(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30),
    );
    const pad = (n: number) => String(n).padStart(2, '0');
    expect(formValues(form).pickup).toBe(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T14:30`,
    );
    expect(group.contains(screen.getByRole('group', { name: 'Time' }))).toBe(true);
    // Clearing either half clears the value.
    segment('Minutes').focus();
    await userEvent.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(formValues(form).pickup).toBe('');
  });

  it('shows a default value and submits seconds when asked', () => {
    render(
      <form data-testid="form">
        <DateTimePicker
          aria-label="Due"
          locale="en-GB"
          name="due"
          seconds
          defaultValue={new Date(2026, 9, 25, 9, 5, 7)}
        />
      </form>,
    );
    expect(formValues(screen.getByTestId<HTMLFormElement>('form')).due).toBe('2026-10-25T09:05:07');
    expect(screen.getByRole('button', { name: 'Date' }).textContent).toContain('25 Oct 2026');
  });

  it('bounds the time on the min day and pulls an earlier time into it', async () => {
    const onValueChange = vi.fn();
    render(
      <DateTimePicker
        aria-label="Start"
        locale="en-GB"
        numberOfMonths={1}
        min={new Date(2026, 9, 25, 13, 0)}
        defaultValue={new Date(2026, 9, 26, 9, 15)}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Date' }));
    await userEvent.click(screen.getByRole('gridcell', { name: 'Sunday, 25 October 2026' }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 25, 13, 0));
    // On the min day the hours cannot step below 13.
    segment('Hours').focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 25, 13, 0));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('keeps a controlled value', async () => {
    function Controlled() {
      const [value, setValue] = React.useState<Date | null>(new Date(2026, 9, 25, 8, 0));
      return (
        <>
          <DateTimePicker aria-label="When" locale="en-GB" value={value} onValueChange={setValue} />
          <output>{value ? value.toISOString() : 'none'}</output>
        </>
      );
    }
    render(<Controlled />);
    segment('Hours').focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('status').textContent).toBe(new Date(2026, 9, 25, 9, 0).toISOString());
  });
});

describe('clearable pickers', () => {
  it('DatePicker clears to null from the popover and empties its form value', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker
        aria-label="Due"
        name="due"
        clearable
        defaultValue={new Date(2026, 9, 25)}
        onValueChange={onValueChange}
      />,
    );
    const input = container.querySelector('input[name="due"]') as HTMLInputElement;
    expect(input.value).toBe('2026-10-25');
    await userEvent.click(screen.getByRole('button', { name: /Due/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Clear' }));
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(input.value).toBe('');
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
  });

  it('shows no Clear button without clearable or without a value', async () => {
    render(<DatePicker aria-label="Due" clearable />);
    await userEvent.click(screen.getByRole('button', { name: /Due/ }));
    expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();
  });

  it('DateRangePicker clears both ends', async () => {
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        aria-label="Stay"
        clearable
        defaultValue={{ from: new Date(2026, 9, 1), to: new Date(2026, 9, 4) }}
        onValueChange={onValueChange}
        labels={{ clear: 'Reset' }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Stay/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Reset' }));
    expect(onValueChange).toHaveBeenCalledWith({});
    expect(screen.getByRole('button', { name: /Stay/ }).textContent).toContain('Pick dates');
  });
});
