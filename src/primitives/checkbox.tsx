import * as React from 'react';

import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { FormProxy, useInForm } from './form-proxy';
import { usePresence } from './presence';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';

/**
 * A checkbox, per the ARIA checkbox pattern: a `button` with
 * `role="checkbox"` and `aria-checked` (`"mixed"` when indeterminate).
 * Space toggles it (the button's own activation); Enter does not, as the
 * pattern specifies. A label pointing at it, or wrapping it, toggles it
 * through the browser's label activation. In a form it submits, validates
 * and resets through a native proxy input (see `form-proxy`).
 */

export type CheckedState = boolean | 'indeterminate';

const stateOf = (checked: CheckedState) =>
  checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked';

interface CheckboxContextValue {
  checked: CheckedState;
  disabled: boolean;
}

const CheckboxContext = React.createContext<CheckboxContextValue | null>(null);

export interface CheckboxProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'checked' | 'defaultChecked'
> {
  asChild?: boolean;
  checked?: CheckedState;
  defaultChecked?: CheckedState;
  required?: boolean;
  onCheckedChange?: (checked: CheckedState) => void;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  {
    asChild = false,
    checked: checkedProp,
    defaultChecked = false,
    onCheckedChange,
    required = false,
    disabled = false,
    name,
    value = 'on',
    form,
    onClick,
    onKeyDown,
    children,
    ...props
  },
  forwardedRef,
) {
  const nodeRef = React.useRef<HTMLButtonElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  const [checked, setChecked] = useControllableState<CheckedState>({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const [initial] = React.useState(checked);
  const inForm = useInForm(nodeRef, form);
  const context = React.useMemo(() => ({ checked, disabled }), [checked, disabled]);
  const Comp = asChild ? Slot : 'button';
  return (
    <CheckboxContext.Provider value={context}>
      <Comp
        type={asChild ? undefined : 'button'}
        role="checkbox"
        aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
        aria-required={required || undefined}
        data-state={stateOf(checked)}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        value={value}
        {...props}
        ref={ref}
        onKeyDown={composeHandlers(onKeyDown, (event: React.KeyboardEvent<HTMLButtonElement>) => {
          if (event.key === 'Enter') event.preventDefault();
        })}
        onClick={composeHandlers(onClick, () => {
          if (!disabled) setChecked((current) => (current === 'indeterminate' ? true : !current));
        })}
      >
        {children}
      </Comp>
      {inForm && (
        <FormProxy
          type="checkbox"
          controlRef={nodeRef}
          checked={checked === true}
          indeterminate={checked === 'indeterminate'}
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          form={form}
          onReset={() => setChecked(initial)}
        />
      )}
    </CheckboxContext.Provider>
  );
});

export interface CheckboxIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  /** Keep it in the DOM while unchecked (for a custom animation). */
  forceMount?: true;
}

/** Rendered while checked or indeterminate; carries the same `data-state`. */
const CheckboxIndicator = React.forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  function CheckboxIndicator({ asChild = false, forceMount, ...props }, forwardedRef) {
    const context = React.useContext(CheckboxContext);
    if (!context) throw new Error('CheckboxIndicator must be inside a Checkbox');
    const nodeRef = React.useRef<HTMLSpanElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    const mounted = usePresence(context.checked !== false, nodeRef);
    if (!mounted && !forceMount) return null;
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp
        data-state={stateOf(context.checked)}
        data-disabled={context.disabled ? '' : undefined}
        {...props}
        ref={ref}
        // A press on the mark is a press on the box.
        style={{ pointerEvents: 'none', ...props.style }}
      />
    );
  },
);

export { Checkbox, CheckboxIndicator, CheckboxIndicator as Indicator, Checkbox as Root };
