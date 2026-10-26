import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../src/index';

afterEach(() => {
  vi.useRealTimers();
});

function Site(props: Partial<React.ComponentProps<typeof NavigationMenu>>) {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/stealth">Stealth</NavigationMenuLink>
            <NavigationMenuLink href="/cli">CLI</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="docs">
          <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/docs" active>
              Guide
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/about">About</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator data-testid="indicator" />
    </NavigationMenu>
  );
}

describe('NavigationMenu', () => {
  it('is a nav of disclosure buttons; a click opens the panel in the viewport and toggles it closed', async () => {
    const user = userEvent.setup();
    render(<Site />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav.dataset.orientation).toBe('horizontal');
    const products = screen.getByRole('button', { name: 'Products' });
    expect(products.getAttribute('aria-expanded')).toBe('false');
    expect(products.dataset.state).toBe('closed');
    expect(screen.queryByRole('link', { name: 'Stealth' })).toBeNull();
    await user.click(products);
    const link = await screen.findByRole('link', { name: 'Stealth' });
    const panel = link.closest<HTMLElement>('[data-slot="navigation-menu-content"]')!;
    expect(products.getAttribute('aria-expanded')).toBe('true');
    expect(products.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(products.id);
    expect(panel.dataset.state).toBe('open');
    const viewport = document.querySelector<HTMLElement>('[data-slot="navigation-menu-viewport"]')!;
    expect(viewport.contains(panel)).toBe(true);
    expect(viewport.dataset.state).toBe('open');
    expect(viewport.style.getPropertyValue('--bl-navigation-menu-viewport-width')).toBe('0px');
    expect(viewport.style.getPropertyValue('--radix-navigation-menu-viewport-height')).toBe('0px');
    expect(screen.getByTestId('indicator').dataset.state).toBe('visible');
    await user.click(products);
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Stealth' })).toBeNull());
    expect(products.getAttribute('aria-expanded')).toBe('false');
  });

  it('marks the active link with aria-current and closes the panel when a link is followed', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/docs" active onSelect={onSelect}>
                Guide
              </NavigationMenuLink>
              <NavigationMenuLink href="/keep" onSelect={(event) => event.preventDefault()}>
                Keep
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Docs' }));
    const guide = await screen.findByRole('link', { name: 'Guide' });
    expect(guide.getAttribute('aria-current')).toBe('page');
    expect(guide.dataset.active).toBe('true');
    await user.click(screen.getByRole('link', { name: 'Keep' }));
    expect(screen.getByRole('link', { name: 'Keep' })).toBeTruthy();
    await user.click(guide);
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Guide' })).toBeNull());
  });

  it('moves along the bar with Left and Right, into the panel with Down, and back out with Escape', async () => {
    const user = userEvent.setup();
    render(<Site />);
    const products = screen.getByRole('button', { name: 'Products' });
    const docs = screen.getByRole('button', { name: 'Docs' });
    products.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(docs);
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'About' }));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(products);
    await user.keyboard('{Enter}');
    await screen.findByRole('link', { name: 'Stealth' });
    expect(document.activeElement).toBe(products);
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Stealth' }));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'CLI' }));
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Stealth' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Stealth' })).toBeNull());
    expect(document.activeElement).toBe(products);
  });

  it('Tab from the button enters the open panel, Shift+Tab from its first link returns, Tab past its last link leaves', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Site />
        <button>after</button>
      </>,
    );
    const products = screen.getByRole('button', { name: 'Products' });
    products.focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('link', { name: 'Stealth' });
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Stealth' }));
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(document.activeElement).toBe(products);
    await user.keyboard('{Tab}');
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'CLI' }));
    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Docs' }));
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Stealth' })).toBeNull());
  });

  it('opens on hover after the delay, switches between buttons at once, closes after leaving, and skips the delay briefly after', () => {
    vi.useFakeTimers();
    render(<Site delayDuration={200} skipDelayDuration={300} />);
    const products = screen.getByRole('button', { name: 'Products' });
    const docs = screen.getByRole('button', { name: 'Docs' });
    act(() => {
      fireEvent.pointerEnter(products, { pointerType: 'mouse' });
      fireEvent.pointerMove(products, { pointerType: 'mouse' });
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('link', { name: 'Stealth' })).toBeNull();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.getByRole('link', { name: 'Stealth' })).toBeTruthy();
    // Another button: no delay.
    act(() => {
      fireEvent.pointerLeave(products, { pointerType: 'mouse' });
      fireEvent.pointerEnter(docs, { pointerType: 'mouse' });
      fireEvent.pointerMove(docs, { pointerType: 'mouse' });
    });
    expect(screen.getByRole('link', { name: 'Guide' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Stealth' })).toBeNull();
    expect(
      screen
        .getByRole('link', { name: 'Guide' })
        .closest('[data-motion]')
        ?.getAttribute('data-motion'),
    ).toBe('from-end');
    // Leaving the button and the panel closes after a moment.
    act(() => {
      fireEvent.pointerLeave(docs, { pointerType: 'mouse' });
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByRole('link', { name: 'Guide' })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByRole('link', { name: 'Guide' })).toBeNull();
    // Within the skip window the next panel opens at once.
    act(() => {
      vi.advanceTimersByTime(100);
      fireEvent.pointerEnter(products, { pointerType: 'mouse' });
      fireEvent.pointerMove(products, { pointerType: 'mouse' });
    });
    expect(screen.getByRole('link', { name: 'Stealth' })).toBeTruthy();
    // Touch does not open on hover.
    act(() => {
      fireEvent.pointerLeave(products, { pointerType: 'mouse' });
      vi.advanceTimersByTime(500);
      fireEvent.pointerEnter(docs, { pointerType: 'touch' });
      fireEvent.pointerMove(docs, { pointerType: 'touch' });
      vi.advanceTimersByTime(500);
    });
    expect(screen.queryByRole('link', { name: 'Guide' })).toBeNull();
  });

  it('keeps the panel while the pointer is over it', () => {
    vi.useFakeTimers();
    render(<Site />);
    const products = screen.getByRole('button', { name: 'Products' });
    act(() => {
      fireEvent.pointerEnter(products, { pointerType: 'mouse' });
      fireEvent.pointerMove(products, { pointerType: 'mouse' });
      vi.advanceTimersByTime(250);
    });
    const panel = screen
      .getByRole('link', { name: 'Stealth' })
      .closest('[data-slot="navigation-menu-content"]')!;
    act(() => {
      fireEvent.pointerLeave(products, { pointerType: 'mouse' });
      fireEvent.pointerEnter(panel, { pointerType: 'mouse' });
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole('link', { name: 'Stealth' })).toBeTruthy();
    act(() => {
      fireEvent.pointerLeave(panel, { pointerType: 'mouse' });
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole('link', { name: 'Stealth' })).toBeNull();
  });

  it('closes on a press outside and on Escape, but not when focus moves to another button in the bar', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>elsewhere</button>
        <Site />
      </>,
    );
    const products = screen.getByRole('button', { name: 'Products' });
    await user.click(products);
    await screen.findByRole('link', { name: 'Stealth' });
    screen.getByRole('button', { name: 'Docs' }).focus();
    expect(screen.getByRole('link', { name: 'Stealth' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'elsewhere' }));
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Stealth' })).toBeNull());
  });

  it('renders the panel in place without a viewport, and takes a controlled value', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NavigationMenu value="" onValueChange={onValueChange} viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem value="a">
            <NavigationMenuTrigger>A</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/a">Link A</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(onValueChange).toHaveBeenCalledWith('a');
    expect(screen.queryByRole('link', { name: 'Link A' })).toBeNull();
    rerender(
      <NavigationMenu value="a" onValueChange={onValueChange} viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem value="a">
            <NavigationMenuTrigger>A</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/a">Link A</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const link = await screen.findByRole('link', { name: 'Link A' });
    expect(link.closest('li')).toBe(screen.getByRole('button', { name: 'A' }).closest('li'));
    expect(document.querySelector('[data-slot="navigation-menu-viewport"]')).toBeNull();
  });

  it('uses Up and Down along a vertical bar and Right to enter a panel', async () => {
    const user = userEvent.setup();
    render(<Site orientation="vertical" />);
    const products = screen.getByRole('button', { name: 'Products' });
    products.focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Docs' }));
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(products);
    await user.keyboard('{ArrowRight}');
    await screen.findByRole('link', { name: 'Stealth' });
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Stealth' }));
  });
});
