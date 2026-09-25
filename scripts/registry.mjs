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
const { light, dark, radius, shadow, motion, fontSans, fontMono } =
  await import('../src/tokens.ts');
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
      ...Object.fromEntries(Object.entries(motion.animations).map(([k, v]) => [`animate-${k}`, v])),
    },
    light: { ...light, radius: radius.md },
    dark: { ...dark },
  },
  css: Object.fromEntries(
    Object.entries(motion.keyframes).map(([name, frames]) => [`@keyframes ${name}`, frames]),
  ),
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
  if (source.includes("from 'react-resizable-panels'"))
    dependencies.push(version('react-resizable-panels'));
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
