import { readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const comment = (text) => `/*\n${text.replaceAll('*/', '* /').trim()}\n*/\n`;

export function sourceNotice(root) {
  return comment(
    readFileSync(join(root, 'LICENSE'), 'utf8') +
      '\nAdapted portions: shadcn/ui\n' +
      readFileSync(join(root, 'LICENSES/shadcn-MIT.txt'), 'utf8'),
  );
}

/** A separate item per primitive keeps copy-source consumers on the minimum closure. */
export function primitiveRegistryItems(root, base) {
  const manifest = JSON.parse(readFileSync(join(root, 'vendor-manifest.json'), 'utf8'));
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const vendor = join(root, 'src/primitives/vendor');
  const keys = [...manifest.packages.map((p) => `radix/${p.package.split('/')[1]}`), 'cmdk'];
  return keys.map((key) => {
    const name = `primitive-${key.replace('radix/', '')}`;
    const dependencies = new Set();
    const registryDependencies = new Set();
    const license = readFileSync(
      join(vendor, key === 'cmdk' ? 'LICENSE.cmdk' : 'LICENSE.radix'),
      'utf8',
    );
    const files = manifest.files
      .filter((f) => f.path.startsWith(`src/primitives/vendor/${key}/`))
      .map((f) => {
        const absolute = join(root, f.path);
        const source = readFileSync(absolute, 'utf8');
        for (const [, spec] of source.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)) {
          if (spec.startsWith('.')) {
            const target = relative(vendor, resolve(dirname(absolute), spec)).replaceAll('\\', '/');
            const depKey = target.startsWith('radix/')
              ? target.split('/').slice(0, 2).join('/')
              : 'cmdk';
            if (depKey !== key)
              registryDependencies.add(`${base}/primitive-${depKey.replace('radix/', '')}.json`);
          } else if (!/^react(?:-dom)?(?:\/|$)/.test(spec)) {
            const dep = spec.startsWith('@')
              ? spec.split('/').slice(0, 2).join('/')
              : spec.split('/')[0];
            if (!pkg.dependencies[dep]) throw new Error(`Undeclared vendor dependency: ${dep}`);
            dependencies.add(`${dep}@${pkg.dependencies[dep]}`);
          }
        }
        const target = `lib/burtson-primitives/${relative(vendor, absolute).replaceAll('\\', '/')}`;
        return { path: target, target, type: 'registry:lib', content: comment(license) + source };
      });
    if (!files.length) throw new Error(`Empty primitive item: ${key}`);
    return {
      $schema: 'https://ui.shadcn.com/schema/registry-item.json',
      name,
      type: 'registry:lib',
      title: `Burtson internal ${key}`,
      description: 'Locally maintained MIT-licensed primitive source. Installed by its component.',
      dependencies: [...dependencies].sort(),
      registryDependencies: [...registryDependencies].sort(),
      files,
    };
  });
}
