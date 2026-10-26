# Vendoring: history

Burtson UI 0.14.0 replaced its `@radix-ui/*` and `cmdk` dependencies with
locally maintained copies of their source under `src/primitives/vendor`, so the
kit and its registry items installed without them. 0.18.0 moved the overlay
family onto Burtson Labs' own primitive layer; 0.19.0 moved everything else
and deleted the vendored tree, `vendor-manifest.json`, the Radix and cmdk
license files, and the `@floating-ui/react-dom`, `aria-hidden` and
`react-remove-scroll` dependencies the ports had needed.

What the kit runs on now is described in [src/primitives/README.md](src/primitives/README.md).
`npm run primitives:check` (`scripts/verify-primitives.mjs`) fails the build if
any of those packages or a vendored copy ever comes back.
