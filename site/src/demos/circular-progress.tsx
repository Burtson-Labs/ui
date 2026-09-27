import * as React from 'react';

import { CircularProgress, Slider } from '@burtson-labs/ui';

export default function CircularProgressDemo() {
  const [value, setValue] = React.useState(64);
  return (
    <div className="grid w-full max-w-sm gap-6">
      <div className="flex flex-wrap items-center gap-7">
        <CircularProgress label="Processing" />
        <CircularProgress value={value} size={56} showValue label="File uploaded" />
        <CircularProgress value={100} label="Complete" />
        <CircularProgress size={20} label="Connecting" />
      </div>
      <Slider value={value} onValueChange={setValue} aria-label="Upload percentage" />
    </div>
  );
}
