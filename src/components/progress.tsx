import { Progress as ProgressPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '../lib/utils';

function Progress({
  className,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const maximum = Number.isFinite(max) && max > 0 ? max : 100;
  const progress =
    typeof value === 'number' && Number.isFinite(value)
      ? Math.min(maximum, Math.max(0, value))
      : null;
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={progress}
      max={maximum}
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'h-full bg-brand transition-transform',
          progress === null ? 'w-1/3 animate-pulse' : 'w-full',
        )}
        style={
          progress === null
            ? undefined
            : { transform: `translateX(-${100 - (progress / maximum) * 100}%)` }
        }
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
