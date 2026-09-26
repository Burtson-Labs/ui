import * as React from 'react';

import { cn, focusRingClasses, touchTargetClasses } from '../lib/utils';
import * as SwitchPrimitive from '../primitives/vendor/radix/react-switch';

/**
 * A 36×20 toggle with a 44px hit area on touch screens; the off track is the
 * field border tone (`input`, 3:1 on the page), the on track primary in light
 * mode and brand in dark mode (see Checkbox), focus the shared 2px outline.
 */
const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input data-[state=unchecked]:hover:bg-muted-foreground/70 dark:data-[state=checked]:bg-brand',
        focusRingClasses,
        touchTargetClasses,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-1px)] data-[state=unchecked]:translate-x-px dark:data-[state=checked]:bg-background dark:data-[state=unchecked]:bg-foreground/80"
      />
    </SwitchPrimitive.Root>
  );
});

export interface SwitchRowProps extends Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  'children'
> {
  /** The setting's name. */
  label: React.ReactNode;
  /** What it does, under the name. */
  description?: React.ReactNode;
  /** Beside the label: a Badge such as "Always on". */
  badge?: React.ReactNode;
  /** Padding for a row in a SwitchList. */
  inset?: boolean;
  /** A control that belongs to the switch (a minutes field for "Alert when late"), beside it on wide screens and under the label on phones. */
  before?: React.ReactNode;
  /** Extra classes for the row; className goes to the switch. */
  rowClassName?: string;
  /** Extra lines under the description. */
  children?: React.ReactNode;
}

/**
 * A setting that is on or off: what it is (and what it does) on the left,
 * the switch on the right, level with the first line of the label. Several
 * of them stack in a SwitchList.
 */
const SwitchRow = React.forwardRef<HTMLButtonElement, SwitchRowProps>(function SwitchRow(
  {
    label,
    description,
    badge,
    inset,
    before,
    id: idProp,
    className,
    rowClassName,
    children,
    ...props
  },
  ref,
) {
  const auto = React.useId();
  const id = idProp ?? auto;
  return (
    <div
      data-slot="switch-row"
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4',
        before && 'gap-y-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]',
        inset && 'px-4 py-3.5 sm:px-5 sm:py-4',
        rowClassName,
      )}
    >
      <div className="grid min-w-0 gap-1">
        <label
          htmlFor={id}
          className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5 font-medium"
        >
          {label}
          {badge}
        </label>
        {description && (
          <p id={`${id}-description`} className="text-[13px] leading-5 text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
      {before && (
        <div className="col-start-1 row-start-2 flex items-center sm:col-start-2 sm:row-start-1 sm:-my-2">
          {before}
        </div>
      )}
      <Switch
        ref={ref}
        id={id}
        aria-describedby={description ? `${id}-description` : undefined}
        className={cn('col-start-2 row-start-1', before && 'sm:col-start-3', className)}
        {...props}
      />
    </div>
  );
});

export interface SwitchListProps extends React.ComponentProps<'div'> {
  /** A rounded border around the list, for a list that is not already in a Card. */
  bordered?: boolean;
}

/** SwitchRows (with `inset`) divided by rules, in a Card or a bordered box. */
const SwitchList = React.forwardRef<HTMLDivElement, SwitchListProps>(function SwitchList(
  { bordered, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="switch-list"
      className={cn('grid divide-y divide-border', bordered && 'rounded-lg border', className)}
      {...props}
    />
  );
});

export interface InlineSwitchProps extends Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  'children'
> {
  label: React.ReactNode;
  /** Extra classes for the label; className goes to the switch. */
  rowClassName?: string;
}

/**
 * A filter that is on or off, in a row of filters: the switch first, its
 * label after it, at least 44px tall on touch screens. (Settings put the
 * switch on the right: SwitchRow.)
 */
const InlineSwitch = React.forwardRef<HTMLButtonElement, InlineSwitchProps>(function InlineSwitch(
  { label, id: idProp, className, rowClassName, ...props },
  ref,
) {
  const auto = React.useId();
  const id = idProp ?? auto;
  return (
    <label
      htmlFor={id}
      data-slot="inline-switch"
      className={cn(
        'flex min-h-5 cursor-pointer items-center gap-2.5 text-sm leading-5 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 pointer-coarse:min-h-11',
        rowClassName,
      )}
    >
      <Switch ref={ref} id={id} className={className} {...props} />
      {label}
    </label>
  );
});

export { InlineSwitch, Switch, SwitchList, SwitchRow };
