import * as React from 'react';

import { Slot } from './slot';

/**
 * A rule between sections. Semantic by choice: `decorative` (the kit's
 * default) renders `role="none"`, so assistive technology skips it; a
 * semantic separator is `role="separator"` with `aria-orientation` when
 * vertical (horizontal is the role's default). `data-orientation` is set
 * either way for styling.
 */

export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  orientation?: SeparatorOrientation;
  /** Visual only: hidden from assistive technology. */
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { asChild = false, orientation: orientationProp = 'horizontal', decorative = false, ...props },
  ref,
) {
  const orientation: SeparatorOrientation =
    orientationProp === 'vertical' ? 'vertical' : 'horizontal';
  const Comp = asChild ? Slot : 'div';
  return (
    <Comp
      data-orientation={orientation}
      {...(decorative
        ? { role: 'none' }
        : {
            role: 'separator',
            'aria-orientation': orientation === 'vertical' ? orientation : undefined,
          })}
      {...props}
      ref={ref}
    />
  );
});

export { Separator as Root, Separator };
