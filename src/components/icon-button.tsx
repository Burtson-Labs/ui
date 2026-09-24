import * as React from 'react';

import { cn } from '../lib/utils';

import { Button, type ButtonProps } from './button';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  label: string;
  children: React.ReactNode;
}

function IconButton({ label, className, children, size = 'icon', ...props }: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      title={props.title ?? label}
      size={size}
      className={cn('rounded-md', className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export { IconButton };
