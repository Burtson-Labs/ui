// 0.13.0: paging (helpers, usePagination, Pagination's page size and phone
// form), DataTable's phone cards and built-in paging, compact Steps, and the
// smaller additions (Sheet without its X, Dialog as a bottom sheet,
// CheckboxCard).
import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CheckboxCard,
  CheckboxCardGroup,
  clampPage,
  DataTable,
  Dialog,
  DialogContent,
  DialogTitle,
  pageCountFor,
  pageWindow,
  paginate,
  Pagination,
  paginationSummary,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetTitle,
  Steps,
  usePagination,
  type DataTableColumn,
  type DataTableSort,
} from '@burtson-labs/ui';

const attr = (el: Element | null | undefined, name: string) => el?.getAttribute(name);

describe('paging helpers', () => {
  it('counts pages, never fewer than one', () => {
    expect(pageCountFor(312, 25)).toBe(13);
    expect(pageCountFor(0, 25)).toBe(1);
    expect(pageCountFor(Number.NaN, 25)).toBe(1);
    expect(pageCountFor(10, 0)).toBe(10);
  });

  it('clamps anything to a real page', () => {
    expect(clampPage(5, 3)).toBe(3);
    expect(clampPage(-2, 3)).toBe(1);
    expect(clampPage('2', 3)).toBe(2);
    expect(clampPage('abc', 3)).toBe(1);
    expect(clampPage(2.7, 3)).toBe(2);
  });

  it('works out a page window and slices rows', () => {
    expect(pageWindow({ page: 2, pageSize: 25, total: 312 })).toEqual({
      page: 2,
      pageCount: 13,
      pageSize: 25,
      total: 312,
      from: 26,
      to: 50,
    });
    expect(pageWindow({ page: 99, pageSize: 25, total: 30 })).toMatchObject({
      page: 2,
      from: 26,
      to: 30,
    });
    expect(pageWindow({ page: 1, pageSize: 25, total: 0 })).toMatchObject({ from: 0, to: 0 });
    const rows = Array.from({ length: 7 }, (_, i) => i + 1);
    expect(paginate(rows, 2, 3).rows).toEqual([4, 5, 6]);
    expect(paginate(rows, 3, 3).rows).toEqual([7]);
    expect(paginate([], 4, 3)).toMatchObject({ rows: [], page: 1, pageCount: 1 });
  });

  it('summarises a page', () => {
    expect(paginationSummary({ from: 1, to: 25, total: 312 }, 'en-US')).toBe('1–25 of 312');
    expect(paginationSummary({ from: 1, to: 7, total: 7 }, 'en-US')).toBe('7 of 7');
    expect(paginationSummary({ from: 1001, to: 1025, total: 1500 }, 'en-US')).toBe(
      '1,001–1,025 of 1,500',
    );
    expect(paginationSummary({ from: 0, to: 0, total: 0 })).toBe('0 of 0');
  });
});

describe('usePagination', () => {
  const rows = Array.from({ length: 60 }, (_, i) => i + 1);
  beforeEach(() => localStorage.clear());

  it('slices, clamps and changes size', () => {
    const { result } = renderHook(() => usePagination(rows, { defaultPage: 9 }));
    expect(result.current.page).toBe(3);
    expect(result.current.rows).toEqual(rows.slice(50));
    expect(result.current.summary).toBe('51–60 of 60');
    expect(result.current.hasPages).toBe(true);
    act(() => result.current.setPageSize(50));
    expect(result.current).toMatchObject({ page: 1, pageSize: 50, pageCount: 2 });
  });

  it('goes back to page 1 when the reset key changes, but not on first render', () => {
    const { result, rerender } = renderHook(
      ({ q }) => usePagination(rows, { resetKey: q, defaultPage: 2 }),
      {
        initialProps: { q: '' },
      },
    );
    expect(result.current.page).toBe(2);
    rerender({ q: 'a' });
    expect(result.current.page).toBe(1);
  });

  it('asks a controlled owner (the URL) to go to page 1 on a new filter', () => {
    const onPageChange = vi.fn();
    const { rerender } = renderHook(
      ({ q }) => usePagination(rows, { page: 2, onPageChange, resetKey: q }),
      { initialProps: { q: '' } },
    );
    expect(onPageChange).not.toHaveBeenCalled();
    rerender({ q: 'x' });
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('remembers the page size under storageKey, ignoring unknown sizes', () => {
    const { result, unmount } = renderHook(() => usePagination(rows, { storageKey: 'members' }));
    act(() => result.current.setPageSize(100));
    unmount();
    expect(
      renderHook(() => usePagination(rows, { storageKey: 'members' })).result.current.pageSize,
    ).toBe(100);
    localStorage.setItem('bl-page-size:members', '7');
    expect(
      renderHook(() => usePagination(rows, { storageKey: 'members' })).result.current.pageSize,
    ).toBe(25);
  });

  it('does not slice server pages', () => {
    const { result } = renderHook(() => usePagination([1, 2, 3], { total: 312, page: 4 }));
    expect(result.current).toMatchObject({ rows: [1, 2, 3], from: 76, to: 100, pageCount: 13 });
  });
});

describe('Pagination', () => {
  it('shows a summary from total, "Page n of m" and a page-size menu', async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={2}
        pageCount={13}
        onPageChange={() => undefined}
        total={312}
        pageSize={25}
        onPageSizeChange={onPageSizeChange}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(nav.textContent).toContain('26–50 of 312');
    expect(screen.getByRole('status').textContent).toBe('Page 2 of 13');
    const size = screen.getByRole('combobox', { name: 'Rows per page' });
    expect(size.textContent).toContain('25 per page');
    await userEvent.click(size);
    await userEvent.click(await screen.findByRole('option', { name: '50 per page' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it('keeps one pair of previous and next buttons for every width', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={3} onPageChange={onPageChange} />);
    expect(screen.getAllByRole('button', { name: 'Next page' })).toHaveLength(1);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Previous page' }).disabled).toBe(
      true,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.queryByRole('combobox')).toBeNull();
  });
});

interface Row {
  id: string;
  name: string;
  email: string;
  status: string;
  runs: number;
}
const people: Row[] = Array.from({ length: 30 }, (_, i) => ({
  id: `r${i + 1}`,
  name: `Person ${i + 1}`,
  email: `p${i + 1}@example.com`,
  status: i % 2 ? 'Active' : 'Invited',
  runs: i,
}));
const columns: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Name', sortable: true, cell: (r) => r.name },
  { id: 'email', header: 'Email', cell: (r) => r.email, card: 'subtitle', hideBelow: 'lg' },
  { id: 'status', header: 'Status', cell: (r) => r.status, card: 'aside' },
  { id: 'runs', header: 'Runs', numeric: true, sortable: true, cell: (r) => r.runs },
  { id: 'note', header: 'Note', cell: () => 'card only', cardOnly: true, card: 'footer' },
];

function mockViewport(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }),
  });
}

function Members(props: Partial<React.ComponentProps<typeof DataTable<Row>>>) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<DataTableSort | null>(null);
  return (
    <DataTable<Row>
      aria-label="Members"
      columns={columns}
      rows={people.slice(0, 3)}
      getRowId={(r) => r.id}
      getRowLabel={(r) => r.name}
      selected={selected}
      onSelectedChange={setSelected}
      sort={sort}
      onSortChange={setSort}
      {...props}
    />
  );
}

describe('DataTable on a phone', () => {
  beforeEach(() => mockViewport(true));
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('renders a list of cards named by their titles, with slots', () => {
    const { container } = render(<Members />);
    expect(attr(container.querySelector('[data-slot="data-table"]'), 'data-layout')).toBe('cards');
    expect(screen.queryByRole('table')).toBeNull();
    const list = screen.getByRole('list', { name: 'Members' });
    const cards = within(list).getAllByRole('article');
    expect(cards).toHaveLength(3);
    expect(screen.getByRole('article', { name: 'Person 1' })).toBe(cards[0]);
    const first = within(cards[0]!);
    expect(first.getByText('p1@example.com')).toBeTruthy();
    // Fields are labelled values; card-only columns appear on cards.
    expect(first.getByText('Runs').tagName).toBe('DT');
    expect(first.getByText('card only')).toBeTruthy();
  });

  it('opens from the title, selects from a 44px checkbox, and keeps controls separate', async () => {
    const onRowAction = vi.fn();
    const onMenu = vi.fn();
    render(
      <Members
        onRowAction={onRowAction}
        rowActions={(r) => (
          <button type="button" onClick={onMenu}>
            Menu {r.name}
          </button>
        )}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Person 2' }));
    expect(onRowAction).toHaveBeenCalledWith(people[1]);
    await userEvent.click(screen.getByRole('button', { name: 'Menu Person 1' }));
    expect(onMenu).toHaveBeenCalledOnce();
    expect(onRowAction).toHaveBeenCalledOnce();
    const box = screen.getByRole('checkbox', { name: 'Select Person 1' });
    expect(box.closest('label')?.className).toContain('size-11');
    await userEvent.click(box);
    expect(attr(box, 'data-state')).toBe('checked');
    expect(attr(screen.getByRole('article', { name: 'Person 1' }), 'data-state')).toBe('selected');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    expect(screen.getByText('3 selected')).toBeTruthy();
  });

  it('moves sorting into a menu', async () => {
    const onSortChange = vi.fn();
    render(<Members sort={null} onSortChange={onSortChange} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Runs descending' }));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: 'runs', direction: 'desc' });
  });

  it('shows empty and error states without a table', () => {
    const { rerender } = render(<Members rows={[]} empty="Nobody yet." />);
    expect(screen.getByText('Nobody yet.')).toBeTruthy();
    rerender(<Members error="Could not load." />);
    expect(screen.getByRole('alert').textContent).toContain('Could not load.');
  });

  it('stays a table when cardsBelow is false', () => {
    render(<Members cardsBelow={false} />);
    expect(screen.getByRole('table', { name: 'Members' })).toBeTruthy();
  });
});

describe('DataTable on a desktop', () => {
  it('keeps to one grid track so a wide table cannot widen its parent', () => {
    const { container } = render(<Members />);
    const root = container.querySelector('[data-slot="data-table"]');
    expect(root?.className).toContain('grid-cols-[minmax(0,1fr)]');
    expect(attr(root, 'data-layout')).toBe('table');
  });

  it('hides card-only columns and marks hideBelow columns', () => {
    render(<Members />);
    expect(screen.queryByRole('columnheader', { name: 'Note' })).toBeNull();
    expect(screen.getByRole('columnheader', { name: 'Email' }).className).toContain(
      'lg:table-cell',
    );
  });

  it('pages in the browser with paginate and resets on a new search', async () => {
    function Paged() {
      const [filter, setFilter] = React.useState('');
      return (
        <Members
          rows={people.filter((p) => p.name.includes(filter))}
          filter={filter}
          onFilterChange={setFilter}
          paginate
          rowNoun="members"
        />
      );
    }
    render(<Paged />);
    expect(screen.getAllByRole('row')).toHaveLength(26);
    expect(screen.getByText('1–25 of 30 members')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByText('26–30 of 30 members')).toBeTruthy();
    await userEvent.type(screen.getByRole('searchbox'), '1');
    // Person 1, 10–19 and 21: 12 rows, one page, back to page 1.
    expect(screen.getAllByRole('row')).toHaveLength(13);
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull();
  });

  it('builds the server summary and page-size menu from paging props', () => {
    render(
      <Members
        page={2}
        pageCount={13}
        onPageChange={() => undefined}
        pageSize={25}
        onPageSizeChange={() => undefined}
        totalRows={312}
        rowNoun="members"
      />,
    );
    expect(screen.getByText('26–50 of 312 members')).toBeTruthy();
    expect(screen.getByRole('combobox', { name: 'Rows per page' })).toBeTruthy();
  });
});

describe('Steps compact form', () => {
  const items = ['Company', 'Sign-in', 'Mailbox', 'Brand', 'Review'].map((title) => ({ title }));

  it('adds "Step n of m" and a bar to the current step and hides the rest on phones', () => {
    const { container } = render(<Steps items={items} current={1} />);
    const steps = screen.getAllByRole('listitem');
    expect(steps[1]!.textContent).toContain('Step 2 of 5');
    expect(steps[0]!.className).toContain('max-sm:hidden');
    expect(steps[1]!.className).not.toContain('max-sm:hidden');
    expect(container.querySelectorAll('[data-slot="steps-bar"] > span')).toHaveLength(5);
    expect(attr(container.querySelector('[data-slot="steps-bar"]'), 'aria-hidden')).toBe('true');
  });

  it('shows the last step when all are done, and honours compactBelow and orientation', () => {
    const { container, rerender } = render(<Steps items={items} current={5} />);
    expect(container.textContent).toContain('Step 5 of 5');
    rerender(
      <Steps items={items} current={1} compactBelow="md" formatCounter={(n, t) => `${n}/${t}`} />,
    );
    expect(screen.getAllByRole('listitem')[0]!.className).toContain('max-md:hidden');
    expect(container.textContent).toContain('2/5');
    rerender(<Steps items={items} current={1} compactBelow={false} />);
    expect(container.querySelector('[data-slot="steps-counter"]')).toBeNull();
    rerender(<Steps items={items} current={1} orientation="vertical" />);
    expect(container.querySelector('[data-slot="steps-counter"]')).toBeNull();
  });
});

describe('overlays', () => {
  it('leaves out the sheet close button on request', () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false} aria-describedby={undefined}>
          <SheetTitle>Person</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole('dialog', { name: 'Person' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('makes a dialog a bottom sheet on phones', () => {
    render(
      <Dialog open>
        <DialogContent mobile="sheet" aria-describedby={undefined}>
          <DialogTitle>Invite</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Invite' });
    expect(attr(dialog, 'data-mobile')).toBe('sheet');
    expect(dialog.className).toContain('max-sm:bottom-0');
    expect(dialog.querySelector('[data-slot="dialog-handle"]')).not.toBeNull();
  });
});

describe('CheckboxCard', () => {
  it('toggles from anywhere on the card and is named and described', async () => {
    const onCheckedChange = vi.fn();
    render(
      <CheckboxCardGroup label="Roles">
        <CheckboxCard
          title="Dispatcher"
          description="Books loads."
          onCheckedChange={onCheckedChange}
        />
      </CheckboxCardGroup>,
    );
    expect(screen.getByRole('group', { name: 'Roles' })).toBeTruthy();
    const box = screen.getByRole('checkbox', { name: 'Dispatcher' });
    expect(box.getAttribute('aria-describedby')).toBeTruthy();
    expect(document.getElementById(box.getAttribute('aria-describedby')!)?.textContent).toBe(
      'Books loads.',
    );
    await userEvent.click(screen.getByText('Books loads.'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('is disabled by a disabled group', () => {
    render(
      <CheckboxCardGroup label="Roles" disabled>
        <CheckboxCard title="Admin" />
      </CheckboxCardGroup>,
    );
    const box = screen.getByRole<HTMLButtonElement>('checkbox', { name: 'Admin' });
    // A browser sends no clicks to it; the card's has-[:disabled] styles match.
    expect(box.matches(':disabled')).toBe(true);
    expect(box.closest('[data-slot="checkbox-card"]')?.matches(':has(:disabled)')).toBe(true);
  });
});

// 0.13.1
describe('select trigger heights', () => {
  const classes = (el: Element | null) => (el?.getAttribute('class') ?? '').split(/\s+/);

  it('lets a caller override the height (h-11, max-sm:h-11, pointer-coarse:h-11)', () => {
    render(
      <>
        <Select>
          <SelectTrigger aria-label="Tall" className="h-11">
            <SelectValue placeholder="x" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">a</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger aria-label="Small" size="sm">
            <SelectValue placeholder="x" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">a</SelectItem>
          </SelectContent>
        </Select>
      </>,
    );
    const tall = classes(screen.getByRole('combobox', { name: 'Tall' }));
    // tailwind-merge keeps the caller's h-11 and drops the default h-9; an
    // attribute-selector height (data-[size=default]:h-9) would have outranked it.
    expect(tall).toContain('h-11');
    expect(tall.filter((k) => /(^|:)h-9$|data-\[size/.test(k))).toEqual([]);
    const small = classes(screen.getByRole('combobox', { name: 'Small' }));
    expect(small).toContain('h-8');
    expect(small.filter((k) => /data-\[size/.test(k))).toEqual([]);
    expect(screen.getByRole('combobox', { name: 'Small' }).getAttribute('data-size')).toBe('sm');
  });

  it('gives the page-size menu and the card sort menu 44px on touch screens', () => {
    mockViewport(true);
    try {
      render(
        <>
          <Pagination
            page={1}
            pageCount={3}
            onPageChange={() => undefined}
            pageSize={25}
            onPageSizeChange={() => undefined}
          />
          <Members sort={null} onSortChange={() => undefined} />
        </>,
      );
      for (const name of ['Rows per page', 'Sort by']) {
        const c = classes(screen.getByRole('combobox', { name }));
        expect(c).toContain('pointer-coarse:h-11');
        expect(c.filter((k) => /data-\[size/.test(k))).toEqual([]);
      }
    } finally {
      delete (window as { matchMedia?: unknown }).matchMedia;
    }
  });
});

describe('paging edge cases', () => {
  it('shows pages with an empty page-size list and no "Page 0 of 0"', () => {
    const rows = Array.from({ length: 60 }, (_, i) => i + 1);
    const { result } = renderHook(() =>
      usePagination(rows, { pageSizeOptions: [], defaultPageSize: 25 }),
    );
    expect(result.current.hasPages).toBe(true);
    const { container } = render(
      <Pagination page={1} pageCount={0} onPageChange={() => undefined} />,
    );
    expect(container.querySelector('[data-slot="pagination-position"]')?.textContent).toBe('');
    expect(screen.getByRole('status').textContent).toBe('');
  });
});

describe('controls inside cards', () => {
  beforeEach(() => mockViewport(true));
  afterEach(() => {
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('lifts links and controls in fields and subtitles above the open-row overlay', async () => {
    const onRowAction = vi.fn();
    const onLink = vi.fn((e: React.MouseEvent) => e.preventDefault());
    const withLink: DataTableColumn<Row>[] = [
      columns[0]!,
      {
        id: 'email',
        header: 'Email',
        card: 'subtitle',
        cell: (r) => (
          <a href={`mailto:${r.email}`} onClick={onLink}>
            {r.email}
          </a>
        ),
      },
      {
        id: 'site',
        header: 'Site',
        cell: (r) => (
          <a href={`https://example.com/${r.id}`} onClick={onLink}>
            site
          </a>
        ),
      },
    ];
    render(<Members columns={withLink} onRowAction={onRowAction} />);
    const mail = screen.getByRole('link', { name: 'p1@example.com' });
    const site = screen.getAllByRole('link', { name: 'site' })[0]!;
    // The wrappers carry the lift (jsdom has no hit-testing to prove the
    // stacking; the browser check did).
    expect(mail.parentElement?.parentElement?.className).toContain('[&_a]:z-10');
    expect(site.closest('dl')?.className).toContain('[&_a]:z-10');
    await userEvent.click(mail);
    await userEvent.click(site);
    expect(onLink).toHaveBeenCalledTimes(2);
    // The links are not inside the title button (no nested interactive content).
    expect(mail.closest('button')).toBeNull();
    expect(site.closest('button')).toBeNull();
  });
});
