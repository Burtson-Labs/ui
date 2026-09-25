import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(root, 'vendor-manifest.json');
const manifest = JSON.parse(readFileSync(path, 'utf8'));
const update = process.argv.includes('--record');
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const forbidden = Object.keys(lock.packages).filter((p) =>
  /(?:^|\/)node_modules\/(?:@radix-ui\/|radix-ui$|cmdk$)/.test(p),
);
if (forbidden.length)
  throw new Error(`External primitive packages in lockfile: ${forbidden.join(', ')}`);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(directory, e.name)) : [join(directory, e.name)],
  );
}
for (const folder of ['src', 'dist']) {
  if (!existsSync(join(root, folder))) continue;
  for (const file of walk(join(root, folder)).filter((p) => /\.(?:[cm]?js|tsx?|mts)$/.test(p))) {
    const source = readFileSync(file, 'utf8');
    if (
      /(?:from\s*|import\s*\(|require\s*\()\s*['"](?:@radix-ui\/|radix-ui['"]|cmdk['"])/.test(
        source,
      )
    )
      throw new Error(`External primitive import: ${file}`);
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
for (const entry of manifest.files) {
  const current = digest(join(root, entry.path));
  if (update) entry.localSha256 = current;
  else if (current !== entry.localSha256)
    throw new Error(
      `Unrecorded vendored edit: ${entry.path}. Review it and run npm run vendor:record.`,
    );
}
const tracked = new Set(manifest.files.map((f) => resolve(root, f.path)));
for (const path of walk(join(root, 'src/primitives/vendor')).filter((f) => /\.tsx?$/.test(f))) {
  if (!tracked.has(path)) throw new Error(`Unrecorded vendor source: ${path}`);
}
if (update) writeFileSync(path, JSON.stringify(manifest, null, 2) + '\n');
process.stdout.write(
  `${update ? 'Recorded' : 'Verified'} ${manifest.files.length} vendor sources; lockfile and imports contain no external Radix/cmdk.\n`,
);
