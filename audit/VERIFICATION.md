# Verification record

Source baseline: Burtson UI `0.13.0`, commit
`3931fe6e4982e656c890e1a2afa949c41ff91003`.
Executed on 2026-09-25 with Node `24.19.0` and TypeScript `6.0.3`.
This is a review candidate; no remote repository, release, or deployment changed.

## Completed

| Check                      | Result                                                                         |
| -------------------------- | ------------------------------------------------------------------------------ |
| Clean lockfile install     | `npm ci --ignore-scripts` passed                                               |
| Original baseline tests    | 260 passed before the port                                                     |
| Complete project gate      | `npm run check` passed                                                         |
| Current test suite         | 311 tests across 11 files passed                                               |
| Strict project TypeScript  | Passed                                                                         |
| ESLint and Prettier        | Passed                                                                         |
| Runtime export contracts   | All 48 local Radix packages and cmdk match captured upstream export names      |
| Nested overlay interaction | Escape closes a menu inside a dialog and restores focus in sequence            |
| API generation             | 71 component modules, 365 exports; freshness check passed                      |
| API reference interaction  | Composer props and lazily loaded inherited props render correctly              |
| Package build              | ESM modules, declarations, theme CSS, standalone CSS produced                  |
| Site build                 | Production assets and 75 route pages produced                                  |
| Source registry            | 71 components, 122 resolved items, 179 copied source files typechecked         |
| Vendor integrity           | 107 source hashes verified; no external Radix/cmdk imports or lockfile entries |
| Packed React 18 consumer   | React 18.3.1: clean installation, strict types, and server rendering passed    |
| Packed React 19 consumer   | React 19.3.0: clean installation, strict types, and server rendering passed    |
| Consumer dependency trees  | Zero external Radix or cmdk packages in either clean consumer                  |
| npm dependency audit       | Zero vulnerabilities reported at the time of execution                         |

The packed-consumer checks install the tarball outside this repository, with
`skipLibCheck: false` and only React/DOM ambient types. They compile representative
Button, Dialog, Composer, Select, Command, and DataTable usage and server-render
Button, Composer, DialogTrigger, and Command. They do not establish compatibility
with every possible React/framework version or server-rendered component state.

## Build warnings and limits

- Rolldown warns about upstream `use client` directives when processing modules.
  The package build explicitly restores that directive through its output banner.
  Generated package entry, public component, and primitive implementation files
  were inspected; the directive is present. The separate tokens entry stays free
  of the client directive. A full Next.js/RSC application was not exercised.
- An upstream `@__NO_SIDE_EFFECTS__` comment on the Primitive constant produces
  an invalid-annotation warning and is ignored by Rolldown. The source was kept
  intact; builds complete successfully. Bundle-size parity is not asserted.
- npm reports an environment-specific `http-proxy` configuration warning.
- jsdom does not prove browser layout, touch behavior, scroll locking, native
  mobile behavior, or assistive-technology compatibility. Real-browser visual
  review and screen-reader/device checks were not completed for this candidate.
- GitHub Actions and Sentinel were not run remotely. The existing CI now also
  checks vendor integrity, generated API freshness, and copied registry source.
- `npm audit` inspects npm dependencies, not the vulnerabilities of copied source.
  The upstream version/commit manifest supports separate maintenance review.

## Reproduce

```sh
npm ci
npm run check
npm run package:check
npm audit --audit-level=high
```

The first two commands run all project checks; the package check additionally
needs npm network access for isolated consumer installations. Runtime export
names are recorded in `upstream-exports.json`; consumer results are recorded in
`packed-consumers.json`. Sanitized command logs are included beside this file.

Before release, preview Dialog, Select, Command, Composer, and DataTable on desktop
and mobile, inspect API tables in both themes, and test nested overlays, focus
restoration, command search, touch scrolling, and screen-reader announcements.
Use `PORT_REVIEW.md` as the reviewing agent's entry point.
