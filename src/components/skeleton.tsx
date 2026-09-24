import * as React from 'react';

import { cn } from '../lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn('animate-pulse rounded-md bg-foreground/[0.06]', className)}
      {...props}
    />
  );
}

export { Skeleton };
