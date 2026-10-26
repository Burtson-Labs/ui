import Check from '@burtson-labs/icons/react/check';
import Copy from '@burtson-labs/icons/react/copy';
import * as React from 'react';

import { Button } from '@burtson-labs/ui';

/** Where a component's Markdown page is served (written by scripts/llms.mjs). */
export const markdownHref = (name: string) => `/docs/components/${name}.md`;

/**
 * Copies a component's docs as Markdown, for pasting into an agent chat. The
 * file is fetched when the page opens so the copy itself happens inside the
 * click (Safari refuses clipboard writes that wait on the network).
 */
export function CopyMarkdown({ name }: { name: string }) {
  const [text, setText] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  React.useEffect(() => () => clearTimeout(timer.current), []);

  React.useEffect(() => {
    let active = true;
    fetch(markdownHref(name))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((t) => {
        if (active) setText(t);
      })
      .catch(() => {
        if (active) setText(null);
      });
    return () => {
      active = false;
    };
  }, [name]);

  const copy = async () => {
    try {
      const value = text ?? (await (await fetch(markdownHref(name))).text());
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Button variant="outline" size="sm" onClick={() => void copy()}>
        {status === 'copied' ? (
          <Check aria-hidden className="text-success" />
        ) : (
          <Copy aria-hidden />
        )}
        {status === 'copied' ? 'Copied' : 'Copy as Markdown'}
      </Button>
      <a
        href={markdownHref(name)}
        className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        View as Markdown
      </a>
      <span role="status" className="sr-only">
        {status === 'copied'
          ? 'Markdown copied to clipboard.'
          : status === 'failed'
            ? 'Copy blocked. Open View as Markdown and copy it from there.'
            : ''}
      </span>
    </div>
  );
}
