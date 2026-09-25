import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const records = new Map();
const missing = [];

function visit(name, from) {
  const req = createRequire(join(from, 'package.json'));
  let path;
  try {
    path = req.resolve(`${name}/package.json`);
  } catch {
    try {
      let dir = dirname(req.resolve(name));
      while (dir !== dirname(dir)) {
        const candidate = join(dir, 'package.json');
        if (existsSync(candidate) && JSON.parse(readFileSync(candidate, 'utf8')).name === name) {
          path = candidate;
          break;
        }
        dir = dirname(dir);
      }
    } catch {
      return; // Optional peers/platform packages may not be installed.
    }
  }
  if (!path) return;
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const key = `${data.name}@${data.version}`;
  if (records.has(key)) return;
  const directory = dirname(path);
  const notices = readdirSync(directory)
    .filter((f) => /^(licen[sc]e|notice|copying)([.-]|$)/i.test(f))
    .sort()
    .map((f) => `${f}\n${readFileSync(join(directory, f), 'utf8')}`);
  if (!notices.length) {
    const override = join(root, 'LICENSES/overrides', data.name.replaceAll('/', '_') + '.txt');
    if (existsSync(override)) notices.push(readFileSync(override, 'utf8'));
    else missing.push({ name: data.name, version: data.version, repository: data.repository });
  }
  records.set(key, `${key} (${data.license ?? 'see license'})\n${notices.join('\n\n')}`);
  for (const dep of Object.keys({ ...data.dependencies, ...data.peerDependencies }))
    visit(dep, directory);
}

for (const name of Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies })) visit(name, root);
if (missing.length) throw new Error('License text missing: ' + JSON.stringify(missing));
const text = [...records.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, text]) => text)
  .join('\n\n====================\n\n');
mkdirSync(join(root, 'LICENSES'), { recursive: true });
writeFileSync(join(root, 'LICENSES/DEPENDENCIES.txt'), text + '\n');
const bundled = [
  'LICENSE',
  'THIRD_PARTY_NOTICES.md',
  'LICENSES/Radix-MIT.txt',
  'LICENSES/cmdk-MIT.txt',
  'LICENSES/shadcn-MIT.txt',
  'LICENSES/DEPENDENCIES.txt',
]
  .map((f) => `${f}\n\n${readFileSync(join(root, f), 'utf8')}`)
  .join('\n\n====================\n\n');
writeFileSync(join(root, 'site/public/licenses.txt'), bundled);
process.stdout.write(`Preserved notices for ${records.size} installed runtime/peer packages.\n`);
