// App patterns from the Bandit modernization blueprint: attachment-only sends,
// attachments and uploads, sources, connection and sync state, the mobile tab
// bar, bottom sheets, and the controlled DataTable recipe.
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  AttachmentItem,
  AttachmentTray,
  Composer,
  ConnectionBanner,
  ConnectionStatus,
  DataTable,
  MobileNav,
  Sheet,
  SheetContent,
  SheetTitle,
  SourceCitation,
  SourceList,
  SyncStatus,
  UploadQueue,
  formatBytes,
  safeSourceHref,
  type DataTableColumn,
  type DataTableSort,
} from '@burtson-labs/ui';

const attr = (el: Element | null | undefined, name: string) => el?.getAttribute(name);

describe('Composer attachment-only sends', () => {
  it('sends an empty message when files are attached', async () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} attachmentCount={1} />);
    const send = screen.getByRole<HTMLButtonElement>('button', { name: 'Send' });
    expect(send.disabled).toBe(false);
    await userEvent.click(send);
    expect(onSubmit).toHaveBeenCalledWith('');
  });

  it('stays disabled with no text and no files', () => {
    render(<Composer onSubmit={() => {}} />);
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Send' }).disabled).toBe(true);
  });

  it('canSubmit={false} blocks sending but not typing', async () => {
    const onSubmit = vi.fn();
    render(<Composer onSubmit={onSubmit} attachmentCount={1} canSubmit={false} />);
    const box = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Message' });
    await userEvent.type(box, 'hello{Enter}');
    expect(box.value).toBe('hello');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Send' }).disabled).toBe(true);
  });

  it('keeps the draft when an attachment-only send is rejected', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('offline'));
    render(<Composer onSubmit={onSubmit} attachmentCount={2} />);
    await userEvent.type(screen.getByRole('textbox'), 'see files{Enter}');
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole<HTMLTextAreaElement>('textbox').value).toBe('see files');
  });
});

describe('Attachments', () => {
  it('formats sizes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(38_200_000)).toBe('36 MB');
  });

  it('lists items in a tray, with named remove and retry', async () => {
    const onRemove = vi.fn();
    const onRetry = vi.fn();
    render(
      <AttachmentTray>
        <AttachmentItem name="a.pdf" size={2048} />
        <AttachmentItem
          name="b.pages"
          state="failed"
          error="Export it as PDF."
          onRemove={onRemove}
          onRetry={onRetry}
        />
      </AttachmentTray>,
    );
    const list = screen.getByRole('list', { name: 'Attachments' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Export it as PDF.')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Retry b.pages' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove b.pages' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('shows progress while uploading and no retry unless failed', () => {
    render(<AttachmentItem name="c.tiff" state="uploading" progress={40} onRetry={() => {}} />);
    expect(screen.getByRole('progressbar', { name: 'Uploading c.tiff' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Retry/ })).toBeNull();
    expect(
      attr(screen.getByText('c.tiff').closest('[data-slot="attachment-item"]'), 'aria-busy'),
    ).toBe('true');
  });

  it('summarises an upload queue', () => {
    render(
      <UploadQueue
        files={[
          { id: '1', name: 'a', state: 'ready' },
          { id: '2', name: 'b', state: 'failed' },
          { id: '3', name: 'c', state: 'parsing' },
        ]}
      />,
    );
    expect(screen.getByText('1 of 3 ready, 1 failed')).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Uploads' })).toBeTruthy();
  });
});

describe('Sources', () => {
  it('only links http(s) URLs', () => {
    expect(safeSourceHref('https://example.com/a')).toBe('https://example.com/a');
    expect(safeSourceHref('javascript:alert(1)')).toBeUndefined();
    expect(safeSourceHref('data:text/html,hi')).toBeUndefined();
    expect(safeSourceHref('/relative')).toBeUndefined();
  });

  it('renders a numbered list, linking safe URLs only', () => {
    render(
      <SourceList
        sources={[
          { id: 'a', title: 'Safe', url: 'https://example.com/doc' },
          { id: 'b', title: 'Unsafe', url: 'javascript:alert(1)' },
        ]}
      />,
    );
    expect(attr(screen.getByRole('link', { name: /Safe/ }), 'rel')).toBe('noopener noreferrer');
    expect(screen.queryByRole('link', { name: /Unsafe/ })).toBeNull();
    expect(screen.getByText('Unsafe')).toBeTruthy();
  });

  it('opens a citation popover', async () => {
    render(
      <SourceCitation index={2} source={{ id: 'x', title: 'Policy', snippet: 'Receipts.' }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Source 2: Policy' }));
    expect(await screen.findByText('Receipts.')).toBeTruthy();
  });
});

describe('Connection and sync status', () => {
  it('never reads unknown as connected', () => {
    render(<ConnectionStatus state="unknown" />);
    expect(screen.getByRole('status').textContent).toContain('Status unknown');
    expect(screen.queryByText('Connected')).toBeNull();
  });

  it('offers retry only when it can help', () => {
    const { rerender } = render(<ConnectionStatus state="connected" onRetry={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    rerender(<ConnectionStatus state="offline" onRetry={() => {}} />);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('counts pending changes', () => {
    render(<SyncStatus state="pending" pendingCount={1} />);
    expect(screen.getByRole('status').textContent).toContain('1 change not synced yet');
  });

  it('shows the banner only for trouble', () => {
    const { container, rerender } = render(<ConnectionBanner state="connected" />);
    expect(container.innerHTML).toBe('');
    rerender(<ConnectionBanner state="offline" onRetry={() => {}} />);
    expect(screen.getByRole('alert').textContent).toContain('You are offline');
  });
});

describe('MobileNav', () => {
  it('marks the current destination and reports presses', async () => {
    const onValueChange = vi.fn();
    render(
      <MobileNav
        value="chat"
        onValueChange={onValueChange}
        items={[
          { id: 'chat', label: 'Chat', icon: <svg /> },
          { id: 'history', label: 'History', icon: <svg />, badge: 3 },
        ]}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeTruthy();
    expect(attr(screen.getByRole('button', { name: 'Chat' }), 'aria-current')).toBe('page');
    await userEvent.click(screen.getByRole('button', { name: /History, 3 new/ }));
    expect(onValueChange).toHaveBeenCalledWith('history', expect.anything());
  });
});

describe('Sheet', () => {
  it('shows a grab handle on bottom sheets only', () => {
    const { unmount } = render(
      <Sheet open>
        <SheetContent side="bottom" aria-describedby={undefined}>
          <SheetTitle>Pick a model</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector('[data-slot="sheet-handle"]')).not.toBeNull();
    unmount();
    render(
      <Sheet open>
        <SheetContent side="right" aria-describedby={undefined}>
          <SheetTitle>Details</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector('[data-slot="sheet-handle"]')).toBeNull();
  });
});

interface Row {
  id: string;
  name: string;
  runs: number;
}
const rows: Row[] = [
  { id: 'a', name: 'Ada', runs: 3 },
  { id: 'b', name: 'Grace', runs: 1 },
  { id: 'c', name: 'Alan', runs: 2 },
];
const columns: DataTableColumn<Row>[] = [
  { id: 'name', header: 'Name', sortable: true, cell: (r) => r.name },
  { id: 'runs', header: 'Runs', numeric: true, cell: (r) => r.runs },
];

function Table({
  initialSelected,
  onSortChange,
  ...props
}: Partial<React.ComponentProps<typeof DataTable<Row>>> & { initialSelected?: string[] }) {
  const [sort, setSort] = React.useState<DataTableSort | null>(null);
  const [selected, setSelected] = React.useState<string[]>(initialSelected ?? []);
  return (
    <DataTable<Row>
      aria-label="Members"
      columns={columns}
      rows={rows}
      getRowId={(r) => r.id}
      getRowLabel={(r) => r.name}
      sort={sort}
      onSortChange={(s) => {
        setSort(s);
        onSortChange?.(s);
      }}
      selected={selected}
      onSelectedChange={setSelected}
      {...props}
    />
  );
}

describe('DataTable', () => {
  it('cycles sort ascending, descending, none and reports aria-sort', async () => {
    const onSortChange = vi.fn();
    render(<Table onSortChange={onSortChange} />);
    const header = () => screen.getByRole('columnheader', { name: /Name/ });
    expect(attr(header(), 'aria-sort')).toBe('none');
    await userEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(attr(header(), 'aria-sort')).toBe('ascending');
    await userEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(attr(header(), 'aria-sort')).toBe('descending');
    await userEvent.click(screen.getByRole('button', { name: /Name/ }));
    expect(onSortChange).toHaveBeenLastCalledWith(null);
    // The table never reorders rows itself.
    const cells = screen
      .getAllByRole('row')
      .slice(1)
      .map((r) => within(r).getAllByRole('cell')[1]);
    expect(cells.map((c) => c?.textContent)).toEqual(['Ada', 'Grace', 'Alan']);
  });

  it('selects all on the page, with an indeterminate state', async () => {
    render(<Table initialSelected={['a']} />);
    const all = screen.getByRole('checkbox', { name: 'Select all rows on this page' });
    expect(attr(all, 'data-state')).toBe('indeterminate');
    await userEvent.click(all);
    expect(attr(all, 'data-state')).toBe('checked');
    expect(screen.getByText('3 selected')).toBeTruthy();
    await userEvent.click(all);
    expect(attr(screen.getByRole('checkbox', { name: 'Select Ada' }), 'data-state')).toBe(
      'unchecked',
    );
  });

  it('moves between rows with arrows; Enter acts, Space selects', () => {
    const onRowAction = vi.fn();
    render(<Table onRowAction={onRowAction} />);
    const body = screen.getAllByRole('row').slice(1);
    expect(attr(body[0], 'tabindex')).toBe('0');
    expect(attr(body[1], 'tabindex')).toBe('-1');
    body[0]!.focus();
    fireEvent.keyDown(body[0]!, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(body[1]);
    fireEvent.keyDown(body[1]!, { key: 'Enter' });
    expect(onRowAction).toHaveBeenCalledWith(rows[1]);
    fireEvent.keyDown(body[1]!, { key: ' ' });
    expect(attr(screen.getByRole('checkbox', { name: 'Select Grace' }), 'data-state')).toBe(
      'checked',
    );
    fireEvent.keyDown(body[1]!, { key: 'End' });
    expect(document.activeElement).toBe(body[2]);
  });

  it('does not run the row action for clicks on controls inside the row', async () => {
    const onRowAction = vi.fn();
    const onMenu = vi.fn();
    render(
      <Table
        onRowAction={onRowAction}
        rowActions={(r) => (
          <button type="button" onClick={onMenu}>
            Menu {r.name}
          </button>
        )}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Menu Ada' }));
    expect(onMenu).toHaveBeenCalledOnce();
    expect(onRowAction).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Grace'));
    expect(onRowAction).toHaveBeenCalledWith(rows[1]);
  });

  it('shows loading, empty and error states', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<Table rows={[]} loading />);
    expect(attr(screen.getByRole('table', { name: 'Members' }), 'aria-busy')).toBe('true');
    rerender(<Table rows={[]} empty="Nobody here yet." />);
    expect(screen.getByText('Nobody here yet.')).toBeTruthy();
    rerender(<Table error="Could not load members." onRetry={onRetry} />);
    expect(screen.getByRole('alert').textContent).toContain('Could not load members.');
    expect(screen.queryByText('Ada')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('reports search text and pages', async () => {
    const onFilterChange = vi.fn();
    const onPageChange = vi.fn();
    render(
      <Table
        filter=""
        onFilterChange={onFilterChange}
        page={1}
        pageCount={3}
        onPageChange={onPageChange}
      />,
    );
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search members' }), 'a');
    expect(onFilterChange).toHaveBeenCalledWith('a');
    await userEvent.click(screen.getByRole('button', { name: /Next/ }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
