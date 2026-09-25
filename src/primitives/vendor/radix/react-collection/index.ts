// Vendored from Radix Primitives (c) 2022 WorkOS, MIT. See vendor/LICENSE.radix.
// Local modification: package imports resolve to the pinned local source.
'use client';
export { createCollection } from './collection-legacy';
export type { CollectionProps } from './collection-legacy';

export { createCollection as unstable_createCollection } from './collection';
export type { CollectionProps as unstable_CollectionProps } from './collection';
