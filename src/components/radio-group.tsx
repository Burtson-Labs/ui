import * as React from 'react';

import { cn, focusRingClasses, noOutlineClasses, touchTargetClasses } from '../lib/utils';
import * as RadioGroupPrimitive from '../primitives/vendor/radix/react-radio-group';

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RadioGroupPrimitive.Root>
>(function RadioGroup({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      data-slot="radio-group"
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
});

/**
 * A 16px dot with a 44px hit area on touch screens; focus is the shared 2px
 * outline. Chosen, it is primary in light mode and brand in dark mode (see
 * Checkbox).
 */
const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof RadioGroupPrimitive.Item>
>(function RadioGroupItem({ className, ...props }, ref) {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      data-slot="radio-group-item"
      className={cn(
        'aspect-square size-4 shrink-0 rounded-full border border-input bg-surface text-primary shadow-xs transition-[border-color,box-shadow] hover:border-brand/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[state=checked]:border-primary dark:text-brand dark:data-[state=checked]:border-brand',
        focusRingClasses,
        touchTargetClasses,
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <span className="size-2 rounded-full bg-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});

export interface RadioCardProps extends Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Item>,
  'title' | 'children'
> {
  /** The option's name. */
  title: React.ReactNode;
  /** A sentence under the name: what choosing it means. */
  description?: React.ReactNode;
  /** Extra classes for the card (the label); className goes to the radio. */
  cardClassName?: string;
}

/**
 * One option of a RadioGroup as a bordered card: the dot, a title and a line
 * of help, the whole card the target (44px or taller). The chosen card takes
 * the brand border; focus shows once, on the card. Pairs with CheckboxCard.
 */
const RadioCard = React.forwardRef<HTMLButtonElement, RadioCardProps>(function RadioCard(
  { title, description, id: idProp, disabled, className, cardClassName, ...props },
  ref,
) {
  const auto = React.useId();
  const id = idProp ?? auto;
  return (
    <label
      htmlFor={id}
      data-slot="radio-card"
      className={cn(
        'flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border-strong',
        'has-[[data-state=checked]]:border-brand/40 has-[[data-state=checked]]:bg-brand-soft/50',
        'has-[:focus-visible]:border-ring has-[:focus-visible]:inset-ring-1 has-[:focus-visible]:inset-ring-ring',
        'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:hover:border-border',
        cardClassName,
      )}
    >
      <RadioGroupItem
        ref={ref}
        id={id}
        disabled={disabled}
        aria-labelledby={`${id}-title`}
        aria-describedby={description ? `${id}-description` : undefined}
        // The card draws the focus ring; the dot keeps a system outline in forced colors.
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

export { RadioCard, RadioGroup, RadioGroupItem };
