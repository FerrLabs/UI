import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
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
  style?: CSSProperties;
}

const sizeMaxWidth: Record<NonNullable<ModalProps['size']>, number> = {
  sm: 384,
  md: 448,
  lg: 512,
  xl: 672,
};

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
  style,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

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
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      className={className}
      style={{
        padding: 0,
        background: 'transparent',
        margin: 'auto',
        borderRadius: 14,
        border: 'none',
        animation: 'modal-in 160ms ease-out',
        ...style,
      }}
    >
      <style>{`
        dialog::backdrop {
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(2px);
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        style={{
          width: 'calc(100vw - 2rem)',
          maxWidth: sizeMaxWidth[size],
          background: 'var(--color-card, #fff)',
          borderRadius: 14,
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.18)',
          border: '1px solid var(--color-card-rule, rgba(30, 41, 59, 0.10))',
          overflow: 'hidden',
        }}
      >
        {(title || description) && (
          <div style={{ padding: '24px 24px 12px' }}>
            {title && (
              <h2
                id={titleId}
                style={{
                  fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: 'var(--color-ink, #1e293b)',
                  margin: 0,
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id={descriptionId}
                style={{
                  marginTop: 4,
                  marginBottom: 0,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: 'var(--color-ink-3, #64748b)',
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}
        {children && (
          <div
            style={{
              padding: '12px 24px',
              fontSize: 14,
              lineHeight: 1.5,
              color: 'var(--color-ink-2, #475569)',
            }}
          >
            {children}
          </div>
        )}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              background: 'var(--color-paper-2, #f3efe7)',
              borderTop: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
