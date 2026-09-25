// Vendored from Radix Primitives (c) 2022 WorkOS, MIT. See vendor/LICENSE.radix.
// Local modification: package imports resolve to the pinned local source.
export type Timeout = ReturnType<typeof setTimeout>;
export type Interval = ReturnType<typeof setInterval>;
// Local type portability: browsers do not declare Node's setImmediate.
export type Immediate = typeof globalThis extends { setImmediate: (...args: never[]) => infer Handle }
  ? Handle
  : ReturnType<typeof setTimeout>;
