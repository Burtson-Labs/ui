import Search from '@burtson-labs/icons/react/search';
import * as React from 'react';

import { cn, noOutlineClasses } from '../lib/utils';

/**
 * Keyboard focus for anything that is a text field, or a box that contains
 * one (Composer, a bordered Command): the border turns the ring colour and a
 * 1px inset ring doubles it to 2px. It sits inside the border box, so it
 * follows the radius exactly and no overflow can clip it. The outline is
 * suppressed with !important (an app's unlayered `:focus-visible { outline }`
 * would otherwise beat the utilities layer and draw a second, offset box) and
 * comes back as a system-colour outline in forced-colors mode, where no ring
 * colour survives.
 */
export const fieldFocusClasses = `${noOutlineClasses} focus-visible:border-ring focus-visible:inset-ring-1 focus-visible:inset-ring-ring aria-invalid:focus-visible:inset-ring-destructive`;

/**
 * Fields and field-like triggers: 10px radius (radius-md). Popovers are 12px
 * (radius-lg) and their rows 8px (radius-sm: 12px less the 4px inset).
 * Placeholder text is the muted foreground at full strength (4.5:1 on the
 * field); disabled fields fill with muted and dim.
 */
export const fieldClasses = `w-full min-w-0 rounded-md border border-input bg-surface px-3 text-base sm:text-sm text-foreground shadow-xs transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground hover:border-border-strong ${fieldFocusClasses} disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive dark:bg-surface-raised`;

/**
 * Field widths by what goes in them, on the 4px scale. Every width is full on
 * a phone (fields stack there); from 640px a field takes the width its
 * content needs, so a row of them reads as a form rather than a column of
 * bars. `full` always fills the row.
 */
export const fieldWidthClasses = {
  /** 2–4 digits: minutes, a percentage, a count. */
  xs: 'w-full sm:w-24',
  /** Money, gallons, a year, a time of day. */
  sm: 'w-full sm:w-36',
  /** A date, a short code, a short choice. */
  md: 'w-full sm:w-48',
  /** Names, emails, most choices: capped so they do not run across a wide card. */
  lg: 'w-full sm:max-w-sm',
  full: 'w-full',
} as const;

export type FieldWidth = keyof typeof fieldWidthClasses;

export interface InputProps extends React.ComponentProps<'input'> {
  /** How wide the field is from 640px up; full width on phones. */
  width?: FieldWidth;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, width, ...props }: InputProps,
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
        width && fieldWidthClasses[width],
        className,
      )}
      {...props}
    />
  );
});

export interface SearchInputProps extends Omit<InputProps, 'type'> {
  /** Classes for the wrapper that positions the icon; `className` goes to the input. */
  containerClassName?: string;
}

/**
 * A search box: the magnifier inside the field, `type="search"` for the
 * browser's clear control and the search key on phone keyboards, and Enter
 * left to the form. Name it with `aria-label`, `aria-labelledby` or a Label.
 */
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, containerClassName, width, ...props }: SearchInputProps,
  ref,
) {
  return (
    <span
      data-slot="search-input"
      className={cn(
        'relative flex min-w-0',
        width ? fieldWidthClasses[width] : 'w-full',
        containerClassName,
      )}
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={ref}
        type="search"
        autoComplete="off"
        enterKeyHint="search"
        className={cn('pl-9', className)}
        {...props}
      />
    </span>
  );
});

export { Input, SearchInput };
