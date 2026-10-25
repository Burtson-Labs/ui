import ChevronLeft from '@burtson-labs/icons/react/chevron-left';
import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import * as React from 'react';

import { cn } from '../lib/utils';

import { IconButton } from './icon-button';

const responseVersionLabels = {
  group: 'Response versions',
  previous: 'Previous response',
  next: 'Next response',
  /** Announced when the version changes, and the group's description. */
  status: (current: number, total: number) => `Response ${current} of ${total}`,
};

export type ResponseVersionLabels = typeof responseVersionLabels;

export interface ResponseVersionsProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  /** The version on screen, from 0. */
  index: number;
  /** How many versions there are. Below 2 the switcher renders nothing. */
  count: number;
  onIndexChange: (index: number) => void;
  /** Accessible names and the announcement, for translation. */
  labels?: Partial<ResponseVersionLabels>;
}

/**
 * "2 / 3" with previous and next buttons, for moving between regenerated
 * responses. The change is announced politely ("Response 2 of 3"). The
 * buttons stay focusable at either end (aria-disabled), so focus is never
 * dropped, and Left and Right arrows also move while focus is in the group.
 */
const ResponseVersions = React.forwardRef<HTMLDivElement, ResponseVersionsProps>(
  function ResponseVersions({ index, count, onIndexChange, labels, className, ...props }, ref) {
    const l = { ...responseVersionLabels, ...labels };
    const statusId = React.useId();
    const total = Math.max(0, Math.floor(count));
    const current = Math.min(Math.max(0, Math.floor(index)), Math.max(0, total - 1));
    // Announce changes only, not the first render (StrictMode-safe: compares values).
    const [announced, setAnnounced] = React.useState('');
    const shown = React.useRef(`${current}/${total}`);
    React.useEffect(() => {
      const key = `${current}/${total}`;
      if (shown.current === key) return;
      shown.current = key;
      setAnnounced(l.status(current + 1, total));
      // eslint-disable-next-line react-hooks/exhaustive-deps -- labels is often an inline object
    }, [current, total]);
    if (total < 2) return null;
    const atStart = current === 0;
    const atEnd = current === total - 1;
    const go = (next: number) => {
      if (next >= 0 && next < total && next !== current) onIndexChange(next);
    };
    const arrows = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(current - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(current + 1);
      }
    };
    const small =
      'size-7 text-muted-foreground hover:text-foreground pointer-coarse:size-11 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted-foreground';
    return (
      <div
        ref={ref}
        data-slot="response-versions"
        role="group"
        aria-label={l.group}
        aria-describedby={statusId}
        className={cn('inline-flex items-center gap-0.5', className)}
        {...props}
      >
        <IconButton
          variant="ghost"
          size="icon-sm"
          label={l.previous}
          aria-disabled={atStart || undefined}
          onClick={() => go(current - 1)}
          onKeyDown={arrows}
          className={small}
        >
          <ChevronLeft />
        </IconButton>
        <span
          aria-hidden
          className="min-w-9 text-center text-xs text-muted-foreground tabular-nums select-none"
        >
          {current + 1} / {total}
        </span>
        <IconButton
          variant="ghost"
          size="icon-sm"
          label={l.next}
          aria-disabled={atEnd || undefined}
          onClick={() => go(current + 1)}
          onKeyDown={arrows}
          className={small}
        >
          <ChevronRight />
        </IconButton>
        <span id={statusId} className="sr-only">
          {l.status(current + 1, total)}
        </span>
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {announced}
        </span>
      </div>
    );
  },
);

export { ResponseVersions };
