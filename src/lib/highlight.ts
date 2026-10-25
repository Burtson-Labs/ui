/*
 * A tiny syntax tokenizer for code blocks: JavaScript/TypeScript, JSON, shell
 * and Python. It splits source into typed runs of plain text; the caller
 * renders each run as a React text node, so nothing is ever parsed as HTML.
 * It is a highlighter, not a parser: good enough to colour a chat answer,
 * and it falls back to plain text for anything it does not know.
 */

export type CodeTokenType =
  | 'plain'
  | 'comment'
  | 'keyword'
  | 'string'
  | 'number'
  | 'literal'
  | 'function'
  | 'property'
  | 'variable'
  | 'operator'
  | 'punctuation';

export interface CodeToken {
  type: CodeTokenType;
  text: string;
}

type Rule = [CodeTokenType, RegExp];

const words = (list: string) => new RegExp(`\\b(?:${list.split(' ').join('|')})\\b`, 'y');

const js: Rule[] = [
  ['comment', /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y],
  ['string', /`(?:\\[\s\S]|[^\\`])*`?|"(?:\\.|[^\\"\n])*"?|'(?:\\.|[^\\'\n])*'?/y],
  [
    'keyword',
    words(
      'as async await break case catch class const continue debugger declare default delete do else enum export extends finally for from function get if implements import in instanceof interface let new of private protected public readonly return satisfies set static super switch this throw try type typeof var void while with yield keyof infer',
    ),
  ],
  ['literal', words('true false null undefined NaN Infinity')],
  [
    'number',
    /\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?)n?\b/y,
  ],
  ['function', /[A-Za-z_$][\w$]*(?=\s*\()/y],
  ['property', /(?<=\.)[A-Za-z_$][\w$]*/y],
  ['plain', /[A-Za-z_$][\w$]*/y],
  ['operator', /=>|[=!]==?|[<>]=?|&&|\|\||\?\?|\?\.|[-+*/%&|^~!?:]=?|\.\.\./y],
  ['punctuation', /[{}()[\];,.]/y],
];

const json: Rule[] = [
  ['property', /"(?:\\.|[^\\"\n])*"(?=\s*:)/y],
  ['string', /"(?:\\.|[^\\"\n])*"?/y],
  ['literal', words('true false null')],
  ['number', /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y],
  ['punctuation', /[{}[\],:]/y],
];

const bash: Rule[] = [
  ['comment', /(?<![\w$])#[^\n]*/y],
  ['string', /"(?:\\[\s\S]|[^\\"])*"?|'[^']*'?/y],
  ['variable', /\$(?:\{[^}\n]*\}?|[A-Za-z_]\w*|[\d@*#?$!-])/y],
  [
    'keyword',
    words(
      'if then else elif fi for while until do done case esac in function return local export readonly declare unset break continue select time',
    ),
  ],
  ['function', /(?<=^|[\n;|&]\s*|\bsudo\s+)[A-Za-z_][\w.-]*/y],
  ['property', /(?<=\s)--?[A-Za-z][\w-]*/y],
  ['number', /\b\d+\b/y],
  ['operator', /&&|\|\||[|&;<>]=?|[=!]/y],
  ['plain', /[A-Za-z_][\w.-]*/y],
];

const python: Rule[] = [
  ['comment', /#[^\n]*/y],
  [
    'string',
    /[rRbBuUfF]{0,2}(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^\\"\n])*"?|'(?:\\.|[^\\'\n])*'?)/y,
  ],
  [
    'keyword',
    words(
      'and as assert async await break class continue def del elif else except finally for from global if import in is lambda match case nonlocal not or pass raise return try while with yield',
    ),
  ],
  ['literal', words('True False None self cls')],
  [
    'number',
    /\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?j?)\b/y,
  ],
  ['function', /[A-Za-z_]\w*(?=\s*\()/y],
  ['property', /@[A-Za-z_][\w.]*/y],
  ['plain', /[A-Za-z_]\w*/y],
  ['operator', /\*\*=?|\/\/=?|->|:=|[=!<>]=?|[-+*/%&|^~@]=?/y],
  ['punctuation', /[{}()[\];,.:]/y],
];

const languages: Record<string, Rule[]> = {
  js,
  jsx: js,
  mjs: js,
  cjs: js,
  javascript: js,
  ts: js,
  tsx: js,
  mts: js,
  typescript: js,
  json,
  jsonc: json,
  json5: json,
  bash,
  sh: bash,
  shell: bash,
  zsh: bash,
  console: bash,
  py: python,
  python,
};

/** Language names the built-in tokenizer knows, aliases included. */
export const highlightLanguages = Object.keys(languages);

/** Longer input is shown plain: the tokenizer runs on every render of a streaming answer. */
const MAX_LENGTH = 100_000;

/**
 * Split `code` into typed runs for `lang`, or null when the language is not
 * one the built-in tokenizer knows (the caller then shows plain text). The
 * runs always join back to exactly `code`.
 */
export function tokenizeCode(code: string, lang: string | undefined): CodeToken[] | null {
  const rules = languages[(lang ?? '').trim().toLowerCase()];
  if (!rules || code.length > MAX_LENGTH) return null;
  const tokens: CodeToken[] = [];
  const push = (type: CodeTokenType, text: string) => {
    const last = tokens.at(-1);
    if (last && last.type === type) last.text += text;
    else tokens.push({ type, text });
  };
  let i = 0;
  while (i < code.length) {
    let matched = false;
    for (const [type, pattern] of rules) {
      pattern.lastIndex = i;
      const m = pattern.exec(code);
      if (m && m[0].length > 0) {
        push(type, m[0]);
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Whitespace and anything unrecognised, one character at a time.
      push('plain', code[i] ?? '');
      i++;
    }
  }
  return tokens;
}
