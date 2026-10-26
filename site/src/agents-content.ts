// Text for the "Use with AI agents" page, shared with scripts/llms.mjs so the
// page and the Markdown/llms files say the same thing. Plain strings only:
// Node imports this file with --experimental-strip-types.

export const SITE = 'https://ui.burtson.ai';

/** The block people paste into CLAUDE.md, AGENTS.md or .cursorrules. */
export const projectRules = `## UI: Burtson UI and Burtson Icons

This app uses Burtson UI (\`@burtson-labs/ui\`) and Burtson Icons (\`@burtson-labs/icons\`).

- Component docs for agents: https://ui.burtson.ai/llms.txt. Before using a component for the first time, read https://ui.burtson.ai/docs/components/<name>.md (props, when to use it, an example).
- Icon names: https://icons.burtson.ai/llms.txt (search tags in https://icons.burtson.ai/llms-full.txt).
- Import components from \`@burtson-labs/ui\` (or \`@/components/ui/<name>\` for source copied from the registry). New copied components: \`npx shadcn@latest add @burtson/<name>\` (registry \`https://ui.burtson.ai/r/{name}.json\`).
- Icons only from \`@burtson-labs/icons\`, one import per icon: \`import Settings from '@burtson-labs/icons/react/settings'\`. No other icon libraries.
- Colours only from theme tokens (\`bg-background\`, \`text-foreground\`, \`text-muted-foreground\`, \`border-border\`, \`bg-brand\`, \`text-success\`, \`text-warning\`, \`text-destructive\`). No hex values or Tailwind palette colours. Dark mode is \`class="dark"\` on \`<html>\`.
- Every form control sits in \`<Field label="...">\` (with \`description\` and \`error\` as needed); group with \`FieldSet\`, lay out with \`FieldGrid\`, buttons in \`FormActions\`. Icon-only buttons need \`aria-label\` (or \`IconButton label\`).
- Interactive elements stay at least 44px on touch screens; do not override component heights to make them smaller.
- Copied component source must not add runtime dependencies; keep its \`@/lib/...\` imports and do not swap in \`@radix-ui/*\`.
`;

export const componentsJson = `{
  "registries": {
    "@burtson": "https://ui.burtson.ai/r/{name}.json"
  }
}`;

export const registryCommands = `# add the registry to components.json (or paste the block above)
npx shadcn@latest registry add "@burtson=https://ui.burtson.ai/r/{name}.json"

# copy components into components/ui
npx shadcn@latest add @burtson/button @burtson/field

# browse and inspect
npx shadcn@latest search @burtson -q dialog
npx shadcn@latest view @burtson/button`;

export const mcpCommands = `# Claude Code: writes .mcp.json
npx shadcn@latest mcp init --client claude

# Cursor: writes .cursor/mcp.json
npx shadcn@latest mcp init --client cursor

# VS Code (Copilot): writes .vscode/mcp.json
npx shadcn@latest mcp init --client vscode

# Codex: prints the block to add to ~/.codex/config.toml
npx shadcn@latest mcp init --client codex`;

export const skillCommands = `# Burtson UI skill (this repo) and Burtson Icons skill
npx skills add burtson-labs/ui
npx skills add burtson-labs/icons

# one agent only, without prompts
npx skills add burtson-labs/ui -a claude-code -y`;

export const prompts: { title: string; prompt: string }[] = [
  {
    title: 'Build a form',
    prompt:
      'Using Burtson UI, build a settings form for an API connection: name, base URL, API key (masked), a timeout in seconds and a save button. Read https://ui.burtson.ai/docs/components/field.md first. Use Field for every control, show a validation error on the URL, and use only theme tokens for colour.',
  },
  {
    title: 'Pick icons',
    prompt:
      'Replace every lucide-react icon in src/ with the closest Burtson Icon. Look names up in https://icons.burtson.ai/llms-full.txt by tag and alias, import each from @burtson-labs/icons/react/<name>, remove lucide-react from package.json, and list any icon you could not match.',
  },
  {
    title: 'Copy and adapt a component',
    prompt:
      'Add the Burtson data table with npx shadcn@latest add @burtson/data-table, then use it for the deployments list on the dashboard page with sorting by date and a status column using the Status component. Do not add new dependencies.',
  },
];
