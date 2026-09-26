import * as React from 'react';

import { cn } from '../lib/utils';

/** A placeholder block. Give it the size of what it stands in for; hidden from screen readers. */
const Skeleton = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function Skeleton(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden
      className={cn('animate-pulse rounded-md bg-foreground/[0.08]', className)}
      {...props}
    />
  );
});

export { Skeleton };
