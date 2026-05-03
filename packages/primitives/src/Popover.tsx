import {
  useEffect,
  useId,
  useRef,
  useState,
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
  defaultOpen?: boolean;
}

const sideAlignStyles: Record<PopoverSide, Record<PopoverAlign, string>> = {
  top: {
    start: 'bottom-full left-0 mb-2',
    center: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    end: 'bottom-full right-0 mb-2',
  },
  bottom: {
    start: 'top-full left-0 mt-2',
    center: 'top-full left-1/2 -translate-x-1/2 mt-2',
    end: 'top-full right-0 mt-2',
  },
  right: {
    start: 'left-full top-0 ml-2',
    center: 'left-full top-1/2 -translate-y-1/2 ml-2',
    end: 'left-full bottom-0 ml-2',
  },
  left: {
    start: 'right-full top-0 mr-2',
    center: 'right-full top-1/2 -translate-y-1/2 mr-2',
    end: 'right-full bottom-0 mr-2',
  },
};

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'start',
  className,
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
    <span ref={containerRef} className="relative inline-flex">
      {triggerEl}
      {open && (
        <span
          id={id}
          role="dialog"
          className={classes(
            'absolute z-40 min-w-48 rounded-lg bg-white shadow-lg ring-1 ring-slate-200 p-2 animate-[popover-in_140ms_ease-out]',
            sideAlignStyles[side][align],
            className,
          )}
        >
          <style>{`
            @keyframes popover-in {
              from { opacity: 0; transform: scale(0.96); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
          {children}
        </span>
      )}
    </span>
  );
}
