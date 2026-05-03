import { useEffect, useRef, type ReactNode } from 'react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles: Record<NonNullable<DrawerProps['size']>, string> = {
  sm: 'w-72',
  md: 'w-96',
  lg: 'w-[28rem]',
};

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
  footer,
  size = 'md',
  className,
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

  const positionClasses = side === 'right' ? 'ml-auto mr-0' : 'mr-auto ml-0';

  const animation =
    side === 'right'
      ? 'open:animate-[drawer-in-right_200ms_ease-out]'
      : 'open:animate-[drawer-in-left_200ms_ease-out]';

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className={classes(
        'p-0 bg-transparent backdrop:bg-slate-900/30 m-0 max-h-screen h-screen',
        positionClasses,
        animation,
      )}
      style={{ inset: 0 }}
    >
      <style>{`
        @keyframes drawer-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes drawer-in-left  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
      <div
        className={classes(
          'h-screen flex flex-col bg-white shadow-xl ring-1 ring-slate-200',
          sizeStyles[size],
          className,
        )}
      >
        {title && (
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-slate-700">{children}</div>
        {footer && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
