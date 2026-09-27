import * as React from 'react';

import { cn } from '../lib/utils';

export interface SkeletonProps extends React.ComponentProps<'div'> {
  animation?: 'pulse' | 'shimmer' | 'none';
}

/** A placeholder block. Give it the size of what it stands in for; hidden from screen readers. */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { className, animation = 'pulse', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden
      className={cn(
        'rounded-md bg-foreground/[0.08] motion-reduce:animate-none',
        animation === 'pulse' && 'animate-pulse',
        animation === 'shimmer' &&
          'animate-skeleton-shimmer bg-linear-to-r from-transparent via-foreground/[0.06] to-transparent bg-[length:200%_100%]',
        className,
      )}
      {...props}
    />
  );
});

export { Skeleton };
