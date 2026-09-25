<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.burtson.ai/logos/burtson-labs-logo-alt.png" />
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.burtson.ai/logos/burtson-labs-logo.png" />
    <img src="https://cdn.burtson.ai/logos/burtson-labs-logo-alt.png" alt="Burtson Labs" width="200" />
  </picture>

# Burtson UI

**React components for Burtson Labs products.**

Used in Bandit Stealth, Sentinel, our cluster tools and client apps. Radix primitives handle focus and keyboard behaviour, Tailwind v4 handles styling, and the icons are [Burtson Icons](https://icons.burtson.ai). No runtime provider. Install the package, or copy a component's source and change it.

[![Docs](https://img.shields.io/badge/docs-ui.burtson.ai-a60ee5)](https://ui.burtson.ai)
[![npm](https://img.shields.io/npm/v/@burtson-labs/ui?logo=npm)](https://www.npmjs.com/package/@burtson-labs/ui)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![CI](https://github.com/Burtson-Labs/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/Burtson-Labs/ui/actions/workflows/ci.yml)

</div>

---

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://icons.burtson.ai/svg-white/package-build.svg"/><img src="https://icons.burtson.ai/svg-black/package-build.svg" align="center" alt=""/></picture> Install

```bash
npm install @burtson-labs/ui @burtson-labs/icons
```

With Tailwind CSS v4, add the theme and let Tailwind see the component classes:

```css
@import 'tailwindcss';
@import '@burtson-labs/ui/theme.css';
@source '../node_modules/@burtson-labs/ui/dist';
```

Without Tailwind (an MUI app, for example), import the precompiled styles once:

```ts
import '@burtson-labs/ui/styles.css';
```

Then:

```tsx
import { Button } from '@burtson-labs/ui';

export const Save = () => <Button>Save</Button>;
```

### Or copy the source

Every component is also a registry item in the [shadcn](https://ui.shadcn.com) registry format. The CLI copies the file into `components/ui`, installs its dependencies and adds the Burtson theme:

```bash
npx shadcn@latest add https://ui.burtson.ai/r/button.json
```

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://icons.burtson.ai/svg-white/panel-grid.svg"/><img src="https://icons.burtson.ai/svg-black/panel-grid.svg" align="center" alt=""/></picture> Components

Accordion · Alert · Alert Dialog · App Shell · Attachment · Avatar · Badge · Breadcrumb · Button · Card · Checkbox · Collapsible · Combobox · Command · Connection Status · Context Menu · Copy Button · Data Table · Dialog · Dropdown Menu · Editor Tabs · Empty State · Field · Icon Button · Input · Kbd · Label · Menubar · Mobile Nav · Navigation Menu · Onboarding Checklist · Page Header · Pagination · Popover · Progress · Radio Group · Reasoning · Resizable · Scroll Area · Secret Input · Select · Separator · Sheet · Skeleton · Slider · Source · Spinner · Stat Card · Status · Steps · Switch · Table · Tabs · Textarea · Toast · Toaster · Toolbar · Tooltip · Tour · Tree View

Live previews and code for each one are at [ui.burtson.ai](https://ui.burtson.ai/docs/components/button).

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://icons.burtson.ai/svg-white/palette.svg"/><img src="https://icons.burtson.ai/svg-black/palette.svg" align="center" alt=""/></picture> Theming

[`src/tokens.ts`](src/tokens.ts) is the single source of colour, radius and type. It generates `theme.css` (the CSS variables, with shadcn names plus `brand`, `brand-soft`, `success` and `warning`), feeds the registry's theme item, and drives the MUI adapter. Light is the default; add `class="dark"` or `data-theme="dark"` to `<html>` for dark.

### MUI apps

Most Burtson Labs apps run MUI today. They can share the palette now and adopt components one screen at a time:

```tsx
import { ThemeProvider } from '@mui/material/styles';
import { createBurtsonTheme } from '@burtson-labs/ui/mui';

<ThemeProvider theme={createBurtsonTheme('dark')}>{app}</ThemeProvider>;

// A product accent and admin density; contrast is kept for any accent.
createBurtsonTheme({ mode: 'dark', accent: '#2563eb', density: 'compact' });
```

`@burtson-labs/ui/tokens` also exports `accentTokens(accent, mode)` for the CSS side, and the motion timing (`duration`, `easing`) and `elevation` levels that `theme.css` exposes as `--duration-*` and `--ease-*`.

## <picture><source media="(prefers-color-scheme: dark)" srcset="https://icons.burtson.ai/svg-white/terminal.svg"/><img src="https://icons.burtson.ai/svg-black/terminal.svg" align="center" alt=""/></picture> Develop

```bash
npm install
npm run dev        # docs site with live components, http://localhost:5173
npm run check      # typecheck, lint, format, tests, package build, site build
```

| Path              | What                                                                             |
| ----------------- | -------------------------------------------------------------------------------- |
| `src/components/` | One file per component; also the registry source                                 |
| `src/tokens.ts`   | Design tokens (edit here, then `npm run theme`)                                  |
| `src/mui/`        | MUI theme adapter                                                                |
| `site/`           | Docs site for [ui.burtson.ai](https://ui.burtson.ai); demos in `site/src/demos/` |
| `scripts/`        | Package build, theme and registry generators, link-preview card                  |

Adding a component: write `src/components/<name>.tsx`, export it from `src/index.ts`, add a demo in `site/src/demos/<name>.tsx` and an entry in `site/src/docs.ts`. The registry picks it up on the next build.

Linting and formatting follow [Burtson Labs frontend standards](https://github.com/Burtson-Labs/frontend-standards). Every push is audited by [Sentinel](https://github.com/Burtson-Labs/sentinel-audit).

## License

[MIT](LICENSE) © Burtson Labs. Inspired by and partly adapted from [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT); see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
