# AGENTS.md

Instructions for AI coding agents working in this repository. People should start with [README.md](README.md).

This is `@burtson-labs/ui`: React components for Burtson Labs products, published to npm and as a shadcn registry. The docs site is [ui.burtson.ai](https://ui.burtson.ai). If you are using the library in another app rather than changing it, read [ui.burtson.ai/docs/ai-agents](https://ui.burtson.ai/docs/ai-agents) or the skill in [`skills/burtson-ui/SKILL.md`](skills/burtson-ui/SKILL.md) instead.

## Layout

| Path                         | What                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/components/<name>.tsx`  | One file per component. Also the registry source, so keep imports relative (`../lib/utils`, `./button`) |
| `src/primitives/vendor/`     | Locally maintained Radix and cmdk source. Pinned; change it only with `npm run vendor:record`           |
| `src/lib/`                   | `cn()`, focus and touch-target classes, media queries, safe URLs                                        |
| `src/tokens.ts`              | Design tokens; `npm run theme` regenerates `theme.css`                                                  |
| `src/mui/`                   | MUI theme adapter (`createBurtsonTheme`)                                                                |
| `site/src/docs.ts`           | The component list: name, title, one-line description                                                   |
| `site/src/usage.ts`          | When to use, when not to, accessibility notes per component                                             |
| `site/src/demos/<name>.tsx`  | The example shown on each page and copied into the Markdown docs                                        |
| `site/src/generated/api/`    | Generated API reference (`npm run api`); never edit by hand                                             |
| `scripts/registry.mjs`       | Writes the shadcn registry to `site/public/r/`                                                          |
| `scripts/llms.mjs`           | Writes `llms.txt`, `llms-full.txt` and `docs/components/<name>.md` to `site/public/`                    |
| `scripts/route-pages.mjs`    | Static HTML per route plus `sitemap.xml`, after the site build                                          |
| `skills/burtson-ui/SKILL.md` | The Agent Skill for people using the library (`npx skills add burtson-labs/ui`)                         |
| `test/`, `e2e/`              | Vitest (jsdom) and Playwright (Chromium at 1440 and 390 touch)                                          |

## Commands

```bash
npm ci
npm run dev        # docs site, http://localhost:5173
npm run check      # everything CI runs: vendor, API reference, typecheck, lint, format, tests, build, site, registry
npm test           # vitest only
npm run site && npm run smoke   # Playwright against the built site
```

`npm run check` must pass before a change is done. If you edit a component's props or doc comments, run `npm run api` and commit the regenerated `site/src/generated/api/` files (`api:check` fails otherwise). Generated output (`dist/`, `site/dist/`, `site/public/r/`, the llms files) is not committed.

## Rules

- Icons come only from `@burtson-labs/icons`, one import per icon (`import Settings from '@burtson-labs/icons/react/settings'`). Never add another icon library.
- Colours come from the tokens (`bg-background`, `text-muted-foreground`, `bg-brand`, `text-destructive`). No hex values or Tailwind palette colours in components or demos.
- Every interactive element is at least 44px on touch screens (`pointer-coarse:min-h-11`, `touchTargetClasses`) and uses `focusRingClasses` or `fieldFocusClasses` for focus.
- Form controls in demos sit in `Field` with a visible label; icon-only buttons have a label.
- No new runtime dependencies. Registry items must install without `@radix-ui/*` or `cmdk` (`npm run registry:check` enforces it).
- Adding a component: `src/components/<name>.tsx` (forwardRef, `data-slot` on every part), export from `src/index.ts`, a demo in `site/src/demos/<name>.tsx`, an entry in `site/src/docs.ts`, notes in `site/src/usage.ts` and a cell in `site/src/matrix.tsx`. The registry and the llms files pick it up on the next build.
- Copy is plain and factual: say what a thing does, no marketing language.
- Do not bump the version or edit `CHANGELOG.md` unless asked; releases are cut by the maintainer.
- Linting and formatting follow [Burtson Labs frontend standards](https://github.com/Burtson-Labs/frontend-standards). Run `npm run format` before committing.
