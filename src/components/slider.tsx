import * as React from 'react';

import { cn } from '../lib/utils';

export interface SliderProps extends Omit<
  React.ComponentProps<'input'>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> {
  /** Controlled value. Leave out for an uncontrolled slider. */
  value?: number;
  /** The starting value when uncontrolled. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * A single-value range slider on the native input, so keyboard, touch and
 * screen readers work without extra code. The track is 6px; the thumb 16px,
 * with the whole 44px-tall input as its target on touch screens. Pass
 * `aria-valuetext` when the raw number isn't meaningful ("45% change").
 */
const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    className,
    value: valueProp,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    style,
    ...props
  },
  ref,
) {
  const [own, setOwn] = React.useState(defaultValue ?? min);
  const value = valueProp ?? own;
  const percent = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  return (
    <input
      ref={ref}
      type="range"
      data-slot="slider"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => {
        const next = Number(event.target.value);
        if (valueProp === undefined) setOwn(next);
        onValueChange?.(next);
      }}
      style={{ ...style, ['--bl-slider-fill' as string]: `${percent}%` }}
      className={cn(
        'h-5 w-full min-w-0 cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-60 pointer-coarse:h-11',
        // Track: brand up to the thumb, the strong border tone after it.
        '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full',
        '[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-brand)_var(--bl-slider-fill),var(--color-border-strong)_var(--bl-slider-fill))]',
        '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-border-strong',
        '[&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-brand',
        '[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm',
        '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-background',
        // Focus: the 2px ring-colour outline, 2px out, drawn as shadows on the
        // thumb (outlines on range thumbs are not reliable across engines).
        'focus-visible:[&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)]',
        'focus-visible:[&::-moz-range-thumb]:shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--ring)]',
        className,
      )}
      {...props}
    />
  );
});

export { Slider };
