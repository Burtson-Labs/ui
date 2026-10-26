import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../src/index';
import * as SelectPrimitive from '../src/primitives/select';

afterEach(() => {
  vi.useRealTimers();
  document.body.removeAttribute('style');
});

const activeName = () => document.activeElement?.textContent?.trim();

function Pets(
  props: React.ComponentProps<typeof Select> & { position?: 'popper' | 'item-aligned' },
) {
  const { position, ...rest } = props;
  return (
    <Select {...rest}>
      <SelectTrigger aria-label="Pet" className="w-40">
        <SelectValue placeholder="Pick a pet" />
      </SelectTrigger>
      <SelectContent position={position}>
        <SelectGroup>
          <SelectLabel>Mammals</SelectLabel>
          <SelectItem value="cat">Cat</SelectItem>
          <SelectItem value="dog">Dog</SelectItem>
          <SelectItem value="ferret" disabled>
            Ferret
          </SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectItem value="snake">Snake</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Select', () => {
  it('is a combobox button that shows the placeholder, then the chosen option text while closed', () => {
    const { unmount } = render(<Pets />);
    const trigger = screen.getByRole('combobox', { name: 'Pet' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-autocomplete')).toBe('none');
    expect(trigger.hasAttribute('data-placeholder')).toBe(true);
    expect(trigger.textContent).toContain('Pick a pet');
    expect(screen.queryByRole('listbox')).toBeNull();
    unmount();
    render(<Pets defaultValue="dog" />);
    const chosen = screen.getByRole('combobox', { name: 'Pet' });
    expect(chosen.textContent).toContain('Dog');
    expect(chosen.hasAttribute('data-placeholder')).toBe(false);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('opens with Enter on the chosen option, moves with arrows, chooses with Enter and returns focus', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onOpenChange = vi.fn();
    render(<Pets defaultValue="dog" onValueChange={onValueChange} onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Pet' });
    trigger.focus();
    await user.keyboard('{Enter}');
    const listbox = await screen.findByRole('listbox');
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(listbox.id);
    const dog = screen.getByRole('option', { name: 'Dog' });
    expect(document.activeElement).toBe(dog);
    expect(dog.getAttribute('aria-selected')).toBe('true');
    expect(dog.dataset.state).toBe('checked');
    expect(dog.hasAttribute('data-highlighted')).toBe(true);
    expect(screen.getByRole('option', { name: 'Cat' }).getAttribute('aria-selected')).toBe('false');
    await user.keyboard('{ArrowDown}');
    // Ferret is disabled: skipped.
    expect(activeName()).toBe('Snake');
    await user.keyboard('{ArrowDown}');
    expect(activeName()).toBe('Snake');
    await user.keyboard('{Home}');
    expect(activeName()).toBe('Cat');
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('cat');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(trigger.textContent).toContain('Cat');
  });

  it('opens with Space, Up and Down, and Escape closes without choosing', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Pets onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Pet' });
    trigger.focus();
    for (const key of ['{ArrowDown}', '{ArrowUp}', ' ']) {
      await user.keyboard(key);
      await screen.findByRole('listbox');
      // No value yet: the first option takes focus.
      expect(activeName()).toBe('Cat');
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      await waitFor(() => expect(document.activeElement).toBe(trigger));
    }
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('chooses by typing while closed and moves by typing while open', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Pets onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Pet' });
    trigger.focus();
    await user.keyboard('s');
    expect(onValueChange).toHaveBeenLastCalledWith('snake');
    expect(screen.queryByRole('listbox')).toBeNull();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    expect(activeName()).toBe('Snake');
    await user.keyboard('d');
    expect(activeName()).toBe('Dog');
  });

  it('opens on a press and chooses on release after a drag onto an option', async () => {
    const onValueChange = vi.fn();
    render(<Pets onValueChange={onValueChange} />);
    const trigger = screen.getByRole('combobox', { name: 'Pet' });
    fireEvent.pointerDown(trigger, { button: 0, clientX: 10, clientY: 10 });
    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeTruthy();
    const dog = screen.getByRole('option', { name: 'Dog' });
    // Released where it was pressed: nothing chosen yet, the list stays.
    fireEvent.pointerUp(dog, { button: 0, clientX: 12, clientY: 12 });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
    fireEvent.keyDown(dog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    fireEvent.pointerDown(trigger, { button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(await screen.findByRole('option', { name: 'Dog' }), {
      button: 0,
      clientX: 60,
      clientY: 80,
    });
    expect(onValueChange).toHaveBeenCalledWith('dog');
  });

  it('chooses an option with a click and ignores disabled ones', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Pets onValueChange={onValueChange} />);
    await user.click(screen.getByRole('combobox', { name: 'Pet' }));
    await screen.findByRole('listbox');
    const ferret = screen.getByRole('option', { name: 'Ferret' });
    expect(ferret.getAttribute('aria-disabled')).toBe('true');
    expect(ferret.hasAttribute('data-disabled')).toBe(true);
    await user.click(ferret);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.click(screen.getByRole('option', { name: 'Snake' }));
    expect(onValueChange).toHaveBeenCalledWith('snake');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  });

  it('labels groups and hides separators from assistive technology', async () => {
    const user = userEvent.setup();
    render(<Pets />);
    await user.click(screen.getByRole('combobox', { name: 'Pet' }));
    const group = await screen.findByRole('group', { name: 'Mammals' });
    expect(group.contains(screen.getByRole('option', { name: 'Cat' }))).toBe(true);
    const separator = document.querySelector('[data-slot="select-separator"]');
    expect(separator?.getAttribute('aria-hidden')).toBe('true');
  });

  it('is modal while open: the page is inert and locked, focus is trapped', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>outside</button>
        <Pets />
      </>,
    );
    const outside = screen.getByRole('button', { name: 'outside' });
    await user.click(screen.getByRole('combobox', { name: 'Pet' }));
    await screen.findByRole('listbox');
    expect(document.body.style.pointerEvents).toBe('none');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(outside.closest('[aria-hidden="true"]')).not.toBeNull();
    await user.keyboard('{Tab}');
    expect(screen.getByRole('listbox').contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    expect(document.body.style.pointerEvents).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('submits through a hidden native select, with required and autofill', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Pets name="pet" defaultValue="cat" required onValueChange={onValueChange} />
      </form>,
    );
    const form = container.querySelector('form')!;
    expect(new FormData(form).get('pet')).toBe('cat');
    const native = form.querySelector<HTMLSelectElement>('select[name="pet"]')!;
    expect(native.required).toBe(true);
    expect(native.getAttribute('aria-hidden')).toBe('true');
    expect(native.tabIndex).toBe(-1);
    expect([...native.options].map((o) => o.value)).toEqual(['', 'cat', 'dog', 'ferret', 'snake']);
    await user.click(screen.getByRole('combobox', { name: 'Pet' }));
    await user.click(await screen.findByRole('option', { name: 'Snake' }));
    expect(new FormData(form).get('pet')).toBe('snake');
    // The browser autofilling the native control sets the value.
    fireEvent.change(native, { target: { value: 'dog' } });
    expect(onValueChange).toHaveBeenLastCalledWith('dog');
    expect(screen.getByRole('combobox', { name: 'Pet' }).textContent).toContain('Dog');
  });

  it('renders no native select outside a form unless it has a name', () => {
    const { container, rerender } = render(<Pets />);
    expect(container.querySelector('select')).toBeNull();
    rerender(<Pets name="pet" />);
    expect(container.querySelector('select[name="pet"]')).not.toBeNull();
  });

  it('shows the placeholder again when the controlled value is reset to ""', () => {
    const { rerender } = render(<Pets value="dog" onValueChange={() => {}} />);
    const trigger = screen.getByRole('combobox', { name: 'Pet' });
    expect(trigger.textContent).toContain('Dog');
    rerender(<Pets value="" onValueChange={() => {}} />);
    expect(trigger.textContent).toContain('Pick a pet');
    expect(trigger.hasAttribute('data-placeholder')).toBe(true);
  });

  it('honours disabled on the root and on the trigger', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Pets disabled />);
    const trigger = screen.getByRole('combobox', { name: 'Pet' });
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    expect(trigger.hasAttribute('data-disabled')).toBe(true);
    await user.click(trigger);
    expect(screen.queryByRole('listbox')).toBeNull();
    rerender(<Pets />);
    expect((trigger as HTMLButtonElement).disabled).toBe(false);
  });

  it('places the list in a fixed wrapper that publishes the trigger size variables (item-aligned) or beside the trigger (popper)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Pets position="item-aligned" />);
    await user.click(screen.getByRole('combobox', { name: 'Pet' }));
    const listbox = await screen.findByRole('listbox');
    const wrapper = listbox.closest<HTMLElement>('[data-bl-anchored]')!;
    expect(wrapper.style.position).toBe('fixed');
    expect(wrapper.style.getPropertyValue('--bl-anchor-width')).toBe('0px');
    expect(wrapper.style.getPropertyValue('--radix-select-trigger-width')).toBe(
      'var(--bl-anchor-width)',
    );
    expect(wrapper.style.getPropertyValue('--radix-select-content-available-height')).toBe(
      'var(--bl-available-height)',
    );
    expect(listbox.hasAttribute('data-side')).toBe(false);
    unmount();
    render(<Pets position="popper" />);
    await user.click(screen.getByRole('combobox', { name: 'Pet' }));
    const popper = await screen.findByRole('listbox');
    expect(popper.dataset.side).toBe('bottom');
    expect(popper.dataset.align).toBe('start');
    const popperWrapper = popper.closest<HTMLElement>('[data-bl-anchored]')!;
    expect(popperWrapper.style.getPropertyValue('--radix-select-trigger-height')).toBe(
      'var(--bl-anchor-height)',
    );
  });

  it('shows scroll buttons only when the viewport can scroll that way', async () => {
    const user = userEvent.setup();
    render(
      <SelectPrimitive.Root defaultOpen>
        <SelectPrimitive.Trigger aria-label="Pet">
          <SelectPrimitive.Value placeholder="Pick" />
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content>
            <SelectPrimitive.ScrollUpButton data-testid="up" />
            <SelectPrimitive.Viewport data-testid="viewport">
              <SelectPrimitive.Item value="a">
                <SelectPrimitive.ItemText>A</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
              <SelectPrimitive.Item value="b">
                <SelectPrimitive.ItemText>B</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton data-testid="down" />
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>,
    );
    const viewport = await screen.findByTestId('viewport');
    expect(screen.queryByTestId('up')).toBeNull();
    expect(screen.queryByTestId('down')).toBeNull();
    Object.defineProperty(viewport, 'scrollHeight', { value: 400, configurable: true });
    Object.defineProperty(viewport, 'clientHeight', { value: 100, configurable: true });
    viewport.scrollTop = 0;
    fireEvent.scroll(viewport);
    expect(screen.queryByTestId('up')).toBeNull();
    expect(screen.getByTestId('down').getAttribute('aria-hidden')).toBe('true');
    viewport.scrollTop = 50;
    fireEvent.scroll(viewport);
    expect(screen.getByTestId('up')).toBeTruthy();
    // Resting the pointer on a button scrolls steadily.
    vi.useFakeTimers();
    act(() => {
      fireEvent.pointerMove(screen.getByTestId('down'), { pointerType: 'mouse' });
      vi.advanceTimersByTime(64);
    });
    expect(viewport.scrollTop).toBeGreaterThan(50);
    act(() => {
      fireEvent.pointerLeave(screen.getByTestId('down'), { pointerType: 'mouse' });
    });
    const after = viewport.scrollTop;
    act(() => {
      vi.advanceTimersByTime(64);
    });
    expect(viewport.scrollTop).toBe(after);
    vi.useRealTimers();
    await user.keyboard('{Escape}');
  });

  it('keeps the ItemText node for the trigger, so icons in options show in the value', async () => {
    const user = userEvent.setup();
    render(
      <Select defaultValue="x">
        <SelectTrigger aria-label="Shape">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="x">
            <span data-testid="icon" /> Cross
          </SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Shape' });
    expect(trigger.querySelector('[data-testid="icon"]')).not.toBeNull();
    expect(trigger.textContent).toContain('Cross');
    await user.click(trigger);
    expect(await screen.findByRole('option', { name: 'Cross' })).toBeTruthy();
  });
});
