import * as React from 'react';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';

/**
 * Imperative toasts: call `toast({ title, description, variant })` from
 * anywhere (event handlers, data hooks) and one mounted `<Toaster />` renders
 * them on the Toast primitives. Mount the Toaster once near the root.
 */
export type ToastVariant = 'default' | 'success' | 'destructive';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before it closes (Radix pauses on hover and focus). */
  duration?: number;
}

interface ToastRecord extends ToastOptions {
  id: number;
  open: boolean;
}

let records: ToastRecord[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function close(id: number) {
  records = records.map((r) => (r.id === id ? { ...r, open: false } : r));
  emit();
  // Leave time for the exit animation before dropping the record.
  setTimeout(() => {
    records = records.filter((r) => r.id !== id);
    emit();
  }, 400);
}

/** Show a brief notice. Returns a function that closes it early. */
function toast(options: ToastOptions | string): () => void {
  const opts = typeof options === 'string' ? { title: options } : options;
  const id = nextId++;
  // Keep the stack short: the oldest go first.
  records = [...records.slice(-3), { ...opts, id, open: true }];
  emit();
  return () => close(id);
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const snapshot = () => records;

function Toaster({ className }: { className?: string }) {
  const list = React.useSyncExternalStore(subscribe, snapshot, snapshot);
  return (
    <ToastProvider swipeDirection="right">
      {list.map((r) => (
        <Toast
          key={r.id}
          open={r.open}
          variant={r.variant}
          duration={r.duration ?? (r.variant === 'destructive' ? 8000 : 4000)}
          onOpenChange={(open) => {
            if (!open) close(r.id);
          }}
        >
          <ToastTitle>{r.title}</ToastTitle>
          {r.description && <ToastDescription>{r.description}</ToastDescription>}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport className={className} />
    </ToastProvider>
  );
}

export { toast, Toaster };
