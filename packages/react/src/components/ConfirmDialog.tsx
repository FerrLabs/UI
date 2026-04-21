import { useEffect, useState } from 'react';
import { toast } from '../lib/toast';

type ConfirmStyle = 'primary' | 'danger';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmStyle?: ConfirmStyle;
  error?: string | null;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmStyle = 'primary',
  error = null,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, busy]);

  useEffect(() => {
    if (!open) setBusy(false);
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
      // Inline error messaging on forms stays — this toast only fires on
      // a successful confirmation, so callers that still surface their own
      // banner on failure don't double-announce the result.
      toast.success(`${confirmLabel} succeeded`);
    } finally {
      setBusy(false);
    }
  };

  const confirmClass =
    confirmStyle === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-orange-600 hover:bg-orange-700 text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (!busy && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="px-6 pt-6">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 break-words">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 mt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'inherit' }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${confirmClass}`}
            style={{ fontFamily: 'inherit' }}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
