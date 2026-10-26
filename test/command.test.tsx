import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../src/index';
import { useCommandState } from '../src/primitives/command';
import { commandScore, normalizeText } from '../src/primitives/command-score';

const visibleItems = () =>
  [...document.querySelectorAll<HTMLElement>('[cmdk-item]:not([hidden])')].map((el) =>
    el.textContent?.trim(),
  );
const selectedItem = () =>
  document.querySelector<HTMLElement>('[cmdk-item][data-selected="true"]')?.textContent?.trim();

describe('command-score', () => {
  it('ranks exact, prefix, word start, substring and fuzzy matches in that order, and rejects the rest', () => {
    const exact = commandScore('Table', 'table');
    const prefix = commandScore('Tabs', 'tab');
    const wordStart = commandScore('Data table', 'tab');
    const substring = commandScore('Database', 'tab');
    const fuzzy = commandScore('Toolbar', 'tbr');
    expect(exact).toBe(1);
    expect(prefix).toBeGreaterThan(wordStart);
    expect(wordStart).toBeGreaterThan(substring);
    expect(substring).toBeGreaterThan(fuzzy);
    expect(fuzzy).toBeGreaterThan(0);
    expect(commandScore('Settings', 'xyz')).toBe(0);
    expect(commandScore('Settings', '')).toBe(1);
  });

  it('prefers shorter texts among equal prefix matches and earlier substrings', () => {
    expect(commandScore('Tab', 'ta')).toBeGreaterThan(commandScore('Table of contents', 'ta'));
    expect(commandScore('a tab', 'tab')).toBeGreaterThan(commandScore('a long row tab', 'tab'));
  });

  it('sees word starts after separators and camelCase', () => {
    expect(commandScore('data-table', 'tab')).toBe(commandScore('data table', 'tab'));
    expect(commandScore('dataTable', 'tab')).toBeGreaterThan(commandScore('datatable', 'tab'));
    expect(commandScore('docs/components', 'comp')).toBeGreaterThan(0.75);
  });

  it('matches keywords, several words and ignores case and accents', () => {
    expect(commandScore('Sign out', 'logout', ['log out', 'logout'])).toBe(1);
    expect(commandScore('Rename file', 'file ren')).toBeGreaterThan(0.5);
    expect(commandScore('Rename file', 'file xyz')).toBe(0);
    expect(commandScore('Café', 'cafe')).toBe(1);
    expect(normalizeText('Élan')).toBe('elan');
  });
});

function Palette(props: Partial<React.ComponentProps<typeof Command>> & { empty?: string }) {
  const { empty = 'No results.', ...rest } = props;
  return (
    <Command label="Go to" {...rest}>
      <CommandInput placeholder="Search" />
      <CommandList>
        <CommandEmpty>{empty}</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem>Data table</CommandItem>
          <CommandItem>Database</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
        <CommandSeparator data-testid="separator" />
        <CommandGroup heading="Components">
          <CommandItem>Table</CommandItem>
          <CommandItem>Tabs</CommandItem>
          <CommandItem disabled>Toast (soon)</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe('Command', () => {
  it('is a combobox over an always-open listbox with aria-activedescendant on the highlighted option', () => {
    render(<Palette />);
    const input = screen.getByRole('combobox', { name: 'Go to' });
    const list = screen.getByRole('listbox', { name: 'Suggestions' });
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(input.getAttribute('aria-controls')).toBe(list.id);
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('autocomplete')).toBe('off');
    const first = screen.getByRole('option', { name: 'Data table' });
    expect(input.getAttribute('aria-activedescendant')).toBe(first.id);
    expect(first.getAttribute('aria-selected')).toBe('true');
    expect(first.dataset.selected).toBe('true');
    expect(screen.getByRole('option', { name: 'Database' }).dataset.selected).toBe('false');
    expect(screen.getByRole('group', { name: 'Pages' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Toast (soon)' }).getAttribute('aria-disabled')).toBe(
      'true',
    );
    expect(document.querySelector('[cmdk-root]')).not.toBeNull();
    expect(document.querySelector('[cmdk-input]')).toBe(input);
    expect(document.querySelector('[cmdk-list]')).toBe(list);
    expect(document.querySelector('[cmdk-group-heading]')?.textContent).toBe('Pages');
    expect(screen.queryByText('No results.')).toBeNull();
  });

  it('filters and ranks as you type, hides empty groups and separators, and shows Empty when nothing matches', async () => {
    const user = userEvent.setup();
    render(<Palette />);
    const input = screen.getByRole('combobox', { name: 'Go to' });
    await user.type(input, 'tab');
    // Ranked: prefix matches first (shorter first), then a word start, then a substring.
    expect(visibleItems()).toEqual(['Tabs', 'Table', 'Data table', 'Database']);
    expect(selectedItem()).toBe('Tabs');
    expect(input.getAttribute('aria-activedescendant')).toBe(
      screen.getByRole('option', { name: 'Tabs' }).id,
    );
    expect(screen.queryByTestId('separator')).toBeNull();
    // Groups are re-ordered too: Components (best 0.9) before Pages (best 0.8).
    const groups = [
      ...document.querySelectorAll('[cmdk-group]:not([hidden]) [cmdk-group-heading]'),
    ];
    expect(groups.map((g) => g.textContent)).toEqual(['Components', 'Pages']);
    await user.type(input, 'xyz');
    expect(visibleItems()).toEqual([]);
    expect(screen.getByText('No results.')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Pages', hidden: true }).closest('[cmdk-group]')).toBe(
      document.querySelector('[cmdk-group][hidden]'),
    );
    await user.clear(input);
    expect(visibleItems()).toEqual([
      'Data table',
      'Database',
      'Settings',
      'Table',
      'Tabs',
      'Toast (soon)',
    ]);
    expect(screen.getByTestId('separator').getAttribute('role')).toBe('separator');
    expect(selectedItem()).toBe('Data table');
  });

  it('moves the highlight with the arrows, Home, End and the vim keys, skipping disabled rows', async () => {
    const user = userEvent.setup();
    render(<Palette loop />);
    const input = screen.getByRole('combobox', { name: 'Go to' });
    input.focus();
    await user.keyboard('{ArrowDown}');
    expect(selectedItem()).toBe('Database');
    await user.keyboard('{End}');
    expect(selectedItem()).toBe('Tabs');
    await user.keyboard('{ArrowDown}');
    expect(selectedItem()).toBe('Data table');
    await user.keyboard('{ArrowUp}');
    expect(selectedItem()).toBe('Tabs');
    await user.keyboard('{Home}');
    expect(selectedItem()).toBe('Data table');
    await user.keyboard('{Control>}n{/Control}');
    expect(selectedItem()).toBe('Database');
    await user.keyboard('{Control>}p{/Control}');
    expect(selectedItem()).toBe('Data table');
    await user.keyboard('{Control>}j{/Control}{Control>}j{/Control}');
    expect(selectedItem()).toBe('Settings');
    await user.keyboard('{Control>}k{/Control}');
    expect(selectedItem()).toBe('Database');
    // Alt+Down: the first row of the next group.
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(selectedItem()).toBe('Table');
    await user.keyboard('{Alt>}{ArrowUp}{/Alt}');
    expect(selectedItem()).toBe('Data table');
    // Meta+Down: the last row.
    await user.keyboard('{Meta>}{ArrowDown}{/Meta}');
    expect(selectedItem()).toBe('Tabs');
  });

  it('does not wrap without loop and ignores the vim keys when turned off', async () => {
    const user = userEvent.setup();
    render(<Palette vimBindings={false} />);
    screen.getByRole('combobox', { name: 'Go to' }).focus();
    await user.keyboard('{ArrowUp}');
    expect(selectedItem()).toBe('Data table');
    await user.keyboard('{Control>}n{/Control}');
    expect(selectedItem()).toBe('Data table');
  });

  it('runs the highlighted row on Enter and a clicked row, with its value', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClick = vi.fn();
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem onSelect={onSelect} value="Open File">
            Open…
          </CommandItem>
          <CommandItem onSelect={onClick}>Save</CommandItem>
          <CommandItem onSelect={onClick} disabled>
            Never
          </CommandItem>
        </CommandList>
      </Command>,
    );
    screen.getByRole('combobox').focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('open file');
    await user.click(screen.getByRole('option', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledWith('save');
    await user.click(screen.getByRole('option', { name: 'Never' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('highlights under the pointer unless pointer selection is off', () => {
    const { unmount } = render(<Palette />);
    fireEvent.pointerMove(screen.getByRole('option', { name: 'Settings' }));
    expect(selectedItem()).toBe('Settings');
    fireEvent.pointerMove(screen.getByRole('option', { name: 'Toast (soon)' }));
    expect(selectedItem()).toBe('Settings');
    unmount();
    render(<Palette disablePointerSelection />);
    fireEvent.pointerMove(screen.getByRole('option', { name: 'Settings' }));
    expect(selectedItem()).toBe('Data table');
  });

  it('takes a controlled highlight and reports changes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<Palette value="settings" onValueChange={onValueChange} />);
    expect(selectedItem()).toBe('Settings');
    screen.getByRole('combobox', { name: 'Go to' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(onValueChange).toHaveBeenCalledWith('table');
    expect(selectedItem()).toBe('Settings');
    rerender(<Palette value="table" onValueChange={onValueChange} />);
    expect(selectedItem()).toBe('Table');
    rerender(<Palette defaultValue="Tabs" />);
  });

  it('starts on defaultValue, matched regardless of case', () => {
    render(<Palette defaultValue="TABS" />);
    expect(selectedItem()).toBe('Tabs');
  });

  it('keeps every row with shouldFilter={false} and uses a custom filter when given', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Palette shouldFilter={false} />);
    await user.type(screen.getByRole('combobox', { name: 'Go to' }), 'zzz');
    expect(visibleItems().length).toBe(6);
    expect(screen.queryByText('No results.')).toBeNull();
    unmount();
    const filter = vi.fn((value: string, search: string) => (value.endsWith(search) ? 1 : 0));
    render(<Palette filter={filter} />);
    await user.type(screen.getByRole('combobox', { name: 'Go to' }), 'base');
    expect(visibleItems()).toEqual(['Database']);
    expect(filter).toHaveBeenCalledWith('data table', 'base', undefined);
  });

  it('matches keywords and keeps a row forced to mount', async () => {
    const user = userEvent.setup();
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandEmpty>Nothing</CommandEmpty>
          <CommandItem keywords={['log out', 'exit']}>Sign out</CommandItem>
          <CommandItem forceMount>Always</CommandItem>
          <CommandItem>Other</CommandItem>
        </CommandList>
      </Command>,
    );
    await user.type(screen.getByRole('combobox'), 'exit');
    expect(visibleItems()).toEqual(['Sign out', 'Always']);
    await user.type(screen.getByRole('combobox'), 'q');
    expect(visibleItems()).toEqual(['Always']);
    expect(screen.queryByText('Nothing')).toBeNull();
  });

  it('exposes its state through useCommandState', async () => {
    const user = userEvent.setup();
    function Count() {
      const count = useCommandState((state) => state.filtered.count);
      const search = useCommandState((state) => state.search);
      return <output>{`${count}|${search}`}</output>;
    }
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem>Alpha</CommandItem>
          <CommandItem>Beta</CommandItem>
          <Count />
        </CommandList>
      </Command>,
    );
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('2|'));
    await user.type(screen.getByRole('combobox'), 'al');
    expect(screen.getByRole('status').textContent).toBe('1|al');
  });

  it('rows added later join the list and the highlight recovers when its row leaves', async () => {
    function Harness() {
      const [rows, setRows] = React.useState(['One', 'Two']);
      return (
        <>
          <button onClick={() => setRows(['Zero', ...rows])}>add</button>
          <button onClick={() => setRows(rows.slice(1))}>drop</button>
          <Command>
            <CommandInput />
            <CommandList>
              <CommandEmpty>Nothing</CommandEmpty>
              {rows.map((row) => (
                <CommandItem key={row}>{row}</CommandItem>
              ))}
            </CommandList>
          </Command>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    expect(selectedItem()).toBe('One');
    await user.click(screen.getByRole('button', { name: 'add' }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(visibleItems()).toEqual(['Zero', 'One', 'Two']);
    expect(selectedItem()).toBe('One');
    await user.click(screen.getByRole('button', { name: 'drop' }));
    await user.click(screen.getByRole('button', { name: 'drop' }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(visibleItems()).toEqual(['Two']);
    expect(selectedItem()).toBe('Two');
  });
});

describe('a search whose rows the caller filters', () => {
  function CallerFiltered() {
    const [search, setSearch] = React.useState('');
    // Only a search shows the full list; empty shows two favourites.
    const rows = search ? ['Alpha', 'Beta', 'Gamma'] : ['Beta', 'Gamma'];
    return (
      <Command shouldFilter={false}>
        <CommandInput aria-label="Search" value={search} onValueChange={setSearch} />
        <CommandList>
          {rows
            .filter((r) => r.toLowerCase().includes(search.toLowerCase()))
            .map((r) => (
              <CommandItem key={r} value={r}>
                {r}
              </CommandItem>
            ))}
        </CommandList>
      </Command>
    );
  }

  it('highlights the top result after a one-step (pasted) query, not a surviving old row', async () => {
    render(<CallerFiltered />);
    const input = screen.getByRole('combobox', { name: 'Search' });
    await waitFor(() => expect(selectedItem()).toBe('Beta'));
    fireEvent.change(input, { target: { value: 'a' } });
    await waitFor(() => expect(visibleItems()).toEqual(['Alpha', 'Beta', 'Gamma']));
    await waitFor(() => expect(selectedItem()).toBe('Alpha'));
  });

  it('keeps a highlight the person moved while rows keep arriving', async () => {
    render(<CallerFiltered />);
    const input = screen.getByRole('combobox', { name: 'Search' });
    fireEvent.change(input, { target: { value: 'a' } });
    await waitFor(() => expect(selectedItem()).toBe('Alpha'));
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(selectedItem()).toBe('Beta');
  });
});
