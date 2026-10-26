# Changelog

## 0.19.2

- Fix: a DropdownMenu opened with a mouse press closed again at once on pages where an
  ancestor of the button stayed focusable under the modal menu (a `<main tabindex="-1">` that
  holds a live region, as on the burtson.ai console): the browser's own focus change on
  mousedown ran after the page was made inert, landed on that ancestor, and counted as focus
  outside the menu. The press now cancels that default, as the Select trigger already did; the
  menu takes focus itself and returns it to the button on close.
- Fix: a NavigationMenu panel rendered in a viewport closed when the pointer left it even
  though the app had prevented the viewport's `onPointerLeave` (the click-only pattern:
  `preventDefault()` on the trigger's `onPointerMove` and `onPointerLeave` and on the
  viewport's `onPointerLeave`). In a viewport the viewport's edge is now the panel's edge, and
  both leave handlers honour `preventDefault()`.

## 0.19.1

- Fix: Command with `shouldFilter={false}` (the caller filters the rows) could leave the
  highlight on a row that survived a one-step query change (a paste or autofill) instead of
  moving it to the new top result, so Enter opened the wrong row. A search change now
  re-chooses the best row once the caller's rows have registered; a highlight the person moved
  with the keyboard or pointer is left alone.

## 0.19.0

### The kit is its own

- Every remaining component now runs on Burtson Labs' own primitive layer: DropdownMenu,
  ContextMenu, Menubar, Select, Command (and Combobox, ModelPicker, Pagination, DataTable's
  sort menu and ChatHistory through it), NavigationMenu, Tabs, Accordion, Checkbox, CheckboxRow,
  CheckboxCard, RadioGroup, RadioCard, Switch, SwitchRow, InlineSwitch, Toast and Toaster,
  ScrollArea, Avatar, Progress, Separator and Label. The modules (`menu`, `select`, `command`
  - `command-score`, `navigation-menu`, `pointer-intent`, `tabs`, `accordion`, `form-proxy`,
    `checkbox`, `radio-group`, `switch`, `toast`, `scroll-area`, `avatar`, `progress`,
    `separator`, `label`) are written from the ARIA Authoring Practices and the web specs.
    Public names, props, data attributes, refs and the `--radix-*` CSS variable aliases are
    unchanged.
- The vendored Radix Primitives and cmdk ports are deleted, along with `vendor-manifest.json`,
  the Radix and cmdk license files and the `@floating-ui/react-dom`, `aria-hidden` and
  `react-remove-scroll` dependencies. `npm run primitives:check` (replacing `vendor:check`)
  fails on any of them coming back. A consumer of the menu, Select and Command family ships
  about a quarter less JavaScript (183 kB → 139 kB minified); the whole kit 560 kB → 539 kB.
- Menus: rows activate on the pointer's release inside the row, so a submenu that moves under
  a finger still selects; a positioned surface holds still while a pointer is down on it;
  submenus open on hover with a pointer-intent triangle that keeps them open on a diagonal
  path; a caller's own `id` on a trigger or content is what `aria-labelledby`/`aria-controls`
  name.
- Select: item-aligned placement keeps the chosen row over the trigger and above the scroll
  button near the window's edge; a hidden native select carries the value for forms and
  autofill; press-drag-release chooses a row.
- Command: a documented matcher (exact, prefix, word start, substring, fuzzy) with ranked rows
  and groups, `aria-activedescendant`, Alt/Meta/Ctrl bindings and `useCommandState`.
- Checkbox, Switch and RadioGroup submit, validate `required` and reset with their form
  through a native proxy input. Tab lands on the chosen tab or radio item, not the list.
- Toasts stay reachable behind a modal dialog: pressable, focusable with F8, and Escape on a
  focused toast does not close the dialog behind it. The toast list item is a plain list item
  with a separate `role="alert"`/`role="status"` announcer.
- New canonical CSS variables: `--bl-accordion-content-height/width`,
  `--bl-toast-swipe-move-x/y`, `--bl-toast-swipe-end-x/y`,
  `--bl-scroll-area-thumb-width/height`, `--bl-scroll-area-corner-width/height`,
  `--bl-navigation-menu-viewport-width/height`, `--bl-command-list-height`. The `--radix-*`
  names are still set, deprecated, and go in a later major.
- Behaviour that changed on purpose: ScrollArea's viewport is marked
  `data-bl-scroll-area-viewport` (the `data-radix-` name is gone) and a track click pages by
  one viewport; `aria-required` is omitted when false; a RadioGroupItem `checked` prop is
  ignored in favour of the group's value; an Avatar with no `src` reports `error` at once;
  cmdk's `Command.Dialog` and the internal `SelectBubbleInput`/`SelectProvider` exports are
  gone.

## 0.18.2

- Fix: a Dialog that had a vendored Select or menu open inside it, and then an AlertDialog
  on top, stayed hidden from assistive technology after the alert closed (`aria-hidden`
  left on the dialog). The kit's hide-others no longer treats an `aria-hidden` the other
  overlay stack set as the value to restore.

## 0.18.1

- Fix: a modal Dialog opened from a DropdownMenu, ContextMenu or Menubar item closed the
  instant it opened, because the closing menu handing focus back to its trigger read as
  focus leaving the dialog. A modal dialog now ignores focus moving outside (its focus scope
  pulls it back), as before 0.18.0.
- Fix: after such a dialog closed, the page could ignore every click. While menus still run on
  the vendored layer, the two overlay stacks each restored `body { pointer-events }`; ours no
  longer puts back a `none` the other stack set.

## 0.18.0

### Our own primitives (phase 1)

- Popover, HoverCard, Tooltip, Dialog, AlertDialog, Sheet, Collapsible, Tour and every
  `asChild` now run on Burtson Labs' own primitive layer in `src/primitives`: dismissable
  layers, focus scope, a positioning engine, presence, scroll lock, hiding the page behind a
  modal, collections and roving focus, written from the ARIA Authoring Practices and the web
  specs rather than ported from Radix. Public names, props, data attributes and refs are
  unchanged. An app shipping the overlay family sends about half the JavaScript it did.
- Canonical CSS variables for positioned surfaces: `--bl-anchor-width/height`,
  `--bl-available-width/height`, `--bl-transform-origin`, plus
  `--bl-collapsible-content-height/width` and `--bl-scrollbar-gutter`. The `--radix-*` names
  are still set, deprecated, and go in a later major.
- Behaviour that changed on purpose: a modal closed by a press on its overlay returns focus to
  its trigger after the browser's own focus change; the page behind a modal is `inert` as well
  as `aria-hidden`, except live regions and the Toaster; Dialog only references a Title or
  Description that exists and no longer logs development warnings; an outside press closes a
  popover and the dialog it was opened from in one press.
- Copy-source users get the primitives as `primitive-<module>` registry items; a new
  "Primitives" docs page explains the layer. The vendored Radix popover, tooltip and
  alert-dialog ports are removed; the remaining ports move in phase 2 (see VENDORING.md).

### Dates and times

- Calendar: `numberOfMonths` (1–3) shows months side by side with one pair of month buttons;
  the keyboard and range selection cross months; each month keeps six rows.
- DatePicker / DateRangePicker: `labels` for the placeholder, the popover name and the month
  buttons; the popover now has an accessible name; `clearable` adds a Clear button that sets
  the value back to null. DateRangePicker submits `{name}From`/`{name}To` (or
  `startName`/`endName`) as YYYY-MM-DD, shows two months from `lg` up and one below, and both
  pickers take `numberOfMonths`. Outside-month days meet 4.5:1.
- New TimePicker: hours, minutes, optional seconds and AM/PM as spinbuttons in the locale's
  order and clock (`hourCycle` overrides), typing and arrows per segment, `step`, `min`/`max`,
  an optional `slots` list, and `name` submitting `HH:mm[:ss]`.
- New DateTimePicker: DatePicker and TimePicker in one labelled group with a local `Date`
  value; submits `YYYY-MM-DDTHH:mm`; `min`/`max` bound the time on the boundary days.
- New helpers: `toISODate`, `parseTime`, `formatTime`, `localeHourCycle`.

### For AI agents

- `/llms.txt`, `/llms-full.txt` and `/docs/components/<name>.md` are generated with the docs;
  every component page has "Copy as Markdown" and "View as Markdown".
- New "Use with AI agents" guide: rules to paste into CLAUDE.md or AGENTS.md, the `@burtson`
  registry namespace for the shadcn CLI and MCP server, and example prompts. The `burtson-ui`
  Agent Skill ships in the package under `skills/` (`npx skills add burtson-labs/ui`).
- Registry items carry their description and a docs link, so `shadcn search` shows them.
- `AGENTS.md` and `CLAUDE.md` describe the repository for agents working on it.

### Fixes

- Menubar sizes to its triggers; a fixed 32px height clipped them and a horizontally
  scrollable bar grew a vertical scrollbar.

## 0.17.0

### New components

- **Toggle** and **ToggleGroup**: `type="single"` is a radio group whose arrows move and
  choose; `type="multiple"` is pressed buttons. One Tab stop, arrows, Home and End, RTL,
  `orientation` and `loop`. 44px on touch screens.
- **HoverCard** for link and citation previews: opens after a delay on hover or keyboard
  focus (not touch), stays open while the pointer or focus is inside, closes on Escape.
- **InputOTP**: one real input with `autocomplete="one-time-code"`, paste that strips
  separators, `pattern` tested one character at a time, `groupSize` and `onComplete`.
- **Calendar**, **DatePicker** and **DateRangePicker** with no date library: Intl month and
  weekday names, locale week start, `min`/`max`/disabled days, the full WAI-ARIA date grid
  keyboard. DatePicker can submit `YYYY-MM-DD` through `name`.
- **ModelPicker**: searchable model selector grouped by provider, with context size,
  capability badges and disabled models that say why. Fits Composer `actions`.
- **ResponseVersions** ("2 / 3" between regenerated responses, announced politely) and a
  `versions` prop on MessageActions.
- **MessageUsage**: input/output tokens, currency cost and duration for a message footer.
- **ImageLightbox** and **ImageGallery**: dialog viewer with required alt text,
  previous/next and focus returned to the opener. MessageAttachments takes `lightbox`.
- **ArtifactPanel**: a generated artifact in a resizable panel beside the conversation,
  a sheet below `lg`.
- CodeBlock and Markdown highlight code through a pluggable `highlight` prop (bring shiki
  or Prism), with a small built-in tokenizer for js/ts/json/bash/python that renders only
  escaped text. CodeBlock takes `copyLabel`.

### Accessibility and translation

- `themeInitScript()`, `themeInitScriptHash()` and a static
  `@burtson-labs/ui/theme-init.js` apply the saved theme before first paint, so dark mode
  no longer flashes light; they work under a strict CSP. ThemeProvider takes
  `legacyStorageKeys` and moves an old preference to the current key.
- AskUser: shared focus ring, questions described by both description and error,
  `labels` for every string, `headingLevel`.
- ContextUsage announces threshold and compacting changes once per crossing, uses the
  reader's locale (or `locale`), and takes `labels`.
- StreamingIndicator is now LoadingDots with a typing label: one labelled status.
- AgentRun, AgentPlan and AskUser take `headingLevel` (2-6). AgentRun and AgentPlan take
  `labels` for every built-in string.
- Composer takes `maxFileBytes`, `maxFiles` and `onReject`, which reports refused files and
  why (type, size or count).
- ChatLayout's mobile sidebar sheet returns focus to its menu button when it closes.

### Security

- Attachment links, images and voice notes, AttachmentItem previews and AudioPlayer only
  use http(s), blob: and relative URLs (plus `data:image` for images). Anything else
  renders without a link or source, which closes `javascript:` URLs under React 18.
  Attachment links use `rel="noopener noreferrer"`. New `safeLinkHref` and
  `safeImageSrc` exports.
- Releases publish only after CI passes for the same commit, with npm provenance. CI
  installs without lifecycle scripts; Dependabot proposes grouped weekly updates.
- Docs use @burtson-labs/icons 0.9.0.

## 0.16.1

- Composer keeps focus while a message sends: the text box is read-only instead of
  disabled, and focus returns to it when the send or stop button disables or swaps
  under it. New `sendLabel` and `stopLabel` props.
- Conversation takes `streaming`, which sets `aria-busy` on the log so screen readers
  read the finished reply instead of every token.
- AgentRun announces a running state once; the spinner beside it is now decorative.
- MessageActions is a labelled group rather than a toolbar (it has no arrow-key
  navigation) and takes `labels` for translation.
- VoiceRecorder moves focus to the stop button when recording starts and back to the
  microphone when it ends.
- AgentRun, AgentPlan, AskUser, AvatarUpload and ContextUsage forward refs.
- Docs use @burtson-labs/icons 0.8.1, whose paperclip stays legible at 16px. Apps
  pick up the redraw by updating their own icons dependency.
- Clear high-severity audit findings in dev dependencies.

## 0.16.0

- Add AskUser for agent clarification with choices, multiple selections, written answers,
  validation, async submission, duplicate prevention and retry without losing answers.
- Add AgentPlan for plan review and ContextUsage for measured token capacity and compaction requests.
- Add CircularProgress and LoadingDots. Progress now sweeps when indeterminate; Skeleton
  supports pulse, shimmer and static placeholders. Loading indicators respect reduced motion.
- Add ThemeProvider, useTheme and ThemeToggle with system/light/dark modes, persistence and
  cross-tab updates. The docs expose nine presets and a custom accent/radius/density editor
  with light/dark CSS export. Standard controls accept --control-height; --radius now controls
  the full radius scale. Touch targets remain at least 44px.
- Match the Icons site's compact sun/moon button and accessible hover labels.
- Add interactive demos, API and registry entries, and an agent component coverage audit.

## 0.15.0

- AvatarUpload: a source-copy or npm component for choosing, cropping, zooming,
  uploading and removing profile photos. Native position sliders, touch dragging,
  inline validation, async retry and duplicate-save protection; no storage dependency.
- AgentRun: a controlled execution timeline with queued, running, waiting, paused,
  completed, failed and canceled states; runtime-owned pause, resume, cancel and retry.
- ToolCall gains a canceled status. Approval headers wrap long tool names on phones.
- The docs homepage includes an interactive approval flow and workflow collections.
  Package navigation and typography match the icon catalogue, including mobile links.

## 0.14.1

A consistency pass over every component, measured in a browser rather than
eyeballed: each component in each of its states, light and dark, five
accents, comfortable and compact, at 1440 with a mouse and 390 as a phone,
in Chromium and WebKit (the `/matrix` page on the docs site renders it all).
Four form patterns and a stat strip come in from the RWT load-intake app.

- **DataTable cards are opt-in by column** (behaviour change). Rows become
  cards on phones only when a column says where it goes (`card: 'title'`,
  `'subtitle'`, `'aside'`, `'field'`, `'footer'` or `'hidden'`) or
  `cardsBelow` is set; a table with no placements stays a table at every
  width, in a named scroll region that fades on the side with more, pins
  nothing and says "Swipe for more" on touch screens. 0.13.0 turned every
  table into cards below 768px with the first column as the title, which
  suited record lists and not number tables. Migration: a table that relied
  on that default needs `cardsBelow="md"`; `cardsBelow={false}` still works
  and is now the default for a table without placements. New
  `pinFirstColumn` keeps a name column in view while numbers scroll.
- **One focus style per kind of control.** `focusRingClasses` (a 2px
  ring-colour outline, 2px out, solid, following the radius) is now on every
  button, toggle, tab, link, row and scroll region; it replaces a mix of 3px
  halos at 20% opacity, inset shadows and bare outlines that read differently
  from one component to the next and in places did not reach 3:1. Fields
  keep the 0.12.4 border-plus-inset ring (`fieldFocusClasses`); menu, select,
  command, tree and history rows keep their fill. `noOutlineClasses`
  suppresses an outline with `!important` (a host page's unlayered
  `:focus-visible` rule cannot draw a second box) and restores a system
  outline in forced-colors mode, where no ring colour survives. The old
  `outline-hidden!` drew a transparent outline that high-contrast mode showed
  as a rest ring on every field; it is gone.
- **44px on touch screens for every control.** Button carries its own
  `pointer-coarse:min-h-11 min-w-11` (a trigger's `asChild` replaces
  `data-slot`, so the theme rule missed DialogTrigger, DropdownMenuTrigger,
  TooltipTrigger and Collapsible buttons); link-styled buttons stay inline
  and `pointer-coarse:min-h-8` opts a dense one out. Checkbox, RadioGroupItem
  and Switch keep their size and grow an invisible 44px hit area
  (`touchTargetClasses`); tabs and menubar triggers grow to 44px tall
  (`touchTargetRowClasses`); menu, select and command rows, tree and chat
  history rows, tool-call headers, table rows at the default density, a
  Label around a toggle, ToastClose and ToastAction, the Composer textarea,
  the chat history search, the audio waveform, message attachment chips,
  a Badge used as a link, and the Dialog and Sheet close buttons are all 44px
  to a touch. The theme's touch rule moved into `@layer base` with
  `:where()` so any utility beats it.
- **Contrast, measured.** The `input` token (the field border, and now the
  unchecked box, dot and off track of Checkbox, RadioGroup and Switch) is a
  3:1 tone on every surface in both palettes (`#908a95` light, `#68646e`
  dark; it was 1.45:1 and 1.5:1, a hairline). Checked toggles in dark mode
  fill with brand, the ring colour at 4.5:1 on the page, instead of primary
  at 2.8:1. Status badge text is the tone mixed a quarter toward the
  foreground: 6:1 on its tint (was 4.3 to 4.5:1), and inside a terminal Card
  it lightens instead. Placeholders are the full muted foreground (was 80%).
  The Skeleton, Progress rail and Slider rest track are a shade stronger. A
  terminal Card re-points `--foreground`, `--muted-foreground`, `--muted` and
  `--border` at the code palette so text, ghost buttons and rules inside it
  read. Every text pair on the matrix now measures at least 4.5:1 and every
  field and toggle boundary at least 3:1, for all five accents.
- **Elevation, motion and layering tokens.** `shadow.lg` (floating:
  popovers, menus, toasts, the navigation viewport) and `shadow.xl` (modal:
  dialogs, sheets) replace hard-coded shadows; `elevation` gains levels 4 and
  5, and the MUI adapter maps its 25 elevations onto the five. `layer`
  documents the z-index scale: raised 10, chrome 40, overlay 50, toast 100.
  Every `transition-*` utility runs on `--duration-fast` and
  `--ease-standard` unless it says otherwise, and the enter and exit
  animations are built from the `duration` and `easing` tokens (new
  `easing.drawer` for sheets), so one edit retimes everything.
- **API consistency.** `forwardRef` on every component whose root is a DOM
  element, 50 of them newly (DataTable, Tour, Resizable and the Toaster keep
  their shapes), `data-slot` on every part, `data-variant` and `data-size` on Button,
  `data-variant` on Badge, Alert, Card and Toast, `data-status` on Status.
  Combobox and Slider work uncontrolled (`defaultValue`); Combobox takes
  `aria-required` and `width` and forwards its ref to the trigger;
  SelectTrigger takes `width`; Toaster reads an empty server snapshot;
  StatusDot and Status accept `destructive` (`danger` still works);
  ConnectionStatus reports failures as `destructive`. `useMediaQuery`,
  `useNarrowerThan` and `breakpoints` are exported (false on the server, so
  the desktop layout is the fallback) and DataTable uses them. Menu, select
  and command group headings share `menuLabelClasses` (11px, 0.06em). Sheet
  headers keep clear of the close button; Dialog, AlertDialog and Sheet share
  `overlayClasses`. Button's disabled opacity is 50%, like everything else.
- **Field recipe.** `<Field label description error hint optional required>`
  wires the control's `id`, `aria-describedby` (error first), `aria-invalid`
  and `aria-required` for you, including a kit Select's trigger; `group`
  names a set of inputs instead; `span` crosses a `FieldGrid`. `FieldGrid`
  (1 to 4 columns from 640px) puts each field on a three-row subgrid so
  controls in a row share a top edge when a label wraps or one field has
  help; `FieldSet` groups fields under a legend with a rule between sets;
  `useField()` reaches the wiring from a custom control. The composed form
  (`FieldLabel`, `FieldHint`, `FieldDescription`, `FieldError`) is unchanged.
- **New, from RWT load-intake.** Input `width` (`xs` 96px, `sm` 144, `md`
  192, `lg` max 384, `full`; every width is full on phones) and
  `SearchInput`; `NumberInput` (unit inside the field, right-aligned tabular
  figures, numeric keyboard, the box carries border, focus and invalid
  state); `NativeSelect` (the platform picker, drawn like the kit's fields);
  `CheckboxRow`, `RadioCard`, `SwitchRow`, `SwitchList` and `InlineSwitch`;
  `ErrorSummary` (focus moves to it, each entry focuses its field);
  `FormActions` (right-aligned, one shared row on phones, `sticky`);
  `StatStrip` (two to four figures in one card). `fieldWidthClasses` is
  exported for custom fields.
- **Table.** `pinFirstColumn`, `overflowHint`, a fade on the scrolling side,
  the focus outline drawn inside the box (the frame around it clipped an
  offset one), 44px rows at the default density on touch screens.
- **Docs.** Every component page has When to use, Don't, and Accessibility
  and behaviour notes (`site/src/usage.ts`); four new pages; the pager no
  longer widens phone pages; Inter is bundled with the site; the CSP allows
  the audio demos' blob URLs. `/matrix` renders every component in every
  state for review.
- **CI.** A Playwright smoke (`npm run smoke`, Chromium at 1440 with a mouse
  and 390 as a phone, animations off) checks every control's touch target,
  that every control shows keyboard focus, DataTable cards and paging, the
  mobile Dialog and Sheet, Select, Combobox and ⌘K from the keyboard, and
  that no docs or matrix page scrolls sideways. It found fourteen things
  before this release; all are fixed above.
- **Icons.** Peer range `@burtson-labs/icons >=0.5.0`; the MUI page shows
  the per-icon MUI entries (`@burtson-labs/icons/mui/<name>`).

## 0.14.0

Radix Primitives and cmdk are now local TypeScript source in the package
instead of npm dependencies. No component API changes: every export, prop and
class list is the same as 0.13.1.

- **Local primitives**: the 48 Radix packages the components use (from the
  radix-ui 1.6.7 install) and cmdk 1.1.1 live under `src/primitives/vendor/`
  with their MIT notices, pinned versions, npm integrity values and original
  file hashes (`vendor-manifest.json`, `VENDORING.md`). Local changes are
  limited to import paths, license headers, strict TypeScript annotations and
  a `process.env.NODE_ENV` development flag in place of a package export
  condition. `npm run vendor:check` fails on any unrecorded edit.
- **Dependencies**: `radix-ui` and `cmdk` are no longer installed.
  `@floating-ui/react-dom`, `aria-hidden` and `react-remove-scroll` are now
  direct dependencies (pinned to the versions Radix used).
- **Client boundary**: every component and primitive module in `dist` starts
  with `"use client"`. The entry barrel, `cn`, the platform helpers and the
  tokens do not, so a Next.js server component can import from
  `@burtson-labs/ui`, render components and call `cn()`. (0.13.0 could not be
  imported from a server component at all.) Variant helpers such as
  `buttonVariants` live in client modules; call them from client components.
- **API references**: every component page on ui.burtson.ai lists props,
  types, defaults and inherited primitive props for all 71 component modules.
- **Registry**: copied components depend on granular `primitive-*` items that
  install the local primitive source into `lib/burtson-primitives/`, with the
  MIT notices at the top of each copied file.
- **styles.css** (the precompiled stylesheet for apps without Tailwind) now
  contains only the components' classes. It used to pick up utilities from
  the docs site as well (about 9 kB, e.g. `.-mt-4`, `.text-7xl`); an app that
  happened to use one of those stray classes from this file needs its own.
- **Notices**: the package ships `LICENSES/` (Radix, cmdk, shadcn and every
  runtime dependency's license) and `vendor-manifest.json`; the site serves
  `/licenses.txt`.

### Migrating

Nothing to change for code that only imports from `@burtson-labs/ui`. An app
that imported `radix-ui`, `@radix-ui/*` or `cmdk` directly and relied on this
package to install them must add them to its own `dependencies`. Bundle size
is unchanged or slightly smaller (Button, Dialog, Select, Command and
DataTable: 153 kB minified vs 166 kB, excluding React).

## 0.13.1

- **SelectTrigger height**: the size was set through a `data-size` attribute
  variant. An attribute selector outranks a class, so a caller's `h-11`,
  `max-sm:h-11` or `pointer-coarse:h-11` never won: the Pagination page-size
  menu and DataTable's "Sort by" menu stayed 32px and 36px on touch screens
  (0.13.0 said 44px), and an app's own `h-11` triggers rendered 36px. The
  sizes are plain classes now (`h-9`, `h-8` for `sm`); `data-size` is still
  set. (The standalone stylesheet is compiled from every file in the repo,
  which is why this note does not spell out the old class.)
- **DataTable cards**: a link or control inside a `subtitle` or `field` cell
  sat under the title's open-row overlay when `onRowAction` was set, so a
  mailto link in a card could not be tapped (the table lets clicks on a
  control belong to the control). Such controls now sit above the overlay;
  the rest of the field still opens the row.
- **Pagination**: `usePagination` with an empty `pageSizeOptions` never
  reported `hasPages` (`Math.min()` of nothing is `Infinity`); a
  `pageCount` of 0 no longer shows "Page 0 of 0" on phones.

## 0.13.0

Phone layouts for records: DataTable cards, paging with a rows-per-page menu,
compact Steps. Ported from the RWT load-intake app and generalised.

- **DataTable cards**: below `cardsBelow` (`md`, 768px, by default; `sm`,
  `lg`, `xl` or `false`) the rows render as a list of articles, each named by
  its title. Columns choose their place with `card`: `title`, `subtitle`,
  `aside` (a status badge), `field` (a labelled value in a two-column grid),
  `footer` (links or buttons) or `hidden`; with nothing marked, the first
  column is the title and the rest are fields. `cardLabel`, `cardCell` (a
  shorter rendering) and `cardOnly` refine it, and `hideBelow` drops a table
  column below a width. The title is the row's open button and its hit area
  covers the card; the selection checkbox has a 44px target and row actions
  and footer controls keep their own clicks. Select all and a Sort by menu
  move into the toolbar, since the headers are gone. Loading, empty and error
  states have card forms. The layout is chosen with `matchMedia`; without it
  (server render, tests) the table is shown. **Behaviour change**: existing
  DataTables become cards on phones; pass `cardsBelow={false}` to keep the
  table.
- **DataTable paging**: `paginate` (or `{ pageSize, pageSizeOptions,
storageKey }`) pages every row passed in, with a rows-per-page menu, and
  goes back to page 1 when `filter` or `sort` changes. For server paging,
  `pageSize`, `pageSizeOptions`, `onPageSizeChange` and `totalRows` add the
  menu and the "1–25 of 312" summary; `rowNoun` appends "members".
- **DataTable in a grid**: the root is a single `minmax(0, 1fr)` track, so a
  wide table scrolls inside its frame instead of widening a grid or flex
  parent.
- **Pagination**: `pageSize`, `pageSizeOptions` (25, 50, 100) and
  `onPageSizeChange` add a rows-per-page menu; `total` gives a default
  summary. Below 640px it is "Page 2 of 13" between two 44px previous and next
  buttons, with the summary and menu underneath; the new page is announced to
  screen readers. The page-size trigger is 44px tall on touch screens.
- **usePagination** (headless): slices rows, clamps the page, returns to page
  1 when `resetKey` changes (not on the first render, so a link to page 3
  stays there), optionally remembers the size in localStorage
  (`storageKey`), accepts a controlled `page` / `pageSize` for URL sync and a
  `total` for server pages. `paginationProps` spreads onto Pagination. Pure
  helpers: `paginate`, `pageWindow`, `pageCountFor`, `clampPage`,
  `paginationSummary`, `DEFAULT_PAGE_SIZES`.
- **Steps**: below `compactBelow` (`sm` by default for horizontal steps)
  only the current step shows, with "Step 2 of 5" (`formatCounter`) and a
  segmented progress bar, instead of titles squeezed to a few letters.
- **CheckboxCard** and **CheckboxCardGroup** (new): a checkbox with a title
  and a sentence where the whole card, 44px or taller, is the target; one
  focus ring on the card; a fieldset with a legend around them.
- **SheetContent** `showCloseButton={false}` leaves out the corner X when the
  sheet has its own close control (matches DialogContent).
- **DialogContent** `mobile="sheet"`: below 640px the dialog docks to the
  bottom edge, full width, with a grab bar and a slide-up entrance; larger
  screens keep the centred window.
- **Docs and registry**: demos, usage notes and prop tables for each;
  `checkbox-card` is a new registry item.

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
