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

export default function TableDemo() {
  return (
    <Table className="max-w-xl" scrollLabel="Recent agent runs">
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
              <Badge variant={r.status === 'Passed' ? 'success' : 'destructive'}>{r.status}</Badge>
            </TableCell>
            <TableCell numeric>{r.took}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
