import * as React from 'react';

import { cn } from '../lib/utils';

export interface LoadingDotsProps extends React.ComponentProps<'span'> {
  label?: string;
  /** Show the status beside the dots as well as announcing it. */
  showLabel?: boolean;
}

/** A quiet status for thinking, typing and waiting without a known percentage. */
export const LoadingDots = React.forwardRef<HTMLSpanElement, LoadingDotsProps>(function LoadingDots(
  { label = 'Thinking', showLabel = false, className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-slot="loading-dots"
      role="status"
      className={cn('inline-flex items-center gap-2 text-sm text-muted-foreground', className)}
      {...props}
    >
      <span aria-hidden className="inline-flex items-center gap-1 py-2">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 animate-loading-dot rounded-full bg-current motion-reduce:animate-none"
            style={{ animationDelay: `${dot * 160}ms` }}
          />
        ))}
      </span>
      <span className={showLabel ? undefined : 'sr-only'}>{label}</span>
    </span>
  );
});
