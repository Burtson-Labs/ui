import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../lib/utils';

const cardVariants = cva(
  'group/card relative flex flex-col overflow-hidden rounded-lg border text-card-foreground transition-[border-color,background-color,box-shadow,transform] duration-150',
  {
    variants: {
      variant: {
        default: 'border-border bg-card shadow-xs',
        raised: 'border-border bg-surface-raised shadow-md',
        subtle: 'border-border/70 bg-surface-muted shadow-none',
        interactive:
          'border-border bg-card shadow-xs hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md',
        terminal: 'border-border-strong bg-code text-code-foreground shadow-md',
      },
      density: {
        compact:
          '[&_[data-slot=card-header]]:p-4 [&_[data-slot=card-content]]:px-4 [&_[data-slot=card-footer]]:p-4',
        default:
          '[&_[data-slot=card-header]]:p-5 [&_[data-slot=card-content]]:px-5 [&_[data-slot=card-footer]]:p-5',
        roomy:
          '[&_[data-slot=card-header]]:p-6 [&_[data-slot=card-content]]:px-6 [&_[data-slot=card-footer]]:p-6',
      },
    },
    defaultVariants: { variant: 'default', density: 'default' },
  },
);

export interface CardProps extends React.ComponentProps<'div'>, VariantProps<typeof cardVariants> {}

function Card({ className, variant, density, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, density }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'grid grid-cols-[1fr_auto] items-start gap-x-4 gap-y-1 border-b border-transparent pb-3',
        className,
      )}
      {...props}
    />
  );
}

function CardEyebrow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-eyebrow"
      className={cn(
        'col-span-full mb-0.5 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('min-w-0 text-sm font-semibold tracking-[-0.015em]', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('col-start-1 text-sm leading-5 text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('pb-5', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('mt-auto flex items-center gap-2 border-t pt-4', className)}
      {...props}
    />
  );
}

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
