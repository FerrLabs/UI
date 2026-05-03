import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dismissOnBackdrop?: boolean;
  className?: string;
}

const sizeStyles: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  dismissOnBackdrop = true,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent<HTMLDialogElement>) => {
      if (!dismissOnBackdrop) return;
      if (e.target === dialogRef.current) onClose();
    },
    [dismissOnBackdrop, onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={classes(
        'p-0 bg-transparent backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm m-auto rounded-xl',
        'open:animate-[modal-in_160ms_ease-out]',
      )}
    >
      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        className={classes(
          'w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl ring-1 ring-slate-200 overflow-hidden',
          sizeStyles[size],
          className,
        )}
      >
        {(title || description) && (
          <div className="px-6 pt-6 pb-3">
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
        )}
        {children && <div className="px-6 py-3 text-sm text-slate-700">{children}</div>}
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
