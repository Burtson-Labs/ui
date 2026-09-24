#!/usr/bin/env node
// Writes src/styles/theme.css from src/tokens.ts. Run with --check in CI to
// fail when someone edits one without the other.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fail, say } from './log.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/styles/theme.css');
const { light, dark, radius, fontSans, fontMono } = await import('../src/tokens.ts');

const vars = (palette, indent) =>
  Object.entries(palette)
    .map(([k, v]) => `${indent}--${k}: ${v};`)
    .join('\n');

const css = `/*
 * Burtson UI theme for Tailwind CSS v4. Generated from src/tokens.ts by
 * scripts/theme.mjs; edit the tokens, not this file.
 *
 *   @import 'tailwindcss';
 *   @import '@burtson-labs/ui/theme.css';
 *   @source '../node_modules/@burtson-labs/ui/dist';
 *
 * Light is the default. Put \`class="dark"\` or \`data-theme="dark"\` on <html>
 * (or any subtree) for the dark palette.
 */

@custom-variant dark (&:where(.dark, .dark *, [data-theme='dark'], [data-theme='dark'] *));

:root {
${vars(light, '  ')}
  --radius: ${radius};
  color-scheme: light;
}

.dark,
[data-theme='dark'] {
${vars(dark, '  ')}
  color-scheme: dark;
}

@theme inline {
${Object.keys(light)
  .map((k) => `  --color-${k}: var(--${k});`)
  .join('\n')}
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --font-sans: ${fontSans};
  --font-mono: ${fontMono};
  --animate-in: bl-in 160ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-out: bl-out 120ms ease-in forwards;
  --animate-sheet-in: bl-sheet-in 220ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-sheet-out: bl-sheet-out 160ms ease-in forwards;
  --animate-accordion-down: bl-accordion-down 180ms ease-out;
  --animate-accordion-up: bl-accordion-up 160ms ease-out;
  --animate-collapsible-down: bl-collapsible-down 180ms ease-out;
  --animate-collapsible-up: bl-collapsible-up 160ms ease-out;
}

@keyframes bl-in {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(2px);
  }
}
@keyframes bl-out {
  to {
    opacity: 0;
    transform: scale(0.97);
  }
}
@keyframes bl-sheet-in {
  from {
    transform: translateX(var(--bl-sheet-from, 100%));
  }
}
@keyframes bl-sheet-out {
  to {
    transform: translateX(var(--bl-sheet-from, 100%));
  }
}
@keyframes bl-accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}
@keyframes bl-accordion-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}

@keyframes bl-collapsible-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
}
@keyframes bl-collapsible-up {
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
  }
}

@layer base {
  * {
    border-color: var(--color-border);
  }
  :focus-visible {
    outline-color: var(--color-ring);
  }
}
`;

if (process.argv.includes('--check')) {
  if (readFileSync(OUT, 'utf8') !== css) {
    fail('src/styles/theme.css is stale; run npm run theme');
    process.exit(1);
  }
  say('theme.css matches tokens.ts');
} else {
  writeFileSync(OUT, css);
  say('wrote src/styles/theme.css');
}
