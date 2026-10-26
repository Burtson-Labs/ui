import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '../src/index';
import { graceTriangle, pointInPolygon } from '../src/primitives/pointer-intent';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.removeAttribute('style');
});

const activeName = () => document.activeElement?.textContent?.trim();

function Basic({ loop, dir, modal }: { loop?: boolean; dir?: 'ltr' | 'rtl'; modal?: boolean }) {
  return (
    <DropdownMenu dir={dir} modal={modal}>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent loop={loop}>
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem disabled>Billing</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>Link</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('pointer intent', () => {
  it('builds the grace triangle toward the submenu and tests points against it', () => {
    const polygon = graceTriangle(
      { x: 150, y: 50 },
      { left: 200, top: 0, right: 400, bottom: 200 },
    );
    expect(polygon).toEqual([
      { x: 145, y: 50 },
      { x: 200, y: -5 },
      { x: 200, y: 205 },
    ]);
    // Diagonally toward the submenu: inside. Straight down the parent: outside.
    expect(pointInPolygon({ x: 170, y: 60 }, polygon)).toBe(true);
    expect(pointInPolygon({ x: 190, y: 150 }, polygon)).toBe(true);
    expect(pointInPolygon({ x: 150, y: 150 }, polygon)).toBe(false);
    expect(pointInPolygon({ x: 100, y: 50 }, polygon)).toBe(false);
    // A submenu that opened to the left uses its right edge.
    const left = graceTriangle({ x: 450, y: 50 }, { left: 200, top: 0, right: 400, bottom: 200 });
    expect(left[0]).toEqual({ x: 455, y: 50 });
    expect(left[1]?.x).toBe(400);
  });
});

describe('DropdownMenu', () => {
  it('is a menu button: Enter opens with the first row focused, Escape closes and returns focus', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.focus();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    expect(menu.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id);
    expect(trigger.dataset.state).toBe('open');
    expect(activeName()).toBe('Profile');
    expect(screen.getByRole('menuitem', { name: 'Profile' }).hasAttribute('data-highlighted')).toBe(
      true,
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('opens from a press with focus on the surface, and the press does not toggle it twice', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await user.click(trigger);
    const menu = await screen.findByRole('menu');
    expect(document.activeElement).toBe(menu);
    expect(screen.queryByRole('menuitem', { name: 'Billing' })?.getAttribute('aria-disabled')).toBe(
      'true',
    );
    await user.keyboard('{ArrowDown}');
    expect(activeName()).toBe('Profile');
  });

  it('cancels the browser focus change of the press, so the inert page cannot take focus and close the menu', () => {
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    // fireEvent returns false once a handler has called preventDefault().
    expect(fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' })).toBe(false);
    expect(screen.getByRole('menu')).toBeTruthy();
    expect(fireEvent.pointerDown(trigger, { button: 2, pointerType: 'mouse' })).toBe(true);
  });

  it('moves with the arrows (skipping disabled rows), Home and End, and wraps with loop', async () => {
    const user = userEvent.setup();
    render(<Basic loop />);
    screen.getByRole('button', { name: 'Actions' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(activeName()).toBe('Profile');
    await user.keyboard('{ArrowDown}');
    expect(activeName()).toBe('Settings');
    await user.keyboard('{End}');
    expect(activeName()).toBe('Sign out');
    await user.keyboard('{ArrowDown}');
    expect(activeName()).toBe('Profile');
    await user.keyboard('{ArrowUp}');
    expect(activeName()).toBe('Sign out');
    await user.keyboard('{Home}');
    expect(activeName()).toBe('Profile');
  });

  it('does not wrap without loop', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    screen.getByRole('button', { name: 'Actions' }).focus();
    await user.keyboard('{ArrowDown}{ArrowUp}');
    expect(activeName()).toBe('Profile');
  });

  it('jumps to a row by typing, and a repeated letter cycles through its rows', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    screen.getByRole('button', { name: 'Actions' }).focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('si');
    expect(activeName()).toBe('Sign out');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await user.keyboard('{ArrowDown}');
    await user.keyboard('s');
    expect(activeName()).toBe('Settings');
    await user.keyboard('s');
    expect(activeName()).toBe('Share');
    await user.keyboard('s');
    expect(activeName()).toBe('Sign out');
    await user.keyboard('s');
    expect(activeName()).toBe('Settings');
  });

  it('closes everything on Tab and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await user.keyboard('{ArrowDown}{Tab}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('runs onSelect and closes, unless the handler prevents the default', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const keep = vi.fn((event: Event) => event.preventDefault());
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={keep}>Keep open</DropdownMenuItem>
          <DropdownMenuItem onSelect={onSelect}>Close</DropdownMenuItem>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Never
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Keep open' }));
    expect(keep).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu')).toBeTruthy();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Never' }));
    expect(onSelect).not.toHaveBeenCalled();
    screen.getByRole('menuitem', { name: 'Close' }).focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('ignores a click that was not preceded by a press on the row (a long press released on it)', async () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Row</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const row = await screen.findByRole('menuitem', { name: 'Row' });
    fireEvent.click(row, { detail: 1 });
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.pointerDown(row);
    fireEvent.click(row, { detail: 1 });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('activates on the pointer release even when the row moved under the finger, and never on a release outside it', () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={(event) => event.preventDefault()}>Other</DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              onSelect();
              event.preventDefault();
            }}
          >
            Row
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const row = screen.getByRole('menuitem', { name: 'Row' });
    const box = (top: number) =>
      ({
        left: 0,
        top,
        right: 200,
        bottom: top + 30,
        width: 200,
        height: 30,
        x: 0,
        y: top,
      }) as DOMRect;
    row.getBoundingClientRect = () => box(100);
    const wrapper = row.closest<HTMLElement>('[data-bl-anchored]')!;
    fireEvent.pointerDown(row, { button: 0, pointerId: 7, clientX: 50, clientY: 110 });
    // The surface is held in place while the pointer is down.
    expect(wrapper.hasAttribute('data-bl-hold')).toBe(true);
    // The submenu repositioned: the row is now elsewhere, the finger is not.
    row.getBoundingClientRect = () => box(300);
    fireEvent.pointerUp(document.documentElement, {
      button: 0,
      pointerId: 7,
      clientX: 50,
      clientY: 110,
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(wrapper.hasAttribute('data-bl-hold')).toBe(false);
    // The click a browser fires after the release does not activate twice.
    fireEvent.click(row, { detail: 1 });
    expect(onSelect).toHaveBeenCalledTimes(1);
    // Pressed, slid off, released elsewhere: not activated.
    fireEvent.pointerDown(row, { button: 0, pointerId: 8, clientX: 50, clientY: 310 });
    fireEvent.pointerUp(document.documentElement, {
      button: 0,
      pointerId: 8,
      clientX: 500,
      clientY: 500,
    });
    expect(onSelect).toHaveBeenCalledTimes(1);
    // A release on the row where it now is counts too.
    fireEvent.pointerDown(row, { button: 0, pointerId: 9, clientX: 50, clientY: 310 });
    fireEvent.pointerUp(row, { button: 0, pointerId: 9, clientX: 60, clientY: 320 });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('has checkbox and radio rows with the right roles, states and callbacks', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    function Harness() {
      const [checked, setChecked] = React.useState<boolean | 'indeterminate'>('indeterminate');
      const [value, setValue] = React.useState('a');
      return (
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              checked={checked}
              onCheckedChange={(next) => {
                onCheckedChange(next);
                setChecked(next);
              }}
              onSelect={(event) => event.preventDefault()}
            >
              Show hidden
            </DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup
              value={value}
              onValueChange={(next) => {
                onValueChange(next);
                setValue(next);
              }}
            >
              <DropdownMenuRadioItem value="a" onSelect={(event) => event.preventDefault()}>
                A
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="b" onSelect={(event) => event.preventDefault()}>
                B
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    render(<Harness />);
    const box = await screen.findByRole('menuitemcheckbox', { name: 'Show hidden' });
    expect(box.getAttribute('aria-checked')).toBe('mixed');
    expect(box.dataset.state).toBe('indeterminate');
    await user.click(box);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(box.getAttribute('aria-checked')).toBe('true');
    expect(box.dataset.state).toBe('checked');
    // The indicator (the check icon's span) is rendered only while checked.
    expect(box.querySelector('svg')).not.toBeNull();
    await user.click(box);
    expect(box.dataset.state).toBe('unchecked');
    expect(box.querySelector('svg')).toBeNull();
    const a = screen.getByRole('menuitemradio', { name: 'A' });
    const b = screen.getByRole('menuitemradio', { name: 'B' });
    expect(a.getAttribute('aria-checked')).toBe('true');
    expect(b.getAttribute('aria-checked')).toBe('false');
    await user.click(b);
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(b.dataset.state).toBe('checked');
    expect(a.dataset.state).toBe('unchecked');
    expect(screen.getByRole('group')).toBeTruthy();
  });

  it('is modal by default (page pointer events off) and not with modal={false}', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Basic />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    expect(document.body.style.pointerEvents).toBe('none');
    unmount();
    expect(document.body.style.pointerEvents).toBe('');
    render(<Basic modal={false} />);
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await screen.findByRole('menu');
    expect(document.body.style.pointerEvents).toBe('');
  });

  it('closes on a press outside, and a press on the trigger toggles rather than reopening', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>elsewhere</button>
        <Basic modal={false} />
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    await user.click(trigger);
    await screen.findByRole('menu');
    await user.click(trigger);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await user.click(trigger);
    await screen.findByRole('menu');
    await user.click(screen.getByRole('button', { name: 'elsewhere' }));
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('supports controlled open state', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <DropdownMenu open={false} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Row</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('menu')).toBeNull();
    rerender(
      <DropdownMenu open onOpenChange={onOpenChange}>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Row</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(await screen.findByRole('menu')).toBeTruthy();
  });
});

describe('submenus', () => {
  it('open with Right/Enter/Space (first row focused), close with Left, and Escape closes one level', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    const trigger = screen.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    await user.keyboard('sh');
    expect(activeName()).toBe('Share');
    const subTrigger = screen.getByRole('menuitem', { name: 'Share' });
    expect(subTrigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(subTrigger.getAttribute('aria-expanded')).toBe('false');
    await user.keyboard('{ArrowRight}');
    const sub = await screen.findByRole('menu', { name: 'Share' });
    expect(subTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(subTrigger.dataset.state).toBe('open');
    expect(subTrigger.getAttribute('aria-controls')).toBe(sub.id);
    expect(activeName()).toBe('Email');
    await user.keyboard('{ArrowDown}');
    expect(activeName()).toBe('Link');
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull());
    expect(document.activeElement).toBe(subTrigger);
    await user.keyboard('{Enter}');
    await screen.findByRole('menu', { name: 'Share' });
    expect(activeName()).toBe('Email');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull());
    expect(screen.getByRole('menu', { name: 'Actions' })).toBeTruthy();
    expect(document.activeElement).toBe(subTrigger);
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('flip the opening keys in RTL', async () => {
    const user = userEvent.setup();
    render(<Basic dir="rtl" />);
    screen.getByRole('button', { name: 'Actions' }).focus();
    await user.keyboard('{ArrowDown}sh');
    await user.keyboard('{ArrowRight}');
    expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull();
    await user.keyboard('{ArrowLeft}');
    await screen.findByRole('menu', { name: 'Share' });
    expect(activeName()).toBe('Email');
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull());
    expect(activeName()).toBe('Share');
  });

  it('a selected row in a submenu closes the whole tree', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    screen.getByRole('button', { name: 'Actions' }).focus();
    await user.keyboard('{ArrowDown}sh{ArrowRight}');
    await screen.findByRole('menu', { name: 'Share' });
    await user.keyboard('{Enter}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('open on hover after a short rest, and the grace triangle keeps them open while the pointer crosses other rows', () => {
    vi.useFakeTimers();
    render(<Basic />);
    act(() => {
      fireEvent.pointerDown(screen.getByRole('button', { name: 'Actions' }), { button: 0 });
    });
    const subTrigger = screen.getByRole('menuitem', { name: 'Share' });
    const settings = screen.getByRole('menuitem', { name: 'Settings' });
    act(() => {
      fireEvent.pointerMove(subTrigger, { pointerType: 'mouse', clientX: 150, clientY: 50 });
    });
    expect(document.activeElement).toBe(subTrigger);
    expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull();
    act(() => {
      vi.advanceTimersByTime(120);
    });
    const sub = screen.getByRole('menu', { name: 'Share' });
    // Focus stays on the trigger row after a pointer open.
    expect(document.activeElement).toBe(subTrigger);
    const subRect = () =>
      ({
        left: 200,
        top: 0,
        right: 400,
        bottom: 200,
        width: 200,
        height: 200,
        x: 200,
        y: 0,
      }) as DOMRect;
    sub.getBoundingClientRect = subRect;
    act(() => {
      fireEvent.pointerLeave(subTrigger, { pointerType: 'mouse', clientX: 150, clientY: 50 });
    });
    // Diagonally across another row, inside the triangle: nothing changes.
    act(() => {
      fireEvent.pointerMove(settings, { pointerType: 'mouse', clientX: 170, clientY: 60 });
    });
    expect(screen.getByRole('menu', { name: 'Share' })).toBeTruthy();
    expect(document.activeElement).toBe(subTrigger);
    // Still moving inside the triangle a moment later: still on its way.
    act(() => {
      vi.advanceTimersByTime(200);
      fireEvent.pointerMove(settings, { pointerType: 'mouse', clientX: 175, clientY: 62 });
    });
    expect(screen.getByRole('menu', { name: 'Share' })).toBeTruthy();
    // Resting there for 300ms is no longer intent: the next move takes the row.
    act(() => {
      vi.advanceTimersByTime(320);
      fireEvent.pointerMove(settings, { pointerType: 'mouse', clientX: 176, clientY: 62 });
    });
    expect(document.activeElement).toBe(settings);
    expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull();
    // Reopen for the last step.
    act(() => {
      fireEvent.pointerMove(subTrigger, { pointerType: 'mouse', clientX: 150, clientY: 50 });
      vi.advanceTimersByTime(120);
    });
    screen.getByRole('menu', { name: 'Share' }).getBoundingClientRect = subRect;
    act(() => {
      fireEvent.pointerLeave(subTrigger, { pointerType: 'mouse', clientX: 150, clientY: 50 });
    });
    // Straight down onto the row, outside the triangle: the row takes the highlight and the submenu closes.
    act(() => {
      fireEvent.pointerMove(settings, { pointerType: 'mouse', clientX: 150, clientY: 150 });
    });
    expect(document.activeElement).toBe(settings);
    expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull();
  });

  it('do not open on hover for touch, and a disabled sub trigger never opens', () => {
    vi.useFakeTimers();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const subTrigger = screen.getByRole('menuitem', { name: 'Share' });
    act(() => {
      fireEvent.pointerMove(subTrigger, { pointerType: 'touch' });
      fireEvent.pointerMove(subTrigger, { pointerType: 'mouse' });
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull();
    fireEvent.keyDown(subTrigger, { key: 'ArrowRight' });
    expect(screen.queryByRole('menu', { name: 'Share' })).toBeNull();
  });
});

describe('ContextMenu', () => {
  it('opens on the contextmenu event, anchored at the pointer, and closes on Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ContextMenu onOpenChange={onOpenChange}>
        <ContextMenuTrigger asChild>
          <button>target</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Rename</ContextMenuItem>
          <ContextMenuItem>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const target = screen.getByRole('button', { name: 'target' });
    expect(target.dataset.state).toBe('closed');
    const event = fireEvent.contextMenu(target, { clientX: 40, clientY: 50 });
    expect(event).toBe(false); // the browser's own menu is prevented
    const menu = await screen.findByRole('menu');
    expect(target.dataset.state).toBe('open');
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.activeElement).toBe(menu);
    await user.keyboard('{ArrowDown}');
    expect(activeName()).toBe('Rename');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('opens on a long press with touch and not on a short one', () => {
    vi.useFakeTimers();
    render(
      <ContextMenu>
        <ContextMenuTrigger>
          <div>target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Rename</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    const target = screen.getByText('target');
    act(() => {
      fireEvent.pointerDown(target, { pointerType: 'touch', clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(300);
      fireEvent.pointerUp(target, { pointerType: 'touch' });
      vi.advanceTimersByTime(600);
    });
    expect(screen.queryByRole('menu')).toBeNull();
    act(() => {
      fireEvent.pointerDown(target, { pointerType: 'touch', clientX: 10, clientY: 10 });
      vi.advanceTimersByTime(750);
    });
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('takes a controlled open state', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ContextMenu open={false} onOpenChange={onOpenChange}>
        <ContextMenuTrigger>
          <div>target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Rename</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('target'), { clientX: 5, clientY: 5 });
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('menu')).toBeNull();
    rerender(
      <ContextMenu open onOpenChange={onOpenChange}>
        <ContextMenuTrigger>
          <div>target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Rename</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(await screen.findByRole('menu')).toBeTruthy();
  });

  it('does nothing while disabled', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger disabled>
          <div>target</div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Rename</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('target'));
    expect(screen.queryByRole('menu')).toBeNull();
  });
});

function Bar({ loop, onValueChange }: { loop?: boolean; onValueChange?: (v: string) => void }) {
  return (
    <Menubar loop={loop} onValueChange={onValueChange}>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New</MenubarItem>
          <MenubarItem>Save</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Zoom</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

describe('Menubar', () => {
  it('is one Tab stop whose Left and Right move between the buttons', async () => {
    const user = userEvent.setup();
    render(<Bar />);
    const bar = screen.getByRole('menubar');
    const file = screen.getByRole('menuitem', { name: 'File' });
    const edit = screen.getByRole('menuitem', { name: 'Edit' });
    expect(bar.contains(file)).toBe(true);
    expect(file.tabIndex).toBe(0);
    expect(edit.tabIndex).toBe(-1);
    file.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(edit);
    await user.keyboard('{End}');
    expect(activeName()).toBe('View');
    await user.keyboard('{ArrowRight}');
    expect(activeName()).toBe('File');
    await user.keyboard('{ArrowLeft}');
    expect(activeName()).toBe('View');
  });

  it('opens with Down (first row) and Up (last row), and Left/Right in a menu move to the neighbours', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Bar onValueChange={onValueChange} />);
    screen.getByRole('menuitem', { name: 'File' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(await screen.findByRole('menu', { name: 'File' })).toBeTruthy();
    expect(onValueChange).toHaveBeenLastCalledWith('file');
    expect(activeName()).toBe('New');
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByRole('menu', { name: 'Edit' })).toBeTruthy();
    expect(screen.queryByRole('menu', { name: 'File' })).toBeNull();
    expect(activeName()).toBe('Undo');
    await user.keyboard('{ArrowLeft}');
    expect(await screen.findByRole('menu', { name: 'File' })).toBeTruthy();
    expect(activeName()).toBe('New');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(activeName()).toBe('File');
    await user.keyboard('{ArrowUp}');
    await screen.findByRole('menu', { name: 'File' });
    await waitFor(() => expect(activeName()).toBe('Save'));
  });

  it('wraps across menus only with loop', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Bar loop />);
    screen.getByRole('menuitem', { name: 'View' }).focus();
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(await screen.findByRole('menu', { name: 'File' })).toBeTruthy();
    unmount();
    render(<Bar loop={false} />);
    screen.getByRole('menuitem', { name: 'View' }).focus();
    await user.keyboard('{ArrowDown}{ArrowRight}');
    expect(screen.getByRole('menu', { name: 'View' })).toBeTruthy();
  });

  it('follows the pointer across the buttons while a menu is open', async () => {
    render(<Bar />);
    const file = screen.getByRole('menuitem', { name: 'File' });
    const edit = screen.getByRole('menuitem', { name: 'Edit' });
    fireEvent.pointerEnter(edit, { pointerType: 'mouse' });
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.pointerDown(file, { button: 0 });
    expect(await screen.findByRole('menu', { name: 'File' })).toBeTruthy();
    expect(file.dataset.state).toBe('open');
    fireEvent.pointerEnter(edit, { pointerType: 'mouse' });
    expect(await screen.findByRole('menu', { name: 'Edit' })).toBeTruthy();
    expect(screen.queryByRole('menu', { name: 'File' })).toBeNull();
    expect(edit.dataset.state).toBe('open');
    expect(file.dataset.state).toBe('closed');
    // A press on the open button closes it.
    fireEvent.pointerDown(edit, { button: 0 });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('is controllable through value', async () => {
    render(
      <Menubar value="edit">
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Undo</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    expect(await screen.findByRole('menu', { name: 'Edit' })).toBeTruthy();
    expect(screen.queryByRole('menu', { name: 'File' })).toBeNull();
  });
});
