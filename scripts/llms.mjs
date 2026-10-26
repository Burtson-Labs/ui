#!/usr/bin/env node
// Writes the docs for AI agents and LLM tools into site/public/, so the site
// build copies them to the root of ui.burtson.ai (and `npm run dev` serves them):
//
//   /llms.txt                      index (https://llmstxt.org)
//   /llms-full.txt                 every component in one file
//   /docs/components/<name>.md     one component page as Markdown
//   /docs/ai-agents.md             the "Use with AI agents" guide
//
// Sources are the same ones the HTML pages use: site/src/docs.ts, usage.ts,
// the notes and key-prop tables in component-details.tsx, the generated API
// JSON and the demos. Nothing here is written by hand per component.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { say } from './log.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'site/public');
const SITE = 'https://ui.burtson.ai';
const ICONS = 'https://icons.burtson.ai';

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const { components } = await import('../site/src/docs.ts');
const { usage } = await import('../site/src/usage.ts');
const agents = await import('../site/src/agents-content.ts');
const skill = readFileSync(join(ROOT, 'skills/burtson-ui/SKILL.md'), 'utf8');

/**
 * The guidance notes and key-prop tables are object literals of plain strings
 * in component-details.tsx (a .tsx file Node cannot import). Read them as
 * literals rather than keep a second copy.
 */
function literal(name) {
  const source = readFileSync(join(ROOT, 'site/src/component-details.tsx'), 'utf8');
  const start = source.indexOf(`const ${name}: Record<`);
  if (start < 0) throw new Error(`component-details.tsx has no "const ${name}"`);
  const open = source.indexOf('= {', start) + 2;
  const close = source.indexOf('\n};\n', open);
  if (open < 2 || close < 0) throw new Error(`could not find the end of "const ${name}"`);
  return new Function(`return (${source.slice(open, close + 2)});`)();
}
const guidance = literal('guidance');
const keyProps = literal('api');

const api = (name) =>
  JSON.parse(readFileSync(join(ROOT, 'site/src/generated/api', `${name}.json`), 'utf8'));
const demo = (name) => readFileSync(join(ROOT, 'site/src/demos', `${name}.tsx`), 'utf8').trimEnd();
const oneLine = (t) => t.replace(/\s+/g, ' ').trim();
const bullets = (items) => items.map((i) => `- ${oneLine(i)}`).join('\n');
const fence = (lang, code) => {
  const ticks = code.includes('```') ? '````' : '```';
  return `${ticks}${lang}\n${code}\n${ticks}`;
};

/** One component as Markdown. `level` is the heading level of its title. */
function componentMarkdown(doc, level = 1) {
  const h = (n) => '#'.repeat(level + n);
  const ref = api(doc.name);
  const runtime = ref.exports.filter((e) => e.kind !== 'type');
  const u = usage[doc.name];
  const out = [
    `${h(0)} ${doc.title}`,
    '',
    `> ${doc.description}`,
    '',
    `- Docs: ${SITE}/docs/components/${doc.name}`,
    `- Import: \`import { ${runtime.map((e) => e.name).join(', ')} } from '@burtson-labs/ui';\``,
    `- Copy the source: \`npx shadcn@latest add @burtson/${doc.name}\` (or \`npx shadcn@latest add ${SITE}/r/${doc.name}.json\`), then import from \`@/components/ui/${doc.name}\``,
    `- Source: https://github.com/Burtson-Labs/ui/blob/main/${ref.source}`,
  ];
  if (doc.radix) out.push(`- Primitive: adapted from Radix ${doc.radix}, maintained locally`);
  if (u) {
    out.push('', `${h(1)} When to use`, '', bullets(u.use));
    out.push('', `${h(1)} When not to`, '', bullets(u.avoid));
  }
  const notes = [...(u?.a11y ?? []), ...(guidance[doc.name] ?? [])];
  if (notes.length) out.push('', `${h(1)} Accessibility and behaviour`, '', bullets(notes));
  if (keyProps[doc.name]) {
    out.push('', `${h(1)} Key props`, '');
    for (const [prop, type, def] of keyProps[doc.name])
      out.push(`- \`${prop}\`: ${oneLine(type)}${def && def !== '—' ? ` (default ${def})` : ''}`);
  }
  out.push('', `${h(1)} API`);
  for (const e of runtime) {
    out.push('', `${h(2)} ${e.name}${e.kind === 'component' ? '' : ` (${e.kind})`}`);
    if (e.description) out.push('', oneLine(e.description));
    if (e.kind === 'function' && e.signatures?.length)
      out.push('', `\`${e.name}${oneLine(e.signatures[0])}\``);
    if (e.kind === 'value' && e.type) out.push('', `Value: \`${oneLine(e.type).slice(0, 300)}\``);
    const own = (e.props ?? []).filter((p) => !p.native);
    if (own.length) {
      out.push('');
      for (const p of own)
        out.push(
          `- \`${p.name}${p.required ? '' : '?'}\`: \`${oneLine(p.type).replace(/ \| undefined$/, '')}\`` +
            (p.default ? ` (default \`${p.default}\`)` : '') +
            (p.description ? `. ${oneLine(p.description)}` : ''),
        );
    }
    if (e.inherited?.length)
      out.push('', `Also accepts ${e.inherited.length} standard HTML/ARIA props.`);
  }
  out.push('', `${h(1)} Example`, '', fence('tsx', demo(doc.name)));
  return out.join('\n') + '\n';
}

const intro = `Burtson UI (\`@burtson-labs/ui\`, v${pkg.version}, MIT) is a React component library for Burtson Labs products: Tailwind CSS v4 styling, locally maintained Radix primitives (no external Radix package), icons from Burtson Icons (\`@burtson-labs/icons\`). Use it as an npm package, or copy each component's source with the shadcn CLI from the registry at ${SITE}/r.`;

const install = `- Package: \`npm install @burtson-labs/ui @burtson-labs/icons\`, then \`import { Button } from '@burtson-labs/ui'\`.
- Tailwind v4 CSS: \`@import 'tailwindcss'; @import '@burtson-labs/ui/theme.css'; @source '../node_modules/@burtson-labs/ui/dist';\`
- Without Tailwind: \`import '@burtson-labs/ui/styles.css'\` once.
- Registry (copy the source): add \`"registries": { "@burtson": "${SITE}/r/{name}.json" }\` to components.json, then \`npx shadcn@latest add @burtson/button\`. Without the namespace: \`npx shadcn@latest add ${SITE}/r/button.json\`. Index: ${SITE}/r/registry.json.
- MUI apps: \`import { createBurtsonTheme } from '@burtson-labs/ui/mui'\` shares the palette with an MUI ThemeProvider.
- Dark mode: \`class="dark"\` or \`data-theme="dark"\` on \`<html>\`.`;

const llmsTxt = `# Burtson UI

> ${intro}

${install}

## Docs

- [Use with AI agents](${SITE}/docs/ai-agents.md): rules to paste into CLAUDE.md or AGENTS.md, shadcn registry and MCP setup, the Agent Skill, example prompts
- [Installation](${SITE}/docs/installation): package, Tailwind setup, registry
- [Theming](${SITE}/docs/theming): colour, radius, shadow and motion tokens
- [Using with MUI](${SITE}/docs/mui): createBurtsonTheme for MUI apps
- [Build a chat app](${SITE}/docs/recipes/chat): history, attachments, streaming, voice notes
- [All components in one file](${SITE}/llms-full.txt)

## Components

${components.map((c) => `- [${c.title}](${SITE}/docs/components/${c.name}.md): ${c.description}`).join('\n')}

## Optional

- [Burtson Icons for agents](${ICONS}/llms.txt): icon names, tags and import paths
- [Agent Skill](https://github.com/Burtson-Labs/ui/blob/main/skills/burtson-ui/SKILL.md): \`npx skills add burtson-labs/ui\`
- [shadcn registry index](${SITE}/r/registry.json)
- [Source on GitHub](https://github.com/Burtson-Labs/ui)
`;

const rules = `## Rules for agents

${agents.projectRules
  .split('\n')
  .filter((l) => l.startsWith('- '))
  .join('\n')}
`;

const llmsFull = `# Burtson UI

> ${intro}

Docs: ${SITE}. Index: ${SITE}/llms.txt. Each component below is also served alone at ${SITE}/docs/components/<name>.md.

## Install

${install}

${rules}
${components.map((c) => componentMarkdown(c, 2)).join('\n')}`;

const agentsMd = `# Use with AI agents

Set up Claude Code, Cursor, Codex, Copilot or another coding agent to build with Burtson UI and Burtson Icons. Web page: ${SITE}/docs/ai-agents

## Docs agents can read

- ${SITE}/llms.txt: index of every component
- ${SITE}/llms-full.txt: every component in one file
- ${SITE}/docs/components/<name>.md: one component as Markdown
- ${SITE}/r/registry.json: the shadcn registry
- ${ICONS}/llms.txt: Burtson Icons

## 1. Add the rules to your project

Paste into CLAUDE.md, AGENTS.md, .cursorrules (or a file in .cursor/rules/) or .github/copilot-instructions.md:

${fence('md', agents.projectRules.trimEnd())}

## 2. Connect the registry and the shadcn MCP server

components.json:

${fence('json', agents.componentsJson)}

${fence('sh', agents.registryCommands)}

The shadcn MCP server lets the agent browse, search and install registry items. Run in the project root (needs a tsconfig.json; adds shadcn as a dev dependency), then restart the agent:

${fence('sh', agents.mcpCommands)}

## 3. Install the Agent Skill

${fence('sh', agents.skillCommands)}

Or save this as .claude/skills/burtson-ui/SKILL.md or .agents/skills/burtson-ui/SKILL.md:

${fence('md', skill.trimEnd())}

## 4. Ask your agent

${agents.prompts.map((p) => `- ${p.title}: "${p.prompt}"`).join('\n')}
`;

const files = new Map([
  ['llms.txt', llmsTxt],
  ['llms-full.txt', llmsFull],
  ['docs/ai-agents.md', agentsMd],
  ...components.map((c) => [`docs/components/${c.name}.md`, componentMarkdown(c)]),
]);

rmSync(join(OUT, 'docs'), { recursive: true, force: true });
for (const [path, content] of files) {
  mkdirSync(dirname(join(OUT, path)), { recursive: true });
  writeFileSync(join(OUT, path), content);
}
say(
  `llms: llms.txt, llms-full.txt (${(llmsFull.length / 1024).toFixed(0)} KB), ${components.length} component .md -> site/public`,
);
