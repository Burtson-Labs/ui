import * as React from 'react';

import { cn } from '../lib/utils';
import * as AvatarPrimitive from '../primitives/vendor/radix/react-avatar';

const Avatar = React.forwardRef<HTMLSpanElement, React.ComponentProps<typeof AvatarPrimitive.Root>>(
  function Avatar({ className, ...props }, ref) {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        data-slot="avatar"
        className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
        {...props}
      />
    );
  },
);

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentProps<typeof AvatarPrimitive.Image>
>(function AvatarImage({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Image
      ref={ref}
      data-slot="avatar-image"
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  );
});

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<typeof AvatarPrimitive.Fallback>
>(function AvatarFallback({ className, ...props }, ref) {
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full border border-brand/15 bg-brand-soft text-xs font-semibold text-brand-soft-foreground',
        className,
      )}
      {...props}
    />
  );
});

export { Avatar, AvatarFallback, AvatarImage };
