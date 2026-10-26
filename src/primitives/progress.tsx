import * as React from 'react';

import { Slot } from './slot';

/**
 * A progress bar, per the ARIA `progressbar` role: `aria-valuemin` 0,
 * `aria-valuemax` the maximum, and `aria-valuenow` with a readable
 * `aria-valuetext` while the value is known. A `null` (or missing, or out of
 * range) value is indeterminate: no `aria-valuenow`, and `data-state`
 * "indeterminate" for the stylesheet. Otherwise `data-state` is "loading",
 * or "complete" at the maximum. A maximum that is not a positive number
 * falls back to 100.
 */

export type ProgressState = 'indeterminate' | 'loading' | 'complete';

const DEFAULT_MAX = 100;

const percentLabel = (value: number, max: number) => `${Math.round((value / max) * 100)}%`;

const validMax = (max: unknown): number =>
  typeof max === 'number' && Number.isFinite(max) && max > 0 ? max : DEFAULT_MAX;

const validValue = (value: unknown, max: number): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max ? value : null;

const stateOf = (value: number | null, max: number): ProgressState =>
  value === null ? 'indeterminate' : value === max ? 'complete' : 'loading';

interface ProgressContextValue {
  value: number | null;
  max: number;
}

const ProgressContext = React.createContext<ProgressContextValue | null>(null);

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  value?: number | null;
  max?: number;
  /** The spoken value; a whole percentage by default. */
  getValueLabel?: (value: number, max: number) => string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    asChild = false,
    value: valueProp = null,
    max: maxProp,
    getValueLabel = percentLabel,
    ...props
  },
  ref,
) {
  const max = validMax(maxProp);
  const value = validValue(valueProp, max);
  const context = React.useMemo(() => ({ value, max }), [value, max]);
  const Comp = asChild ? Slot : 'div';
  return (
    <ProgressContext.Provider value={context}>
      <Comp
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value ?? undefined}
        aria-valuetext={value === null ? undefined : getValueLabel(value, max)}
        data-state={stateOf(value, max)}
        data-value={value ?? undefined}
        data-max={max}
        {...props}
        ref={ref}
      />
    </ProgressContext.Provider>
  );
});

export interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

/** The filled part; carries the bar's `data-state`, `data-value` and `data-max`. */
const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  function ProgressIndicator({ asChild = false, ...props }, ref) {
    const context = React.useContext(ProgressContext);
    if (!context) throw new Error('ProgressIndicator must be inside a Progress');
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        data-state={stateOf(context.value, context.max)}
        data-value={context.value ?? undefined}
        data-max={context.max}
        {...props}
        ref={ref}
      />
    );
  },
);

export { ProgressIndicator as Indicator, Progress, ProgressIndicator, Progress as Root };
