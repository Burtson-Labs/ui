import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const cardVariants = cva(
  'group/card relative flex flex-col overflow-hidden rounded-lg border text-card-foreground transition-[border-color,background-color,box-shadow,transform]',
  {
    variants: {
      variant: {
        default: 'border-border bg-card shadow-xs',
        raised: 'border-border bg-surface-raised shadow-md',
        subtle: 'border-border/70 bg-surface-muted shadow-none',
        interactive:
          'border-border bg-card shadow-xs hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md',
        // A dark panel in either theme. It re-points the text and rule tokens
        // at the code palette, so muted text, ghost buttons and dividers inside
        // it stay legible instead of using the page's colours.
        terminal:
          'border-border-strong bg-code text-code-foreground shadow-md [--foreground:var(--code-foreground)] [--muted-foreground:color-mix(in_srgb,var(--code-foreground)_72%,var(--code))] [--muted:color-mix(in_srgb,var(--code-foreground)_10%,var(--code))] [--border:color-mix(in_srgb,var(--code-foreground)_16%,var(--code))]',
      },
      density: {
        compact:
          '[&_[data-slot=card-header]]:p-4 [&_[data-slot=card-content]]:px-4 [&_[data-slot=card-content]]:pb-4 [&_[data-slot=card-footer]]:p-4',
        default:
          '[&_[data-slot=card-header]]:p-5 [&_[data-slot=card-content]]:px-5 [&_[data-slot=card-content]]:pb-5 [&_[data-slot=card-footer]]:p-5',
        roomy:
          '[&_[data-slot=card-header]]:p-6 [&_[data-slot=card-content]]:px-6 [&_[data-slot=card-content]]:pb-6 [&_[data-slot=card-footer]]:p-6',
      },
    },
    defaultVariants: { variant: 'default', density: 'default' },
  },
);

export interface CardProps extends React.ComponentProps<'div'>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, density, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="card"
      data-variant={variant ?? 'default'}
      className={cn(cardVariants({ variant, density }), className)}
      {...props}
    />
  );
});

const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-header"
        className={cn('grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1', className)}
        {...props}
      />
    );
  },
);

const CardEyebrow = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function CardEyebrow({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-eyebrow"
        className={cn(
          'col-span-full mb-0.5 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase',
          className,
        )}
        {...props}
      />
    );
  },
);

const CardTitle = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function CardTitle(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="card-title"
      className={cn('min-w-0 text-sm font-semibold tracking-[-0.015em]', className)}
      {...props}
    />
  );
});

const CardDescription = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function CardDescription({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-description"
        className={cn('col-start-1 text-sm leading-5 text-muted-foreground', className)}
        {...props}
      />
    );
  },
);

const CardAction = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function CardAction({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-action"
        className={cn('col-start-2 row-span-2 row-start-1 self-start', className)}
        {...props}
      />
    );
  },
);

const CardContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} data-slot="card-content" className={cn('pb-5', className)} {...props} />;
  },
);

const CardFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot="card-footer"
        className={cn('mt-auto flex items-center gap-2 border-t pt-4', className)}
        {...props}
      />
    );
  },
);

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardEyebrow,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
};
