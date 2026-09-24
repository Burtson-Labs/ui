import * as React from 'react';

import { cn } from '../lib/utils';

function Field({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field" className={cn('grid gap-1.5', className)} {...props} />;
}

function FieldHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-header"
      className={cn('flex items-baseline justify-between gap-3', className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // Callers pass htmlFor (or wrap the control); the rule cannot see through the spread.
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      data-slot="field-label"
      className={cn('text-[13px] font-semibold text-foreground', className)}
      {...props}
    />
  );
}

function FieldHint({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="field-hint"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-xs leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn('text-xs font-medium text-destructive', className)}
      {...props}
    />
  );
}

export { Field, FieldDescription, FieldError, FieldHeader, FieldHint, FieldLabel };
