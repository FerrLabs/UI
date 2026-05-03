import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  title?: ReactNode;
  message: ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  info: 'bg-slate-900 text-white border-slate-700',
  success: 'bg-emerald-600 text-white border-emerald-700',
  warning: 'bg-amber-500 text-white border-amber-600',
  error: 'bg-red-600 text-white border-red-700',
};

const variantIcons: Record<ToastVariant, string> = {
  info: '·',
  success: '✓',
  warning: '!',
  error: '×',
};

let counter = 0;
function nextId(): string {
  counter += 1;
  return `toast-${Date.now()}-${counter}`;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = nextId();
      const next: Toast = { id, variant: 'info', duration: 5000, ...toast };
      setToasts((prev) => [...prev, next]);
      if (next.duration && next.duration > 0) {
        setTimeout(() => dismiss(id), next.duration);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.variant === 'error' ? 'alert' : 'status'}
            className={classes(
              'pointer-events-auto min-w-72 max-w-sm rounded-lg shadow-lg border px-4 py-3 flex items-start gap-3 animate-[toast-in_180ms_ease-out]',
              variantStyles[t.variant ?? 'info'],
            )}
          >
            <style>{`
              @keyframes toast-in {
                from { opacity: 0; transform: translateY(8px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <span aria-hidden className="font-mono leading-none mt-0.5 opacity-80">
              {variantIcons[t.variant ?? 'info']}
            </span>
            <div className="flex-1 min-w-0">
              {t.title && <div className="text-sm font-medium leading-tight">{t.title}</div>}
              <div
                className={classes('text-sm leading-snug', Boolean(t.title) && 'mt-0.5 opacity-90')}
              >
                {t.message}
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-white/70 hover:text-white cursor-pointer leading-none text-lg"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside a <ToastProvider>.');
  }
  return ctx;
}

export function ToastViewportSentinel() {
  // No-op — kept for symmetry with libraries that require an explicit viewport.
  useEffect(() => undefined, []);
  return null;
}
