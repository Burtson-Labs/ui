import * as React from 'react';

import { type CodeTokenType, tokenizeCode } from '../lib/highlight';
import { cn } from '../lib/utils';

import { CopyButton } from './copy-button';

/*
 * A small, safe Markdown renderer for chat: paragraphs, headings, bullet and
 * numbered lists, block quotes, fenced code, inline code, bold, italic and
 * links. Everything becomes React elements (never HTML strings), and links
 * only keep http(s) and mailto targets, so model output cannot inject markup
 * or script.
 */

const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

function inline(text: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const pattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*|__[^_]+__)|(\*[^*\s][^*]*\*|_[^_\s][^_]*_)|(\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(pattern)) {
    const i = m.index;
    if (i > last) out.push(text.slice(last, i));
    const token = m[0];
    const k = `${key}-${n++}`;
    if (m[1]) {
      out.push(
        <code key={k} className="rounded-xs bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (m[2]) {
      out.push(<strong key={k}>{inline(token.slice(2, -2), k)}</strong>);
    } else if (m[3]) {
      out.push(<em key={k}>{inline(token.slice(1, -1), k)}</em>);
    } else {
      const [, label = '', href = ''] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token) ?? [];
      out.push(
        SAFE_HREF.test(href) ? (
          <a
            key={k}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            {label}
          </a>
        ) : (
          label
        ),
      );
    }
    last = i + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Your own highlighter (shiki, Prism, highlight.js), as React nodes. Return
 * null or undefined to fall back to the built-in tokenizer's output. Build
 * the nodes from tokens, as elements and text: never pass a highlighter's
 * HTML string through dangerouslySetInnerHTML, since the code is model output.
 */
export type CodeHighlighter = (code: string, lang: string) => React.ReactNode | null | undefined;

const tokenClasses: Record<CodeTokenType, string | undefined> = {
  plain: undefined,
  // Token colours mixed toward the code foreground so they read at 5.7:1 or
  // better on the code background in both themes.
  keyword: 'text-[color-mix(in_srgb,var(--brand)_60%,var(--code-foreground))]',
  string: 'text-[color-mix(in_srgb,var(--success)_60%,var(--code-foreground))]',
  number: 'text-[color-mix(in_srgb,var(--warning)_60%,var(--code-foreground))]',
  literal: 'text-[color-mix(in_srgb,var(--warning)_60%,var(--code-foreground))]',
  variable: 'text-[color-mix(in_srgb,var(--warning)_60%,var(--code-foreground))]',
  function: 'text-[color-mix(in_srgb,var(--info)_60%,var(--code-foreground))]',
  property: 'text-[color-mix(in_srgb,var(--destructive)_60%,var(--code-foreground))]',
  operator: 'text-code-foreground/80',
  punctuation: 'text-code-foreground/80',
  comment: 'text-code-foreground/65 italic',
};

/**
 * The built-in highlighter: JavaScript, TypeScript, JSON, shell and Python
 * as coloured text spans. Unknown languages come back as the plain string.
 */
export function highlightCode(code: string, lang: string | undefined): React.ReactNode {
  const tokens = tokenizeCode(code, lang);
  if (!tokens) return code;
  return tokens.map((t, i) => {
    const className = tokenClasses[t.type];
    return className ? (
      <span key={i} data-token={t.type} className={className}>
        {t.text}
      </span>
    ) : (
      t.text
    );
  });
}

/** A fenced code block with a language label, syntax colours and a copy button. */
export interface CodeBlockProps {
  code: string;
  lang?: string;
  className?: string;
  /**
   * Syntax colouring. Leave out for the built-in tokenizer (js, ts, json,
   * bash, python), pass your own function to use a full highlighter, or
   * false for plain text.
   */
  highlight?: CodeHighlighter | false;
  /** Accessible name of the copy button, for translation. */
  copyLabel?: string;
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock(
  { code, lang, className, highlight, copyLabel = 'Copy code' },
  ref,
) {
  const content = React.useMemo(() => {
    if (highlight === false) return code;
    const custom = highlight?.(code, lang ?? '');
    return custom ?? highlightCode(code, lang);
  }, [code, lang, highlight]);
  return (
    <div
      ref={ref}
      data-slot="code-block"
      className={cn('overflow-hidden rounded-md border bg-code text-code-foreground', className)}
    >
      <div className="flex min-h-8 items-center justify-between border-b border-white/10 px-3 text-[11px] text-code-foreground/70">
        <span className="font-mono">{lang || 'text'}</span>
        <CopyButton
          value={code}
          label={copyLabel}
          className="size-7 text-code-foreground hover:bg-white/10 hover:text-code-foreground"
        />
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-5">
        <code>{content}</code>
      </pre>
    </div>
  );
});

type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; level: 1 | 2 | 3; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; lang: string; code: string };

/** Split Markdown into blocks. Exported for tests. */
export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: 'p', text: para.join(' ') });
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const fence = /^```\s*([\w+-]*)\s*$/.exec(line);
    if (fence) {
      flush();
      const code: string[] = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? '')) code.push(lines[i++] ?? '');
      blocks.push({ type: 'code', lang: fence[1] ?? '', code: code.join('\n') });
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({
        type: 'h',
        level: (heading[1]?.length ?? 1) as 1 | 2 | 3,
        text: heading[2] ?? '',
      });
      continue;
    }
    const list = /^\s*([-*]|\d+[.)])\s+(.*)$/.exec(line);
    if (list) {
      flush();
      const type = /\d/.test(list[1] ?? '') ? 'ol' : 'ul';
      const prev = blocks.at(-1);
      if (prev && prev.type === type) prev.items.push(list[2] ?? '');
      else blocks.push({ type, items: [list[2] ?? ''] });
      continue;
    }
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      flush();
      blocks.push({ type: 'quote', text: quote[1] ?? '' });
      continue;
    }
    if (!line.trim()) flush();
    else para.push(line.trim());
  }
  flush();
  return blocks;
}

export interface MarkdownProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  children: string;
  /** Passed to every CodeBlock: your highlighter, or false for plain code. */
  highlight?: CodeHighlighter | false;
}

/** Renders a Markdown string safely, for assistant messages. */
const Markdown = React.forwardRef<HTMLDivElement, MarkdownProps>(function Markdown(
  { children, highlight, className, ...props },
  ref,
) {
  const blocks = React.useMemo(() => parseMarkdown(children), [children]);
  return (
    <div
      ref={ref}
      data-slot="markdown"
      className={cn('grid gap-3 text-sm leading-6 [&_li]:leading-6', className)}
      {...props}
    >
      {blocks.map((b, i) => {
        const k = `b${i}`;
        switch (b.type) {
          case 'h': {
            const Tag = (['h3', 'h4', 'h5'] as const)[b.level - 1] ?? 'h5';
            return (
              <Tag key={k} className="font-semibold tracking-[-0.01em]">
                {inline(b.text, k)}
              </Tag>
            );
          }
          case 'ul':
          case 'ol': {
            const Tag = b.type;
            return (
              <Tag
                key={k}
                className={cn('grid gap-1 pl-5', b.type === 'ul' ? 'list-disc' : 'list-decimal')}
              >
                {b.items.map((item, j) => (
                  <li key={`${k}-${j}`}>{inline(item, `${k}-${j}`)}</li>
                ))}
              </Tag>
            );
          }
          case 'quote':
            return (
              <blockquote
                key={k}
                className="border-l-2 border-border-strong pl-3 text-muted-foreground"
              >
                {inline(b.text, k)}
              </blockquote>
            );
          case 'code':
            return <CodeBlock key={k} code={b.code} lang={b.lang} highlight={highlight} />;
          default:
            return <p key={k}>{inline(b.text, k)}</p>;
        }
      })}
    </div>
  );
});

export { CodeBlock, Markdown };
