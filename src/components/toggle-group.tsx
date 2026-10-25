import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

import { toggleVariants } from './toggle';

type ToggleVariants = VariantProps<typeof toggleVariants>;

interface ToggleGroupContextValue extends ToggleVariants {
  type: 'single' | 'multiple';
  values: string[];
  toggle: (value: string) => void;
  disabled: boolean;
  active: string | null;
  setActive: (value: string) => void;
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null);

interface ToggleGroupSharedProps
  extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange' | 'dir'>, ToggleVariants {
  /** Disables every item. */
  disabled?: boolean;
  /** Which arrow keys move between items. One choice (radio) mode accepts all four. */
  orientation?: 'horizontal' | 'vertical';
  /** Arrow keys wrap from the last item to the first. */
  loop?: boolean;
}

export interface ToggleGroupSingleProps extends ToggleGroupSharedProps {
  /** One choice: a radio group (alignment, view mode). Arrow keys move and choose. */
  type: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export interface ToggleGroupMultipleProps extends ToggleGroupSharedProps {
  /** Any number on: a set of toggles (bold, italic, underline). Arrow keys move; Space toggles. */
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

const ITEM = '[data-slot=toggle-group-item]';

/**
 * A row of toggles that is one Tab stop: arrow keys move between items
 * (Home and End jump to the ends), as in a toolbar. `type="single"` is a
 * radio group: role="radiogroup", each item role="radio" with aria-checked,
 * and arrows choose as they move; once chosen, a value cannot be cleared by
 * clicking it again. `type="multiple"` is a group of aria-pressed buttons.
 * Name the group with aria-label or aria-labelledby.
 */
const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(props, ref) {
    const {
      type,
      value: valueProp,
      defaultValue,
      onValueChange,
      disabled = false,
      orientation = 'horizontal',
      loop = true,
      variant,
      size,
      className,
      onKeyDown,
      children,
      ...rest
    } = props;
    const toList = (v: string | string[] | undefined): string[] =>
      v === undefined ? [] : Array.isArray(v) ? v : v === '' ? [] : [v];
    const [uncontrolled, setUncontrolled] = React.useState<string[]>(() => toList(defaultValue));
    const values = valueProp !== undefined ? toList(valueProp) : uncontrolled;
    const [active, setActive] = React.useState<string | null>(values[0] ?? null);
    const groupRef = React.useRef<HTMLDivElement | null>(null);

    const commit = (next: string[]) => {
      if (valueProp === undefined) setUncontrolled(next);
      if (type === 'single') onValueChange?.(next[0] ?? '');
      else onValueChange?.(next);
    };
    const select = (value: string) => {
      if (values.length === 1 && values[0] === value) return;
      commit([value]);
    };
    const toggle = (value: string) => {
      if (type === 'single') select(value);
      else commit(values.includes(value) ? values.filter((v) => v !== value) : [...values, value]);
    };

    const items = () =>
      [...(groupRef.current?.querySelectorAll<HTMLButtonElement>(ITEM) ?? [])].filter(
        (el) => el.closest('[data-slot=toggle-group]') === groupRef.current && !el.disabled,
      );

    // Keep exactly one enabled item in the Tab order: the last focused, else
    // the chosen one, else the first.
    React.useEffect(() => {
      const enabled = items();
      if (enabled.some((el) => el.tabIndex === 0)) return;
      const chosen = enabled.find((el) => values.includes(el.dataset.value ?? ''));
      const next = (chosen ?? enabled[0])?.dataset.value ?? null;
      if (next !== active) setActive(next);
      // Items mount, unmount and disable with the children.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, values.join('\u0000'), disabled, children]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const enabled = items();
      const current = enabled.indexOf(event.target as HTMLButtonElement);
      if (current === -1) return;
      const rtl =
        typeof window !== 'undefined' &&
        groupRef.current !== null &&
        getComputedStyle(groupRef.current).direction === 'rtl';
      const horizontal = orientation === 'horizontal' || type === 'single';
      const vertical = orientation === 'vertical' || type === 'single';
      let next: number | null = null;
      if (horizontal && event.key === 'ArrowRight') next = current + (rtl ? -1 : 1);
      else if (horizontal && event.key === 'ArrowLeft') next = current + (rtl ? 1 : -1);
      else if (vertical && event.key === 'ArrowDown') next = current + 1;
      else if (vertical && event.key === 'ArrowUp') next = current - 1;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = enabled.length - 1;
      if (next === null) return;
      event.preventDefault();
      if (loop) next = (next + enabled.length) % enabled.length;
      else next = Math.max(0, Math.min(enabled.length - 1, next));
      const target = enabled[next];
      if (!target) return;
      target.focus();
      if (type === 'single' && target.dataset.value) select(target.dataset.value);
    };

    return (
      <ToggleGroupContext.Provider
        value={{
          type,
          values,
          toggle,
          disabled,
          active,
          setActive,
          variant,
          size,
        }}
      >
        <div
          ref={(node) => {
            groupRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          data-slot="toggle-group"
          data-orientation={orientation}
          role={type === 'single' ? 'radiogroup' : 'group'}
          aria-orientation={type === 'single' ? undefined : orientation}
          aria-disabled={disabled || undefined}
          className={cn(
            'inline-flex w-fit items-center gap-1',
            orientation === 'vertical' && 'flex-col items-stretch',
            className,
          )}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {children}
        </div>
      </ToggleGroupContext.Provider>
    );
  },
);

export interface ToggleGroupItemProps
  extends Omit<React.ComponentProps<'button'>, 'value'>, ToggleVariants {
  /** This item's value in the group's value. */
  value: string;
}

/** One toggle in a ToggleGroup; takes the group's variant and size unless it sets its own. */
const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  function ToggleGroupItem(
    { value, variant, size, className, disabled, onClick, onFocus, type, ...props },
    ref,
  ) {
    const ctx = React.useContext(ToggleGroupContext);
    if (!ctx) throw new Error('ToggleGroupItem must be used inside a ToggleGroup');
    const on = ctx.values.includes(value);
    const isDisabled = ctx.disabled || disabled;
    const single = ctx.type === 'single';
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        data-slot="toggle-group-item"
        data-value={value}
        data-state={on ? 'on' : 'off'}
        role={single ? 'radio' : undefined}
        aria-checked={single ? on : undefined}
        aria-pressed={single ? undefined : on}
        disabled={isDisabled}
        tabIndex={ctx.active === value ? 0 : -1}
        className={cn(
          toggleVariants({ variant: variant ?? ctx.variant, size: size ?? ctx.size }),
          className,
        )}
        onFocus={(event) => {
          onFocus?.(event);
          ctx.setActive(value);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || isDisabled) return;
          ctx.toggle(value);
        }}
        {...props}
      />
    );
  },
);

export { ToggleGroup, ToggleGroupItem };
