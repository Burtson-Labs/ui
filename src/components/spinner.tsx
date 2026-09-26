import Loader from '@burtson-labs/icons/react/loader';
import * as React from 'react';

import { cn } from '../lib/utils';

export interface SpinnerProps extends React.ComponentProps<typeof Loader> {
  /** What is loading, for screen readers. */
  label?: string;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { className, label = 'Loading', ...props },
  ref,
) {
  return (
    <Loader
      ref={ref}
      role="status"
      aria-label={label}
      data-slot="spinner"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
});

export { Spinner };
