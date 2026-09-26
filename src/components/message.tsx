import * as React from 'react';

import { cn } from '../lib/utils';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageProps extends React.ComponentProps<'div'> {
  /** Who wrote it. (Not `role`, which is the ARIA attribute.) */
  from: MessageRole;
  /** Avatar or agent mark beside assistant messages. */
  avatar?: React.ReactNode;
  /** Sender name shown above the message, e.g. the agent's name. */
  name?: React.ReactNode;
  /** Timestamp or status text. */
  meta?: React.ReactNode;
  /** Actions such as copy and retry, shown on hover and focus. */
  actions?: React.ReactNode;
}

/**
 * One turn in a conversation. User turns sit on the right in a quiet bubble,
 * assistant turns read full width with an optional avatar, and system notes
 * are centred and small.
 */
const Message = React.forwardRef<HTMLDivElement, MessageProps>(function Message(
  { from, avatar, name, meta, actions, children, className, ...props },
  ref,
) {
  if (from === 'system') {
    return (
      <div
        ref={ref}
        data-slot="message"
        data-role="system"
        className={cn('mx-auto max-w-prose text-center text-xs text-muted-foreground', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
  const user = from === 'user';
  return (
    <div
      ref={ref}
      data-slot="message"
      data-role={from}
      className={cn(
        'group/message flex animate-in gap-3',
        user ? 'justify-end' : 'justify-start',
        className,
      )}
      {...props}
    >
      {!user && avatar && (
        <div className="mt-0.5 grid size-7 shrink-0 place-items-center overflow-hidden rounded-md border border-brand/15 bg-brand-soft text-brand [&_svg]:size-4">
          {avatar}
        </div>
      )}
      <div
        className={cn('grid min-w-0 gap-1.5', user ? 'max-w-[85%] justify-items-end' : 'flex-1')}
      >
        {(name || meta) && (
          <div className="flex items-baseline gap-2 text-xs">
            {name && <span className="font-semibold text-foreground">{name}</span>}
            {meta && <span className="text-muted-foreground">{meta}</span>}
          </div>
        )}
        <div
          data-slot="message-body"
          className={cn(
            'min-w-0 break-words text-sm leading-6',
            user && 'rounded-lg rounded-tr-xs bg-secondary px-3.5 py-2 text-secondary-foreground',
          )}
        >
          {children}
        </div>
        {actions && (
          <div className="flex gap-1 opacity-0 transition-opacity group-focus-within/message:opacity-100 group-hover/message:opacity-100 max-md:opacity-100">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
});

export { Message };
