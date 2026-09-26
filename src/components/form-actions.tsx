import * as React from 'react';

import { cn } from '../lib/utils';

export interface FormActionsProps extends React.ComponentProps<'div'> {
  /** Cancel, Back or Delete: left-aligned on wide screens, first in the row on phones. */
  start?: React.ReactNode;
  /**
   * On phones the row is pinned to the bottom of the screen, above the home
   * indicator, while the form scrolls under it. For a page's own form, not
   * one inside a card or a dialog.
   */
  sticky?: boolean;
}

/**
 * A form's buttons. Wide screens: right-aligned, the primary last, with
 * `start` on the left. Phones: one row, the buttons sharing the width and
 * the primary (the last one) taking twice the share.
 */
const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(function FormActions(
  { start, sticky, className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="form-actions"
      data-sticky={sticky || undefined}
      className={cn(
        'flex items-center gap-2',
        // Phone: the two groups dissolve into one row; the primary is widest.
        'max-sm:*:contents max-sm:**:data-[slot=button]:min-w-0 max-sm:**:data-[slot=button]:flex-1',
        'max-sm:[&>div:last-child>[data-slot=button]:last-child]:flex-[2]',
        sticky &&
          'max-sm:sticky max-sm:bottom-0 max-sm:z-20 max-sm:-mx-4 max-sm:border-t max-sm:border-border max-sm:bg-background/95 max-sm:px-4 max-sm:pt-3 max-sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] max-sm:backdrop-blur-md',
        className,
      )}
      {...props}
    >
      {start && <div className="mr-auto flex items-center gap-2">{start}</div>}
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  );
});

export { FormActions };
