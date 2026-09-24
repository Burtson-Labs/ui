import { Spinner } from '@burtson-labs/ui';

export default function SpinnerDemo() {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <Spinner />
      <Spinner className="size-6 text-brand" />
      <span className="inline-flex items-center gap-2">
        <Spinner label="Pulling model" /> Pulling model…
      </span>
    </div>
  );
}
