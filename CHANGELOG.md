# Changelog

## 0.8.1

- Fix: the default keyboard-focus outline (0.8.0) sat outside the cascade
  layers, so it beat components' own focus styles: a second box inside the
  command palette's search field and around text inputs. It now lives in the
  base layer at zero specificity.
- `isApplePlatform()`, `modKeyLabel()` and `shortcutLabel('k')`: shortcut
  labels that read ⌘K on Apple devices and Ctrl K elsewhere. The docs search
  button uses it.

## 0.8.0

UX audit and upgrade (Astra; findings in AUDIT.md).

- **Behaviour changes:** Button defaults to `type="button"` (add `type="submit"`
  for form submits) and forwards refs, as do Input and Textarea; disabled or
  loading `asChild` links no longer activate. Toolbar is a labelled `group`
  instead of `toolbar`. Progress honours `max`, clamps, and is indeterminate
  for null. Composer awaits a returned promise, keeps the draft on failure and
  blocks double sends. Tooltip reuses an existing TooltipProvider.
- **Accessibility:** stronger focus outlines, forced-colours support, 44px
  targets on coarse pointers, contrast-paired filled buttons (automated 4.5:1
  checks), indeterminate checkbox mark, bounded dialogs, sheets and popovers.
- **Components:** Combobox naming, `name` and `required`; CopyButton success
  and error callbacks; ToolApproval `busy`; safe tool-output serialisation;
  Pagination and Steps edge cases; Alerts without an icon.
- **Docs site:** ⌘K search, searchable catalog, playground, usage and
  accessibility notes with prop tables, source view, lazy demos, focus moves
  to content on navigation.

## 0.7.0

- Toaster and `toast()`: raise toasts from event handlers and data hooks;
  one mounted `<Toaster />` renders them (success and destructive variants,
  longer duration for errors, a short stack).
- Slider: a single-value range on the native input, filled with the brand
  colour up to the thumb.
- CopyButton: copies a value and confirms with a check; falls back to a
  toast when the browser blocks the clipboard.
- SecretInput: a masked monospace field with a show/hide toggle.

## 0.6.0

Agent chat components.

- `Conversation`: a live message log (`role="log"`, polite announcements) that
  follows streaming replies unless the reader scrolls up, with a jump-to-latest
  button and an empty slot.
- `Message` (`from="user" | "assistant" | "system"`, avatar, name, meta,
  actions) and `Markdown`, a safe renderer for model output: React elements
  only, http(s)/mailto links only, code blocks with copy.
- `ToolCall` (queued/running/done/failed, duration, collapsible arguments and
  result) and `ToolApproval` for gating tools with side effects.
- `Reasoning` ("Thought for 3s", collapsible) and `StreamingIndicator`.
- `Composer` (grows with its text, Enter sends, Shift+Enter for a new line,
  IME-safe, Stop while streaming, attachment and action slots) and
  `Suggestions` prompt chips.

## 0.5.1

Motion. Surfaces now move the way they arrive:

- Popovers, menus, select lists and tooltips slide a few pixels from the side
  they open on; dialogs zoom up slightly; overlays fade; toasts rise from the
  bottom; tab panels fade in; navigation-menu content slides with the pointer.
- Sheets glide in with a drawer ease and gain `top` and `bottom` sides for
  mobile drawers.
- Closing animates and is faster than opening. prefers-reduced-motion still
  turns all motion off.
- Motion lives in `tokens.ts` (`motion.animations`, `motion.keyframes`); the
  theme CSS and the registry theme item are both generated from it.

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
