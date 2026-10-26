import * as React from 'react';

import { useIsoLayoutEffect } from './use-layout-effect';

/**
 * An ordered registry of the items inside a composite widget (a menu's
 * rows, a tab list's tabs, a listbox's options). Items register their node
 * and data while mounted; readers get them in document order, which is what
 * arrow keys, Home, End and typeahead need regardless of render order or
 * portals. The data is whatever the widget needs: a value, a disabled flag,
 * the text to match when typing.
 */
export interface CollectionItem<T> {
  node: HTMLElement;
  data: T;
}

export interface CollectionContextValue<T> {
  register: (node: HTMLElement, data: T) => () => void;
  /** Every registered item in document order. */
  getItems: () => CollectionItem<T>[];
}

export function createCollection<T>(name: string) {
  const Context = React.createContext<CollectionContextValue<T> | null>(null);

  function CollectionProvider({ children }: { children: React.ReactNode }) {
    const items = React.useRef(new Map<HTMLElement, T>());
    const value = React.useMemo<CollectionContextValue<T>>(
      () => ({
        register: (node, data) => {
          items.current.set(node, data);
          return () => {
            items.current.delete(node);
          };
        },
        getItems: () =>
          [...items.current.entries()]
            .map(([node, data]) => ({ node, data }))
            .sort((a, b) =>
              a.node === b.node
                ? 0
                : a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING
                  ? -1
                  : 1,
            ),
      }),
      [],
    );
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useCollection(): CollectionContextValue<T> {
    const context = React.useContext(Context);
    if (!context) throw new Error(`${name} items must be inside their collection provider`);
    return context;
  }

  /** Registers the element in `ref` with `data` while mounted (and whenever `data` changes). */
  function useCollectionItem(ref: React.RefObject<HTMLElement | null>, data: T) {
    const { register } = useCollection();
    useIsoLayoutEffect(() => {
      const node = ref.current;
      if (!node) return;
      return register(node, data);
    }, [register, ref, data]);
  }

  return { CollectionProvider, useCollection, useCollectionItem };
}
