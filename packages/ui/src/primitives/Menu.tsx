import {
  cloneElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

export type MenuAlign = 'start' | 'end';

export interface MenuProps {
  trigger: ReactElement;
  children: ReactNode;
  align?: MenuAlign;
  className?: string;
  style?: CSSProperties;
}

export interface MenuItemProps {
  onSelect?: () => void;
  href?: string;
  icon?: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  shortcut?: ReactNode;
}

export function Menu({ trigger, children, align = 'start', className, style }: MenuProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

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
    'aria-haspopup': 'menu',
    onClick: (e: React.MouseEvent) => {
      const orig = (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick;
      orig?.(e);
      setOpen((v) => !v);
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <span ref={containerRef} style={{ position: 'relative', display: 'inline-flex' }}>
      {triggerEl}
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={className}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align === 'end' ? 'right' : 'left']: 0,
            zIndex: 60,
            minWidth: 220,
            background: 'var(--color-card, #ffffff)',
            border: '1px solid var(--color-card-rule, rgba(30, 41, 59, 0.10))',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
            padding: 6,
            ...style,
          }}
        >
          {children}
        </div>
      )}
    </span>
  );
}

export function MenuItem({
  onSelect,
  href,
  icon,
  children,
  disabled,
  destructive,
  shortcut,
}: MenuItemProps) {
  const baseColor = destructive ? '#dc2626' : 'var(--color-ink-2, #475569)';
  const hoverColor = destructive ? '#dc2626' : 'var(--color-ink, #1e293b)';
  const hoverBg = destructive
    ? 'color-mix(in oklab, #dc2626 8%, var(--color-paper, transparent))'
    : 'var(--color-paper-2, rgba(30, 41, 59, 0.04))';

  const baseStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 14,
    fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
    color: baseColor,
    background: 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: '100%',
    textAlign: 'left',
    textDecoration: 'none',
    transition: 'background 140ms ease, color 140ms ease',
  };

  const onMouseEnter = (e: { currentTarget: HTMLElement }) => {
    if (disabled) return;
    e.currentTarget.style.background = hoverBg;
    e.currentTarget.style.color = hoverColor;
  };
  const onMouseLeave = (e: { currentTarget: HTMLElement }) => {
    if (disabled) return;
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.color = baseColor;
  };

  const content = (
    <>
      {icon && (
        <span
          style={{
            width: 16,
            display: 'inline-flex',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
      {shortcut && (
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
            color: 'var(--color-ink-3, #64748b)',
          }}
        >
          {shortcut}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        role="menuitem"
        style={baseStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      disabled={disabled}
      style={baseStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {content}
    </button>
  );
}

export function MenuSeparator() {
  return (
    <div
      role="separator"
      style={{
        margin: '4px 0',
        height: 1,
        background: 'var(--color-rule, rgba(30, 41, 59, 0.14))',
      }}
    />
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: '6px 12px',
        fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--color-ink-3, #64748b)',
      }}
    >
      {children}
    </div>
  );
}
