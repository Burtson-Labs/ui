import * as React from 'react';

import { Slot } from './slot';

/**
 * A native `<label>`. The browser's label activation does the work: a press
 * on it activates (and, for a text field, focuses) the control it names
 * with `htmlFor` or wraps. The one addition: a double press on the caption
 * does not select its text, which a quick double toggle of a checkbox
 * would otherwise do. Presses on a control inside the label are left alone.
 */

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
}

const CONTROLS = 'button, input, select, textarea, [contenteditable]';

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { asChild = false, onMouseDown, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'label';
  return (
    <Comp
      {...props}
      ref={ref}
      onMouseDown={(event: React.MouseEvent<HTMLLabelElement>) => {
        onMouseDown?.(event);
        const target = event.target;
        if (target instanceof Element && target.closest(CONTROLS)) return;
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }}
    />
  );
});

export { Label, Label as Root };
