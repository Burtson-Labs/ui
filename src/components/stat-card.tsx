import * as React from 'react';

import { cn, focusRingClasses } from '../lib/utils';

import { Card } from './card';

export interface StatCardProps extends React.ComponentProps<typeof Card> {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  detail?: React.ReactNode;
  trend?: React.ReactNode;
}

/** One metric with context. A row of them on a phone is better as a StatStrip. */
const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  { label, value, icon, detail, trend, className, ...props },
  ref,
) {
  return (
    <Card
      ref={ref}
      density="compact"
      data-slot="stat-card"
      className={cn('min-w-0', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <div
            data-slot="stat-card-label"
            className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase"
          >
            {label}
          </div>
          <div
            data-slot="stat-card-value"
            className="mt-1 truncate text-2xl font-semibold tracking-[-0.035em] text-foreground tabular-nums"
          >
            {value}
          </div>
          {detail ? (
            <div data-slot="stat-card-detail" className="mt-1 text-xs text-muted-foreground">
              {detail}
            </div>
          ) : null}
        </div>
        {icon ? (
          <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-brand/15 bg-brand-soft text-brand [&_svg]:size-4">
            {icon}
          </div>
        ) : null}
      </div>
      {trend ? (
        <div data-slot="stat-card-trend" className="border-t border-border px-4 py-2.5 text-xs">
          {trend}
        </div>
      ) : null}
    </Card>
  );
});

export interface StatStripItem {
  label: React.ReactNode;
  value: React.ReactNode;
  detail?: React.ReactNode;
  /** Makes the figure a link to this page. */
  href?: string;
  /** Makes the figure a button. */
  onSelect?: () => void;
}

export interface StatStripProps extends Omit<React.ComponentProps<typeof Card>, 'children'> {
  /** Two to four figures. */
  stats: StatStripItem[];
  /**
   * Renders each linked figure through your router's link: it receives
   * `href` and the figure's content as children.
   */
  renderLink?: (href: string, children: React.ReactNode, className: string) => React.ReactNode;
}

/**
 * Up to four headline figures in one card, side by side: the phone form of a
 * row of StatCards, which would otherwise stack into a screen of boxes. A
 * figure with `href` or `onSelect` is a target.
 */
const StatStrip = React.forwardRef<HTMLDivElement, StatStripProps>(function StatStrip(
  { stats, renderLink, className, ...props },
  ref,
) {
  const cell = cn(
    'grid min-w-0 content-start px-3 py-3 text-left first:rounded-l-[inherit] last:rounded-r-[inherit]',
    focusRingClasses,
    'focus-visible:outline-offset-[-2px]',
  );
  const interactive = cn(cell, 'transition-colors hover:bg-muted/60 active:bg-muted');
  return (
    <Card ref={ref} data-slot="stat-strip" className={cn('gap-0 py-0', className)} {...props}>
      <div
        className="grid divide-x divide-border"
        style={{ gridTemplateColumns: `repeat(${Math.max(1, stats.length)}, minmax(0, 1fr))` }}
      >
        {stats.map((s, i) => {
          const body = (
            <>
              <span className="text-[10.5px] leading-4 font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                {s.label}
              </span>
              <span className="mt-1 text-xl font-semibold tracking-[-0.03em] tabular-nums">
                {s.value}
              </span>
              {s.detail && (
                <span className="mt-0.5 text-[11.5px] leading-4 text-muted-foreground">
                  {s.detail}
                </span>
              )}
            </>
          );
          if (s.href)
            return (
              <React.Fragment key={i}>
                {renderLink ? (
                  renderLink(s.href, body, interactive)
                ) : (
                  <a href={s.href} data-slot="stat-strip-item" className={interactive}>
                    {body}
                  </a>
                )}
              </React.Fragment>
            );
          if (s.onSelect)
            return (
              <button
                key={i}
                type="button"
                data-slot="stat-strip-item"
                onClick={s.onSelect}
                className={interactive}
              >
                {body}
              </button>
            );
          return (
            <div key={i} data-slot="stat-strip-item" className={cell}>
              {body}
            </div>
          );
        })}
      </div>
    </Card>
  );
});

export { StatCard, StatStrip };
