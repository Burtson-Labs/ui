import AlertCircle from '@burtson-labs/icons/react/alert-circle';
import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';

import { Alert, AlertDescription, AlertTitle } from './alert';

export interface ErrorSummaryItem {
  /** The id of the field with the problem; the entry links to it. */
  id: string;
  message: React.ReactNode;
}

export interface ErrorSummaryProps extends Omit<
  React.ComponentProps<'div'>,
  'children' | 'title' | 'onSelect'
> {
  /** Nothing renders while this is empty. */
  errors: ErrorSummaryItem[];
  title?: React.ReactNode;
  /** Called with the field id when an entry is chosen, after the field is focused. */
  onSelect?: (id: string) => void;
}

/**
 * The errors of a long form, at the top of it after a failed submit, each a
 * link to its field. Focus moves here when errors appear, so a screen reader
 * hears the list; choosing an entry focuses the field and scrolls it into
 * view.
 */
const ErrorSummary = React.forwardRef<HTMLDivElement, ErrorSummaryProps>(function ErrorSummary(
  { errors, title = 'Fix these to continue', onSelect, className, ...props },
  ref,
) {
  const local = React.useRef<HTMLDivElement | null>(null);
  const count = errors.length;
  React.useEffect(() => {
    if (count) local.current?.focus();
  }, [count]);
  if (!count) return null;
  return (
    <div
      ref={(node) => {
        local.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      tabIndex={-1}
      data-slot="error-summary"
      className={cn('outline-none', className)}
      {...props}
    >
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <ul className="grid gap-0.5">
            {errors.map(({ id, message }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={cn(
                    'rounded-xs text-foreground underline underline-offset-2 hover:text-destructive',
                    focusRingClasses,
                  )}
                  onClick={(event) => {
                    const el = document.getElementById(id);
                    if (!el) return;
                    event.preventDefault();
                    el.focus();
                    el.scrollIntoView?.({
                      block: 'center',
                      behavior:
                        typeof matchMedia === 'function' &&
                        matchMedia('(prefers-reduced-motion: reduce)').matches
                          ? 'auto'
                          : 'smooth',
                    });
                    onSelect?.(id);
                  }}
                >
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
});

export { ErrorSummary };
