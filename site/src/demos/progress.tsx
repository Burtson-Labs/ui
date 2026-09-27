import * as React from 'react';

import { Progress, Slider } from '@burtson-labs/ui';

export default function ProgressDemo() {
  const [value, setValue] = React.useState(62);
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="grid gap-3">
        <div className="flex justify-between text-sm">
          <span>Uploading a file</span>
          <span className="tabular-nums text-muted-foreground">{value}%</span>
        </div>
        <Progress value={value} aria-label="Uploading a file" />
        <Slider value={value} onValueChange={setValue} aria-label="Example upload percentage" />
      </div>
      <div className="grid gap-3">
        <p className="text-sm">Connecting to the agent</p>
        <Progress value={null} aria-label="Connecting to the agent" />
        <p className="text-xs text-muted-foreground">
          Indeterminate: the amount of work is unknown.
        </p>
      </div>
    </div>
  );
}
