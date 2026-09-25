# Locally maintained primitives

Burtson UI now owns the maintenance of the primitive source in this repository.
The source remains derived from Radix Primitives and cmdk under their original
MIT licenses. This is a vendor port, not an independent reimplementation.

## Baselines

- Burtson UI: `0.13.0`, commit `3931fe6e4982e656c890e1a2afa949c41ff91003`.
- Radix umbrella version previously installed: `1.6.7`.
- Radix release commit used for entry points and auxiliary types:
  `579c5b84e10605c302cc919a191ceffa6d56be5c`.
- Runtime implementation files were recovered from the exact installed packages'
  published source maps. This matters because some source at a release commit
  differs from packages that were not republished at that release.
- cmdk: `1.1.1`, tag source commit
  `fb4ea04e9ec211777fbb39c6104e3c5f2ee107d2`.

`vendor-manifest.json` records per-package versions and npm integrity values,
original file hashes, source origins, and current local hashes. The initial
declared dependency graph contained 49 Radix packages; the reachable source
requires 48. The unused `react-use-rect` package is omitted. There are 107 local
TypeScript source files, including cmdk and a local environment adapter.

## Layout and dependency boundary

- `src/components/`: the public Burtson components and existing APIs.
- `src/primitives/vendor/radix/`: individual primitive modules and utilities.
- `src/primitives/vendor/cmdk/`: command menu and scoring implementation.
- `LICENSES/`: original licenses and generated dependency notices.
- `audit/upstream-exports.json`: runtime export names captured before removal
  of the installed upstream packages.

Components import their specific local primitive directly. There is no
compatibility package that forwards calls to npm Radix. The package manifest,
lockfile, compiled JavaScript, and declarations are checked for external Radix
and cmdk imports.

Floating UI, aria-hidden, and react-remove-scroll remain ordinary declared
dependencies, pinned to their already-installed versions. React, icons,
class-variance-authority, clsx, tailwind-merge and react-resizable-panels remain
part of the existing dependency model. This is not a dependency-free library.

## Client boundary

Upstream Radix marked each package entry `"use client"`. The build restores
that per module: every file under `dist/components/` and `dist/primitives/`
starts with the directive, and `dist/index.js`, `dist/lib/`, `dist/tokens.js`
and `dist/mui/` do not, so server components can import the barrel and call
`cn()`. `npm run vendor:check` enforces this after a build.

## Local changes to upstream source

1. Package imports resolve to local modules; license/origin comments are added.
2. Focus-scope, popover, and slot entry points match the installed published
   runtime exports rather than unreleased exports in the release tree.
3. The `primitive/is-development` package export condition becomes a local
   `process.env.NODE_ENV` flag, with an ambient type so registry consumers do not
   require Node types. Standard application bundlers inline this flag.
4. An unused select compatibility type is exported internally to satisfy
   `noUnusedLocals`. It is not exported from Burtson UI's public entry point.
5. The unused Node-only `Immediate` helper type has a browser-compatible fallback.
6. cmdk receives React 19/strict TypeScript annotations, explicit ref initializers,
   and null handling for absent DOM/map values. Its score algorithm is retained;
   an unused score constant is removed.

Vendored files keep upstream formatting and are excluded only from the local
style linter/formatter. They remain subject to strict TypeScript checking, the
component tests, export-contract tests, and integrity verification. No
`@ts-nocheck` or blanket type-check suppression is used.

## Source registry

Each copied component depends on granular `primitive-*` registry items. Those
items include the required local modules and their dependency closure. Full MIT
notices travel inside copied source files. The registry verifier materializes
all components into an independent tree and strictly typechecks it using only
React/DOM types.

## Updating the local fork

1. Choose exact upstream versions/commits. Review the upstream change and its
   license before copying files; do not refresh from an unpinned branch.
2. Review the dependency closure, conditional exports, and source-map origins.
3. Apply upstream changes while preserving the local adaptations above.
4. Update version/origin/original-hash metadata and the expected export contract
   only when the changed contract is intentional.
5. Review the local diff, then run `npm run vendor:record` to acknowledge hashes.
6. Run `npm run api`, `npm run check`, and `npm run package:check` (requires npm
   network access for independent React 18 and React 19 consumer installations).
7. Exercise dialogs, nested menus, command search, selection, focus restoration,
   and native mobile behavior in real browsers before release.

Vendoring makes security and behavior updates a deliberate maintainer task.
The hash check is a drift detector, not a substitute for review or security work.
