#!/usr/bin/env node
// Builds dist/: ESM modules (one file per source module, so apps only bundle
// the components they import), .d.ts files, theme.css and the precompiled
// styles.css.
import { spawnSync } from 'node:child_process';
import { copyFileSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { say } from './log.mjs';

import { build } from 'vite';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

rmSync(join(ROOT, 'dist'), { recursive: true, force: true });
run(process.execPath, [
  '--experimental-strip-types',
  '--no-warnings',
  'scripts/theme.mjs',
  '--check',
]);

// Every dependency and peer stays external, including deep imports such as
// @burtson-labs/icons/react/check and @mui/material/styles.
const external = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)];
await build({
  configFile: false,
  logLevel: 'warn',
  root: ROOT,
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    minify: false,
    sourcemap: true,
    target: 'es2022',
    lib: {
      entry: { index: 'src/index.ts', tokens: 'src/tokens.ts', 'mui/index': 'src/mui/index.ts' },
      formats: ['es'],
    },
    rolldownOptions: {
      external: (id) =>
        /^react(-dom)?(\/|$)/.test(id) || external.some((d) => id === d || id.startsWith(`${d}/`)),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        // Keep the client boundary after upstream barrels are tree-shaken.
        // Components and primitives are client modules. The entry barrel,
        // lib helpers, tokens and the MUI adapter stay directive-free so a
        // server component can import the barrel and call cn() or read
        // tokens; the components it re-exports remain client references.
        banner: (chunk) =>
          /\/src\/(?:components|primitives)\//.test(chunk.facadeModuleId ?? '')
            ? '"use client";'
            : '',
      },
    },
  },
});

run(join(ROOT, 'node_modules/.bin/tsc'), ['-p', 'tsconfig.build.json']);
copyFileSync(join(ROOT, 'src/styles/theme.css'), join(ROOT, 'dist/theme.css'));
run(join(ROOT, 'node_modules/.bin/tailwindcss'), [
  '-i',
  'src/styles/standalone.css',
  '-o',
  'dist/styles.css',
  '--minify',
]);
say('built dist/');
