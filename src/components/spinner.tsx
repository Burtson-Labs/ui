import Loader from '@burtson-labs/icons/react/loader';
import * as React from 'react';

import { cn } from '../lib/utils';

function Spinner({
  className,
  label = 'Loading',
  ...props
}: React.ComponentProps<typeof Loader> & { label?: string }) {
  return (
    <Loader
      role="status"
      aria-label={label}
      data-slot="spinner"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };
