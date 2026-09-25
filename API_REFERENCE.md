# API reference maintenance

Every component page now includes an API reference with a direct
`#api-reference` link and anchors such as `#api-DialogContent`.

The generator covers all 71 component modules and their 365 exported components,
types, values, and functions. It reads the public TypeScript definitions,
including inherited primitive props. Existing examples, hand-written usage
guidance, and key-prop summaries are retained.

```sh
npm run api        # Regenerate after a public API change
npm run api:check  # Fail if the checked-in reference is stale
```

The UI shows prop types, requiredness, declared defaults, documentation comments,
and callable signatures. An em dash means no default was declared in the public
implementation/type documentation; it does not assert that the underlying
browser or primitive has no fallback behavior.

Inherited HTML/React props are deduplicated into a shared metadata file and
loaded only when expanded. Component metadata is loaded per page. This keeps
the main site entry from eagerly loading the entire API catalog.

TypeScript cannot infer every behavioral guarantee, accessibility requirement,
or application-level default. Keep those explanations in
`site/src/component-details.tsx` and the demos. Do not edit generated JSON by
hand. The source viewer includes the applicable source notices.

Upstream links remain available as attribution. Developers can inspect supported
props on ui.burtson.ai itself without following those links.
