import * as React from 'react';

import { cn } from '../lib/utils';

export interface MobileNavItem {
  id: string;
  label: string;
  /** An icon element, e.g. <MessageSquare />; sized to 20px. */
  icon: React.ReactNode;
  /** Renders a link; leave out for a button that only calls onValueChange. */
  href?: string;
  /** A count, or true for a dot. */
  badge?: number | boolean;
}

export interface MobileNavProps extends Omit<React.ComponentProps<'nav'>, 'onChange'> {
  /** Three to five destinations the app defines. */
  items: MobileNavItem[];
  /** The current destination's id. */
  value: string;
  /**
   * Called on every press. For a link, call `event.preventDefault()` and
   * route yourself to keep a single-page app from reloading.
   */
  onValueChange?: (id: string, event: React.MouseEvent<HTMLElement>) => void;
  /** `fixed` pins it to the bottom of the viewport. */
  position?: 'fixed' | 'static';
  'aria-label'?: string;
}

/**
 * The phone's bottom tab bar: icon over a visible label, 44px+ targets, and
 * room for the home indicator (safe-area insets). Destinations come from the
 * app; don't pad it with empty sections.
 */
function MobileNav({
  items,
  value,
  onValueChange,
  position = 'static',
  className,
  'aria-label': ariaLabel = 'Primary',
  ...props
}: MobileNavProps) {
  return (
    <nav
      data-slot="mobile-nav"
      aria-label={ariaLabel}
      className={cn(
        'border-t bg-surface/95 pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] backdrop-blur supports-[backdrop-filter]:bg-surface/80',
        position === 'fixed' && 'fixed inset-x-0 bottom-0 z-40',
        className,
      )}
      {...props}
    >
      <ul className="mx-auto flex max-w-lg">
        {items.map((item) => {
          const active = item.id === value;
          const count = typeof item.badge === 'number' && item.badge > 0 ? item.badge : undefined;
          const dot = item.badge === true;
          const content = (
            <>
              <span className="relative [&_svg]:size-5" aria-hidden>
                {item.icon}
                {(count !== undefined || dot) && (
                  <span
                    className={cn(
                      'absolute -top-1 left-3 grid place-items-center rounded-full bg-destructive text-[10px] leading-none font-semibold text-destructive-foreground ring-2 ring-surface tabular-nums',
                      count !== undefined ? 'h-4 min-w-4 px-1' : 'size-2',
                    )}
                  >
                    {count !== undefined ? (count > 99 ? '99+' : count) : null}
                  </span>
                )}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
              {count !== undefined && <span className="sr-only">, {count} new</span>}
              {dot && <span className="sr-only">, new</span>}
            </>
          );
          const classes = cn(
            'flex min-h-14 w-full min-w-11 flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] font-medium text-muted-foreground outline-none transition-colors select-none [-webkit-tap-highlight-color:transparent] hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/25 focus-visible:ring-inset',
            active && 'text-brand hover:text-brand',
          );
          return (
            <li key={item.id} className="min-w-0 flex-1">
              {item.href ? (
                <a
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={(e) => onValueChange?.(item.id, e)}
                  className={classes}
                >
                  {content}
                </a>
              ) : (
                <button
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={(e) => onValueChange?.(item.id, e)}
                  className={classes}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export { MobileNav };
