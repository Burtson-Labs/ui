/* eslint-disable jsx-a11y/no-autofocus -- the Calendar autoFocus prop is under test */
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  addMonths,
  Calendar,
  DatePicker,
  type DateRange,
  DateRangePicker,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  InputOTP,
  localeWeekStart,
  otpCharTest,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from '@burtson-labs/ui';

describe('Toggle', () => {
  it('flips aria-pressed and data-state, controlled or not', async () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Bold" onPressedChange={onPressedChange}>
        B
      </Toggle>,
    );
    const button = screen.getByRole('button', { name: 'Bold' });
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.dataset.slot).toBe('toggle');
    await userEvent.click(button);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.dataset.state).toBe('on');
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(button.className).toContain('pointer-coarse:min-h-11');
  });

  it('does not change when disabled', async () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle aria-label="Mute" disabled onPressedChange={onPressedChange}>
        M
      </Toggle>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Mute' }));
    expect(onPressedChange).not.toHaveBeenCalled();
  });
});

describe('ToggleGroup', () => {
  const Single = (props: { onValueChange?: (v: string) => void }) => (
    <ToggleGroup type="single" aria-label="Alignment" defaultValue="center" {...props}>
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
      <ToggleGroupItem value="right" disabled>
        Right
      </ToggleGroupItem>
      <ToggleGroupItem value="justify">Justify</ToggleGroupItem>
    </ToggleGroup>
  );

  it('single is a radio group with one Tab stop on the chosen item', () => {
    render(<Single />);
    expect(screen.getByRole('radiogroup', { name: 'Alignment' })).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
      'false',
      'false',
    ]);
    expect(radios.map((r) => r.tabIndex)).toEqual([-1, 0, -1, -1]);
    expect(radios[0]?.hasAttribute('aria-pressed')).toBe(false);
  });

  it('arrow keys skip disabled items, wrap, and choose in single mode', async () => {
    const onValueChange = vi.fn();
    render(<Single onValueChange={onValueChange} />);
    screen.getByRole('radio', { name: 'Center' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toBe('Justify');
    expect(onValueChange).toHaveBeenLastCalledWith('justify');
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toBe('Left');
    await userEvent.keyboard('{End}');
    expect(document.activeElement?.textContent).toBe('Justify');
    await userEvent.keyboard('{Home}');
    expect(document.activeElement?.textContent).toBe('Left');
    expect(screen.getByRole('radio', { name: 'Left' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('radio', { name: 'Left' }).tabIndex).toBe(0);
  });

  it('clicking the chosen radio keeps it chosen', async () => {
    const onValueChange = vi.fn();
    render(<Single onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Center' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('multiple is a group of pressed buttons; arrows move without toggling', async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup
        type="multiple"
        aria-label="Text style"
        defaultValue={['bold']}
        onValueChange={onValueChange}
      >
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('group', { name: 'Text style' })).toBeTruthy();
    const bold = screen.getByRole('button', { name: 'Bold' });
    const italic = screen.getByRole('button', { name: 'Italic' });
    expect(bold.getAttribute('aria-pressed')).toBe('true');
    expect(bold.tabIndex).toBe(0);
    bold.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(italic);
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith(['bold', 'italic']);
    await userEvent.click(bold);
    expect(onValueChange).toHaveBeenLastCalledWith(['italic']);
    expect(bold.getAttribute('aria-pressed')).toBe('false');
  });

  it('puts the first enabled item in the Tab order when nothing is chosen', () => {
    render(
      <ToggleGroup type="single" aria-label="View">
        <ToggleGroupItem value="a" disabled>
          A
        </ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByRole('radio', { name: 'B' }).tabIndex).toBe(0);
  });
});

describe('HoverCard', () => {
  const Card = (props: { onOpenChange?: (open: boolean) => void }) => (
    <p>
      See{' '}
      <HoverCard openDelay={50} closeDelay={50} {...props}>
        <HoverCardTrigger href="/docs/source">the source</HoverCardTrigger>
        <HoverCardContent>
          Preview text <a href="/full">Read the full source</a>
        </HoverCardContent>
      </HoverCard>{' '}
      <a href="/after">After</a>
    </p>
  );

  it('opens after the delay on keyboard focus and describes the trigger', () => {
    vi.useFakeTimers();
    try {
      render(<Card />);
      const trigger = screen.getByRole('link', { name: 'the source' });
      act(() => {
        trigger.focus();
      });
      expect(document.querySelector('[data-slot=hover-card-content]')).toBeNull();
      act(() => {
        vi.advanceTimersByTime(60);
      });
      const content = document.querySelector<HTMLElement>('[data-slot=hover-card-content]');
      expect(content).not.toBeNull();
      expect(content?.getAttribute('role')).toBeNull();
      expect(trigger.getAttribute('aria-describedby')).toBe(content?.id);
      // Opening does not steal focus.
      expect(document.activeElement).toBe(trigger);
    } finally {
      vi.useRealTimers();
    }
  });

  it('opens on mouse hover but not on touch, and closes after the pointer leaves', () => {
    vi.useFakeTimers();
    try {
      render(<Card />);
      const trigger = screen.getByRole('link', { name: 'the source' });
      fireEvent.pointerEnter(trigger, { pointerType: 'touch' });
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(document.querySelector('[data-slot=hover-card-content]')).toBeNull();
      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' });
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(document.querySelector('[data-slot=hover-card-content]')).not.toBeNull();
      fireEvent.pointerLeave(trigger, { pointerType: 'mouse' });
      // Reaching the card in time keeps it open.
      fireEvent.pointerEnter(document.querySelector('[data-slot=hover-card-content]')!, {
        pointerType: 'mouse',
      });
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(document.querySelector('[data-slot=hover-card-content]')).not.toBeNull();
      fireEvent.pointerLeave(document.querySelector('[data-slot=hover-card-content]')!, {
        pointerType: 'mouse',
      });
      act(() => {
        vi.advanceTimersByTime(60);
      });
      expect(document.querySelector('[data-state=open][data-slot=hover-card-content]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('Tab enters the card, Tab past it continues after the trigger, Escape closes', async () => {
    const onOpenChange = vi.fn();
    render(
      <p>
        <HoverCard defaultOpen onOpenChange={onOpenChange}>
          <HoverCardTrigger href="/docs/source">the source</HoverCardTrigger>
          <HoverCardContent>
            <a href="/full">Read the full source</a>
          </HoverCardContent>
        </HoverCard>{' '}
        <a href="/after">After</a>
      </p>,
    );
    const trigger = screen.getByRole('link', { name: 'the source' });
    trigger.focus();
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('Read the full source');
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(trigger);
    await userEvent.tab();
    await userEvent.tab();
    expect(document.activeElement?.textContent).toBe('After');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('closes on Escape and returns focus to the trigger from inside', async () => {
    const onOpenChange = vi.fn();
    render(
      <HoverCard defaultOpen onOpenChange={onOpenChange}>
        <HoverCardTrigger href="/x">Trigger</HoverCardTrigger>
        <HoverCardContent>
          <a href="/full">Inside</a>
        </HoverCardContent>
      </HoverCard>,
    );
    screen.getByRole('link', { name: 'Inside' }).focus();
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Trigger' }));
  });
});

describe('InputOTP', () => {
  it('is one input with one-time-code autofill and a numeric keyboard', () => {
    render(<InputOTP aria-label="Verification code" length={6} />);
    const inputs = document.querySelectorAll('input');
    expect(inputs.length).toBe(1);
    const input = screen.getByRole('textbox', { name: 'Verification code' });
    expect(input.getAttribute('autocomplete')).toBe('one-time-code');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(document.querySelectorAll('[data-slot=input-otp-slot]').length).toBe(6);
    // The slots are drawing only.
    expect(
      document.querySelector('[data-slot=input-otp-slot]')?.closest('[aria-hidden=true]'),
    ).not.toBeNull();
  });

  it('drops characters outside the pattern and calls onComplete once full', async () => {
    const onComplete = vi.fn();
    const onValueChange = vi.fn();
    render(
      <InputOTP
        aria-label="Code"
        length={4}
        onComplete={onComplete}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' });
    await userEvent.type(input, '1a2-3');
    expect(input.value).toBe('123');
    expect(onComplete).not.toHaveBeenCalled();
    await userEvent.type(input, '45');
    expect(input.value).toBe('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
    const slots = [...document.querySelectorAll('[data-slot=input-otp-slot]')];
    expect(slots.map((s) => s.textContent)).toEqual(['1', '2', '3', '4']);
  });

  it('a paste replaces the code and strips separators', async () => {
    const onComplete = vi.fn();
    render(<InputOTP aria-label="Code" length={6} defaultValue="99" onComplete={onComplete} />);
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Code' });
    input.focus();
    await userEvent.paste('123 456');
    expect(input.value).toBe('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('alphanumeric uses a text keyboard; a custom RegExp tests one character at a time', () => {
    render(<InputOTP aria-label="A" pattern="alphanumeric" length={3} />);
    expect(screen.getByRole('textbox', { name: 'A' }).getAttribute('inputmode')).toBe('text');
    const upper = otpCharTest(/[A-F]/g);
    // The global flag is dropped, so repeated tests do not alternate.
    expect([upper('A'), upper('A'), upper('a'), upper('AB')]).toEqual([true, true, false, false]);
    // An invalid source falls back to digits instead of throwing.
    const broken = otpCharTest('([');
    expect([broken('1'), broken('x')]).toEqual([true, false]);
    // An oversized source is ignored too.
    expect(otpCharTest('a'.repeat(1000))('a')).toBe(false);
  });

  it('marks the next empty slot active and draws a separator per group', () => {
    render(<InputOTP aria-label="Code" length={6} groupSize={3} defaultValue="12" />);
    const slots = [...document.querySelectorAll<HTMLElement>('[data-slot=input-otp-slot]')];
    expect(slots.findIndex((s) => s.hasAttribute('data-active'))).toBe(2);
    expect(document.querySelectorAll('[data-slot=input-otp-separator]').length).toBe(1);
  });
});

describe('Calendar', () => {
  const today = new Date(2026, 9, 25); // Sunday, 25 October 2026

  it('renders a labelled grid with locale names and the chosen week start', () => {
    render(<Calendar locale="en-US" today={today} weekStartsOn={1} />);
    const grid = screen.getByRole('grid', { name: 'October 2026' });
    const headers = [...grid.querySelectorAll('th')].map((th) => th.getAttribute('abbr'));
    expect(headers[0]).toBe('Monday');
    expect(headers[6]).toBe('Sunday');
    const cell = screen.getByRole('gridcell', { name: 'Sunday, October 25, 2026' });
    expect(cell.getAttribute('aria-current')).toBe('date');
    expect(cell.tabIndex).toBe(0);
    expect(grid.querySelectorAll('[tabindex="0"]').length).toBe(1);
  });

  it('uses other locales for names', () => {
    render(<Calendar locale="de-DE" today={today} weekStartsOn={1} />);
    expect(screen.getByRole('grid', { name: 'Oktober 2026' })).toBeTruthy();
  });

  it('navigates the grid with arrows, Home/End and Page Up/Down', async () => {
    render(<Calendar locale="en-US" today={today} weekStartsOn={0} autoFocus />);
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-25');
    await userEvent.keyboard('{ArrowRight}');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-26');
    await userEvent.keyboard('{ArrowDown}');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-11-02');
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeTruthy();
    await userEvent.keyboard('{End}');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-11-07');
    await userEvent.keyboard('{Home}');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-11-01');
    await userEvent.keyboard('{PageUp}');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-01');
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2027-10-01');
    await userEvent.keyboard('{ArrowUp}');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2027-09-24');
  });

  it('clamps months to their last day', () => {
    expect(addMonths(new Date(2026, 0, 31), 1).getDate()).toBe(28);
    expect(addMonths(new Date(2024, 0, 31), 1).getDate()).toBe(29);
  });

  it('chooses with Enter, refuses disabled, min and max days', async () => {
    const onSelect = vi.fn();
    render(
      <Calendar
        locale="en-US"
        today={today}
        min={new Date(2026, 9, 10)}
        max={new Date(2026, 9, 28)}
        disabled={(d) => d.getDay() === 6}
        onSelect={onSelect}
        autoFocus
      />,
    );
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith(new Date(2026, 9, 25));
    expect(
      screen
        .getByRole('gridcell', { name: 'Sunday, October 25, 2026' })
        .getAttribute('aria-selected'),
    ).toBe('true');
    const saturday = screen.getByRole('gridcell', { name: 'Saturday, October 24, 2026' });
    expect(saturday.getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(saturday);
    await userEvent.click(screen.getByRole('gridcell', { name: 'Friday, October 9, 2026' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    // Keyboard movement stops at max, and the next month button is disabled.
    await userEvent.keyboard('{PageDown}');
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-28');
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Next month' }).disabled).toBe(
      true,
    );
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Previous month' }).disabled).toBe(
      true,
    );
  });

  it('accepts a list of disabled dates', () => {
    render(<Calendar locale="en-US" today={today} disabled={[new Date(2026, 9, 12)]} />);
    expect(
      screen
        .getByRole('gridcell', { name: 'Monday, October 12, 2026' })
        .getAttribute('aria-disabled'),
    ).toBe('true');
  });

  it('range mode: first press starts, second ends, an earlier day swaps', async () => {
    const ranges: DateRange[] = [];
    render(<Calendar mode="range" locale="en-US" today={today} onSelect={(r) => ranges.push(r)} />);
    await userEvent.click(screen.getByRole('gridcell', { name: 'Tuesday, October 20, 2026' }));
    await userEvent.click(screen.getByRole('gridcell', { name: 'Thursday, October 15, 2026' }));
    expect(ranges[0]).toEqual({ from: new Date(2026, 9, 20), to: undefined });
    expect(ranges[1]).toEqual({ from: new Date(2026, 9, 15), to: new Date(2026, 9, 20) });
    const selected = document.querySelectorAll('[aria-selected=true]');
    expect(selected.length).toBe(6);
    expect(document.querySelector('[data-range-start]')?.getAttribute('data-date')).toBe(
      '2026-10-15',
    );
    expect(document.querySelector('[data-range-end]')?.getAttribute('data-date')).toBe(
      '2026-10-20',
    );
    // A third press starts a new range.
    await userEvent.click(screen.getByRole('gridcell', { name: 'Monday, October 26, 2026' }));
    expect(ranges[2]).toEqual({ from: new Date(2026, 9, 26), to: undefined });
  });

  it('turns the page with the month buttons', async () => {
    const onMonthChange = vi.fn();
    render(<Calendar locale="en-US" today={today} onMonthChange={onMonthChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeTruthy();
    expect(onMonthChange).toHaveBeenCalledWith(new Date(2026, 10, 1));
  });

  it('finds the locale week start when the runtime knows it', () => {
    expect([0, 1]).toContain(localeWeekStart('en-GB'));
    expect(localeWeekStart('not a locale')).toBe(0);
  });
});

describe('DatePicker', () => {
  it('opens on the chosen day, chooses, closes and returns focus', async () => {
    const onValueChange = vi.fn();
    render(
      <form data-testid="form">
        <DatePicker
          aria-label="Pickup date"
          locale="en-US"
          defaultValue={new Date(2026, 9, 25)}
          onValueChange={onValueChange}
          name="pickup"
        />
      </form>,
    );
    const trigger = screen.getByRole('button', { name: 'Pickup date' });
    expect(trigger.textContent).toContain('Oct 25, 2026');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    const hidden = document.querySelector<HTMLInputElement>('input[name=pickup]');
    expect(hidden?.value).toBe('2026-10-25');
    await userEvent.click(trigger);
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-25');
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 9, 26));
    expect(document.querySelector('[data-slot=calendar]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.textContent).toContain('Oct 26, 2026');
    expect(hidden?.value).toBe('2026-10-26');
  });

  it('shows the placeholder and closes on Escape without a change', async () => {
    const onValueChange = vi.fn();
    render(
      <DatePicker aria-label="Date" placeholder="Choose a day" onValueChange={onValueChange} />,
    );
    const trigger = screen.getByRole('button', { name: 'Date' });
    expect(trigger.textContent).toContain('Choose a day');
    await userEvent.click(trigger);
    expect(document.querySelector('[data-slot=calendar]')).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(document.querySelector('[data-slot=calendar]')).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('the range picker closes once both ends are set', async () => {
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        aria-label="Stay"
        locale="en-US"
        defaultValue={{ from: new Date(2026, 9, 3) }}
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Stay' });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('gridcell', { name: 'Friday, October 9, 2026' }));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 9, 3),
      to: new Date(2026, 9, 9),
    });
    expect(document.querySelector('[data-slot=calendar]')).toBeNull();
    expect(trigger.textContent).toMatch(/Oct 3\s*–\s*9, 2026/);
  });

  it('keeps a controlled value', async () => {
    function Controlled() {
      const [value, setValue] = React.useState<Date | null>(null);
      return (
        <>
          <DatePicker aria-label="Due" locale="en-US" value={value} onValueChange={setValue} />
          <output>{value ? value.getDate() : 'none'}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Due' }));
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('status').textContent).toBe(String(new Date().getDate()));
  });
});
