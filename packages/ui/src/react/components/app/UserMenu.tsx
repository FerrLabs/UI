import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar } from './Avatar.js';

export interface UserMenuItem {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
  danger?: boolean;
  separatorAbove?: boolean;
}

export interface UserMenuProps {
  name: string;
  email?: string;
  avatarSrc?: string | null;
  accent?: string;
  items: UserMenuItem[];
  showName?: boolean;
}

export function UserMenu({
  name,
  email,
  avatarSrc,
  accent,
  items,
  showName = true,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={name}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'transparent',
          border: 'none',
          padding: '4px 8px',
          margin: 0,
          cursor: 'pointer',
          color: 'inherit',
          font: 'inherit',
          borderRadius: 8,
          transition: 'background 140ms ease',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = 'var(--color-app-nav-hover, rgba(30,41,59,0.03))')
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Avatar name={name} src={avatarSrc} accent={accent} size={28} />
        {showName && (
          <span
            style={{
              fontSize: 13,
              color: 'var(--color-fg-2, #475569)',
              fontFamily: 'var(--font-serif)',
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
        )}
        <span
          aria-hidden
          style={{
            color: 'var(--color-fg-3, #64748b)',
            fontSize: 10,
            opacity: 0.7,
            marginLeft: 2,
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            minWidth: 220,
            background: 'var(--color-card, #ffffff)',
            border: '1px solid var(--color-rule, rgba(30,41,59,0.10))',
            borderRadius: 10,
            boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.18)',
            padding: 6,
            zIndex: 60,
          }}
        >
          <div
            style={{
              padding: '8px 12px 10px',
              borderBottom: '1px solid var(--color-rule, rgba(30,41,59,0.10))',
              marginBottom: 4,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-fg, #1e293b)',
                fontFamily: 'var(--font-serif)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name}
            </div>
            {email && (
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: 'var(--color-fg-3, #64748b)',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {email}
              </div>
            )}
          </div>
          {items.map((item, i) => {
            const baseStyle = {
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 6,
              textDecoration: 'none',
              color: item.danger ? '#ef4444' : 'var(--color-fg-2, #475569)',
              fontSize: 13,
              fontFamily: 'var(--font-serif)',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              width: '100%',
              textAlign: 'left' as const,
              marginTop: item.separatorAbove ? 6 : 0,
              borderTop: item.separatorAbove
                ? '1px solid var(--color-rule, rgba(30,41,59,0.10))'
                : 'none',
              paddingTop: item.separatorAbove ? 12 : 8,
            };
            const onMouseEnter = (e: { currentTarget: HTMLElement }) => {
              e.currentTarget.style.background = item.danger
                ? 'color-mix(in oklab, #ef4444 8%, transparent)'
                : 'var(--color-app-nav-hover, rgba(30,41,59,0.03))';
            };
            const onMouseLeave = (e: { currentTarget: HTMLElement }) => {
              e.currentTarget.style.background = 'transparent';
            };
            const inner = (
              <>
                {item.icon && (
                  <span
                    style={{
                      width: 14,
                      display: 'inline-flex',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </span>
                )}
                <span style={{ flex: 1 }}>{item.label}</span>
              </>
            );
            if (item.href) {
              return (
                <a
                  key={i}
                  href={item.href}
                  role="menuitem"
                  style={baseStyle}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  onClick={() => setOpen(false)}
                >
                  {inner}
                </a>
              );
            }
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                style={baseStyle}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
