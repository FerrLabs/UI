import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribeToasts, type Toast } from '../lib/toast.js';

// Bottom-right stack, newest at the bottom. Auto-dismiss uses a per-toast
// timer map keyed by id so we can clear individual entries when the user
// swipes/clicks them away without nuking the whole schedule.

const KIND_CLASSES: Record<Toast['kind'], string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  info: 'border-orange-200 bg-orange-50 text-orange-900',
  warn: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

const KIND_ACCENT: Record<Toast['kind'], string> = {
  success: 'bg-emerald-500',
  info: 'bg-orange-500',
  warn: 'bg-amber-500',
  error: 'bg-red-500',
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [dragDx, setDragDx] = useState(0);
  const startX = useRef<number | null>(null);

  const dismiss = useCallback(() => onDismiss(toast.id), [onDismiss, toast.id]);

  const onPointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (startX.current == null) return;
    setDragDx(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (Math.abs(dragDx) > 80) {
      dismiss();
    }
    startX.current = null;
    setDragDx(0);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-80 max-w-[calc(100vw-2rem)] rounded-lg border shadow-lg bg-white overflow-hidden ${KIND_CLASSES[toast.kind]}`}
      style={{
        transform: `translateX(${dragDx}px)`,
        opacity: Math.max(0, 1 - Math.abs(dragDx) / 160),
        transition: startX.current == null ? 'transform 150ms, opacity 150ms' : 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="flex items-start gap-3 p-3">
        <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${KIND_ACCENT[toast.kind]}`} />
        <div className="flex-1 text-sm break-words">{toast.message}</div>
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              dismiss();
            }}
            className="text-xs font-semibold uppercase tracking-wide text-current hover:underline cursor-pointer"
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="shrink-0 text-current opacity-60 hover:opacity-100 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    const unsub = subscribeToasts((t) => {
      setToasts((prev) => [...prev, t]);
      if (t.duration > 0) {
        const handle = setTimeout(() => dismiss(t.id), t.duration);
        timers.current.set(t.id, handle);
      }
    });
    // Local copy so the cleanup below isn't at the mercy of the ref mutating
    // between effect-run and effect-cleanup.
    const currentTimers = timers.current;
    return () => {
      unsub();
      for (const h of currentTimers.values()) clearTimeout(h);
      currentTimers.clear();
    };
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
