import * as React from 'react';

import { cn } from '../lib/utils';

/**
 * Keyboard focus for anything that is a text field, or a box that contains
 * one (Composer, a bordered Command): the border turns the ring colour and a
 * 1px inset ring doubles it to 2px. It sits inside the border box, so it
 * follows the radius exactly and no overflow can clip it. The outline is
 * suppressed with !important: an app's unlayered `:focus-visible { outline }`
 * would otherwise beat the utilities layer and draw a second, offset box.
 * outline-hidden keeps a transparent outline, which forced-colors mode shows.
 */
export const fieldFocusClasses =
  'outline-hidden! focus-visible:border-ring focus-visible:inset-ring-1 focus-visible:inset-ring-ring aria-invalid:focus-visible:inset-ring-destructive';

/**
 * Fields and field-like triggers: 10px radius (radius-md). Popovers are 12px
 * (radius-lg) and their rows 8px (radius-sm: 12px less the 4px inset).
 */
export const fieldClasses = `w-full min-w-0 rounded-md border border-input bg-surface px-3 text-base sm:text-sm text-foreground shadow-xs transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/80 hover:border-border-strong ${fieldFocusClasses} disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive dark:bg-surface-raised`;

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(function Input(
  { className, type, ...props }: React.ComponentProps<'input'>,
  ref,
) {
  return (
    <input
      ref={ref}
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
});

export { Input };
