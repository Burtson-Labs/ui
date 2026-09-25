import * as React from 'react';

import { CopyButton as UICopyButton, cn } from '@burtson-labs/ui';

const TOKEN =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(import|from|export|default|function|return|const|let|type|interface|extends|as|if|else|new|typeof|true|false|null|undefined)\b|(<\/?[A-Z][\w.]*|<\/?[a-z][\w-]*)|(\b\d+(?:\.\d+)?\b)/g;
const CLASS = [
  'text-muted-foreground italic',
  'text-success',
  'text-brand',
  'text-warning',
  'text-warning',
];

/** Minimal TSX/shell colouring; our own snippets only, rendered as text nodes. */
function highlight(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const i = m.index;
    if (i > last) out.push(code.slice(last, i));
    const group = m.slice(1).findIndex((g) => g !== undefined);
    out.push(
      <span key={i} className={CLASS[group]}>
        {m[0]}
      </span>,
    );
    last = i + m[0].length;
  }
  out.push(code.slice(last));
  return out;
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  return <UICopyButton value={text} label="Copy code" className={className} />;
}

export function Code({
  code,
  lang = 'tsx',
  className,
}: {
  code: string;
  lang?: 'tsx' | 'sh' | 'css';
  className?: string;
}) {
  const text = code.trimEnd();
  return (
    <div className={cn('group relative rounded-lg border bg-muted/40', className)}>
      <CopyButton text={text} className="absolute top-2 right-2" />
      <pre className="overflow-x-auto p-4 pr-12 font-mono text-[13px] leading-relaxed">
        <code>{lang === 'sh' ? text : highlight(text)}</code>
      </pre>
    </div>
  );
}
