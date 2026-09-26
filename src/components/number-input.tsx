import * as React from 'react';

import { cn, noOutlineClasses } from '../lib/utils';

import { type FieldWidth, fieldWidthClasses } from './input';

export interface NumberInputProps extends Omit<React.ComponentProps<'input'>, 'prefix' | 'type'> {
  /** Inside the field, before the number: "$". */
  prefix?: React.ReactNode;
  /** Inside the field, after the number: "gal", "min", "%". */
  suffix?: React.ReactNode;
  /** How wide the field is from 640px up; `sm` (money, a count) by default. */
  width?: FieldWidth;
  /** Allows a decimal point on the phone keyboard (`inputMode="decimal"`). */
  decimal?: boolean;
  /** Classes for the box; `className` goes to the input itself. */
  containerClassName?: string;
}

/**
 * A number with its unit inside the field, right-aligned in tabular figures
 * so a column of them lines up, with the numeric keyboard on phones. The box
 * is the field: it carries the border, the focus ring and the invalid and
 * disabled states, and the input inside is borderless. The value stays a
 * string, as with any input: parse it on change.
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    prefix,
    suffix,
    width = 'sm',
    decimal,
    className,
    containerClassName,
    disabled,
    ...props
  }: NumberInputProps,
  ref,
) {
  return (
    <div
      data-slot="number-input"
      data-disabled={disabled || undefined}
      className={cn(
        'flex h-9 min-w-0 items-stretch rounded-md border border-input bg-surface text-base text-foreground shadow-xs transition-[border-color,box-shadow,background-color] hover:border-border-strong sm:text-sm dark:bg-surface-raised',
        'has-[input:focus-visible]:border-ring has-[input:focus-visible]:inset-ring-1 has-[input:focus-visible]:inset-ring-ring',
        'has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]:focus-visible]:inset-ring-destructive',
        'data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted data-[disabled]:opacity-60',
        fieldWidthClasses[width],
        containerClassName,
      )}
    >
      {prefix && (
        <span aria-hidden className="shrink-0 self-center pl-3 text-muted-foreground select-none">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        data-slot="number-input-control"
        inputMode={decimal ? 'decimal' : 'numeric'}
        autoComplete="off"
        disabled={disabled}
        className={cn(
          'w-full min-w-0 rounded-md bg-transparent px-3 text-right tabular-nums placeholder:text-muted-foreground disabled:cursor-not-allowed',
          noOutlineClasses,
          prefix && 'pl-1.5',
          suffix && 'pr-1.5',
          className,
        )}
        {...props}
      />
      {suffix && (
        <span aria-hidden className="shrink-0 self-center pr-3 text-muted-foreground select-none">
          {suffix}
        </span>
      )}
    </div>
  );
});

export { NumberInput };
