import { Reasoning, StreamingIndicator } from '@burtson-labs/ui';

export default function ReasoningDemo() {
  return (
    <div className="grid w-full max-w-xl gap-4">
      <Reasoning durationMs={3200} defaultOpen>
        The user wants failing repos. List today&apos;s audits, keep the ones under the gate, then
        read each report for the finding that failed it.
      </Reasoning>
      <Reasoning streaming>Checking the audit index…</Reasoning>
      <StreamingIndicator />
    </div>
  );
}
