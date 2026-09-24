#!/usr/bin/env node
// Writes the shadcn-compatible registry to site/public/r/, served at
// https://ui.burtson.ai/r/. Anyone can copy a component's source into their
// app instead of installing the package:
//
//   npx shadcn@latest add https://ui.burtson.ai/r/button.json
//
// Source files are rewritten from this repo's relative imports to the
// `@/lib/utils` and `@/components/ui/*` aliases a shadcn project uses.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { say } from './log.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'site/public/r');
const BASE = process.env.REGISTRY_BASE ?? 'https://ui.burtson.ai/r';
const SCHEMA_ITEM = 'https://ui.shadcn.com/schema/registry-item.json';
const { light, dark, radius, shadow, fontSans, fontMono } = await import('../src/tokens.ts');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const version = (dep) =>
  `${dep}@${(pkg.dependencies[dep] ?? pkg.devDependencies[dep]).replace(/^[\^~]/, '^')}`;
const url = (name) => `${BASE}/${name}.json`;

/** The theme item carries the palette, radius, fonts and animations. */
const theme = {
  $schema: SCHEMA_ITEM,
  name: 'theme',
  type: 'registry:theme',
  title: 'Burtson theme',
  description: 'Burtson Labs palette (light and dark), radius, fonts and motion.',
  cssVars: {
    theme: {
      'font-sans': fontSans,
      'font-mono': fontMono,
      ...Object.fromEntries(
        Object.entries(radius)
          .filter(([k]) => k !== 'full')
          .map(([k, v]) => [`radius-${k}`, v]),
      ),
      ...Object.fromEntries(Object.entries(shadow).map(([k, v]) => [`shadow-${k}`, v])),
      'animate-in': 'bl-in 160ms cubic-bezier(0.16, 1, 0.3, 1)',
      'animate-out': 'bl-out 120ms ease-in forwards',
      'animate-sheet-in': 'bl-sheet-in 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      'animate-sheet-out': 'bl-sheet-out 160ms ease-in forwards',
      'animate-accordion-down': 'bl-accordion-down 180ms ease-out',
      'animate-accordion-up': 'bl-accordion-up 160ms ease-out',
      'animate-collapsible-down': 'bl-collapsible-down 180ms ease-out',
      'animate-collapsible-up': 'bl-collapsible-up 160ms ease-out',
    },
    light: { ...light, radius: radius.md },
    dark: { ...dark },
  },
  css: {
    '@keyframes bl-in': {
      from: { opacity: '0', transform: 'scale(0.97) translateY(2px)' },
    },
    '@keyframes bl-out': { to: { opacity: '0', transform: 'scale(0.97)' } },
    '@keyframes bl-sheet-in': { from: { transform: 'translateX(var(--bl-sheet-from, 100%))' } },
    '@keyframes bl-sheet-out': { to: { transform: 'translateX(var(--bl-sheet-from, 100%))' } },
    '@keyframes bl-accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-accordion-content-height)' },
    },
    '@keyframes bl-collapsible-down': {
      from: { height: '0' },
      to: { height: 'var(--radix-collapsible-content-height)' },
    },
    '@keyframes bl-collapsible-up': {
      from: { height: 'var(--radix-collapsible-content-height)' },
      to: { height: '0' },
    },
    '@keyframes bl-accordion-up': {
      from: { height: 'var(--radix-accordion-content-height)' },
      to: { height: '0' },
    },
  },
};

const utils = {
  $schema: SCHEMA_ITEM,
  name: 'utils',
  type: 'registry:lib',
  title: 'cn()',
  description: 'Class-name helper: clsx plus tailwind-merge.',
  dependencies: [version('clsx'), version('tailwind-merge')],
  registryDependencies: [url('theme')],
  files: [
    {
      path: 'lib/utils.ts',
      type: 'registry:lib',
      target: 'lib/utils.ts',
      content: readFileSync(join(ROOT, 'src/lib/utils.ts'), 'utf8'),
    },
  ],
};

const componentsDir = join(ROOT, 'src/components');
const names = readdirSync(componentsDir)
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => f.slice(0, -4))
  .sort();

const components = names.map((name) => {
  const source = readFileSync(join(componentsDir, `${name}.tsx`), 'utf8');
  const siblings = [...source.matchAll(/from '\.\/([a-z-]+)'/g)].map((m) => m[1]);
  const dependencies = [];
  if (source.includes("from 'radix-ui'")) dependencies.push(version('radix-ui'));
  if (source.includes("from 'cmdk'")) dependencies.push(version('cmdk'));
  if (source.includes('class-variance-authority'))
    dependencies.push(version('class-variance-authority'));
  if (source.includes('@burtson-labs/icons')) dependencies.push(version('@burtson-labs/icons'));
  const content = source
    .replaceAll("from '../lib/utils'", "from '@/lib/utils'")
    .replace(/from '\.\/([a-z-]+)'/g, "from '@/components/ui/$1'");
  return {
    $schema: SCHEMA_ITEM,
    name,
    type: 'registry:ui',
    title: name.replace(/(^|-)([a-z])/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase()),
    dependencies,
    registryDependencies: [url('utils'), ...siblings.map(url)],
    files: [
      {
        path: `components/${name}.tsx`,
        type: 'registry:ui',
        target: `components/ui/${name}.tsx`,
        content,
      },
    ],
  };
});

const items = [theme, utils, ...components];
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const item of items)
  writeFileSync(join(OUT, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
writeFileSync(
  join(OUT, 'registry.json'),
  `${JSON.stringify(
    {
      $schema: 'https://ui.shadcn.com/schema/registry.json',
      name: 'burtson-ui',
      homepage: 'https://ui.burtson.ai',
      items: items.map(({ $schema: _s, files, ...rest }) => ({
        ...rest,
        ...(files ? { files: files.map(({ content: _c, ...f }) => f) } : {}),
      })),
    },
    null,
    2,
  )}\n`,
);
say(`registry: ${items.length} items -> site/public/r`);
