import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Checkbox,
  CheckboxRow,
  Dialog,
  DialogContent,
  DialogTitle,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  Separator,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  Toaster,
} from '../src/index';
import * as AccordionPrimitive from '../src/primitives/accordion';
import { positionForThumb, thumbOffset } from '../src/primitives/scroll-area';
import * as ScrollAreaPrimitive from '../src/primitives/scroll-area';
import * as TabsPrimitive from '../src/primitives/tabs';
import { matchesHotkey } from '../src/primitives/toast';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const attr = (element: Element, name: string) => element.getAttribute(name);
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });
const values = (mock: { mock: { calls: unknown[][] } }) => mock.mock.calls.map(([v]) => v);

function TabsExample(props: Partial<React.ComponentProps<typeof Tabs>>) {
  return (
    <Tabs defaultValue="one" {...props}>
      <TabsList aria-label="Sections">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
        <TabsTrigger value="three" disabled>
          Three
        </TabsTrigger>
        <TabsTrigger value="four four">Four</TabsTrigger>
      </TabsList>
      <TabsContent value="one">Panel one</TabsContent>
      <TabsContent value="two">Panel two</TabsContent>
      <TabsContent value="three">Panel three</TabsContent>
      <TabsContent value="four four" forceMount>
        Panel four
      </TabsContent>
    </Tabs>
  );
}

describe('tabs', () => {
  it('wires tabs to panels and marks the selected one', () => {
    render(<TabsExample />);
    const tab = screen.getByRole('tab', { name: 'One' });
    const panel = screen.getByRole('tabpanel');
    expect(attr(tab, 'aria-selected')).toBe('true');
    expect(attr(tab, 'data-state')).toBe('active');
    expect(attr(tab, 'aria-controls')).toBe(panel.id);
    expect(attr(panel, 'aria-labelledby')).toBe(tab.id);
    expect(attr(panel, 'tabindex')).toBe('0');
    expect(attr(screen.getByRole('tablist'), 'aria-orientation')).toBe('horizontal');
    // A value with a space still makes valid, single-token ids.
    const four = screen.getByRole('tab', { name: 'Four' });
    expect(attr(four, 'aria-controls')).not.toMatch(/\s/);
    // forceMount keeps the inactive panel in the DOM, hidden.
    const forced = document.getElementById(attr(four, 'aria-controls')!)!;
    expect(forced.hidden).toBe(true);
    expect(attr(forced, 'data-state')).toBe('inactive');
    // Without forceMount an inactive panel is not rendered.
    expect(screen.queryByText('Panel two')).toBeNull();
  });

  it('automatic activation: arrows move focus and select, skipping disabled, wrapping', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TabsExample onValueChange={onValueChange} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'One' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel two');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Four' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'One' }));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Four' }));
    await user.keyboard('{Home}');
    expect(values(onValueChange)).toEqual(['two', 'four four', 'one', 'four four', 'one']);
  });

  it('manual activation: arrows only move focus; Enter and Space select', async () => {
    const user = userEvent.setup();
    render(<TabsExample activationMode="manual" />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    const two = screen.getByRole('tab', { name: 'Two' });
    expect(document.activeElement).toBe(two);
    expect(attr(two, 'aria-selected')).toBe('false');
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel one');
    await user.keyboard('{Enter}');
    expect(attr(two, 'aria-selected')).toBe('true');
    await user.keyboard('{ArrowLeft}');
    await user.keyboard(' ');
    expect(attr(screen.getByRole('tab', { name: 'One' }), 'aria-selected')).toBe('true');
  });

  it('focus entering the list lands on the selected tab, not the last focused one', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <TabsExample activationMode="manual" />
      </>,
    );
    await user.tab();
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Two' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'One' }));
  });

  it('vertical orientation uses Up and Down; RTL mirrors Left and Right', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TabsExample orientation="vertical" />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'One' }));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Two' }));
    expect(attr(screen.getByRole('tablist'), 'aria-orientation')).toBe('vertical');
    unmount();
    render(<TabsExample dir="rtl" />);
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Two' }));
  });

  it('a primary-button press selects on mousedown; a Ctrl-press does not', () => {
    render(<TabsExample />);
    const two = screen.getByRole('tab', { name: 'Two' });
    fireEvent.mouseDown(two, { button: 0, ctrlKey: true });
    expect(attr(two, 'aria-selected')).toBe('false');
    fireEvent.mouseDown(two, { button: 0 });
    expect(attr(two, 'aria-selected')).toBe('true');
  });

  it('exports long and short names', () => {
    expect(TabsPrimitive.Root).toBe(TabsPrimitive.Tabs);
    expect(TabsPrimitive.Trigger).toBe(TabsPrimitive.TabsTrigger);
  });
});

function AccordionExample(props: Record<string, unknown>) {
  const shared = { type: 'single', ...props } as unknown as React.ComponentProps<typeof Accordion>;
  return (
    <Accordion {...shared}>
      <AccordionItem value="a">
        <AccordionTrigger>Alpha</AccordionTrigger>
        <AccordionContent>Alpha body</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b" disabled>
        <AccordionTrigger>Beta</AccordionTrigger>
        <AccordionContent>Beta body</AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>Gamma</AccordionTrigger>
        <AccordionContent>Gamma body</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe('accordion', () => {
  it('single: opening one closes the other; the open one cannot close unless collapsible', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<AccordionExample defaultValue="a" />);
    const alpha = screen.getByRole('button', { name: 'Alpha' });
    const gamma = screen.getByRole('button', { name: 'Gamma' });
    expect(attr(alpha, 'aria-expanded')).toBe('true');
    expect(attr(alpha, 'aria-disabled')).toBe('true');
    await user.click(alpha);
    expect(attr(alpha, 'aria-expanded')).toBe('true');
    await user.click(gamma);
    expect(attr(gamma, 'aria-expanded')).toBe('true');
    expect(attr(alpha, 'aria-expanded')).toBe('false');
    expect(screen.queryByText('Alpha body')).toBeNull();
    unmount();
    const onValueChange = vi.fn();
    render(<AccordionExample defaultValue="a" collapsible onValueChange={onValueChange} />);
    const again = screen.getByRole('button', { name: 'Alpha' });
    expect(again.hasAttribute('aria-disabled')).toBe(false);
    await user.click(again);
    expect(attr(again, 'aria-expanded')).toBe('false');
    expect(onValueChange).toHaveBeenCalledWith('');
  });

  it('multiple: any number open, reported as an array', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<AccordionExample type="multiple" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('button', { name: 'Alpha' }));
    await user.click(screen.getByRole('button', { name: 'Gamma' }));
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['a', 'c']);
    await user.click(screen.getByRole('button', { name: 'Alpha' }));
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(['c']);
  });

  it('wires the region to its button and publishes the height variables', () => {
    render(<AccordionExample defaultValue="a" />);
    const trigger = screen.getByRole('button', { name: 'Alpha' });
    const region = screen.getByRole('region');
    expect(attr(region, 'aria-labelledby')).toBe(trigger.id);
    expect(attr(trigger, 'aria-controls')).toBe(region.id);
    expect(region.style.getPropertyValue('--radix-accordion-content-height')).toBe(
      'var(--bl-collapsible-content-height)',
    );
    expect(region.style.getPropertyValue('--bl-accordion-content-height')).toBe(
      'var(--bl-collapsible-content-height)',
    );
    expect(region.style.getPropertyValue('--radix-collapsible-content-height')).toMatch(/px$/);
    expect(trigger.closest('h3')?.getAttribute('data-state')).toBe('open');
    expect(attr(region, 'data-orientation')).toBe('vertical');
  });

  it('arrows, Home and End move between enabled triggers, wrapping', async () => {
    const user = userEvent.setup();
    render(<AccordionExample />);
    const alpha = screen.getByRole('button', { name: 'Alpha' });
    const gamma = screen.getByRole('button', { name: 'Gamma' });
    alpha.focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(gamma);
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(alpha);
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(gamma);
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(alpha);
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(gamma);
    // Left and Right do nothing in a vertical accordion.
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(gamma);
  });

  it('horizontal orientation moves with Left and Right', async () => {
    const user = userEvent.setup();
    render(<AccordionExample orientation="horizontal" />);
    screen.getByRole('button', { name: 'Alpha' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Gamma' }));
  });

  it('exports long and short names', () => {
    expect(AccordionPrimitive.Root).toBe(AccordionPrimitive.Accordion);
    expect(AccordionPrimitive.Header).toBe(AccordionPrimitive.AccordionHeader);
  });
});

function submit(form: HTMLFormElement) {
  return Object.fromEntries(
    [...new FormData(form).entries()].map(([k, v]) => [k, typeof v === 'string' ? v : v.name]),
  );
}

describe('checkbox', () => {
  it('toggles on press and Space, not on Enter; indeterminate goes to checked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        aria-label="Agree"
        defaultChecked="indeterminate"
        onCheckedChange={onCheckedChange}
      />,
    );
    const box = screen.getByRole('checkbox');
    expect(attr(box, 'aria-checked')).toBe('mixed');
    expect(attr(box, 'data-state')).toBe('indeterminate');
    await user.click(box);
    expect(attr(box, 'aria-checked')).toBe('true');
    await user.keyboard('{Enter}');
    expect(attr(box, 'aria-checked')).toBe('true');
    await user.keyboard(' ');
    expect(attr(box, 'aria-checked')).toBe('false');
    expect(attr(box, 'data-state')).toBe('unchecked');
    expect(values(onCheckedChange)).toEqual([true, false]);
  });

  it('a label pointing at it, or wrapping it, toggles it', async () => {
    const user = userEvent.setup();
    render(
      <>
        <CheckboxRow label="Send a copy" />
        <Label>
          <Checkbox /> Wrapped
        </Label>
      </>,
    );
    await user.click(screen.getByText('Send a copy'));
    expect(attr(screen.getByRole('checkbox', { name: 'Send a copy' }), 'aria-checked')).toBe(
      'true',
    );
    await user.click(screen.getByText('Wrapped'));
    expect(attr(screen.getByRole('checkbox', { name: 'Wrapped' }), 'aria-checked')).toBe('true');
  });

  it('submits, validates and resets through the form', async () => {
    const user = userEvent.setup();
    const changes = vi.fn();
    render(
      <form aria-label="f" onReset={() => undefined}>
        <Checkbox aria-label="Terms" name="terms" value="yes" required />
        <Checkbox aria-label="News" name="news" defaultChecked />
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>('form');
    form.addEventListener('change', changes);
    expect(submit(form)).toEqual({ news: 'on' });
    expect(form.checkValidity()).toBe(false);
    await user.click(screen.getByRole('checkbox', { name: 'Terms' }));
    expect(submit(form)).toEqual({ terms: 'yes', news: 'on' });
    expect(form.checkValidity()).toBe(true);
    expect(changes).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('checkbox', { name: 'News' }));
    expect(submit(form)).toEqual({ terms: 'yes' });
    act(() => {
      form.reset();
    });
    expect(attr(screen.getByRole('checkbox', { name: 'Terms' }), 'aria-checked')).toBe('false');
    expect(attr(screen.getByRole('checkbox', { name: 'News' }), 'aria-checked')).toBe('true');
    expect(submit(form)).toEqual({ news: 'on' });
    // The proxy is hidden from assistive technology and the Tab sequence.
    const proxy = form.querySelector('input')!;
    expect(attr(proxy, 'aria-hidden')).toBe('true');
    expect(proxy.tabIndex).toBe(-1);
  });

  it('renders no proxy input outside a form; disabled blocks toggling', async () => {
    const user = userEvent.setup();
    const { container } = render(<Checkbox aria-label="Off" disabled />);
    expect(container.querySelector('input')).toBeNull();
    const box = screen.getByRole('checkbox');
    expect(attr(box, 'data-disabled')).toBe('');
    await user.click(box);
    expect(attr(box, 'aria-checked')).toBe('false');
  });
});

describe('radio group', () => {
  function Group(props: Partial<React.ComponentProps<typeof RadioGroup>>) {
    return (
      <RadioGroup aria-label="Plan" {...props}>
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" disabled />
        <RadioGroupItem value="c" aria-label="C" />
      </RadioGroup>
    );
  }

  it('is one Tab stop; arrows move and choose, skipping disabled, wrapping', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Group defaultValue="c" onValueChange={onValueChange} />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'C' }));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'A' }));
    expect(attr(screen.getByRole('radio', { name: 'A' }), 'aria-checked')).toBe('true');
    await user.keyboard('{ArrowRight}');
    expect(attr(screen.getByRole('radio', { name: 'C' }), 'aria-checked')).toBe('true');
    expect(values(onValueChange)).toEqual(['a', 'c']);
    // Tab leaves the group.
    await user.tab();
    expect(document.activeElement).toBe(document.body);
  });

  it('Space chooses, Enter does not; loop={false} stops at the ends', async () => {
    const user = userEvent.setup();
    render(<Group loop={false} />);
    await user.tab();
    const a = screen.getByRole('radio', { name: 'A' });
    expect(document.activeElement).toBe(a);
    await user.keyboard('{Enter}');
    expect(attr(a, 'aria-checked')).toBe('false');
    await user.keyboard(' ');
    expect(attr(a, 'aria-checked')).toBe('true');
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(a);
  });

  it('orientation limits the arrows', async () => {
    const user = userEvent.setup();
    render(<Group orientation="horizontal" defaultValue="a" />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'A' }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'C' }));
    expect(attr(screen.getByRole('radiogroup'), 'aria-orientation')).toBe('horizontal');
  });

  it('submits its name and value, validates required and resets', async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="f">
        <Group name="plan" required />
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>('form');
    expect(form.checkValidity()).toBe(false);
    expect(attr(screen.getByRole('radiogroup'), 'aria-required')).toBe('true');
    await user.click(screen.getByRole('radio', { name: 'C' }));
    expect(submit(form)).toEqual({ plan: 'c' });
    expect(form.checkValidity()).toBe(true);
    act(() => {
      form.reset();
    });
    expect(attr(screen.getByRole('radio', { name: 'C' }), 'aria-checked')).toBe('false');
    expect(submit(form)).toEqual({});
  });
});

describe('switch', () => {
  it('role switch, toggles, submits and validates', async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="f">
        <Switch aria-label="Alerts" name="alerts" required />
      </form>,
    );
    const form = screen.getByRole<HTMLFormElement>('form');
    const control = screen.getByRole('switch');
    expect(attr(control, 'aria-checked')).toBe('false');
    expect(form.checkValidity()).toBe(false);
    await user.click(control);
    expect(attr(control, 'aria-checked')).toBe('true');
    expect(attr(control.querySelector('[data-slot=switch-thumb]')!, 'data-state')).toBe('checked');
    expect(submit(form)).toEqual({ alerts: 'on' });
    expect(form.checkValidity()).toBe(true);
    await user.keyboard('{Enter}');
    expect(attr(control, 'aria-checked')).toBe('false');
  });
});

describe('toast', () => {
  function Example(props: Partial<React.ComponentProps<typeof Toast>>) {
    return (
      <ToastProvider>
        <Toast {...props}>
          <ToastTitle>Saved</ToastTitle>
          <ToastDescription>Build 12 is live.</ToastDescription>
          <ToastAction altText="Open the deploy log">View</ToastAction>
          <ToastClose />
        </Toast>
        <ToastViewport />
      </ToastProvider>
    );
  }

  it('renders in a labelled, live-marked region and is read once', () => {
    vi.useFakeTimers();
    render(<Example />);
    const region = screen.getByRole('region', { name: 'Notifications (F8)' });
    expect(region.hasAttribute('data-bl-live')).toBe(true);
    const list = region.querySelector('ol')!;
    expect(list.querySelectorAll('li')).toHaveLength(1);
    // The toast itself is not a live region.
    expect(list.querySelector('li')!.hasAttribute('aria-live')).toBe(false);
    const announcer = document.querySelector('[data-bl-toast-announce]')!;
    expect(attr(announcer, 'aria-live')).toBe('assertive');
    expect(announcer.textContent).toBe('');
    advance(60);
    expect(announcer.textContent).toBe('Notification Saved Build 12 is live. Open the deploy log');
    advance(1000);
    expect(document.querySelector('[data-bl-toast-announce]')).toBeNull();
  });

  it('background toasts are announced politely', () => {
    render(<Example type="background" />);
    expect(attr(document.querySelector('[data-bl-toast-announce]')!, 'aria-live')).toBe('polite');
  });

  it('closes after its duration, pausing on hover, focus and window blur', () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    const onPause = vi.fn();
    const onResume = vi.fn();
    render(
      <Example duration={1000} onOpenChange={onOpenChange} onPause={onPause} onResume={onResume} />,
    );
    const list = screen.getByRole('region').querySelector('ol')!;
    advance(600);
    fireEvent.pointerEnter(list, { pointerType: 'mouse' });
    expect(onPause).toHaveBeenCalledTimes(1);
    advance(5000);
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.pointerLeave(list, { pointerType: 'mouse' });
    expect(onResume).toHaveBeenCalledTimes(1);
    advance(300);
    expect(onOpenChange).not.toHaveBeenCalled();
    // Focus inside pauses too.
    act(() => {
      screen.getByRole('button', { name: 'View' }).focus();
    });
    advance(5000);
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => {
      screen.getByRole('button', { name: 'View' }).blur();
    });
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    advance(5000);
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    // 600 + 300 used; 100 left.
    advance(99);
    expect(onOpenChange).not.toHaveBeenCalled();
    advance(2);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('the hotkey focuses the viewport; Escape closes a focused toast', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} duration={Infinity} />);
    const list = screen.getByRole('region').querySelector('ol')!;
    await user.keyboard('{F8}');
    expect(document.activeElement).toBe(list);
    await user.tab();
    expect(document.activeElement).toBe(list.querySelector('li'));
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.activeElement).toBe(list);
  });

  it('matches hotkeys by code and modifiers', () => {
    const event = new KeyboardEvent('keydown', { code: 'KeyT', altKey: true });
    expect(matchesHotkey(event, ['altKey', 'KeyT'])).toBe(true);
    expect(matchesHotkey(event, ['KeyT', 'ctrlKey'])).toBe(false);
    expect(matchesHotkey(event, [])).toBe(false);
  });

  it('Action and Close close it', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await user.click(screen.getByRole('button', { name: 'View' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('swipe: moves with the pointer, dismisses past the threshold, springs back short of it', () => {
    const onOpenChange = vi.fn();
    const onSwipeEnd = vi.fn<(event: CustomEvent<{ delta: { x: number; y: number } }>) => void>();
    const onSwipeCancel = vi.fn();
    render(
      <Example onOpenChange={onOpenChange} onSwipeEnd={onSwipeEnd} onSwipeCancel={onSwipeCancel} />,
    );
    const item = screen.getByRole('region').querySelector('li')!;
    fireEvent.pointerDown(item, { button: 0, pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 120, clientY: 101 });
    expect(attr(item, 'data-swipe')).toBe('move');
    expect(item.style.getPropertyValue('--bl-toast-swipe-move-x')).toBe('20px');
    expect(item.style.getPropertyValue('--radix-toast-swipe-move-x')).toBe('20px');
    expect(item.style.getPropertyValue('--radix-toast-swipe-move-y')).toBe('0px');
    fireEvent.pointerUp(item, { pointerId: 1, clientX: 120, clientY: 101 });
    expect(attr(item, 'data-swipe')).toBe('cancel');
    expect(onSwipeCancel).toHaveBeenCalledTimes(1);
    expect(item.style.getPropertyValue('--bl-toast-swipe-move-x')).toBe('');
    // Backwards does not start a swipe.
    fireEvent.pointerDown(item, { button: 0, pointerId: 2, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(item, { pointerId: 2, clientX: 60, clientY: 100 });
    expect(attr(item, 'data-swipe')).toBe('cancel');
    fireEvent.pointerUp(item, { pointerId: 2 });
    fireEvent.pointerDown(item, { button: 0, pointerId: 3, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(item, { pointerId: 3, clientX: 140, clientY: 100 });
    fireEvent.pointerMove(item, { pointerId: 3, clientX: 170, clientY: 100 });
    fireEvent.pointerUp(item, { pointerId: 3, clientX: 170, clientY: 100 });
    expect(onSwipeEnd).toHaveBeenCalledTimes(1);
    expect(onSwipeEnd.mock.calls[0]![0].detail.delta).toEqual({ x: 70, y: 0 });
    expect(attr(item, 'data-swipe')).toBe('end');
    expect(item.style.getPropertyValue('--radix-toast-swipe-end-x')).toBe('70px');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('a toast behind a modal dialog stays visible, pressable and focusable', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <>
        <Dialog defaultOpen>
          <DialogContent aria-describedby={undefined}>
            <DialogTitle>Settings</DialogTitle>
            <button type="button">Inside</button>
          </DialogContent>
        </Dialog>
        <Example onOpenChange={onOpenChange} duration={Infinity} />
      </>,
    );
    const region = screen.getByRole('region', { name: 'Notifications (F8)' });
    expect(region.closest('[aria-hidden="true"]')).toBeNull();
    expect(region.closest('[inert]')).toBeNull();
    await user.keyboard('{F8}');
    expect(document.activeElement).toBe(region.querySelector('ol'));
    // The dialog's focus trap leaves focus in the toast region.
    await user.tab();
    expect(document.activeElement).toBe(region.querySelector('li'));
    // Escape there is the region's: the dialog behind stays open.
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('toast() renders through the Toaster', () => {
    render(<Toaster />);
    act(() => {
      toast({ title: 'Copied', description: 'The key is on the clipboard.' });
    });
    expect(screen.getByText('Copied')).toBeTruthy();
    expect(screen.getByRole('region').querySelector('[data-slot=toast]')).toBeTruthy();
  });
});

describe('scroll area', () => {
  const metrics = { viewport: 100, content: 400, track: 100, thumb: 25 };

  it('maps scroll positions to thumb offsets and back, LTR and RTL', () => {
    expect(thumbOffset(0, metrics, [0, 300])).toBe(0);
    expect(thumbOffset(300, metrics, [0, 300])).toBe(75);
    expect(thumbOffset(150, metrics, [0, 300])).toBe(37.5);
    // RTL horizontal: 0 is the start (thumb at the right end), -300 the far left.
    expect(thumbOffset(0, metrics, [-300, 0])).toBe(75);
    expect(thumbOffset(-300, metrics, [-300, 0])).toBe(0);
    expect(positionForThumb(75, metrics, [0, 300])).toBe(300);
    expect(positionForThumb(0, metrics, [-300, 0])).toBe(-300);
    expect(positionForThumb(1000, metrics, [0, 300])).toBe(300);
    expect(positionForThumb(-5, metrics, [0, 300])).toBe(0);
  });

  it('scrolls only the axes that have a scrollbar, and hides the native ones', () => {
    render(<ScrollArea className="h-10">Text</ScrollArea>);
    const viewport = document.querySelector<HTMLElement>('[data-slot=scroll-area-viewport]')!;
    expect(viewport.style.overflowY).toBe('scroll');
    expect(viewport.style.overflowX).toBe('hidden');
    expect(document.querySelector('style')?.textContent).toContain('scrollbar-width:none');
    const root = document.querySelector<HTMLElement>('[data-slot=scroll-area]')!;
    expect(root.style.getPropertyValue('--radix-scroll-area-corner-width')).toBe('0px');
  });

  it('type="always" shows the scrollbar without overflow; hover waits for the pointer', () => {
    const { unmount } = render(
      <ScrollAreaPrimitive.Root type="always">
        <ScrollAreaPrimitive.Viewport>Text</ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar data-testid="bar">
          <ScrollAreaPrimitive.Thumb data-testid="thumb" />
        </ScrollAreaPrimitive.Scrollbar>
      </ScrollAreaPrimitive.Root>,
    );
    expect(attr(screen.getByTestId('bar'), 'data-state')).toBe('visible');
    // Nothing to scroll: no thumb.
    expect(screen.queryByTestId('thumb')).toBeNull();
    unmount();
    render(
      <ScrollAreaPrimitive.Root type="hover">
        <ScrollAreaPrimitive.Viewport>Text</ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar data-testid="bar" />
      </ScrollAreaPrimitive.Root>,
    );
    expect(screen.queryByTestId('bar')).toBeNull();
  });
});

describe('avatar', () => {
  class FakeImage extends EventTarget {
    static last: FakeImage | null = null;
    src = '';
    referrerPolicy = '';
    crossOrigin: string | null = null;
    complete = false;
    naturalWidth = 0;
    constructor() {
      super();
      FakeImage.last = this;
    }
  }

  it('shows the fallback until the image loads, reports each status and passes referrerPolicy', () => {
    vi.stubGlobal('Image', FakeImage);
    const statuses: string[] = [];
    render(
      <Avatar>
        <AvatarImage
          src="/me.png"
          alt="Me"
          referrerPolicy="no-referrer"
          onLoadingStatusChange={(s) => statuses.push(s)}
        />
        <AvatarFallback>MB</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('MB')).toBeTruthy();
    expect(screen.queryByRole('img')).toBeNull();
    expect(FakeImage.last?.referrerPolicy).toBe('no-referrer');
    act(() => {
      FakeImage.last!.dispatchEvent(new Event('load'));
    });
    const img = screen.getByRole('img', { name: 'Me' });
    expect(attr(img, 'referrerpolicy')).toBe('no-referrer');
    expect(screen.queryByText('MB')).toBeNull();
    expect(statuses).toEqual(['loading', 'loaded']);
    vi.unstubAllGlobals();
  });

  it('an error keeps the fallback; delayMs holds it back', () => {
    vi.useFakeTimers();
    vi.stubGlobal('Image', FakeImage);
    render(
      <Avatar>
        <AvatarImage src="/broken.png" alt="" />
        <AvatarFallback delayMs={500}>AS</AvatarFallback>
      </Avatar>,
    );
    act(() => {
      FakeImage.last!.dispatchEvent(new Event('error'));
    });
    expect(screen.queryByText('AS')).toBeNull();
    advance(500);
    expect(screen.getByText('AS')).toBeTruthy();
    vi.unstubAllGlobals();
  });
});

describe('progress, separator, label', () => {
  it('progress exposes its value, a label, and indeterminate when null', () => {
    const { rerender } = render(<Progress aria-label="Upload" value={25} />);
    const bar = screen.getByRole('progressbar');
    expect(attr(bar, 'aria-valuenow')).toBe('25');
    expect(attr(bar, 'aria-valuemin')).toBe('0');
    expect(attr(bar, 'aria-valuemax')).toBe('100');
    expect(attr(bar, 'aria-valuetext')).toBe('25%');
    expect(attr(bar, 'data-state')).toBe('loading');
    rerender(<Progress aria-label="Upload" value={null} />);
    expect(bar.hasAttribute('aria-valuenow')).toBe(false);
    expect(attr(bar, 'data-state')).toBe('indeterminate');
    rerender(
      <Progress aria-label="Upload" value={4} max={4} getValueLabel={(v, m) => `${v} of ${m}`} />,
    );
    expect(attr(bar, 'aria-valuetext')).toBe('4 of 4');
    expect(attr(bar, 'data-state')).toBe('complete');
  });

  it('separator: decorative is role none; semantic vertical has aria-orientation', () => {
    const { container } = render(
      <>
        <Separator />
        <Separator decorative={false} orientation="vertical" />
        <Separator decorative={false} />
      </>,
    );
    const [decorative, vertical, horizontal] = container.querySelectorAll('[data-slot=separator]');
    expect(attr(decorative!, 'role')).toBe('none');
    expect(attr(vertical!, 'role')).toBe('separator');
    expect(attr(vertical!, 'aria-orientation')).toBe('vertical');
    expect(attr(vertical!, 'data-orientation')).toBe('vertical');
    expect(horizontal!.hasAttribute('aria-orientation')).toBe(false);
  });

  it('label: a double press on the caption does not select text; on a control it is left alone', () => {
    render(
      <Label>
        Caption <input aria-label="Field" />
      </Label>,
    );
    const label = screen.getByText(/Caption/);
    expect(fireEvent.mouseDown(label, { detail: 2 })).toBe(false);
    expect(fireEvent.mouseDown(label, { detail: 1 })).toBe(true);
    expect(fireEvent.mouseDown(screen.getByRole('textbox'), { detail: 2 })).toBe(true);
  });
});
