---
name: burtson-ui
description: Build React screens with Burtson UI (@burtson-labs/ui), its shadcn registry at ui.burtson.ai and Burtson Icons. Use when a project depends on @burtson-labs/ui or has components copied from ui.burtson.ai/r, or when asked to use Burtson components, tokens or the Burtson Labs design system.
license: MIT
---

# Burtson UI

React components for Burtson Labs products: Tailwind v4 styling, Burtson Labs' own behaviour primitives, icons from `@burtson-labs/icons`. Docs: https://ui.burtson.ai. Index for agents: https://ui.burtson.ai/llms.txt.

## Find the right component

1. Read https://ui.burtson.ai/llms.txt for the component list (one line each).
2. Before using a component you have not used in this project, fetch its page as Markdown: `https://ui.burtson.ai/docs/components/<name>.md` (for example `button.md`, `field.md`, `data-table.md`). It has when to use it, when not to, the props and a working example.
3. Everything in one file: https://ui.burtson.ai/llms-full.txt.

## Install

Check `package.json` first and follow what the project already does.

- Package (stays in step with releases): `npm install @burtson-labs/ui @burtson-labs/icons`, then `import { Button } from '@burtson-labs/ui'`. With Tailwind v4, the app CSS needs `@import '@burtson-labs/ui/theme.css';` and `@source '../node_modules/@burtson-labs/ui/dist';`. Without Tailwind, import `@burtson-labs/ui/styles.css` once.
- Copied source (shadcn registry): `npx shadcn@latest add @burtson/<name>` when `components.json` has `"registries": { "@burtson": "https://ui.burtson.ai/r/{name}.json" }`, or `npx shadcn@latest add https://ui.burtson.ai/r/<name>.json`. Files land in `components/ui/` and are imported from `@/components/ui/<name>`.

Do not mix both styles for the same component in one app.

## Rules

- Icons come only from `@burtson-labs/icons`, one import per icon: `import Settings from '@burtson-labs/icons/react/settings'`. Do not add lucide-react, heroicons or another icon set. Find names at https://icons.burtson.ai/llms.txt.
- Colours come from theme tokens (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-brand`, `text-success`, `text-warning`, `text-destructive`, `bg-surface-muted`). No hex, rgb or Tailwind palette colours (`bg-zinc-900`) in app code. Dark mode is `class="dark"` on `<html>`; tokens switch on their own, so no `dark:` colour variants.
- Forms: wrap each control in `<Field label="..." description="..." error="...">`; it wires the label, help text and `aria-describedby`. Group with `FieldSet`, lay out with `FieldGrid`, put buttons in `FormActions`. Never leave a control without a visible label or an `aria-label`.
- Icon-only buttons need a name: `<IconButton label="Settings">` or `aria-label` on `Button size="icon"`.
- Touch targets are at least 44px on touch screens. Do not force small fixed heights on interactive elements; for a custom control use `touchTargetClasses` or `pointer-coarse:min-h-11`, and `focusRingClasses` for its focus style.
- Copied source must not add runtime dependencies. Keep the imports the registry wrote (`@/lib/utils`, `@/lib/burtson-primitives/...`); do not swap in `@radix-ui/*` or `cmdk`.
- Prefer an existing component or variant over new styling. Check the component's Markdown page for variants before writing classes.

## Check your work

Run the project's typecheck, lint and tests. For UI changes, look at the screen at 390px wide and with the keyboard (Tab, Enter, Escape) before calling it done.
