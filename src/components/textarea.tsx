import * as React from 'react';

import { cn } from '../lib/utils';

import { fieldClasses } from './input';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  function Textarea({ className, ...props }: React.ComponentProps<'textarea'>, ref) {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(fieldClasses, 'min-h-24 resize-y py-2.5 leading-5', className)}
        {...props}
      />
    );
  },
);

export { Textarea };
