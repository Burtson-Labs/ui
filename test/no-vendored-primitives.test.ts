import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');
const banned = [
  '@radix-ui/',
  'radix-ui',
  'cmdk',
  '@floating-ui/',
  'aria-hidden',
  'react-remove-scroll',
];

describe('the kit is its own', () => {
  it('has no vendored primitives and no primitive-library packages', () => {
    expect(existsSync(join(root, 'src/primitives/vendor'))).toBe(false);
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
      peerDependencies: Record<string, string>;
    };
    const names = [...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)];
    for (const name of names) for (const b of banned) expect(name.startsWith(b)).toBe(false);
    const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8')) as {
      packages: Record<string, unknown>;
    };
    for (const p of Object.keys(lock.packages))
      for (const b of banned) expect(p.includes(`node_modules/${b}`), p).toBe(false);
  });
});
