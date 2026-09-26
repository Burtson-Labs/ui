import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@burtson-labs/ui';

const runs = [
  { id: 'run-4821', agent: 'release-captain', status: 'Passed', took: '2m 14s' },
  { id: 'run-4820', agent: 'dependency-bot', status: 'Failed', took: '41s' },
  { id: 'run-4819', agent: 'docs-sync', status: 'Passed', took: '1m 02s' },
] as const;

const drivers = [
  { name: 'Ada Lovelace', week: 31, month: 217, year: 930, all: 11315 },
  { name: 'Grace Hopper', week: 128, month: 896, year: 3840, all: 46720 },
  { name: 'Alan Turing', week: 225, month: 1575, year: 6750, all: 82125 },
];

export default function TableDemo() {
  return (
    <div className="grid w-full max-w-xl gap-8">
      <Table scrollLabel="Recent agent runs">
        <TableCaption>Recent agent runs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Run</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead numeric>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((r) => (
            <TableRow key={r.id} selected={r.id === 'run-4821'}>
              <TableCell className="font-mono">{r.id}</TableCell>
              <TableCell>{r.agent}</TableCell>
              <TableCell>
                <Badge variant={r.status === 'Passed' ? 'success' : 'destructive'}>
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell numeric>{r.took}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* A number table that scrolls sideways in a narrow box: the first column stays put,
          the far edge fades, and touch screens get a "Swipe for more" line. */}
      <div className="max-w-sm">
        <Table scrollLabel="Miles by driver" pinFirstColumn>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead numeric>Week</TableHead>
              <TableHead numeric>Month</TableHead>
              <TableHead numeric>Year</TableHead>
              <TableHead numeric>All time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((d) => (
              <TableRow key={d.name}>
                <TableCell>{d.name}</TableCell>
                <TableCell numeric>{d.week.toLocaleString()}</TableCell>
                <TableCell numeric>{d.month.toLocaleString()}</TableCell>
                <TableCell numeric>{d.year.toLocaleString()}</TableCell>
                <TableCell numeric>{d.all.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
