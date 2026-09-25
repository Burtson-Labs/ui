import ChevronRight from '@burtson-labs/icons/react/chevron-right';
import Lightbulb from '@burtson-labs/icons/react/lightbulb';
import * as React from 'react';

import { cn } from '../lib/utils';
import * as CollapsiblePrimitive from '../primitives/vendor/radix/react-collapsible';

export interface ReasoningProps extends React.ComponentProps<'div'> {
  /** True while the model is still thinking. */
  streaming?: boolean;
  durationMs?: number;
  defaultOpen?: boolean;
}

/** A model's reasoning, collapsed to one line ("Thought for 3s") unless opened. */
function Reasoning({
  streaming = false,
  durationMs,
  defaultOpen = false,
  children,
  className,
  ...props
}: ReasoningProps) {
  const label = streaming
    ? 'Thinking…'
    : durationMs !== undefined
      ? `Thought for ${Math.max(1, Math.round(durationMs / 1000))}s`
      : 'Reasoning';
  return (
    <CollapsiblePrimitive.Root defaultOpen={defaultOpen}>
      <div data-slot="reasoning" className={cn('grid gap-1.5', className)} {...props}>
        <CollapsiblePrimitive.Trigger className="group/reasoning inline-flex w-fit items-center gap-1.5 rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/20">
          <Lightbulb className={cn('size-3.5', streaming && 'animate-pulse')} aria-hidden />
          {label}
          <ChevronRight
            aria-hidden
            className="size-3.5 transition-transform group-data-[state=open]/reasoning:rotate-90"
          />
        </CollapsiblePrimitive.Trigger>
        <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="border-l-2 border-border-strong pl-3 text-[13px] leading-6 text-muted-foreground">
            {children}
          </div>
        </CollapsiblePrimitive.Content>
      </div>
    </CollapsiblePrimitive.Root>
  );
}

/** Three pulsing dots while a reply is on its way. Still under reduced motion. */
function StreamingIndicator({
  className,
  label = 'Assistant is typing',
  ...props
}: React.ComponentProps<'span'> & { label?: string }) {
  return (
    <span
      data-slot="streaming-indicator"
      role="status"
      aria-label={label}
      className={cn('inline-flex h-5 items-center gap-1', className)}
      {...props}
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-none"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

export { Reasoning, StreamingIndicator };
