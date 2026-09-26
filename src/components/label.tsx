import * as React from 'react';

import { cn } from '../lib/utils';
import * as LabelPrimitive from '../primitives/vendor/radix/react-label';

/**
 * A caption for a control. Wrap a Checkbox, Switch or RadioGroupItem in it
 * and the whole caption toggles the control; at least 44px tall on touch
 * screens when it does.
 */
const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<typeof LabelPrimitive.Root>>(
  function Label({ className, ...props }, ref) {
    return (
      <LabelPrimitive.Root
        ref={ref}
        data-slot="label"
        className={cn(
          'flex items-center gap-2 text-[13px] leading-none font-semibold select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 has-[[data-slot=checkbox],[data-slot=switch],[data-slot=radio-group-item]]:cursor-pointer has-[[data-slot=checkbox],[data-slot=switch],[data-slot=radio-group-item]]:pointer-coarse:min-h-11',
          className,
        )}
        {...props}
      />
    );
  },
);

export { Label };
