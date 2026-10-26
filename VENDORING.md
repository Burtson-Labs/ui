# Primitives: what is ours, what is still vendored

Burtson UI's behaviour layer is being replaced with Burtson Labs' own
primitives. This file is the plan and the current state.

## State

- `src/primitives/*.ts(x)`: **Burtson-owned** (MIT, this repository's license).
  Written from the WAI-ARIA Authoring Practices, the DOM and CSS specifications
  and the kit's documented behaviour; nothing in it is derived from Radix,
  cmdk, Floating UI, React Aria, Headless UI, Base UI or Zag. Design notes and
  the reasons behind each behaviour are in
  [src/primitives/README.md](src/primitives/README.md).
- `src/primitives/vendor/`: the remaining Radix Primitives and cmdk ports (MIT,
  their original licenses), pending phase 2.

### Phase 1 (done): foundation and the overlay family

Foundation: `slot`, `compose-refs`, `compose-handlers`, `element-ref`,
`use-controllable-state`, `use-id`, `use-layout-effect`, `use-callback-ref`,
`tabbable`, `presence`, `portal`, `layer`, `focus-trap`, `anchor-geometry`,
`anchor`, `scroll-lock`, `hide-others`, `collection`, `roving-focus`,
`typeahead`.

Components now on it: Popover, HoverCard, Tooltip, Dialog, AlertDialog, Sheet,
Collapsible (and Reasoning, ToolCall), Tour and Spotlight, Combobox and
DatePicker (through Popover), CommandDialog and ImageLightbox (through Dialog),
and every `asChild` through `slot` (Button, Badge, Breadcrumb).

Vendored modules deleted because nothing imports them any more:
`radix/react-popover`, `radix/react-tooltip`, `radix/react-alert-dialog`.

Vendored modules that have a Burtson equivalent but stay on disk because other
vendored modules import them (listed in `vendor-manifest.json` under
`replacedByOwnPrimitives.retainedForVendoredImporters`): `react-dialog` (cmdk),
`react-collapsible` (accordion), `react-slot`, `react-compose-refs`,
`react-presence`, `react-portal`, `react-dismissable-layer`, `react-focus-scope`,
`react-focus-guards`, `react-popper`, `react-arrow`, `react-collection`,
`react-roving-focus`, `react-id`, `react-use-controllable-state`,
`react-use-callback-ref`, `react-use-layout-effect`. `npm run vendor:check`
fails if anything outside `src/primitives/vendor` imports one of them.

### Phase 2 (next): everything else

Menus (dropdown, context, menubar), Select, Command (cmdk), NavigationMenu,
Tabs, Accordion, Checkbox, RadioGroup, Switch, Toast, ScrollArea, Avatar,
Progress, Separator, Label. Each is rewritten on the foundation; the mapping
from each vendored module to the foundation piece it should use is in
[src/primitives/README.md](src/primitives/README.md#for-phase-2). When the
last vendored importer of `@floating-ui/react-dom`, `aria-hidden` and
`react-remove-scroll` goes, those dependencies go with it, and
`src/primitives/vendor`, `vendor-manifest.json`, `LICENSES/Radix-MIT.txt`,
`LICENSES/cmdk-MIT.txt` and `audit/upstream-exports.json` are removed.

## Rules for both phases

- Public component API unchanged: names, props, `asChild`, controlled and
  uncontrolled pairs, positioning props, `data-state` / `data-side` /
  `data-align` / `data-disabled` / `data-highlighted`, ref targets.
- CSS variables: the canonical names are `--bl-anchor-width`,
  `--bl-anchor-height`, `--bl-available-width`, `--bl-available-height`,
  `--bl-transform-origin`, `--bl-collapsible-content-height/width` and
  `--bl-scrollbar-gutter`. The older `--radix-*` names are still set as
  aliases, deprecated, to be removed in a later major.
- Clean room: nothing under `src/primitives/vendor` is read while writing a
  replacement, beyond listing exported names.
- Tests in `test/` with plain assertions; the pure parts (geometry, typeahead,
  movement) tested as functions.

## Vendored baselines (unchanged until removal)

- Burtson UI: `0.13.0`, commit `3931fe6e4982e656c890e1a2afa949c41ff91003`.
- Radix umbrella version previously installed: `1.6.7`.
- Radix release commit used for entry points and auxiliary types:
  `579c5b84e10605c302cc919a191ceffa6d56be5c`.
- Runtime implementation files were recovered from the exact installed packages'
  published source maps.
- cmdk: `1.1.1`, tag source commit `fb4ea04e9ec211777fbb39c6104e3c5f2ee107d2`.

`vendor-manifest.json` records per-package versions and npm integrity values,
original file hashes, source origins, current local hashes, and the replaced
modules.

## Layout and dependency boundary

- `src/components/`: the public Burtson components and existing APIs.
- `src/primitives/`: Burtson's own primitives.
- `src/primitives/vendor/radix/`: remaining vendored primitive modules.
- `src/primitives/vendor/cmdk/`: command menu and scoring implementation.
- `LICENSES/`: original licenses and generated dependency notices.
- `audit/upstream-exports.json`: runtime export names captured before removal
  of the installed upstream packages (used by the export-contract test for
  the modules still vendored).

Components import their specific primitive directly. The package manifest,
lockfile, compiled JavaScript, and declarations are checked for external Radix
and cmdk imports.

## Client boundary

Every file under `dist/components/` and `dist/primitives/` starts with
`"use client"`; `dist/index.js`, `dist/lib/`, `dist/tokens.js` and `dist/mui/`
do not, so server components can import the barrel and call `cn()`.
`npm run vendor:check` enforces this after a build.

## Local changes to the vendored source

1. Package imports resolve to local modules; license/origin comments are added.
2. Focus-scope and slot entry points match the installed published runtime
   exports rather than unreleased exports in the release tree.
3. The `primitive/is-development` package export condition becomes a local
   `process.env.NODE_ENV` flag, with an ambient type so registry consumers do not
   require Node types.
4. An unused select compatibility type is exported internally to satisfy
   `noUnusedLocals`.
5. The unused Node-only `Immediate` helper type has a browser-compatible fallback.
6. cmdk receives React 19/strict TypeScript annotations, explicit ref initializers,
   and null handling for absent DOM/map values.

Vendored files keep upstream formatting and are excluded only from the local
style linter/formatter. They remain subject to strict TypeScript checking, the
component tests, export-contract tests, and integrity verification.

## Source registry

Each copied component depends on granular `primitive-*` registry items: one per
Burtson primitive module (`primitive-popover`, `primitive-layer`, ...) and one
per remaining vendored package (`primitive-react-menu`, ...). Both publish under
`lib/burtson-primitives/`, so the relative imports between them keep working in
a consumer's tree. Full MIT notices travel inside copied source files. The
registry verifier materializes all components into an independent tree and
strictly typechecks it using only React/DOM types.

## Updating what is still vendored

1. Choose exact upstream versions/commits. Review the upstream change and its
   license before copying files; do not refresh from an unpinned branch.
2. Apply upstream changes while preserving the local adaptations above.
3. Update version/origin/original-hash metadata and the expected export contract
   only when the changed contract is intentional.
4. Review the local diff, then run `npm run vendor:record` to acknowledge hashes.
5. Run `npm run api`, `npm run check`, and `npm run package:check`.
6. Exercise dialogs, nested menus, command search, selection, focus restoration,
   and native mobile behavior in real browsers before release.

Better still: replace the module (phase 2) instead of updating it.
