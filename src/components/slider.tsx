import * as React from 'react';

import { cn } from '../lib/utils';

export interface SliderProps extends Omit<
  React.ComponentProps<'input'>,
  'type' | 'value' | 'onChange'
> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * A single-value range slider on the native input, so keyboard, touch and
 * screen readers work without extra code. Pass `aria-valuetext` when the raw
 * number isn't meaningful ("45% change").
 */
function Slider({
  className,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  style,
  ...props
}: SliderProps) {
  const percent = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  return (
    <input
      type="range"
      data-slot="slider"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onValueChange(Number(event.target.value))}
      style={{ ...style, ['--bl-slider-fill' as string]: `${percent}%` }}
      className={cn(
        'h-5 w-full min-w-0 cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-60',
        // Track: brand up to the thumb, muted after it.
        '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full',
        '[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--color-brand)_var(--bl-slider-fill),var(--color-muted)_var(--bl-slider-fill))]',
        '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted',
        '[&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-brand',
        '[&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm',
        '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-background',
        'focus-visible:[&::-webkit-slider-thumb]:ring-[3px] focus-visible:[&::-webkit-slider-thumb]:ring-ring/30',
        'focus-visible:[&::-moz-range-thumb]:ring-[3px] focus-visible:[&::-moz-range-thumb]:ring-ring/30',
        className,
      )}
      {...props}
    />
  );
}

export { Slider };
