import Check from '@burtson-labs/icons/react/check';
import Minus from '@burtson-labs/icons/react/minus';
import * as React from 'react';

import { cn, focusRingClasses, touchTargetClasses } from '../lib/utils';
import * as CheckboxPrimitive from '../primitives/vendor/radix/react-checkbox';

/**
 * A 16px box with a 44px hit area on touch screens. Its unchecked border is
 * the field border tone (`input`, 3:1 on the page in both modes); checked it
 * fills with primary in light mode and with brand (the ring colour, 4.5:1 on
 * the page, where primary reaches 2.8:1) in dark mode. Focus is the shared
 * 2px outline. Wrap it in a Label, or use CheckboxRow or CheckboxCard.
 */
const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        'peer size-4 shrink-0 rounded-xs border border-input bg-surface shadow-xs transition-[border-color,box-shadow,background-color] hover:border-brand/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground dark:data-[state=checked]:border-brand dark:data-[state=checked]:bg-brand dark:data-[state=checked]:text-background dark:data-[state=indeterminate]:border-brand dark:data-[state=indeterminate]:bg-brand dark:data-[state=indeterminate]:text-background',
        focusRingClasses,
        touchTargetClasses,
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
});

export interface CheckboxRowProps extends Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  'children'
> {
  /** The option's name. */
  label: React.ReactNode;
  /** A line under the name. */
  description?: React.ReactNode;
  /** Extra classes for the row (the label); className goes to the checkbox. */
  rowClassName?: string;
}

/**
 * A checkbox with its label to the right and an optional line under it, the
 * whole row clickable. For a bordered option with a sentence of explanation
 * use CheckboxCard.
 */
const CheckboxRow = React.forwardRef<HTMLButtonElement, CheckboxRowProps>(function CheckboxRow(
  { label, description, id: idProp, className, rowClassName, disabled, ...props },
  ref,
) {
  const auto = React.useId();
  const id = idProp ?? auto;
  return (
    <label
      htmlFor={id}
      data-slot="checkbox-row"
      className={cn(
        'flex min-h-5 cursor-pointer items-start gap-2.5 text-sm leading-5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60',
        rowClassName,
      )}
    >
      <Checkbox
        ref={ref}
        id={id}
        disabled={disabled}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-description` : undefined}
        className={cn('mt-0.5', className)}
        {...props}
      />
      <span className="grid min-w-0 gap-0.5">
        <span id={`${id}-label`} className="font-medium">
          {label}
        </span>
        {description && (
          <span id={`${id}-description`} className="text-xs leading-4 text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  );
});

export { Checkbox, CheckboxRow };
