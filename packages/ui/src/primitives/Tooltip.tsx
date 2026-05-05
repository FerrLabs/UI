import {
  useId,
  useState,
  type CSSProperties,
  type ReactElement,
  cloneElement,
  type ReactNode,
} from 'react';

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  side?: TooltipSide;
  className?: string;
  style?: CSSProperties;
}

const sidePositioning: Record<TooltipSide, CSSProperties> = {
  top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6 },
  right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 6 },
  bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6 },
  left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 6 },
};

export function Tooltip({ content, children, side = 'top', className, style }: TooltipProps) {
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
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {trigger}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={className}
          style={{
            position: 'absolute',
            zIndex: 50,
            whiteSpace: 'nowrap',
            borderRadius: 8,
            background: 'var(--color-ink, #1e293b)',
            color: '#fff',
            fontSize: 12,
            lineHeight: 1.4,
            padding: '4px 8px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
            pointerEvents: 'none',
            animation: 'tooltip-in 120ms ease-out',
            ...sidePositioning[side],
            ...style,
          }}
        >
          <style>{`
            @keyframes tooltip-in {
              from { opacity: 0; transform: ${sidePositioning[side].transform ?? 'none'} scale(0.94); }
              to   { opacity: 1; transform: ${sidePositioning[side].transform ?? 'none'} scale(1); }
            }
          `}</style>
          {content}
        </span>
      )}
    </span>
  );
}
