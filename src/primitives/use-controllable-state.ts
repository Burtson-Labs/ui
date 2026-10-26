import * as React from 'react';

import { useCallbackRef } from './use-callback-ref';

export interface ControllableStateOptions<T> {
  /** The controlled value; `undefined` means uncontrolled. */
  value?: T;
  /** The initial value when uncontrolled. */
  defaultValue: T;
  /** Called whenever the component wants the value to change, in both modes. */
  onChange?: (value: T) => void;
}

/**
 * The `value` / `defaultValue` / `onChange` triple every open, checked and
 * selected prop pair follows. Uncontrolled: the hook owns the state.
 * Controlled: the parent owns it and only hears about requested changes.
 * `onChange` fires synchronously from the setter (not from an effect), so a
 * controlled parent updates in the same event, and never fires when nothing
 * changed or when the parent changes the value itself.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: ControllableStateOptions<T>): [T, (next: T | ((previous: T) => T)) => void] {
  const [internal, setInternal] = React.useState(defaultValue);
  // Mirrors the uncontrolled state so two calls in one event build on each
  // other; the controlled value is read from the latest render, so a parent
  // that declined a change is asked again next time.
  const mirror = React.useRef(internal);
  const controlled = value !== undefined;
  const set = useCallbackRef((next: T | ((previous: T) => T)) => {
    const base = controlled ? value : mirror.current;
    const resolved = typeof next === 'function' ? (next as (previous: T) => T)(base) : next;
    if (Object.is(resolved, base)) return;
    if (!controlled) {
      mirror.current = resolved;
      setInternal(resolved);
    }
    onChange?.(resolved);
  });
  return [controlled ? value : internal, set];
}
