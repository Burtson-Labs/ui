import * as React from 'react';

const reactMajor = Number(React.version.split('.')[0]);

/**
 * The ref attached to an element: a prop on React 19, a field on React 18
 * (where reading it as a prop is impossible, and on 19 reading the field
 * logs a deprecation warning).
 */
export function getElementRef<T>(element: React.ReactElement): React.Ref<T> | undefined {
  if (reactMajor >= 19) return (element.props as { ref?: React.Ref<T> }).ref;
  return (element as unknown as { ref?: React.Ref<T> }).ref;
}
