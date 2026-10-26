import * as React from 'react';

import { useCallbackRef } from './use-callback-ref';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * Checkbox, Switch and RadioGroup render a `button` with an ARIA role, which
 * a form neither submits nor validates. When the control sits in a form (or
 * names one with `form`), a native `<input>` is rendered next to it that
 * carries its `name`, `value`, checked state, `required` and `disabled`:
 *
 * - `FormData` and a plain submit include it like any checkbox or radio;
 * - the form's constraint validation sees `required`, and the browser's
 *   "please tick this box" bubble appears beside the control; focus that the
 *   browser sends to the invalid input is passed on to the control;
 * - a form `reset` restores the control to the value it started with
 *   (`onReset`), as it does for the native inputs;
 * - a change dispatches `input` and `change` on the native input, which
 *   bubble, so a form listening for `change` hears about it.
 *
 * The input is hidden from assistive technology and pointer events, out of
 * the Tab sequence, and 1px in size so it never affects layout.
 */

/** Whether `control` is in a form: an ancestor `<form>`, or a `form` id. */
export function useInForm(
  controlRef: React.RefObject<HTMLElement | null>,
  form: string | undefined,
): boolean {
  const [inForm, setInForm] = React.useState(false);
  useIsoLayoutEffect(() => {
    setInForm(form !== undefined || Boolean(controlRef.current?.closest('form')));
  }, [form, controlRef]);
  return inForm;
}

export interface FormProxyProps {
  type: 'checkbox' | 'radio';
  /** The visible control; focus sent to the native input moves here. */
  controlRef: React.RefObject<HTMLElement | null>;
  checked: boolean;
  indeterminate?: boolean;
  name?: string;
  value?: string | number | readonly string[];
  required?: boolean;
  disabled?: boolean;
  form?: string;
  /** The owning form was reset. */
  onReset?: () => void;
}

const proxyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  margin: 0,
  padding: 0,
  opacity: 0,
  pointerEvents: 'none',
};

function FormProxy({
  type,
  controlRef,
  checked,
  indeterminate = false,
  name,
  value = 'on',
  required,
  disabled,
  form,
  onReset,
}: FormProxyProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  // The initial state becomes the input's default, so the browser's own
  // reset agrees with the component's.
  const [initial] = React.useState(checked);
  const reset = useCallbackRef(onReset);

  useIsoLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.indeterminate = indeterminate;
    if (input.checked === checked) return;
    input.checked = checked;
    // A radio only reports being chosen, as the native one does.
    if (type === 'radio' && !checked) return;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, [checked, indeterminate, type]);

  React.useEffect(() => {
    const owner = inputRef.current?.form;
    if (!owner) return;
    const onFormReset = () => reset();
    owner.addEventListener('reset', onFormReset);
    return () => owner.removeEventListener('reset', onFormReset);
  }, [reset, form]);

  return (
    <input
      ref={inputRef}
      type={type}
      aria-hidden
      tabIndex={-1}
      name={name}
      value={value}
      defaultChecked={initial}
      required={required}
      disabled={disabled}
      form={form}
      style={proxyStyle}
      data-bl-form-proxy=""
      onFocus={() => controlRef.current?.focus()}
    />
  );
}

export { FormProxy };
