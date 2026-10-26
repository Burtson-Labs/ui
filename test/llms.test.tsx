import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { AiAgents } from '../site/src/agents';
import { components } from '../site/src/docs';

const root = join(import.meta.dirname, '..');
const pub = join(root, 'site/public');
const read = (path: string) => readFileSync(join(pub, path), 'utf8');

describe('docs for AI agents', () => {
  // The same script the site build runs; vite copies site/public to the site root.
  beforeAll(() => {
    execFileSync(
      process.execPath,
      ['--experimental-strip-types', '--no-warnings', join(root, 'scripts/llms.mjs')],
      { cwd: root, stdio: 'pipe' },
    );
  });

  it('writes llms.txt with install commands and a link to every component', () => {
    const txt = read('llms.txt');
    expect(txt.startsWith('# Burtson UI\n\n> ')).toBe(true);
    expect(txt).toContain('npm install @burtson-labs/ui @burtson-labs/icons');
    expect(txt).toContain('"@burtson": "https://ui.burtson.ai/r/{name}.json"');
    expect(txt).toContain('https://ui.burtson.ai/llms-full.txt');
    expect(txt).toContain('https://ui.burtson.ai/docs/ai-agents.md');
    for (const c of components)
      expect(txt).toContain(`[${c.title}](https://ui.burtson.ai/docs/components/${c.name}.md)`);
  });

  it('writes llms-full.txt and one Markdown page per component', () => {
    const full = read('llms-full.txt');
    for (const c of components) {
      expect(full).toContain(`\n## ${c.title}\n`);
      const md = read(`docs/components/${c.name}.md`);
      expect(md.startsWith(`# ${c.title}\n\n> ${c.description}`)).toBe(true);
      expect(md).toContain("from '@burtson-labs/ui';`");
      expect(md).toContain(`npx shadcn@latest add @burtson/${c.name}`);
      expect(md).toContain('## Example\n\n```tsx\n');
    }
    expect(read('docs/components/button.md')).toContain('`variant?`');
    expect(read('docs/components/field.md')).toContain('## When to use');
    expect(read('docs/ai-agents.md')).toContain('name: burtson-ui');
  });

  it('ships an Agent Skill with the frontmatter the skills CLI reads', () => {
    const skill = readFileSync(join(root, 'skills/burtson-ui/SKILL.md'), 'utf8');
    const front = /^---\n([\s\S]*?)\n---\n/.exec(skill)?.[1] ?? '';
    expect(front).toMatch(/^name: burtson-ui$/m);
    const description = /^description: (.+)$/m.exec(front)?.[1] ?? '';
    expect(description.length).toBeGreaterThan(40);
    expect(description.length).toBeLessThanOrEqual(1024);
    expect(skill).toContain('https://ui.burtson.ai/llms.txt');
  });

  it('renders the Use with AI agents page', () => {
    render(<AiAgents />);
    expect(screen.getByRole('heading', { level: 1, name: 'Use with AI agents' })).toBeTruthy();
    for (const name of [
      '1. Add the rules to your project',
      '2. Connect the registry and the shadcn MCP server',
      '3. Install the Agent Skill',
      '4. Ask your agent',
    ])
      expect(screen.getByRole('heading', { level: 2, name })).toBeTruthy();
    const text = document.body.textContent ?? '';
    expect(text).toContain('npx shadcn@latest mcp init --client claude');
    expect(text).toContain('npx skills add burtson-labs/ui');
    expect(text).toContain('name: burtson-ui');
    expect(screen.getAllByRole('link', { name: '/llms.txt' }).length).toBeGreaterThan(0);
  });
});
