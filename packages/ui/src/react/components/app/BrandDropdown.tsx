import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LogoMark, type ProductSlug } from './LogoMark';

export type BrandDropdownAppId =
  | 'ferrflow'
  | 'ferrvault'
  | 'ferrtrack'
  | 'ferrgrowth'
  | 'ferrfleet'
  | 'ferrlabs'
  | 'admin';

export interface BrandDropdownApp {
  id: BrandDropdownAppId;
  label: string;
  /** Kept for backwards compat — no longer rendered. */
  tag?: string;
  href: string;
  accent: string;
  /**
   * Visual grouping. When set on multiple apps with different values, the
   * dropdown renders a divider + uppercase header between groups in entry
   * order. Omit on single-section dropdowns to keep the flat layout.
   */
  section?: string;
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
    href: 'https://app.ferrlabs.com',
    accent: '#1e293b',
  },
  {
    id: 'ferrgrowth',
    label: 'FerrGrowth',
    href: 'https://app.ferrgrowth.com',
    accent: '#7c3aed',
  },
  {
    id: 'ferrfleet',
    label: 'FerrFleet',
    href: 'https://app.ferrfleet.com',
    accent: '#f59e0b',
  },
  {
    id: 'ferrtrack',
    label: 'FerrTrack',
    href: 'https://app.ferrtrack.com',
    accent: '#6366f1',
  },
  {
    id: 'ferrvault',
    label: 'FerrVault',
    href: 'https://app.ferrvault.com',
    accent: '#10b981',
  },
];

/**
 * Staff-only entry. Consumers append this to `apps` ONLY when the current
 * user has staff access — every other user must not see it. Section header
 * "Staff" auto-renders before this row when at least one preceding app
 * carries a different (or no) section.
 *
 * Example (FerrLabs portal):
 *
 *     const me = useMe();
 *     <Shell appSwitcher={{
 *       current: 'ferrlabs',
 *       apps: me?.is_staff ? [...DEFAULT_APPS, ADMIN_APP] : DEFAULT_APPS,
 *     }} ... />
 */
export const ADMIN_APP: BrandDropdownApp = {
  id: 'admin',
  label: 'Admin',
  href: 'https://admin.ferrlabs.com',
  accent: '#e11d48',
  section: 'Staff',
};

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
  const [switching, setSwitching] = useState<BrandDropdownApp | null>(null);
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
          gap: 12,
          justifyContent: 'flex-start',
          width: '100%',
          height: '100%',
          minHeight: 'inherit',
          background: 'transparent',
          border: 'none',
          padding: '0 18px',
          margin: 0,
          cursor: 'pointer',
          color: 'inherit',
          font: 'inherit',
          textAlign: 'left',
          borderRadius: 0,
          transition: 'background 140ms ease',
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
            flex: 1,
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
            height: 'calc(100vh - 64px - 56px)',
            background: 'var(--color-app-sidebar, #f7f7f5)',
            borderBottom: '1px solid var(--color-rule, rgba(30,41,59,0.10))',
            padding: '8px 8px 12px',
            zIndex: 60,
            overflowY: 'auto',
            animation: 'ferrlabs-brand-panel-in 200ms ease-out',
          }}
        >
          <style>{`
            @keyframes ferrlabs-brand-panel-in {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: none; }
            }
          `}</style>
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
          {apps.map((a, i) => {
            const isCurrent = a.id === current;
            const prevSection = i > 0 ? apps[i - 1].section : undefined;
            const showSectionHeader =
              !collapsed && a.section !== undefined && a.section !== prevSection;
            return (
              <div key={a.id} style={{ display: 'contents' }}>
                {showSectionHeader && (
                  <div
                    className="mono"
                    style={{
                      padding: '10px 12px 4px',
                      marginTop: i === 0 ? 0 : 4,
                      borderTop:
                        i === 0 ? 'none' : '1px solid var(--color-rule, rgba(30,41,59,0.10))',
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--color-fg-3, #64748b)',
                    }}
                  >
                    {a.section}
                  </div>
                )}
                <a
                  href={a.href}
                  role="menuitem"
                  aria-current={isCurrent ? 'page' : undefined}
                  title={collapsed ? a.label : undefined}
                  onClick={(e) => {
                    if (isCurrent) {
                      e.preventDefault();
                      setOpen(false);
                      return;
                    }
                    e.preventDefault();
                    setOpen(false);
                    setSwitching(a);
                    window.setTimeout(() => {
                      if (typeof window !== 'undefined') window.location.assign(a.href);
                    }, 360);
                  }}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: collapsed ? 0 : 12,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '6px 0' : '6px 12px',
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
                      width: 36,
                      height: 36,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LogoMark product={a.id as ProductSlug} accent={a.accent} size={36} />
                  </span>
                  {!collapsed && (
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: 'left',
                        fontWeight: 700,
                      }}
                    >
                      {a.label}
                    </span>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      )}
      {switching && (
        <div
          aria-live="polite"
          aria-label={`Switching to ${switching.label}`}
          style={{
            position: 'fixed',
            inset: 0,
            background: `color-mix(in oklab, ${switching.accent} 4%, var(--color-paper, #faf8f4))`,
            backdropFilter: 'blur(10px) saturate(140%)',
            WebkitBackdropFilter: 'blur(10px) saturate(140%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'ferrlabs-brand-switch-in 200ms ease-out',
          }}
        >
          <style>{`
            @keyframes ferrlabs-brand-switch-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes ferrlabs-brand-switch-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.06); }
            }
          `}</style>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 18,
              animation: 'ferrlabs-brand-switch-pulse 1200ms ease-in-out infinite',
            }}
          >
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: switching.accent,
              }}
            >
              <LogoMark product={switching.id as ProductSlug} accent={switching.accent} size={64} />
            </span>
            <span
              className="mono"
              style={{
                fontFamily: 'var(--font-mono, "DM Mono", monospace)',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-ink-3, #64748b)',
              }}
            >
              Opening {switching.label}…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
