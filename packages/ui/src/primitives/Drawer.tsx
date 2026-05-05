import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

const sizeWidth: Record<NonNullable<DrawerProps['size']>, number> = {
  sm: 288,
  md: 384,
  lg: 448,
};

export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
  footer,
  size = 'md',
  className,
  style,
}: DrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const positionStyle: CSSProperties =
    side === 'right'
      ? { marginLeft: 'auto', marginRight: 0 }
      : { marginRight: 'auto', marginLeft: 0 };

  const animationName = side === 'right' ? 'drawer-in-right' : 'drawer-in-left';

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className={className}
      style={{
        padding: 0,
        background: 'transparent',
        border: 'none',
        margin: 0,
        maxHeight: '100vh',
        height: '100vh',
        inset: 0,
        animation: `${animationName} 200ms ease-out`,
        ...positionStyle,
        ...style,
      }}
    >
      <style>{`
        dialog::backdrop {
          background: rgba(30, 41, 59, 0.45);
        }
        @keyframes drawer-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes drawer-in-left  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
      <div
        style={{
          height: '100vh',
          width: sizeWidth[size],
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-card, #fff)',
          boxShadow: '0 20px 48px rgba(15, 23, 42, 0.18)',
          borderLeft:
            side === 'right'
              ? '1px solid var(--color-card-rule, rgba(30, 41, 59, 0.10))'
              : undefined,
          borderRight:
            side === 'left'
              ? '1px solid var(--color-card-rule, rgba(30, 41, 59, 0.10))'
              : undefined,
        }}
      >
        {title && (
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.3,
                color: 'var(--color-ink, #1e293b)',
                margin: 0,
              }}
            >
              {title}
            </h2>
          </div>
        )}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--color-ink-2, #475569)',
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: '12px 20px',
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
