import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LogoMark, type ProductSlug } from './LogoMark';

export type BrandDropdownAppId =
  | 'ferrflow'
  | 'ferrvault'
  | 'ferrtrack'
  | 'ferrgrowth'
  | 'ferrfleet'
  | 'ferrlabs';

export interface BrandDropdownApp {
  id: BrandDropdownAppId;
  label: string;
  tag: string;
  href: string;
  accent: string;
}

export interface BrandDropdownProps {
  current: BrandDropdownAppId;
  apps?: BrandDropdownApp[];
  children: ReactNode;
  className?: string;
  collapsed?: boolean;
}

export const DEFAULT_APPS: BrandDropdownApp[] = [
  {
    id: 'ferrlabs',
    label: 'FerrLabs',
    tag: 'Org & holding',
    href: 'https://app.ferrlabs.com',
    accent: '#1e293b',
  },
  {
    id: 'ferrgrowth',
    label: 'FerrGrowth',
    tag: 'Growth tooling',
    href: 'https://app.ferrgrowth.com',
    accent: '#7c3aed',
  },
  {
    id: 'ferrfleet',
    label: 'FerrFleet',
    tag: 'Agent fleet runtime',
    href: 'https://app.ferrfleet.com',
    accent: '#f59e0b',
  },
  {
    id: 'ferrtrack',
    label: 'FerrTrack',
    tag: 'Issue tracker',
    href: 'https://app.ferrtrack.com',
    accent: '#6366f1',
  },
  {
    id: 'ferrvault',
    label: 'FerrVault',
    tag: 'Secrets management',
    href: 'https://app.ferrvault.com',
    accent: '#10b981',
  },
];

/**
 * Clickable brand area that opens a dropdown to switch between FerrLabs apps.
 * Wraps arbitrary brand content (logo + name + tagline). The whole wrapped
 * region becomes the trigger; a chevron is appended on the right.
 */
export function BrandDropdown({
  current,
  apps = DEFAULT_APPS,
  children,
  className,
  collapsed = false,
}: BrandDropdownProps) {
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

  const currentApp = apps.find((a) => a.id === current);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        flex: 1,
        minWidth: 0,
        alignSelf: 'stretch',
        height: '100%',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={currentApp ? `${currentApp.label} · switch to another FerrLabs app` : 'Switch app'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 12,
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: '100%',
          height: '100%',
          minHeight: 'inherit',
          background: 'transparent',
          border: 'none',
          padding: collapsed ? 0 : '0 20px',
          margin: 0,
          cursor: 'pointer',
          color: 'inherit',
          font: 'inherit',
          textAlign: 'left',
          borderRadius: 0,
          transition: 'background 140ms ease, padding 220ms ease, gap 220ms ease',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = 'var(--color-app-nav-hover, rgba(30,41,59,0.03))')
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span
          style={{
            flex: collapsed ? 'none' : 1,
            minWidth: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {children}
        </span>
        <span
          aria-hidden
          style={{
            color: 'var(--color-fg-3, #64748b)',
            fontSize: 12,
            flexShrink: 0,
            opacity: collapsed ? 0 : 0.7,
            maxWidth: collapsed ? 0 : 16,
            overflow: 'hidden',
            transition: 'opacity 160ms ease, max-width 220ms ease',
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
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--color-app-sidebar, #f7f7f5)',
            borderBottom: '1px solid var(--color-rule, rgba(30,41,59,0.10))',
            padding: '8px 8px 12px',
            zIndex: 60,
          }}
        >
          {!collapsed && (
            <div
              className="mono"
              style={{
                padding: '4px 12px 6px',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-fg-3, #64748b)',
              }}
            >
              Switch app
            </div>
          )}
          {apps.map((a) => {
            const isCurrent = a.id === current;
            return (
              <a
                key={a.id}
                href={a.href}
                role="menuitem"
                aria-current={isCurrent ? 'page' : undefined}
                title={collapsed ? `${a.label} — ${a.tag}` : undefined}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: collapsed ? 0 : 12,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '8px 0' : '8px 12px',
                  margin: '1px 0',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: isCurrent ? 'var(--color-fg, #1e293b)' : 'var(--color-fg-2, #475569)',
                  background: isCurrent
                    ? 'var(--color-app-nav-active, rgba(30,41,59,0.06))'
                    : 'transparent',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 13.5,
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent)
                    e.currentTarget.style.background =
                      'var(--color-app-nav-hover, rgba(30,41,59,0.03))';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'transparent';
                }}
              >
                {isCurrent && !collapsed && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 2,
                      background: a.accent,
                      borderRadius: 2,
                    }}
                  />
                )}
                <span
                  style={{
                    width: 22,
                    height: 22,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    borderRadius: 6,
                    background: isCurrent
                      ? `color-mix(in oklab, ${a.accent} 12%, transparent)`
                      : 'transparent',
                    transition: 'background 120ms',
                  }}
                >
                  <LogoMark product={a.id as ProductSlug} accent={a.accent} size={18} />
                </span>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>{a.label}</span>
                    <span
                      className="mono"
                      style={{
                        fontSize: 10,
                        color: 'var(--color-fg-3, #64748b)',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 110,
                      }}
                    >
                      {a.tag}
                    </span>
                  </>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
