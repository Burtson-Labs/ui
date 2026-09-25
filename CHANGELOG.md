# Changelog

## 0.12.4

Form controls: one radius scale, one focus ring, no stray borders.

- **Combobox and Command**: the search input inside the popover drew a square,
  offset outline from the popover's top edge to the divider, and the active
  row had a 2px inset brand bar that the row's radius bent into a bracket on
  its left side. Cause: a host page's unlayered `:focus-visible { outline }`
  rule (the docs site had one) outranks the input's layered `outline-hidden`
  utility; the bar was CommandItem's `shadow-[inset_2px_0_0_var(--color-brand)]`.
  Not a 0.12.3 regression. The search row is now the field (icon and
  borderless input, ruled off from the list) and the input's outline is
  suppressed with `!important`; the active row is a fill only, and the chosen
  value keeps its check. A standalone Command with a border turns that border
  the ring colour while its input has keyboard focus. Command groups inset
  rows 4px, so an 8px row sits in the 12px surface like Select's.
- **One field focus ring**: Input, Textarea, SecretInput, Select and Combobox
  triggers, ChatHistory's search and rename fields and the message editor had
  up to three indicators at once (brand border, a 3px halo and a 2px outline
  2px out). Focus is now the border in the ring colour plus a 1px inset ring:
  2px, inside the border box, so it follows the radius and no overflow can
  clip it. Invalid fields keep the destructive colour when focused. The
  Composer box uses the same ring when its textarea has keyboard focus, and
  its textarea no longer draws its own. Exported: `fieldFocusClasses`.
- **Menu, Select and Command rows**: the active row's fill is `secondary`
  (muted was the same colour as the raised surface in dark mode, so the
  highlight disappeared), and the rows' outline is suppressed with
  `!important` so a host focus rule cannot box them.
- **MUI adapter**: OutlinedInput focus is a 2px ring-coloured border without
  the outer halo (red when in error); MenuItem, Select and Autocomplete
  options are 8px-radius rows inset 4px in the 12px surface with the same
  secondary fill; menu and Autocomplete surfaces use the strong border.
- **Docs site**: its global `:focus-visible` outline moved into the base layer
  so it no longer overrides component focus styles.

## 0.12.3

- **Borders in styles.css**: the preflight scoped to `[data-slot]` set
  `border: 0 solid`, which reset border-color to the text colour and outranked
  the kit's own border colour. Parts that draw a border without naming a
  colour (OnboardingChecklist, CardFooter's rule) showed a bright outline in
  apps using `@burtson-labs/ui/styles.css`. The reset now keeps
  `var(--border)`; colour utilities still win.
- **Table**: `scrollLabel` names the scroll container; it becomes a region
  that joins the tab order while its content overflows, so keyboard users can
  scroll it (axe `scrollable-region-focusable`). `containerProps` passes
  `tabIndex`, `aria-*`, a ref or a class to the wrapper. DataTable names its
  scroller from its `aria-label`.

## 0.12.2

- **MUI adapter**: text on `secondary` fills (the brand tone, light in dark
  mode) is now white or the page background, whichever reaches 4.5:1. Chips
  and contained secondary buttons in dark mode had white on light purple.

## 0.12.1

- **Accent tokens**: primary fills keep white text whenever darkening the
  accent reaches 4.5:1 (purples, blues, greens, reds), and switch to dark text
  only for genuinely light accents such as yellow. A light brand tone passed as
  the accent (the kit's own dark-mode purple, for one) had turned every
  contained MUI button's text near-black.

## 0.12.0

Everything a chat app needs, and a recipe that builds one.

- **Composer attachments**: `onAttach(files)` adds a paperclip button, and
  files dropped on the composer or pasted into it arrive the same way, filtered
  by `accept` and `multiple`. The app uploads them and shows their state in an
  AttachmentTray. Send, Stop and the paperclip get 44 px targets on touch
  screens. Also exported: `acceptsFile(file, accept)`.
- **ChatHistory**: the conversation list, grouped into Pinned, Today,
  Yesterday, Previous 7 days and Older, with search, New chat, and a row menu
  for rename (in place), pin and delete. Arrow keys, Home and End move between
  rows; loading, error-with-retry and empty states; a `renderItems` hook for
  windowing long lists. `groupConversations` and `matchesConversation` are
  exported.
- **ChatLayout**: header, resizable history sidebar (a sheet on phones that
  closes when a chat is picked), conversation, optional details column, and a
  Full screen button: the Fullscreen API where allowed, a CSS fallback where
  not, Escape to leave, nothing remounted. `useFullscreen(ref)` is exported.
- **AudioPlayer / VoiceMessage**: play and pause, a waveform that is a slider
  (arrow keys ±5 s, Home, End), speed 1×/1.5×/2×, download and a transcript.
  `computePeaks(blob | url)`, `peaksFromChannelData` and `formatDuration`.
- **VoiceRecorder**: record, pause, discard or stop, with a live level meter
  and a timer; hands back `{ blob, mimeType, durationMs }`. Blocked and
  unsupported microphones get a sentence saying how to fix it.
- **MessageActions, MessageEditor, MessageAttachments**: copy, regenerate,
  edit, a controlled thumbs rating; edit-and-resend in place; voice notes,
  images and files shown inside a message.
- **Recording token**: `recording` and `recording-foreground` (added to the
  tokens in 0.11.0) colour live capture, so recording no longer borrows the
  error colour.
- **Docs**: a "Build a chat app" recipe at /docs/recipes/chat with a running
  demo, a snippet per step and the complete example source.

## 0.11.0

The foundation for product themes built on the kit (Bandit's first).

- **MUI adapter**: `createBurtsonTheme` and `burtsonThemeOptions` take a
  config, `{ mode, accent, density, palette }`, as well as a mode (the old
  form still works). MUI buttons, icon buttons, inputs, cards, dialogs, menus,
  popovers, chips, tabs, switches and tooltips now get the kit's radius per
  role, focus ring and borders; shadows map onto the three-level Burtson
  scale; transitions use the kit's timing; ripples are off; `compact` density
  makes controls small and lists, tables and toolbars dense.
- **Accent tokens**: `accentTokens(accent, mode)` derives primary, brand,
  brand-soft and ring tones from any colour while keeping 4.5:1 for the
  primary fill's text, brand text on the background, and soft chips. Also
  `contrast(a, b)` and `mix(a, b, t)`.
- **Motion and elevation tokens**: `duration` (fast 120 ms, standard 180,
  emphasis 240, exit 140) and `easing` (standard, emphasized, exit), exposed
  in `theme.css` as `--duration-*` and `--ease-*`; `elevation` names the
  shadow levels 0–3.

## 0.10.1

- **Standalone stylesheet**: the scoped reset now covers every `<button>`
  inside a component, not only buttons that carry `data-slot` themselves. In
  apps without Tailwind's preflight (MUI apps), EditorTabs, Tour,
  OnboardingChecklist, Combobox, Composer, Conversation, DataTable and
  MobileNav rendered some buttons with the browser's grey face, border and
  padding.

## 0.10.0

App patterns from the Bandit modernization blueprint.

- **Composer** sends with only attachments: `attachmentCount` above zero makes
  an empty message sendable, and `canSubmit={false}` holds sending (e.g. while
  a file is being read) without disabling typing. IME, duplicate-send and
  draft-on-rejection behaviour are unchanged. (The props first shipped,
  undocumented, in 0.9.1.)
- **AttachmentItem**, **AttachmentTray**, **UploadQueue**: files on their way
  into a message. Queued, uploading, parsing, ready and failed states, progress,
  named remove and retry, failure reasons, polite state announcements, and a
  "2 of 4 ready, 1 failed" summary. Presentation only; the app uploads.
- **SourceCitation**, **SourceList**: numbered [n] markers that open the source
  in a popover, and the list under an answer. Only http(s) URLs become links
  (`safeSourceHref`).
- **ConnectionStatus**, **SyncStatus**, **ConnectionBanner**: host-reported
  connection and sync state. `unknown` never reads as connected; Retry appears
  only when it can help; the banner renders nothing unless there is trouble.
- **MobileNav**: a bottom tab bar with visible labels, 44px+ targets, count or
  dot badges, `aria-current`, and safe-area insets. Destinations come from the
  app.
- **Sheet**: bottom sheets get a grab handle (visual only, `handle` prop) and
  clear the home indicator; top sheets clear the notch; the close button is
  44px on touch screens.
- **DataTable**: a controlled recipe over Table. Sort (asc, desc, none) with
  `aria-sort`, a search box, page-scoped select-all with an indeterminate state,
  pagination, per-row actions, loading, empty and error-with-retry states. Rows
  are one tab stop: arrows, Home/End, Enter runs `onRowAction`, Space selects.
  It never reorders rows itself, so server-side data works.

## 0.9.1

Fixes from adopting the workbench primitives in Bandit Stealth.

- **EditorTabs** drags with pointer events instead of HTML5 drag and drop,
  which desktop webviews such as Tauri intercept. A line marks where the tab
  will land, and the click that ends a drag no longer opens the tab.
- **TreeView** gains `actionOnClick` (one click opens a file),
  `expandOnClick` (plain clicks toggle folders in a multi-select explorer),
  `indentGuides` (ancestor lines on hover) and a per-node `className` for app
  states such as ignored or recently written files.

## 0.9.0

Workbench primitives from the Bandit UX audit (work package 1).

- **Resizable** (`ResizablePanelGroup`, `ResizablePanel`, `ResizeHandle`): split
  panels on react-resizable-panels. Both axes, min/max in px or %, collapse,
  keyboard resizing on a labelled separator, pointer capture so drags over
  iframes and terminals keep tracking. `layout` makes sizes controlled;
  persist from `onLayoutChanged`.
- **TreeView**: a controlled explorer tree with stable ids, one tab stop,
  arrows/Home/End/Right/Left, typeahead that ignores rename inputs, single or
  multiple selection (Shift ranges, Ctrl/⌘ toggles), lazy children with a
  loading row, and focus recovery when the focused row is removed or hidden.
- **EditorTabs**: open-file tabs with unsaved markers, close requests the app
  decides on (never discards), Delete to close, Ctrl+Shift+PageUp/PageDown and
  drag to reorder, middle-click close, overflow scrolling.
- **ContextMenu** and **Menubar** on Radix, sharing DropdownMenu's rows
  (`menuItemClasses` is exported from popover).
- **Tour**, **Spotlight**, **TourAnchor** and **OnboardingChecklist**: an
  opt-in guided tour (Back/Next/Skip/Close, progress, `prepare` hooks with
  cancellation, late or missing targets shown centred or skipped, Escape that
  does not steal from editors, focus restored to the starter) and a
  non-focus-taking contextual hint. Apps own copy, eligibility and
  persistence.
- New dependency: `react-resizable-panels`.

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
