import MoreHorizontal from '@burtson-labs/icons/react/more-horizontal';
import * as React from 'react';

import {
  Badge,
  DataTable,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
  type DataTableColumn,
  type DataTableSort,
} from '@burtson-labs/ui';

interface Member {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Member';
  runs: number;
}

const members: Member[] = [
  { id: 'u1', name: 'Ada Lovelace', role: 'Owner', runs: 412 },
  { id: 'u2', name: 'Grace Hopper', role: 'Admin', runs: 268 },
  { id: 'u3', name: 'Alan Turing', role: 'Member', runs: 97 },
  { id: 'u4', name: 'Katherine Johnson', role: 'Member', runs: 151 },
  { id: 'u5', name: 'Edsger Dijkstra', role: 'Member', runs: 33 },
  { id: 'u6', name: 'Barbara Liskov', role: 'Admin', runs: 205 },
  { id: 'u7', name: 'Donald Knuth', role: 'Member', runs: 64 },
];

const PAGE = 5;

const columns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', sortable: true, cell: (m) => m.name },
  {
    id: 'role',
    header: 'Role',
    cell: (m) => <Badge variant={m.role === 'Member' ? 'outline' : 'default'}>{m.role}</Badge>,
  },
  { id: 'runs', header: 'Runs', sortable: true, numeric: true, cell: (m) => m.runs },
];

export default function DataTableDemo() {
  // Sorting, filtering and paging happen here, as a server would do them.
  const [sort, setSort] = React.useState<DataTableSort | null>({
    columnId: 'name',
    direction: 'asc',
  });
  const [filter, setFilter] = React.useState('');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const [opened, setOpened] = React.useState<string | null>(null);

  const matched = members.filter((m) => m.name.toLowerCase().includes(filter.toLowerCase()));
  const sorted = sort
    ? [...matched].sort((a, b) => {
        const k = sort.columnId as 'name' | 'runs';
        const d = a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0;
        return sort.direction === 'asc' ? d : -d;
      })
    : matched;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE));
  const current = Math.min(page, pageCount);
  const rows = sorted.slice((current - 1) * PAGE, current * PAGE);

  return (
    <div className="grid w-full gap-2">
      <DataTable
        aria-label="Workspace members"
        columns={columns}
        rows={rows}
        getRowId={(m) => m.id}
        getRowLabel={(m) => m.name}
        sort={sort}
        onSortChange={setSort}
        filter={filter}
        onFilterChange={(v) => {
          setFilter(v);
          setPage(1);
        }}
        filterPlaceholder="Search members"
        selected={selected}
        onSelectedChange={setSelected}
        onRowAction={(m) => setOpened(m.name)}
        rowActions={(m) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton label={`Actions for ${m.name}`} variant="ghost" size="icon-sm">
                <MoreHorizontal />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setOpened(m.name)}>Open</DropdownMenuItem>
              <DropdownMenuItem>Change role</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        page={current}
        pageCount={pageCount}
        onPageChange={setPage}
        pageSummary={`${sorted.length} members`}
        empty="No members match that search."
      />
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {opened ? `Opened ${opened}` : 'Arrow keys move between rows, Enter opens, Space selects.'}
      </p>
    </div>
  );
}
