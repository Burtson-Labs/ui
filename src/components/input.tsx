import * as React from 'react';

import { cn } from '../lib/utils';

/** Shared by Input, Textarea and SelectTrigger so every field looks the same. */
export const fieldClasses =
  'w-full min-w-0 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/20';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldClasses,
        'h-9 py-1 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
