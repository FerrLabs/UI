import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  cloneElement,
} from 'react';

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface PopoverProps {
  trigger: ReactElement;
  children: ReactNode;
  side?: PopoverSide;
  align?: PopoverAlign;
  className?: string;
  style?: CSSProperties;
  defaultOpen?: boolean;
}

const sideAlignPositioning: Record<PopoverSide, Record<PopoverAlign, CSSProperties>> = {
  top: {
    start: { bottom: '100%', left: 0, marginBottom: 8 },
    center: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    end: { bottom: '100%', right: 0, marginBottom: 8 },
  },
  bottom: {
    start: { top: '100%', left: 0, marginTop: 8 },
    center: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    end: { top: '100%', right: 0, marginTop: 8 },
  },
  right: {
    start: { left: '100%', top: 0, marginLeft: 8 },
    center: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
    end: { left: '100%', bottom: 0, marginLeft: 8 },
  },
  left: {
    start: { right: '100%', top: 0, marginRight: 8 },
    center: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
    end: { right: '100%', bottom: 0, marginRight: 8 },
  },
};

export function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'start',
  className,
  style,
  defaultOpen = false,
}: PopoverProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const triggerEl = cloneElement(trigger, {
    'aria-expanded': open,
    'aria-controls': id,
    'aria-haspopup': 'dialog',
    onClick: (e: React.MouseEvent) => {
      const original = (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick;
      original?.(e);
      setOpen((v) => !v);
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <span ref={containerRef} style={{ position: 'relative', display: 'inline-flex' }}>
      {triggerEl}
      {open && (
        <span
          id={id}
          role="dialog"
          className={className}
          style={{
            position: 'absolute',
            zIndex: 40,
            minWidth: 192,
            borderRadius: 10,
            background: 'var(--color-card, #fff)',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
            border: '1px solid var(--color-card-rule, rgba(30, 41, 59, 0.10))',
            padding: 8,
            color: 'var(--color-ink, #1e293b)',
            animation: 'popover-in 140ms ease-out',
            ...sideAlignPositioning[side][align],
            ...style,
          }}
        >
          <style>{`
            @keyframes popover-in {
              from { opacity: 0; transform: ${sideAlignPositioning[side][align].transform ?? 'none'} scale(0.96); }
              to   { opacity: 1; transform: ${sideAlignPositioning[side][align].transform ?? 'none'} scale(1); }
            }
          `}</style>
          {children}
        </span>
      )}
    </span>
  );
}
