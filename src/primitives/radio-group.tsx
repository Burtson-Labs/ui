import * as React from 'react';

import { composeHandlers } from './compose-handlers';
import { useComposedRefs } from './compose-refs';
import { FormProxy, useInForm } from './form-proxy';
import { usePresence } from './presence';
import { RovingFocusGroup, RovingFocusItem } from './roving-focus';
import { Slot } from './slot';
import { useControllableState } from './use-controllable-state';
import { useStableId } from './use-id';
import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * A radio group, per the ARIA radio group pattern: `role="radiogroup"`
 * around `button`s with `role="radio"`. The group is one Tab stop (the
 * chosen radio, else the first); the arrow keys move focus to the next or
 * previous radio and choose it, wrapping when `loop` is on (the default).
 * Space chooses the focused radio; Enter does nothing, as the pattern
 * specifies. In a form every radio submits, validates and resets through a
 * native radio input sharing the group's `name` (see `form-proxy`).
 */

interface RadioGroupContextValue {
  value: string | null;
  select: (value: string) => void;
  reset: () => void;
  name?: string;
  form?: string;
  required: boolean;
  disabled: boolean;
  register: (node: HTMLElement, value: string) => () => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroup(component: string): RadioGroupContextValue {
  const context = React.useContext(RadioGroupContext);
  if (!context) throw new Error(`${component} must be inside a RadioGroup`);
  return context;
}

export interface RadioGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'dir'
> {
  asChild?: boolean;
  /** The field name the chosen value is submitted under. */
  name?: string;
  /** The id of a form the radios belong to, when they are not inside it. */
  form?: string;
  /** A form cannot be submitted until one is chosen. */
  required?: boolean;
  /** Every radio is disabled. */
  disabled?: boolean;
  /** Reading direction for Left/Right; the computed direction when unset. */
  dir?: 'ltr' | 'rtl';
  /** Limits the arrow keys to Left/Right or Up/Down; both when unset. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Arrow keys wrap from the last radio to the first.
   * @default true
   */
  loop?: boolean;
  /** The value chosen at first, when uncontrolled. */
  defaultValue?: string;
  /** The chosen value; `null` controls the group with nothing chosen. */
  value?: string | null;
  /** Called with the value the person chooses. */
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  {
    asChild = false,
    name,
    form,
    required = false,
    disabled = false,
    dir,
    orientation,
    loop = true,
    defaultValue,
    value: valueProp,
    onValueChange,
    onKeyDown,
    ...props
  },
  ref,
) {
  const [value, setValue] = useControllableState<string | null>({
    value: valueProp,
    defaultValue: defaultValue ?? null,
    onChange: (next) => {
      if (next !== null) onValueChange?.(next);
    },
  });
  const [initial] = React.useState(value);
  // Without a name the native radios would each be a group of their own,
  // and `required` would demand every one of them; a generated name keeps
  // them together (it is only submitted when one is chosen).
  const generatedName = useStableId(undefined, 'bl-radio');
  const items = React.useRef(new Map<HTMLElement, string>());
  const context = React.useMemo<RadioGroupContextValue>(
    () => ({
      value,
      select: (next) => setValue(next),
      reset: () => setValue(initial),
      name: name ?? (required ? generatedName : undefined),
      form,
      required,
      disabled,
      register: (node, itemValue) => {
        items.current.set(node, itemValue);
        return () => {
          items.current.delete(node);
        };
      },
    }),
    [value, setValue, initial, name, required, generatedName, form, disabled],
  );
  const Comp = asChild ? Slot : 'div';
  return (
    <RadioGroupContext.Provider value={context}>
      <RovingFocusGroup
        asChild
        dir={dir}
        orientation={orientation}
        loop={loop}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          onKeyDown?.(event);
          // The radio's roving handler has already moved focus (and
          // prevented the key); the radio that received it is chosen.
          if (!event.defaultPrevented || !event.key.startsWith('Arrow')) return;
          const focused = document.activeElement;
          if (!(focused instanceof HTMLElement) || focused === event.target) return;
          const next = items.current.get(focused);
          if (next !== undefined) setValue(next);
        }}
      >
        <Comp
          role="radiogroup"
          aria-required={required || undefined}
          aria-orientation={orientation}
          data-disabled={disabled ? '' : undefined}
          dir={dir}
          {...props}
          ref={ref}
        />
      </RovingFocusGroup>
    </RadioGroupContext.Provider>
  );
});

interface RadioItemContextValue {
  checked: boolean;
  disabled: boolean;
}

const RadioItemContext = React.createContext<RadioItemContextValue | null>(null);

export interface RadioGroupItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'value'
> {
  asChild?: boolean;
  value: string;
  /** Accepted for compatibility; the group's value decides. */
  checked?: boolean;
  /** Marks this radio's native input required (the group's `required` covers all). */
  required?: boolean;
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  function RadioGroupItem(
    {
      asChild = false,
      value,
      checked: _checked,
      required = false,
      disabled: disabledProp = false,
      onClick,
      onKeyDown,
      children,
      ...props
    },
    forwardedRef,
  ) {
    const group = useRadioGroup('RadioGroupItem');
    const nodeRef = React.useRef<HTMLButtonElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    const disabled = group.disabled || disabledProp;
    const checked = group.value === value;
    const inForm = useInForm(nodeRef, group.form);
    const { register } = group;
    useIsoLayoutEffect(() => {
      const node = nodeRef.current;
      if (!node) return;
      return register(node, value);
    }, [register, value]);
    const itemContext = React.useMemo(() => ({ checked, disabled }), [checked, disabled]);
    const Comp = asChild ? Slot : 'button';
    return (
      <RadioItemContext.Provider value={itemContext}>
        <RovingFocusItem asChild focusable={!disabled} active={checked}>
          <Comp
            type={asChild ? undefined : 'button'}
            role="radio"
            aria-checked={checked}
            data-state={checked ? 'checked' : 'unchecked'}
            data-disabled={disabled ? '' : undefined}
            disabled={disabled}
            value={value}
            {...props}
            ref={ref}
            onKeyDown={composeHandlers(
              onKeyDown,
              (event: React.KeyboardEvent<HTMLButtonElement>) => {
                if (event.key === 'Enter') event.preventDefault();
              },
            )}
            onClick={composeHandlers(onClick, () => {
              if (!disabled) group.select(value);
            })}
          >
            {children}
          </Comp>
        </RovingFocusItem>
        {inForm && (
          <FormProxy
            type="radio"
            controlRef={nodeRef}
            checked={checked}
            name={group.name}
            value={value}
            required={group.required || required}
            disabled={disabled}
            form={group.form}
            onReset={group.reset}
          />
        )}
      </RadioItemContext.Provider>
    );
  },
);

export interface RadioGroupIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
  /** Keep it in the DOM while the radio is not chosen. */
  forceMount?: true;
}

/** Rendered while its radio is chosen. */
const RadioGroupIndicator = React.forwardRef<HTMLSpanElement, RadioGroupIndicatorProps>(
  function RadioGroupIndicator({ asChild = false, forceMount, ...props }, forwardedRef) {
    const item = React.useContext(RadioItemContext);
    if (!item) throw new Error('RadioGroupIndicator must be inside a RadioGroupItem');
    const nodeRef = React.useRef<HTMLSpanElement | null>(null);
    const ref = useComposedRefs(forwardedRef, nodeRef);
    const mounted = usePresence(item.checked, nodeRef);
    if (!mounted && !forceMount) return null;
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp
        data-state={item.checked ? 'checked' : 'unchecked'}
        data-disabled={item.disabled ? '' : undefined}
        {...props}
        ref={ref}
      />
    );
  },
);

export {
  RadioGroupIndicator as Indicator,
  RadioGroupItem as Item,
  RadioGroup,
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroup as Root,
};
