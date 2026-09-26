import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';
import * as Slot from '../primitives/vendor/radix/react-slot';

const buttonVariants = cva(
  `inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform,filter] select-none ${focusRingClasses} pointer-coarse:min-h-11 pointer-coarse:min-w-11 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  {
    variants: {
      variant: {
        default:
          'border border-primary bg-primary text-primary-foreground shadow-xs hover:brightness-90',
        brand:
          'border border-primary bg-primary text-primary-foreground shadow-xs hover:brightness-90',
        soft: 'border border-brand/15 bg-brand-soft text-brand-soft-foreground hover:bg-brand/15',
        secondary:
          'border border-border bg-secondary text-secondary-foreground shadow-xs hover:border-border-strong hover:bg-muted',
        outline:
          'border border-border-strong bg-surface text-foreground shadow-xs hover:border-brand/35 hover:bg-accent/60 hover:text-accent-foreground',
        ghost: 'border border-transparent text-foreground hover:bg-muted',
        destructive:
          'border border-destructive bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
        link: 'h-auto rounded-none border-0 p-0 text-brand shadow-none hover:text-brand-hover hover:underline hover:underline-offset-4 active:translate-y-0 pointer-coarse:min-h-0 pointer-coarse:min-w-0',
      },
      size: {
        xs: 'h-7 gap-1.5 rounded-sm px-2.5 text-xs [&_svg:not([class*=size-])]:size-3.5',
        sm: 'h-8 px-3 text-[13px]',
        default: 'h-9 px-3.5',
        lg: 'h-10 rounded-lg px-4 text-[15px]',
        icon: 'size-9 px-0',
        'icon-sm': 'size-8 px-0',
        'icon-lg': 'size-10 rounded-lg px-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

/**
 * The action primitive. On touch screens every button is at least 44px
 * (`pointer-coarse:min-h-8` opts a button in a dense header out); link-styled
 * buttons stay inline. `data-variant` and `data-size` are set for CSS that
 * needs them. A trigger's `asChild` replaces `data-slot` with its own
 * (`dialog-trigger`), which is why the sizing lives in the classes.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    disabled,
    children,
    type,
    onClickCapture,
    onKeyDownCapture,
    ...props
  }: ButtonProps,
  ref,
) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? 'button')}
      data-slot="button"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'default'}
      data-loading={loading ? '' : undefined}
      aria-busy={loading || undefined}
      disabled={!asChild ? disabled || loading : undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
      aria-disabled={asChild && (disabled || loading) ? true : props['aria-disabled']}
      tabIndex={asChild && (disabled || loading) ? -1 : props.tabIndex}
      onClickCapture={(event) => {
        if (disabled || loading) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClickCapture?.(event);
      }}
      onKeyDownCapture={(event) => {
        if ((disabled || loading) && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onKeyDownCapture?.(event);
      }}
    >
      {asChild ? (
        // Slot needs exactly one child to merge onto, so no spinner here.
        children
      ) : (
        <>
          {loading ? (
            <span
              aria-hidden="true"
              className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent opacity-70"
            />
          ) : null}
          {children}
        </>
      )}
    </Comp>
  );
});

export { Button, buttonVariants };
