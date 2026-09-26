import * as React from 'react';

import { cn } from '../lib/utils';

import { Button, type ButtonProps } from './button';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  /** The accessible name, also the tooltip: "Open terminal". */
  label: string;
  children: React.ReactNode;
}

/** An icon-only Button with its name built in. Keeps `data-slot="button"`, since it is one. */
const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className, children, size = 'icon', ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      aria-label={label}
      title={props.title ?? label}
      size={size}
      className={cn('rounded-md', className)}
      {...props}
    >
      {children}
    </Button>
  );
});

export { IconButton };
