#!/usr/bin/env node
// Writes src/styles/theme.css from src/tokens.ts. Run with --check in CI to
// fail when someone edits one without the other.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fail, say } from './log.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/styles/theme.css');
const { light, dark, radius, shadow, motion, duration, easing, fontSans, fontMono } =
  await import('../src/tokens.ts');

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
  --radius: ${radius.md};
${Object.entries(duration)
  .map(([k, v]) => `  --duration-${k}: ${v}ms;`)
  .join('\n')}
${Object.entries(easing)
  .map(([k, v]) => `  --ease-${k}: ${v};`)
  .join('\n')}
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
  /* Controls 8-10px, panels 10-12px, pills only for tags and status. */
  --radius-xs: ${radius.xs};
  --radius-sm: ${radius.sm};
  --radius-md: ${radius.md};
  --radius-lg: ${radius.lg};
  --radius-xl: ${radius.xl};
  /* Borders carry hierarchy; shadows stay quiet except on floating surfaces. */
  --shadow-xs: ${shadow.xs};
  --shadow-sm: ${shadow.sm};
  --shadow-md: ${shadow.md};
  --shadow-focus: ${shadow.focus};
  --font-sans: ${fontSans};
  --font-mono: ${fontMono};
${Object.entries(motion.animations)
  .map(([k, v]) => `  --animate-${k}: ${v};`)
  .join('\n')}
}

${Object.entries(motion.keyframes)
  .map(
    ([name, frames]) =>
      `@keyframes ${name} {\n${Object.entries(frames)
        .map(
          ([at, props]) =>
            `  ${at} {\n${Object.entries(props)
              .map(([k, v]) => `    ${k}: ${v};`)
              .join('\n')}\n  }`,
        )
        .join('\n')}\n}`,
  )
  .join('\n')}

@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 1ms !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }
}

@media (pointer: coarse) {
  [data-slot='button'], [data-slot='icon-button'], [data-slot='combobox-trigger'] {
    min-height: 44px;
    min-width: 44px;
  }
  [data-slot='input'] { min-height: 44px; }
}

/*
 * Default keyboard-focus outline for every component, in the base layer at
 * zero specificity: a component that draws its own focus (inputs' ring, the
 * command palette's field) overrides it with a utility. Unlayered, it beat
 * those utilities and doubled up (a red box inside the command palette).
 */
@layer base {
  :where([data-slot]):focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  @media (forced-colors: active) {
    :where([data-slot]):focus-visible {
      outline: 2px solid Highlight;
    }
  }
}

@layer base {
  * {
    border-color: var(--color-border);
  }
  :focus-visible {
    outline-color: var(--color-ring);
  }
  html,
  body {
    background: var(--color-background);
    color: var(--color-foreground);
  }
  body {
    font-family: var(--font-sans);
  }
  ::selection {
    background: color-mix(in srgb, var(--color-brand) 28%, transparent);
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
