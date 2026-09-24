import * as React from 'react';

import { cn } from '../lib/utils';

export const fieldClasses =
  'w-full min-w-0 rounded-md border border-input bg-surface px-3 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/80 hover:border-border-strong focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/15 dark:bg-surface-raised';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldClasses,
        'h-9 py-1.5 file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
