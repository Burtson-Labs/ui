import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn, focusRingClasses, touchTargetRowClasses } from '../lib/utils';
import * as Slot from '../primitives/vendor/radix/react-slot';

const badgeVariants = cva(
  `inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4 whitespace-nowrap transition-colors ${focusRingClasses} [&>svg]:size-3`,
  {
    variants: {
      variant: {
        default: 'border-border bg-surface-muted text-foreground',
        // 0.x name for the neutral tag; kept so existing apps keep compiling.
        secondary: 'border-border bg-surface-muted text-foreground',
        brand: 'border-brand/20 bg-brand-soft text-brand-soft-foreground',
        // Status text is the tone mixed a quarter toward the foreground: the
        // plain tone reads at 4.3–4.5:1 on its own tint, the mixed one at 6:1
        // (4.5:1 inside a terminal Card). Mixing toward the foreground darkens
        // it in light mode and lightens it in dark mode and in a terminal Card,
        // which re-points --foreground.
        success:
          'border-success/20 bg-success/10 text-[color-mix(in_srgb,var(--success)_75%,var(--foreground))]',
        warning:
          'border-warning/20 bg-warning/10 text-[color-mix(in_srgb,var(--warning)_75%,var(--foreground))]',
        destructive:
          'border-destructive/20 bg-destructive/10 text-[color-mix(in_srgb,var(--destructive)_75%,var(--foreground))]',
        info: 'border-info/20 bg-info/10 text-[color-mix(in_srgb,var(--info)_75%,var(--foreground))]',
        outline: 'border-border-strong bg-transparent text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : 'span';
  return (
    <Comp
      ref={ref}
      data-slot="badge"
      data-variant={variant ?? 'default'}
      // A badge that is a link or button (asChild) gets a 44px hit area on touch screens.
      className={cn(badgeVariants({ variant }), asChild && touchTargetRowClasses, className)}
      {...props}
    />
  );
});

export { Badge, badgeVariants };
