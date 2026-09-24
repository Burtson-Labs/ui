import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import * as ui from '../src/index';
import { burtsonThemeOptions, createBurtsonTheme } from '../src/mui/index';
import { dark, light } from '../src/tokens';

const ROOT = join(import.meta.dirname, '..');
const components = readdirSync(join(ROOT, 'src/components'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => f.slice(0, -4));

describe('tokens', () => {
  it('defines the same names in light and dark', () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it('theme.css is generated from tokens.ts', () => {
    const r = spawnSync(
      process.execPath,
      ['--experimental-strip-types', '--no-warnings', 'scripts/theme.mjs', '--check'],
      { cwd: ROOT, encoding: 'utf8' },
    );
    expect(r.stderr).toBe('');
    expect(r.status).toBe(0);
  });
});

describe('index', () => {
  it('exports every component module', () => {
    const index = readFileSync(join(ROOT, 'src/index.ts'), 'utf8');
    for (const name of components) expect(index).toContain(`'./components/${name}'`);
    expect(typeof ui.Button).toBe('function');
  });
});

describe('registry', () => {
  it('publishes every component with shadcn aliases and no relative imports', () => {
    const r = spawnSync(
      process.execPath,
      ['--experimental-strip-types', '--no-warnings', 'scripts/registry.mjs'],
      { cwd: ROOT, encoding: 'utf8', env: { ...process.env, REGISTRY_BASE: 'https://x.test/r' } },
    );
    expect(r.status, r.stderr).toBe(0);
    for (const name of components) {
      const item = JSON.parse(
        readFileSync(join(ROOT, 'site/public/r', `${name}.json`), 'utf8'),
      ) as {
        files: { content: string }[];
        registryDependencies: string[];
        dependencies: string[];
      };
      const content = item.files[0]?.content ?? '';
      expect(content).not.toMatch(/from '\.\.?\//);
      expect(item.registryDependencies).toContain('https://x.test/r/utils.json');
      if (content.includes("from 'radix-ui'"))
        expect(item.dependencies.join()).toContain('radix-ui@');
    }
    spawnSync(
      process.execPath,
      ['--experimental-strip-types', '--no-warnings', 'scripts/registry.mjs'],
      {
        cwd: ROOT,
      },
    );
  });
});

describe('MUI adapter', () => {
  it('maps the palette for both modes', () => {
    expect(createBurtsonTheme('dark').palette.background.default).toBe(dark.background);
    expect(createBurtsonTheme('light').palette.primary.main).toBe(light.primary);
    expect(burtsonThemeOptions('dark').shape?.borderRadius).toBe(10);
  });

  it('applies overrides after the Burtson options', () => {
    const t = createBurtsonTheme('dark', { palette: { primary: { main: '#000000' } } });
    expect(t.palette.primary.main).toBe('#000000');
    expect(t.palette.background.default).toBe(dark.background);
  });
});
