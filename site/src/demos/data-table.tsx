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
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
  status: 'Active' | 'Invited' | 'Suspended';
  runs: number;
}

const names = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Katherine Johnson',
  'Edsger Dijkstra',
  'Barbara Liskov',
  'Donald Knuth',
  'Margaret Hamilton',
  'Ken Thompson',
  'Frances Allen',
  'John Backus',
  'Radia Perlman',
  'Dennis Ritchie',
  'Hedy Lamarr',
  'Tim Berners-Lee',
  'Adele Goldberg',
  'Leslie Lamport',
  'Shafi Goldwasser',
];
const roles: Member['role'][] = ['Owner', 'Admin', 'Member', 'Member'];
const statuses: Member['status'][] = ['Active', 'Invited', 'Active', 'Suspended'];
const members: Member[] = names.map((name, i) => ({
  id: `u${i + 1}`,
  name,
  email: `${name.split(' ')[0]!.toLowerCase()}@example.com`,
  role: i === 0 ? 'Owner' : (roles[(i % 3) + 1] ?? 'Member'),
  status: statuses[i % statuses.length] ?? 'Active',
  runs: (i * 97 + 31) % 450,
}));

const statusVariant = { Active: 'success', Invited: 'info', Suspended: 'warning' } as const;

const columns: DataTableColumn<Member>[] = [
  { id: 'name', header: 'Name', sortable: true, cell: (m) => m.name, card: 'title' },
  {
    id: 'email',
    header: 'Email',
    cell: (m) => <span className="text-muted-foreground">{m.email}</span>,
    cardCell: (m) => m.email,
    card: 'subtitle',
    hideBelow: 'lg',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (m) => <Badge variant={statusVariant[m.status]}>{m.status}</Badge>,
    card: 'aside',
  },
  {
    id: 'role',
    header: 'Role',
    cell: (m) => <Badge variant={m.role === 'Member' ? 'outline' : 'default'}>{m.role}</Badge>,
    cardCell: (m) => m.role,
  },
  { id: 'runs', header: 'Runs', sortable: true, numeric: true, cell: (m) => m.runs },
];

export default function DataTableDemo() {
  // Sorting and filtering happen here, as a server would do them; `paginate`
  // pages the result in the browser and goes back to page 1 on a new search.
  const [sort, setSort] = React.useState<DataTableSort | null>({
    columnId: 'name',
    direction: 'asc',
  });
  const [filter, setFilter] = React.useState('');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [opened, setOpened] = React.useState<string | null>(null);

  const matched = members.filter((m) =>
    `${m.name} ${m.email}`.toLowerCase().includes(filter.toLowerCase()),
  );
  const rows = sort
    ? [...matched].sort((a, b) => {
        const k = sort.columnId as 'name' | 'runs';
        const d = a[k] < b[k] ? -1 : a[k] > b[k] ? 1 : 0;
        return sort.direction === 'asc' ? d : -d;
      })
    : matched;

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
        onFilterChange={setFilter}
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
        paginate={{ pageSize: 5, pageSizeOptions: [5, 10, 25] }}
        rowNoun="members"
        empty="No members match that search."
      />
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {opened
          ? `Opened ${opened}`
          : 'Arrow keys move between rows, Enter opens, Space selects. Below 768px the rows are cards.'}
      </p>
    </div>
  );
}
