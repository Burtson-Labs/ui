import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The kit's behaviour layer is Burtson Labs' own (src/primitives). Nothing may
// bring Radix, cmdk or the libraries the old vendored ports needed back in:
// not the lockfile, not an import, not a copy under src/primitives/vendor.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const banned =
  /(?:^|\/)node_modules\/(?:@radix-ui\/|radix-ui$|cmdk$|@floating-ui\/|aria-hidden$|react-remove-scroll)/;
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const forbidden = Object.keys(lock.packages).filter((p) => banned.test(p));
if (forbidden.length) throw new Error(`Banned packages in the lockfile: ${forbidden.join(', ')}`);
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
  for (const name of Object.keys(pkg[field] ?? {}))
    if (banned.test(`node_modules/${name}`)) throw new Error(`Banned ${field} entry: ${name}`);
}
if (existsSync(join(root, 'src/primitives/vendor')))
  throw new Error('src/primitives/vendor exists; the kit has no vendored primitives any more');

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(directory, e.name)) : [join(directory, e.name)],
  );
}
let files = 0;
for (const folder of ['src', 'site/src', 'test', 'dist']) {
  if (!existsSync(join(root, folder))) continue;
  for (const file of walk(join(root, folder)).filter((p) => /\.(?:[cm]?js|tsx?|mts)$/.test(p))) {
    files++;
    const source = readFileSync(file, 'utf8');
    // Shipped code only: tests may quote these names to assert their absence.
    if (
      (folder === 'src' || folder === 'dist') &&
      /(?:from\s*|import\s*\(|require\s*\()\s*['"](?:@radix-ui\/|radix-ui['"]|cmdk['"]|@floating-ui\/|aria-hidden['"]|react-remove-scroll)/.test(
        source,
      )
    )
      throw new Error(`Banned import in ${file}`);
    if (/primitives\/vendor\//.test(source))
      throw new Error(`${file} refers to the removed src/primitives/vendor tree`);
  }
}
// Client boundary: components and primitives are client modules; the entry
// barrel, helpers and tokens stay server-importable (cn() on the server).
if (existsSync(join(root, 'dist/index.js'))) {
  const client = (file) => readFileSync(file, 'utf8').startsWith('"use client";');
  for (const file of walk(join(root, 'dist')).filter((p) => p.endsWith('.js'))) {
    const rel = file.slice(root.length + 1);
    const expected = /^dist\/(?:components|primitives)\//.test(rel);
    if (client(file) !== expected)
      throw new Error(`${rel} ${expected ? 'lacks' : 'must not have'} the "use client" directive`);
  }
}
process.stdout.write(
  `Verified ${files} source files: no Radix, cmdk, Floating UI, aria-hidden or react-remove-scroll in the lockfile, the imports or the tree.\n`,
);
