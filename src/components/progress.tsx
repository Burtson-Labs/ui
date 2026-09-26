import * as React from 'react';

import { cn } from '../lib/utils';
import * as ProgressPrimitive from '../primitives/vendor/radix/react-progress';

const Progress = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ProgressPrimitive.Root>
>(function Progress({ className, value, max = 100, ...props }, ref) {
  const maximum = Number.isFinite(max) && max > 0 ? max : 100;
  const progress =
    typeof value === 'number' && Number.isFinite(value)
      ? Math.min(maximum, Math.max(0, value))
      : null;
  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      value={progress}
      max={maximum}
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-border', className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          'h-full bg-brand transition-transform duration-(--duration-standard)',
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
});

export { Progress };
