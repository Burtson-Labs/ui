import * as React from 'react';

import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { FormProxy, useInForm } from './form-proxy';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';

/**
 * A switch, per the ARIA switch pattern: a `button` with `role="switch"` and
 * `aria-checked`, toggled by a press, Space or Enter (the button's own
 * activation). In a form it submits, validates and resets like a checkbox,
 * through a native proxy input (see `form-proxy`).
 */

interface SwitchContextValue {
  checked: boolean;
  disabled: boolean;
}

const SwitchContext = React.createContext<SwitchContextValue | null>(null);

export interface SwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'checked' | 'defaultChecked'
> {
  asChild?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  required?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
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
    children,
    ...props
  },
  forwardedRef,
) {
  const nodeRef = React.useRef<HTMLButtonElement | null>(null);
  const ref = useComposedRefs(forwardedRef, nodeRef);
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });
  const [initial] = React.useState(checked);
  const inForm = useInForm(nodeRef, form);
  const context = React.useMemo(() => ({ checked, disabled }), [checked, disabled]);
  const state = checked ? 'checked' : 'unchecked';
  const Comp = asChild ? Slot : 'button';
  return (
    <SwitchContext.Provider value={context}>
      <Comp
        type={asChild ? undefined : 'button'}
        role="switch"
        aria-checked={checked}
        aria-required={required || undefined}
        data-state={state}
        data-disabled={disabled ? '' : undefined}
        disabled={disabled}
        value={value}
        {...props}
        ref={ref}
        onClick={composeHandlers(onClick, () => {
          if (!disabled) setChecked((current) => !current);
        })}
      >
        {children}
      </Comp>
      {inForm && (
        <FormProxy
          type="checkbox"
          controlRef={nodeRef}
          checked={checked}
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          form={form}
          onReset={() => setChecked(initial)}
        />
      )}
    </SwitchContext.Provider>
  );
});

export interface SwitchThumbProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

/** The moving part; carries the switch's `data-state` for the slide. */
const SwitchThumb = React.forwardRef<HTMLSpanElement, SwitchThumbProps>(function SwitchThumb(
  { asChild = false, ...props },
  ref,
) {
  const context = React.useContext(SwitchContext);
  if (!context) throw new Error('SwitchThumb must be inside a Switch');
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      data-state={context.checked ? 'checked' : 'unchecked'}
      data-disabled={context.disabled ? '' : undefined}
      {...props}
      ref={ref}
    />
  );
});

export { Switch as Root, Switch, SwitchThumb, SwitchThumb as Thumb };
