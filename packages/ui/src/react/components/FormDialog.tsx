import { useEffect, useRef, type FormEvent, type ReactNode } from 'react';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  title: string;
  submitLabel?: string;
  cancelLabel?: string;
  submitting: boolean;
  canSubmit: boolean;
  error?: string | null;
  children: ReactNode;
}

/**
 * Modal scaffold for create-resource forms. Shares the visual shell of
 * ConfirmDialog but takes a form body via children and routes submission
 * through a native `<form>` (so Enter submits and the button is a real
 * type="submit"). Error state is rendered inline above the actions —
 * callers pass the already-localised message.
 */
export default function FormDialog({
  open,
  onClose,
  onSubmit,
  title,
  submitLabel = 'Create',
  cancelLabel = 'Cancel',
  submitting,
  canSubmit,
  error = null,
  children,
}: FormDialogProps) {
  const firstFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !submitting) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (!open) return;
    const input = firstFieldRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      'input, textarea, select',
    );
    input?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (!submitting && e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-200"
        noValidate
      >
        <div className="px-6 pt-6">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <div ref={firstFieldRef} className="mt-4 space-y-4">
            {children}
          </div>
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 break-words">
              {error}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 mt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'inherit' }}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-orange-600 hover:bg-orange-700 text-white"
            style={{ fontFamily: 'inherit' }}
          >
            {submitting ? 'Working…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
