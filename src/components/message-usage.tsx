import * as React from 'react';

import { cn } from '../lib/utils';

const messageUsageLabels = {
  /** Visible suffixes. */
  input: 'in',
  output: 'out',
  /** Read by screen readers before each value. */
  inputName: 'Input tokens',
  outputName: 'Output tokens',
  costName: 'Cost',
  durationName: 'Duration',
};

export interface MessageUsageProps extends Omit<React.ComponentProps<'p'>, 'children'> {
  /** Prompt tokens the runtime measured for this response. */
  inputTokens?: number | null;
  /** Generated tokens. */
  outputTokens?: number | null;
  /** What the response cost, in `currency` units (0.0042 for $0.0042). */
  cost?: number | null;
  /** ISO 4217 code. Default "USD". */
  currency?: string;
  /** How long the response took, in milliseconds. */
  durationMs?: number | null;
  /** Locale for numbers, currency and units; defaults to the browser's. */
  locale?: string;
  /** Strings, for translation. */
  labels?: Partial<typeof messageUsageLabels>;
}

const valid = (n: number | null | undefined): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0;

/** A cost with enough decimals to be meaningful: $0.0042, $1.25. */
export function formatCost(cost: number, currency = 'USD', locale?: string): string {
  const fraction = cost !== 0 && Math.abs(cost) < 1 ? 4 : 2;
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: fraction,
    }).format(cost);
  } catch {
    // An unknown currency code: show the number and the code.
    return `${cost.toFixed(fraction)} ${currency}`;
  }
}

/** 850 → "850ms", 3240 → "3.2s", 65000 → "1m 5s". */
export function formatElapsed(ms: number, locale?: string): string {
  const unit = (value: number, u: 'millisecond' | 'second' | 'minute', digits = 0) =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: u,
      unitDisplay: 'narrow',
      maximumFractionDigits: digits,
    }).format(value);
  if (ms < 1000) return unit(Math.round(ms), 'millisecond');
  if (ms < 60_000) return unit(ms / 1000, 'second', 1);
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return seconds
    ? `${unit(minutes, 'minute')} ${unit(seconds, 'second')}`
    : unit(minutes, 'minute');
}

/**
 * Token counts, cost and time for one response, as a quiet line for a
 * message footer: "1,204 in · 356 out · $0.0042 · 3.2s". Leave a value out
 * (or pass null) when the runtime did not measure it; nothing is estimated.
 * Renders nothing when there is nothing to show.
 */
const MessageUsage = React.forwardRef<HTMLParagraphElement, MessageUsageProps>(
  function MessageUsage(
    {
      inputTokens,
      outputTokens,
      cost,
      currency = 'USD',
      durationMs,
      locale,
      labels,
      className,
      ...props
    },
    ref,
  ) {
    const l = { ...messageUsageLabels, ...labels };
    const count = new Intl.NumberFormat(locale);
    const parts: { key: string; name: string; value: string; suffix?: string }[] = [];
    if (valid(inputTokens))
      parts.push({
        key: 'input',
        name: l.inputName,
        value: count.format(inputTokens),
        suffix: l.input,
      });
    if (valid(outputTokens))
      parts.push({
        key: 'output',
        name: l.outputName,
        value: count.format(outputTokens),
        suffix: l.output,
      });
    if (valid(cost))
      parts.push({ key: 'cost', name: l.costName, value: formatCost(cost, currency, locale) });
    if (valid(durationMs))
      parts.push({
        key: 'duration',
        name: l.durationName,
        value: formatElapsed(durationMs, locale),
      });
    if (!parts.length) return null;
    return (
      <p
        ref={ref}
        data-slot="message-usage"
        className={cn(
          'flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground tabular-nums',
          className,
        )}
        {...props}
      >
        {parts.map((p, i) => (
          <React.Fragment key={p.key}>
            {i > 0 && <span aria-hidden>·</span>}
            <span data-usage={p.key}>
              <span className="sr-only">{p.name}: </span>
              {p.value}
              {p.suffix && <span aria-hidden> {p.suffix}</span>}
              {i < parts.length - 1 && <span className="sr-only">, </span>}
            </span>
          </React.Fragment>
        ))}
      </p>
    );
  },
);

export { MessageUsage };
