import * as React from 'react';

import { cn } from '../lib/utils';

import { fieldClasses, type FieldWidth, fieldWidthClasses } from './input';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  /** How wide the field is from 640px up; full width on phones. */
  width?: FieldWidth;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, width, ...props }: TextareaProps,
  ref,
) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        fieldClasses,
        'min-h-24 resize-y py-2.5 leading-5',
        width && fieldWidthClasses[width],
        className,
      )}
      {...props}
    />
  );
});

export { Textarea };
