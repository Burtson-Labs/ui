import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// Radix measures elements; jsdom has no layout engine.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
if (!('scrollIntoView' in Element.prototype)) {
  Object.assign(Element.prototype, { scrollIntoView: () => undefined });
}
if (!('hasPointerCapture' in Element.prototype)) {
  Object.assign(Element.prototype, { hasPointerCapture: () => false });
}
