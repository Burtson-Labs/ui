import * as React from 'react';

import { cn, noOutlineClasses } from '../lib/utils';
import * as CheckboxPrimitive from '../primitives/vendor/radix/react-checkbox';

import { Checkbox } from './checkbox';

export interface CheckboxCardProps extends Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  'title' | 'children'
> {
  /** The option's name. */
  title: React.ReactNode;
  /** A sentence under the name: what choosing it means. */
  description?: React.ReactNode;
  /** Extra classes for the card (the label); className goes to the checkbox. */
  cardClassName?: string;
}

/**
 * A checkbox with a title and a sentence, where the whole card is the hit
 * area (44px or taller). For choices that need explaining: roles,
 * permissions, notification types. One focus ring, on the card.
 */
const CheckboxCard = React.forwardRef<HTMLButtonElement, CheckboxCardProps>(function CheckboxCard(
  { title, description, id: idProp, disabled, className, cardClassName, ...props },
  ref,
) {
  const auto = React.useId();
  const id = idProp ?? auto;
  return (
    <label
      htmlFor={id}
      data-slot="checkbox-card"
      className={cn(
        'flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border-strong',
        'has-[[data-state=checked]]:border-brand/40 has-[[data-state=checked]]:bg-brand-soft/50',
        'has-[:focus-visible]:border-ring has-[:focus-visible]:inset-ring-1 has-[:focus-visible]:inset-ring-ring',
        // :disabled also catches a disabled fieldset around the card.
        'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:hover:border-border',
        cardClassName,
      )}
    >
      <Checkbox
        ref={ref}
        id={id}
        disabled={disabled}
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        // The card draws the focus ring; the box keeps a system outline in forced colors.
        className={cn('mt-0.5 focus-visible:outline-none', noOutlineClasses, className)}
        {...props}
      />
      <span className="grid min-w-0 gap-0.5">
        <span id={`${id}-title`} className="text-sm leading-5 font-medium">
          {title}
        </span>
        {description && (
          <span id={`${id}-description`} className="text-[13px] leading-5 text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  );
});

export interface CheckboxCardGroupProps extends React.ComponentProps<'fieldset'> {
  /** The group's name, shown as its legend. */
  label: React.ReactNode;
  /** Help under the legend. */
  description?: React.ReactNode;
}

/** A fieldset of CheckboxCards with a visible legend. `disabled` disables every card. */
const CheckboxCardGroup = React.forwardRef<HTMLFieldSetElement, CheckboxCardGroupProps>(
  function CheckboxCardGroup({ label, description, className, children, ...props }, ref) {
    const id = React.useId();
    return (
      <fieldset
        ref={ref}
        data-slot="checkbox-card-group"
        aria-describedby={description ? `${id}-description` : undefined}
        className={cn('grid min-w-0 gap-2', className)}
        {...props}
      >
        <legend className="mb-1.5 text-sm font-semibold">{label}</legend>
        {description && (
          <p id={`${id}-description`} className="-mt-1.5 text-[13px] text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </fieldset>
    );
  },
);

export { CheckboxCard, CheckboxCardGroup };
