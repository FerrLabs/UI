import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

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

const variantBackground: Record<ToastVariant, string> = {
  info: 'var(--color-ink, #1e293b)',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
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
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <style>{`
          @keyframes toast-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        {toasts.map((t) => {
          const variant = t.variant ?? 'info';
          const itemStyle: CSSProperties = {
            pointerEvents: 'auto',
            minWidth: 288,
            maxWidth: 384,
            borderRadius: 10,
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            background: variantBackground[variant],
            color: '#fff',
            animation: 'toast-in 180ms ease-out',
          };

          return (
            <div key={t.id} role={variant === 'error' ? 'alert' : 'status'} style={itemStyle}>
              <span
                aria-hidden
                className="mono"
                style={{
                  fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                  lineHeight: 1,
                  marginTop: 2,
                  opacity: 0.8,
                }}
              >
                {variantIcons[variant]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.25 }}>{t.title}</div>
                )}
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.4,
                    marginTop: t.title ? 2 : 0,
                    opacity: t.title ? 0.9 : 1,
                  }}
                >
                  {t.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  lineHeight: 1,
                  fontSize: 18,
                  padding: 0,
                  transition: 'color 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)')}
              >
                ×
              </button>
            </div>
          );
        })}
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
  useEffect(() => undefined, []);
  return null;
}
