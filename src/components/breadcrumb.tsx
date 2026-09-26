import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import MoreHorizontal from '@burtson-labs/icons/react/more-horizontal';
import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';
import * as Slot from '../primitives/vendor/radix/react-slot';

const Breadcrumb = React.forwardRef<HTMLElement, React.ComponentProps<'nav'>>(
  function Breadcrumb(props, ref) {
    return <nav ref={ref} aria-label="Breadcrumb" data-slot="breadcrumb" {...props} />;
  },
);

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentProps<'ol'>>(
  function BreadcrumbList({ className, ...props }, ref) {
    return (
      <ol
        ref={ref}
        data-slot="breadcrumb-list"
        className={cn(
          'flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground',
          className,
        )}
        {...props}
      />
    );
  },
);

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  function BreadcrumbItem({ className, ...props }, ref) {
    return (
      <li
        ref={ref}
        data-slot="breadcrumb-item"
        className={cn('inline-flex items-center gap-1.5', className)}
        {...props}
      />
    );
  },
);

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & { asChild?: boolean }
>(function BreadcrumbLink({ asChild, className, ...props }, ref) {
  const Comp = asChild ? Slot.Root : 'a';
  return (
    <Comp
      ref={ref}
      data-slot="breadcrumb-link"
      className={cn(
        'rounded-xs transition-colors hover:text-foreground',
        focusRingClasses,
        className,
      )}
      {...props}
    />
  );
});

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(
  function BreadcrumbPage({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        data-slot="breadcrumb-page"
        role="link"
        aria-disabled="true"
        aria-current="page"
        className={cn('font-medium text-foreground', className)}
        {...props}
      />
    );
  },
);

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  function BreadcrumbSeparator({ children, className, ...props }, ref) {
    return (
      <li
        ref={ref}
        data-slot="breadcrumb-separator"
        role="presentation"
        aria-hidden="true"
        className={cn('[&>svg]:size-3.5', className)}
        {...props}
      >
        {children ?? <ChevronRight />}
      </li>
    );
  },
);

const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, React.ComponentProps<'span'>>(
  function BreadcrumbEllipsis({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        data-slot="breadcrumb-ellipsis"
        role="presentation"
        aria-hidden="true"
        className={cn('flex size-9 items-center justify-center', className)}
        {...props}
      >
        <MoreHorizontal className="size-4" />
        <span className="sr-only">More</span>
      </span>
    );
  },
);

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
