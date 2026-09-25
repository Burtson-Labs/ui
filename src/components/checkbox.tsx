import Check from '@burtson-labs/icons/react/check';
import Minus from '@burtson-labs/icons/react/minus';
import * as React from 'react';

import { cn } from '../lib/utils';
import * as CheckboxPrimitive from '../primitives/vendor/radix/react-checkbox';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 rounded-xs border border-border-strong bg-surface shadow-xs transition-[border-color,box-shadow] outline-none hover:border-brand/50 focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="group/indicator grid place-content-center text-current"
      >
        <Check
          className="size-3.5 group-data-[state=indeterminate]/indicator:hidden"
          strokeWidth={2.5}
          aria-hidden
        />
        <Minus
          className="hidden size-3.5 group-data-[state=indeterminate]/indicator:block"
          strokeWidth={2.5}
          aria-hidden
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
