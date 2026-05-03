import { useId, useState, type ReactElement, cloneElement, type ReactNode } from 'react';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: TooltipSide;
  className?: string;
}

const sideStyles: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
};

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const trigger = cloneElement(children, {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <span className="relative inline-flex">
      {trigger}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={classes(
            'absolute z-50 whitespace-nowrap rounded-md bg-slate-900 text-white text-xs px-2 py-1 shadow-md pointer-events-none animate-[tooltip-in_120ms_ease-out]',
            sideStyles[side],
            className,
          )}
        >
          <style>{`
            @keyframes tooltip-in {
              from { opacity: 0; transform: scale(0.94); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
          {content}
        </span>
      )}
    </span>
  );
}
