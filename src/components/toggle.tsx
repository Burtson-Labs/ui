import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';

/**
 * A two-state button: quiet at rest, the brand-soft fill when on. 36px by
 * default (44px on touch screens), icons 16px. Shared by Toggle and
 * ToggleGroupItem.
 */
const toggleVariants = cva(
  `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-[background-color,border-color,color] select-none ${focusRingClasses} pointer-coarse:min-h-11 pointer-coarse:min-w-11 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-brand-soft data-[state=on]:text-brand-soft-foreground data-[state=on]:border-brand/25 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  {
    variants: {
      variant: {
        default: 'border-transparent text-foreground hover:bg-muted',
        outline:
          'border-border-strong bg-surface text-foreground shadow-xs hover:border-brand/35 hover:bg-accent/60',
      },
      size: {
        sm: 'h-8 min-w-8 px-2 text-[13px]',
        default: 'h-9 min-w-9 px-2.5',
        lg: 'h-10 min-w-10 px-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ToggleProps
  extends Omit<React.ComponentProps<'button'>, 'value'>, VariantProps<typeof toggleVariants> {
  /** Controlled state. */
  pressed?: boolean;
  /** Uncontrolled initial state. */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

/**
 * A button that stays on or off: bold, mute, "show archived". Announced with
 * aria-pressed. Give an icon-only toggle an aria-label that names the thing
 * it turns on ("Bold"), not its state.
 */
const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    className,
    variant,
    size,
    pressed: pressedProp,
    defaultPressed = false,
    onPressedChange,
    onClick,
    type,
    ...props
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultPressed);
  const pressed = pressedProp ?? uncontrolled;
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      data-slot="toggle"
      aria-pressed={pressed}
      data-state={pressed ? 'on' : 'off'}
      className={cn(toggleVariants({ variant, size }), className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || props.disabled) return;
        const next = !pressed;
        if (pressedProp === undefined) setUncontrolled(next);
        onPressedChange?.(next);
      }}
      {...props}
    />
  );
});

export { Toggle, toggleVariants };
