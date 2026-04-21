// Global toast bus. Tiny pub-sub so any call site can emit a toast without
// drilling props or reaching into a context. ToastContainer subscribes and
// renders the stack.
//
// Intentionally dependency-free: an EventTarget under the hood, two maps of
// options, no React state library. The surface stays `toast.success(...)` /
// `toast.error(...)` so migrating call sites later is a one-line swap.

export type ToastKind = 'success' | 'error' | 'warn' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  duration?: number;
  action?: ToastAction;
}

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
  duration: number;
  action?: ToastAction;
}

// Default lifetimes. Success/info are transient; warnings and errors
// linger long enough that a user can read them without feeling rushed.
const DEFAULT_DURATIONS: Record<ToastKind, number> = {
  success: 5000,
  info: 5000,
  warn: 8000,
  error: 8000,
};

const bus = new EventTarget();
let nextId = 1;

function emit(kind: ToastKind, message: string, opts?: ToastOptions) {
  const toast: Toast = {
    id: nextId++,
    kind,
    message,
    duration: opts?.duration ?? DEFAULT_DURATIONS[kind],
    action: opts?.action,
  };
  bus.dispatchEvent(new CustomEvent('toast', { detail: toast }));
}

export const toast = {
  success: (message: string, opts?: ToastOptions) => emit('success', message, opts),
  error: (message: string, opts?: ToastOptions) => emit('error', message, opts),
  warn: (message: string, opts?: ToastOptions) => emit('warn', message, opts),
  info: (message: string, opts?: ToastOptions) => emit('info', message, opts),
};

export function subscribeToasts(handler: (t: Toast) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<Toast>).detail);
  bus.addEventListener('toast', listener);
  return () => bus.removeEventListener('toast', listener);
}
