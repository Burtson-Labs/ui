import ChevronDown from '@burtson-labs/icons/react/chevron-down';
import * as React from 'react';

import { cn } from '../lib/utils';

import { fieldClasses, type FieldWidth, fieldWidthClasses } from './input';

export interface NativeSelectProps extends React.ComponentProps<'select'> {
  /** How wide the field is from 640px up; full width on phones. */
  width?: FieldWidth;
  /** Classes for the wrapper that positions the chevron; `className` goes to the select. */
  containerClassName?: string;
}

/**
 * The browser's own `<select>`, drawn like the kit's fields. Use it for short
 * lists in forms on phones, where the platform picker beats a popover, and
 * anywhere a portal is unwelcome. For search, descriptions or long lists use
 * Select or Combobox.
 */
const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
  { className, containerClassName, width, children, ...props }: NativeSelectProps,
  ref,
) {
  return (
    <span
      data-slot="native-select-container"
      className={cn(
        'relative flex min-w-0',
        width ? fieldWidthClasses[width] : 'w-full',
        containerClassName,
      )}
    >
      <select
        ref={ref}
        data-slot="native-select"
        className={cn(
          fieldClasses,
          'h-9 w-full cursor-pointer appearance-none py-1.5 pr-9',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </span>
  );
});

export { NativeSelect };
