import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import * as ui from '../src/index';
import { burtsonThemeOptions, createBurtsonTheme } from '../src/mui/index';
import { accentTokens, contrast, dark, duration, light } from '../src/tokens';

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
    expect(renderToStaticMarkup(createElement(ui.Button, null, 'Ready'))).toContain(
      'data-slot="button"',
    );
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

  it('takes a config with accent and density', () => {
    const t = createBurtsonTheme({ mode: 'dark', accent: '#2563eb', density: 'compact' });
    expect(t.palette.primary.main).not.toBe(dark.primary);
    expect(t.typography.fontSize).toBe(13);
    expect(t.components?.MuiButton?.defaultProps?.size).toBe('small');
    expect(t.transitions.duration.standard).toBe(duration.standard);
  });

  it('applies overrides after the Burtson options', () => {
    const t = createBurtsonTheme('dark', { palette: { primary: { main: '#000000' } } });
    expect(t.palette.primary.main).toBe('#000000');
    expect(t.palette.background.default).toBe(dark.background);
  });
});

describe('standalone stylesheet', () => {
  // Apps without Tailwind get no preflight, so a plain <button> inside a
  // component (a tab's close button, a checklist row) would keep the
  // browser's grey face and padding unless the scoped reset reaches it.
  it('resets every button inside a component, not only slotted ones', () => {
    const css = readFileSync(join(ROOT, 'src/styles/standalone.css'), 'utf8');
    expect(css).toMatch(/\[data-slot\]\s+button\s*\{[^}]*background-color:\s*transparent/);
    const unslotted = readdirSync(join(ROOT, 'src/components')).filter((f) => {
      const src = readFileSync(join(ROOT, 'src/components', f), 'utf8');
      return /<button\b/.test(src) && !/data-slot=/.test(src);
    });
    // Every file that renders a bare <button> puts it inside a data-slot root.
    expect(unslotted).toEqual([]);
  });
});

describe('accent tokens', () => {
  // Tenants pick a colour; the kit keeps it legible.
  for (const accent of ['#a60ee5', '#2563eb', '#16a34a', '#facc15', '#e11d48', '#06b6d4']) {
    for (const mode of ['light', 'dark'] as const) {
      it(`${accent} in ${mode}: primary fill and brand text reach 4.5:1`, () => {
        const t = accentTokens(accent, mode);
        const bg = mode === 'dark' ? dark.background : light.background;
        expect(contrast(t.primary, t['primary-foreground'])).toBeGreaterThanOrEqual(4.5);
        expect(contrast(t.brand, bg)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(t['brand-soft-foreground'], t['brand-soft'])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
