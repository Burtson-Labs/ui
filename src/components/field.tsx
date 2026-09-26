import * as React from 'react';

import { cn } from '../lib/utils';

import { Select, SelectTrigger } from './select';

/*
 * Label, hint, description and error around a control. Two ways in:
 *
 *   <Field label="Name" description="Shown in logs" error={error}>
 *     <Input />
 *   </Field>
 *
 * wires the control's id, aria-describedby, aria-invalid and aria-required
 * for you (one control as the child; `group` for several), or compose the
 * parts yourself: <Field><FieldLabel htmlFor=…/><Input id=…/><FieldError/></Field>.
 */

export interface FieldContextValue {
  /** The control's id (the label points at it). */
  id: string;
  /** Ids of the description and error, for aria-describedby. */
  describedBy?: string;
  invalid: boolean;
  required?: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

/** The enclosing Field's id and aria wiring, for a custom control made of several inputs. */
export const useField = () => React.useContext(FieldContext);

export interface FieldProps extends React.ComponentProps<'div'> {
  /** Sets the recipe: a label above the control. */
  label?: React.ReactNode;
  /** Help under the control. */
  description?: React.ReactNode;
  /** An error under the control; sets aria-invalid on it. */
  error?: React.ReactNode;
  /** Right of the label: a status, a count. `optional` shows "Optional". */
  hint?: React.ReactNode;
  optional?: boolean;
  /** Sets aria-required on the control. (Mark whichever is rarer in the form, optional or required.) */
  required?: boolean;
  /**
   * The child is a group of inputs (a time range), not one control: the label
   * names the group and each input keeps its own aria-label.
   */
  group?: boolean;
  /** Across every column of a FieldGrid. */
  span?: boolean;
}

const wire = (
  el: React.ReactElement<Record<string, unknown>>,
  ctx: FieldContextValue,
): React.ReactElement =>
  React.cloneElement(el, {
    id: el.props.id ?? ctx.id,
    'aria-describedby': el.props['aria-describedby'] ?? ctx.describedBy,
    'aria-invalid': el.props['aria-invalid'] ?? (ctx.invalid || undefined),
    'aria-required': el.props['aria-required'] ?? (ctx.required || undefined),
  });

/** The control the label points at: a kit Select's trigger, else the child itself. */
function wireControl(children: React.ReactNode, ctx: FieldContextValue): React.ReactNode {
  if (!React.isValidElement<Record<string, unknown>>(children)) return children;
  if (children.type === Select)
    return React.cloneElement(children, {
      children: React.Children.map(children.props.children as React.ReactNode, (c) =>
        React.isValidElement<Record<string, unknown>>(c) && c.type === SelectTrigger
          ? wire(c, ctx)
          : c,
      ),
    });
  return wire(children, ctx);
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  {
    label,
    description,
    error,
    hint,
    optional,
    required,
    group,
    span,
    id: idProp,
    className,
    children,
    ...props
  },
  ref,
) {
  const auto = React.useId();
  const recipe = label !== undefined;
  if (!recipe)
    return (
      <div
        ref={ref}
        id={idProp}
        data-slot="field"
        className={cn('grid gap-1.5', span && 'sm:col-span-full', className)}
        {...props}
      >
        {children}
      </div>
    );
  const id = idProp ?? `f${auto.replace(/:/g, '')}`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, descriptionId].filter(Boolean).join(' ') || undefined;
  const ctx: FieldContextValue = { id, describedBy, invalid: Boolean(error), required };
  return (
    <FieldContext.Provider value={ctx}>
      <div
        ref={ref}
        data-slot="field"
        data-invalid={error ? '' : undefined}
        role={group ? 'group' : undefined}
        aria-labelledby={group ? `${id}-label` : undefined}
        aria-describedby={group ? describedBy : undefined}
        className={cn(
          'grid min-w-0 grid-cols-[minmax(0,1fr)] content-start',
          // In a FieldGrid each field spans three rows of the subgrid, so
          // labels, controls and help in one row share their top edges.
          '[[data-slot=field-grid]>&]:row-span-3 [[data-slot=field-grid]>&]:grid-rows-subgrid',
          span && 'sm:col-span-full',
          className,
        )}
        {...props}
      >
        <FieldHeader className="min-h-5 items-end pb-1.5">
          {group ? (
            <span id={`${id}-label`} data-slot="field-label" className={labelClasses}>
              {label}
            </span>
          ) : (
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
          )}
          {(hint || optional) && (
            <FieldHint className="shrink-0 leading-5">{hint ?? 'Optional'}</FieldHint>
          )}
        </FieldHeader>
        <div className="flex min-w-0 items-start">
          {group ? children : wireControl(children, ctx)}
        </div>
        <div className="grid content-start gap-1 pt-1.5 empty:hidden">
          {error && <FieldError id={errorId}>{error}</FieldError>}
          {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
        </div>
      </div>
    </FieldContext.Provider>
  );
});

const labelClasses = 'text-[13px] leading-5 font-semibold text-foreground';

const FieldHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function FieldHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="field-header"
        className={cn('flex items-baseline justify-between gap-3', className)}
        {...props}
      />
    );
  },
);

const FieldLabel = React.forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(
  function FieldLabel({ className, ...props }, ref) {
    return (
      // Callers pass htmlFor (or wrap the control); the rule cannot see through the spread.
      // eslint-disable-next-line jsx-a11y/label-has-associated-control
      <label ref={ref} data-slot="field-label" className={cn(labelClasses, className)} {...props} />
    );
  },
);

const FieldHint = React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(
  function FieldHint({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        data-slot="field-hint"
        className={cn('text-xs text-muted-foreground', className)}
        {...props}
      />
    );
  },
);

const FieldDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(
  function FieldDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        data-slot="field-description"
        className={cn('text-xs leading-5 text-muted-foreground', className)}
        {...props}
      />
    );
  },
);

const FieldError = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(
  function FieldError({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        data-slot="field-error"
        role="alert"
        className={cn('text-xs leading-5 font-medium text-destructive', className)}
        {...props}
      />
    );
  },
);

const gridColumns = {
  1: '',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
} as const;

export interface FieldGridProps extends React.ComponentProps<'div'> {
  /** Columns from 640px up; one column on phones. */
  columns?: keyof typeof gridColumns;
}

/**
 * Fields side by side. Each recipe Field spans three rows of a subgrid
 * (label, control, help), so the controls in a row share a top edge even
 * when one label wraps or one field has help and its neighbour does not.
 */
const FieldGrid = React.forwardRef<HTMLDivElement, FieldGridProps>(function FieldGrid(
  { columns = 2, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="field-grid"
      className={cn(
        // Rows are spaced by each child's bottom margin, so a field's label,
        // control and help sit in rows of their own with no gap between them.
        '-mb-5 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-0 [&>*]:mb-5',
        gridColumns[columns],
        className,
      )}
      {...props}
    />
  );
});

export interface FieldSetProps extends React.ComponentProps<'fieldset'> {
  /** The group's name, as its legend. */
  legend?: React.ReactNode;
  description?: React.ReactNode;
  /** Beside the legend, right-aligned: a count, a small button. */
  action?: React.ReactNode;
}

/**
 * A titled group of fields. Sets stack with a rule between them; `disabled`
 * greys and locks everything inside. The legend names the fieldset through
 * aria-labelledby, so it can sit in a row with the action.
 */
const FieldSet = React.forwardRef<HTMLFieldSetElement, FieldSetProps>(function FieldSet(
  { legend, description, action, className, children, ...props },
  ref,
) {
  const id = React.useId();
  return (
    <fieldset
      ref={ref}
      data-slot="field-set"
      aria-labelledby={legend ? `${id}-legend` : undefined}
      aria-describedby={description ? `${id}-description` : undefined}
      className={cn(
        'grid min-w-0 gap-4 border-border [&+&]:border-t [&+&]:pt-5 disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {(legend || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            {legend && (
              <div
                id={`${id}-legend`}
                data-slot="field-set-legend"
                className="text-sm leading-5 font-semibold"
              >
                {legend}
              </div>
            )}
            {description && (
              <p id={`${id}-description`} className="text-[13px] leading-5 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </fieldset>
  );
});

export {
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldHeader,
  FieldHint,
  FieldLabel,
  FieldSet,
};
