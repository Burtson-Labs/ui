import * as React from 'react';

import { cn } from '../lib/utils';

const Kbd = React.forwardRef<HTMLElement, React.ComponentProps<'kbd'>>(function Kbd(
  { className, ...props },
  ref,
) {
  return (
    <kbd
      ref={ref}
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-5 min-w-5 items-center justify-center gap-1 rounded-xs border border-border-strong border-b-2 bg-surface-muted px-1 font-mono text-[11px] font-medium text-muted-foreground select-none [&_svg]:size-3',
        className,
      )}
      {...props}
    />
  );
});

const KbdGroup = React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(function KbdGroup(
  { className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      data-slot="kbd-group"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    />
  );
});

export { Kbd, KbdGroup };
