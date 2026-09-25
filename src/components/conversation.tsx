import ArrowDown from '@burtson-labs/icons/react/arrow-down';
import * as React from 'react';

import { cn } from '../lib/utils';

export interface ConversationProps extends React.ComponentProps<'div'> {
  /** Shown instead of the messages when there are none. */
  empty?: React.ReactNode;
  /** Accessible name for the message log. */
  label?: string;
}

/**
 * A scrolling message log that stays pinned to the newest message while it
 * streams, unless the reader has scrolled up; then a "Jump to latest" button
 * appears instead of yanking them back down.
 */
function Conversation({
  children,
  empty,
  label = 'Conversation',
  className,
  ...props
}: ConversationProps) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const content = React.useRef<HTMLDivElement>(null);
  const pinned = React.useRef(true);
  const [atBottom, setAtBottom] = React.useState(true);
  const hasMessages = React.Children.toArray(children).length > 0;

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = scroller.current;
    if (!el) return;
    if (typeof el.scrollTo === 'function') el.scrollTo({ top: el.scrollHeight, behavior });
    else el.scrollTop = el.scrollHeight;
  }, []);

  React.useEffect(() => {
    const el = content.current;
    if (!el) return;
    // Content grows while a reply streams; follow it only if pinned.
    const ro = new ResizeObserver(() => {
      if (pinned.current) scrollToBottom();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollToBottom]);

  React.useEffect(() => {
    if (pinned.current) scrollToBottom();
  }, [children, scrollToBottom]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    pinned.current = bottom;
    setAtBottom(bottom);
  };

  return (
    <div data-slot="conversation" className={cn('relative min-h-0', className)} {...props}>
      <div
        ref={scroller}
        role="log"
        aria-label={label}
        aria-live="polite"
        aria-relevant="additions text"
        // A scrollable region must be reachable by keyboard (WCAG 2.1.1).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        onScroll={onScroll}
        className="size-full overflow-y-auto outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
      >
        <div ref={content} className="grid gap-5 p-4">
          {hasMessages ? children : empty}
        </div>
      </div>
      {!atBottom && (
        <button
          type="button"
          onClick={() => {
            pinned.current = true;
            setAtBottom(true);
            scrollToBottom('smooth');
          }}
          className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 animate-in items-center gap-1.5 rounded-full border border-border-strong bg-surface-raised px-3 py-1.5 text-xs font-semibold shadow-md outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/20 [&_svg]:size-3.5"
        >
          <ArrowDown aria-hidden /> Jump to latest
        </button>
      )}
    </div>
  );
}

export { Conversation };
