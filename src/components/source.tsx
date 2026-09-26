import ExternalLink from '@burtson-labs/icons/react/external-link';
import FileText from '@burtson-labs/icons/react/file-text';
import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from './popover';

/** Where an answer came from. The app supplies provenance; this only shows it. */
export interface Source {
  id: string;
  title: string;
  /** Only http(s) links are rendered as links. */
  url?: string;
  /** The passage the answer relied on. */
  snippet?: string;
  /** Short location, e.g. "page 4" or "Updated 2 days ago". */
  meta?: string;
  icon?: React.ReactNode;
}

/** An http(s) URL, or undefined for anything else (javascript:, data:, relative). */
export function safeSourceHref(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

function hostOf(href: string | undefined): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

function SourceBody({ source, index }: { source: Source; index?: number }) {
  const href = safeSourceHref(source.url);
  const host = hostOf(href);
  const location = [host, source.meta].filter(Boolean).join(' · ');
  return (
    <div className="grid min-w-0 gap-1">
      <div className="flex min-w-0 items-start gap-2">
        {index !== undefined && (
          <span className="mt-px grid h-5 min-w-5 shrink-0 place-items-center rounded-sm border bg-surface-muted px-1 font-mono text-[11px] font-semibold text-muted-foreground tabular-nums">
            {index}
          </span>
        )}
        <span className="mt-0.5 shrink-0 text-muted-foreground [&_svg]:size-4">
          {source.icon ?? <FileText aria-hidden />}
        </span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'min-w-0 rounded-xs font-medium text-foreground underline-offset-2 hover:underline',
              focusRingClasses,
            )}
          >
            <span className="line-clamp-2">{source.title}</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <span className="line-clamp-2 min-w-0 font-medium text-foreground">{source.title}</span>
        )}
        {href && (
          <ExternalLink className="mt-1 size-3 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </div>
      {location && <p className="truncate text-xs text-muted-foreground">{location}</p>}
      {source.snippet && (
        <blockquote className="line-clamp-3 border-l-2 pl-2 text-xs leading-5 text-muted-foreground">
          {source.snippet}
        </blockquote>
      )}
    </div>
  );
}

export interface SourceCitationProps extends Omit<
  React.ComponentProps<typeof PopoverTrigger>,
  'children'
> {
  /** 1-based number shown in the text; matches the SourceList entry. */
  index: number;
  source: Source;
}

/** An inline [n] marker in an answer; opens the source it points to. */
const SourceCitation = React.forwardRef<HTMLButtonElement, SourceCitationProps>(
  function SourceCitation({ index, source, className, ...props }, ref) {
    return (
      <Popover>
        <PopoverTrigger
          ref={ref}
          data-slot="source-citation"
          aria-label={`Source ${index}: ${source.title}`}
          className={cn(
            'mx-0.5 inline-grid h-4 min-w-4 translate-y-[-0.1em] place-items-center rounded-xs border bg-surface-muted px-1 align-baseline font-mono text-[10px] leading-none font-semibold text-muted-foreground tabular-nums transition-colors hover:border-brand/40 hover:text-foreground data-[state=open]:border-brand data-[state=open]:text-foreground',
            focusRingClasses,
            className,
          )}
          {...props}
        >
          {index}
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-80 p-3 text-sm">
          <SourceBody source={source} />
        </PopoverContent>
      </Popover>
    );
  },
);

export interface SourceListProps extends React.ComponentProps<'section'> {
  sources: Source[];
  /** Heading; also the list's accessible name. */
  label?: string;
}

/** Numbered sources under an answer, in citation order. */
const SourceList = React.forwardRef<HTMLElement, SourceListProps>(function SourceList(
  { sources, label = 'Sources', className, ...props },
  ref,
) {
  const headingId = React.useId();
  if (sources.length === 0) return null;
  return (
    <section
      ref={ref}
      data-slot="source-list"
      aria-labelledby={headingId}
      className={cn('grid gap-2', className)}
      {...props}
    >
      <h3
        id={headingId}
        className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase"
      >
        {label}
      </h3>
      <ol className="grid gap-1.5 sm:grid-cols-2">
        {sources.map((source, i) => (
          <li
            key={source.id}
            className="min-w-0 rounded-md border bg-surface p-2.5 text-sm transition-colors hover:border-border-strong"
          >
            <SourceBody source={source} index={i + 1} />
          </li>
        ))}
      </ol>
    </section>
  );
});

export { SourceCitation, SourceList };
