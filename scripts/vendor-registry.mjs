import { readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';

const comment = (text) => `/*\n${text.replaceAll('*/', '* /').trim()}\n*/\n`;

export function sourceNotice(root) {
  return comment(
    readFileSync(join(root, 'LICENSE'), 'utf8') +
      '\nAdapted portions: shadcn/ui\n' +
      readFileSync(join(root, 'LICENSES/shadcn-MIT.txt'), 'utf8'),
  );
}

/**
 * Registry items for the Burtson-owned primitives in src/primitives (one per
 * module, named `primitive-<module>`). Each item lists the sibling modules it
 * imports as registry dependencies, so a component pulls in exactly the
 * closure it needs. They are published next to the remaining vendored
 * modules under lib/burtson-primitives/, so the relative imports between
 * them keep working in a consumer's tree.
 */
export function ownPrimitiveRegistryItems(root, base) {
  const dir = join(root, 'src/primitives');
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const notice = sourceNotice(root);
  return readdirSync(dir)
    .filter((f) => /\.tsx?$/.test(f))
    .sort()
    .map((file) => {
      const name = basename(file, extname(file));
      const source = readFileSync(join(dir, file), 'utf8');
      const dependencies = new Set();
      const registryDependencies = new Set();
      for (const [, spec] of source.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)) {
        if (spec.startsWith('./')) {
          registryDependencies.add(`${base}/primitive-${spec.slice(2)}.json`);
        } else if (spec.startsWith('.')) {
          throw new Error(`Own primitive ${file} may only import its siblings: ${spec}`);
        } else if (!/^react(?:-dom)?(?:\/|$)/.test(spec)) {
          const dep = spec.startsWith('@')
            ? spec.split('/').slice(0, 2).join('/')
            : spec.split('/')[0];
          if (!pkg.dependencies[dep]) throw new Error(`Undeclared primitive dependency: ${dep}`);
          dependencies.add(`${dep}@${pkg.dependencies[dep]}`);
        }
      }
      const target = `lib/burtson-primitives/${file}`;
      return {
        $schema: 'https://ui.shadcn.com/schema/registry-item.json',
        name: `primitive-${name}`,
        type: 'registry:lib',
        title: `Burtson primitive ${name}`,
        description:
          'A Burtson Labs behaviour primitive (MIT). Installed by the components that use it.',
        dependencies: [...dependencies].sort(),
        registryDependencies: [...registryDependencies].sort(),
        files: [{ path: target, target, type: 'registry:lib', content: notice + source }],
      };
    });
}

/** A separate item per vendored primitive keeps copy-source consumers on the minimum closure. */
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
