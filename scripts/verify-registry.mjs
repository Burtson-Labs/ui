// Materialize the public registry into an independent source tree and typecheck it.
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registry = join(root, 'site/public/r');
const cache = join(root, '.verify');
mkdirSync(cache, { recursive: true });
const temp = mkdtempSync(join(cache, 'registry-'));
const index = JSON.parse(readFileSync(join(registry, 'registry.json'), 'utf8'));
const seen = new Set();
const written = new Map();
const roots = index.items.filter((i) => i.type === 'registry:ui').map((i) => i.name);
function materialize(name) {
  if (seen.has(name)) return;
  seen.add(name);
  const item = JSON.parse(readFileSync(join(registry, `${name}.json`), 'utf8'));
  if (item.dependencies?.some((d) => /^(?:@radix-ui\/|radix-ui@|cmdk@)/.test(d)))
    throw new Error(`External Radix/cmdk dependency in ${name}`);
  for (const dep of item.registryDependencies ?? [])
    materialize(new URL(dep).pathname.split('/').at(-1).replace('.json', ''));
  for (const file of item.files ?? []) {
    if (written.has(file.target) && written.get(file.target) !== file.content)
      throw new Error(`Conflicting registry target ${file.target}`);
    if (!file.content.includes('Permission is hereby granted'))
      throw new Error(`Missing license text in ${file.target}`);
    written.set(file.target, file.content);
    const target = join(temp, file.target);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, file.content);
  }
}
try {
  for (const name of roots) materialize(name);
  const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    noUncheckedIndexedAccess: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    skipLibCheck: true,
    noEmit: true,
    types: ['react', 'react-dom'],
    paths: { '@/*': [`${temp}/*`] },
  };
  const program = ts.createProgram(
    [...written.keys()].map((f) => join(temp, f)),
    options,
  );
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length)
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => root,
        getCanonicalFileName: (f) => f,
        getNewLine: () => '\n',
      }),
    );
  process.stdout.write(
    `Registry verified: ${roots.length} components, ${seen.size} resolved items, ${written.size} source files; no external Radix/cmdk.\n`,
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
