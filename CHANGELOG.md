# Changelog

## 0.2.0

- Breadcrumb, Collapsible and Command (a cmdk palette, inline or as a ⌘K
  `CommandDialog`), the pieces an app shell needs for navigation and search.
- Collapsible animations in the theme and the registry theme item.
- Sitemap reference removed from robots.txt until there is a sitemap.

## 0.1.0

First release.

- 26 components on Radix primitives: accordion, alert, avatar, badge, button,
  card, checkbox, dialog, dropdown-menu, input, kbd, label, popover, progress,
  radio-group, scroll-area, select, separator, sheet, skeleton, spinner,
  switch, table, tabs, textarea and tooltip. Icons come from
  `@burtson-labs/icons`.
- Design tokens in `src/tokens.ts`, generated into `theme.css` for Tailwind v4
  and exported for JavaScript (`@burtson-labs/ui/tokens`).
- `@burtson-labs/ui/styles.css`, precompiled for apps without Tailwind.
- `@burtson-labs/ui/mui`: `createBurtsonTheme()` for MUI apps.
- A shadcn-compatible registry at `https://ui.burtson.ai/r`.
- Docs site at https://ui.burtson.ai.
