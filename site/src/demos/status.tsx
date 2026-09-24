import { Status } from '@burtson-labs/ui';

export default function StatusDemo() {
  return (
    <div className="grid gap-3">
      <Status status="success" pulse>
        carterpi · Ready
      </Status>
      <Status status="brand" pulse>
        Agent run 4821 · thinking
      </Status>
      <Status status="warning">maddipi · Memory pressure</Status>
      <Status status="danger">worker-07 · NotReady</Status>
      <Status status="neutral">Nightly audit · queued</Status>
    </div>
  );
}
