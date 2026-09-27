import * as React from 'react';

import { ContextUsage, Button } from '@burtson-labs/ui';

export default function ContextUsageDemo() {
  const [used, setUsed] = React.useState(171000);
  return (
    <div className="grid w-full max-w-md gap-6">
      <ContextUsage used={used} limit={200000} onCompact={() => setUsed(72000)} />
      <ContextUsage used={null} limit={null} label="New session" />
      <Button size="sm" variant="outline" onClick={() => setUsed(196000)}>
        Preview a nearly full window
      </Button>
      <p className="text-xs text-muted-foreground">
        Example counts. In an app, pass measurements and compaction results from your runtime.
      </p>
    </div>
  );
}
