# Changelog

## 0.5.0

- AlertDialog: confirmations for destructive actions (no close button, no
  outside-click dismiss, focus on Cancel, `destructive` action styling).
- Pagination (and `paginationRange`): page controls with a summary slot.
- Combobox: searchable single select, client-filtered or remote via
  `onSearchChange`, with a loading state.
- Steps: progress through a short multi-step flow.
- Repo: the committed `node_modules` symlink is gone and ignored.

## 0.4.0

- NavigationMenu: site navigation with dropdown panels (Radix), for product
  menus and docs sections, on the raised floating surface.
- Toast: brief corner notices with default, success and destructive
  variants, an action button and swipe-to-dismiss (Radix).

## 0.3.0

Burtson design language (vNext). Existing exports and variant names still
work; the look changes.

- Tokens: surface, surface-raised, surface-muted, border-strong, info,
  brand-hover, brand-soft-foreground and code colours; a radius scale
  (xs–xl) and quiet shadow scale. Purple is a signal colour, not a fill.
- Button: brand and soft variants, xs size, a `loading` state. Card: raised,
  subtle, interactive and terminal variants with compact/default/roomy
  density. Badge: info variant. Alert, Tabs, Dialog, Input and Textarea
  restyled to 36px controls and 8–12px radii.
- New patterns: Field, IconButton, Status, StatCard, EmptyState, Toolbar,
  PageHeader and a structural AppShell.
- Table: `density`, `stickyHeader`, selected rows and `numeric` cells.
- Menus, Select, Command, Sheet, Tooltip, Skeleton, form controls and the
  rest restyled to the same surfaces, 32px rows and quieter focus rings.

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
