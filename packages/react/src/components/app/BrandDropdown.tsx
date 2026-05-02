import { useEffect, useRef, useState, type ReactNode } from 'react';

export type BrandDropdownAppId =
  | 'ferrflow' | 'ferrvault' | 'ferrtrack' | 'ferrgrowth' | 'ferrfleet' | 'ferrlabs';

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
}

export const DEFAULT_APPS: BrandDropdownApp[] = [
  { id: 'ferrflow',   label: 'FerrFlow',   tag: 'Versioning CLI',      href: 'https://app.ferrflow.com',   accent: '#e8733a' },
  { id: 'ferrvault',  label: 'FerrVault',  tag: 'Secrets management',  href: 'https://vault.ferrlabs.com', accent: '#10b981' },
  { id: 'ferrtrack',  label: 'FerrTrack',  tag: 'Issue tracker',       href: 'https://track.ferrlabs.com', accent: '#6366f1' },
  { id: 'ferrgrowth', label: 'FerrGrowth', tag: 'Growth tooling',      href: 'https://app.ferrgrowth.com', accent: '#7c3aed' },
  { id: 'ferrfleet',  label: 'FerrFleet',  tag: 'Agent fleet runtime', href: 'https://fleet.ferrlabs.com', accent: '#f59e0b' },
  { id: 'ferrlabs',   label: 'FerrLabs',   tag: 'Org & holding',       href: 'https://ferrlabs.com',       accent: '#1e293b' },
];

/**
 * Clickable brand area that opens a dropdown to switch between FerrLabs apps.
 * Wraps arbitrary brand content (logo + name + tagline). The whole wrapped
 * region becomes the trigger; a chevron is appended on the right.
 */
export function BrandDropdown({ current, apps = DEFAULT_APPS, children, className }: BrandDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={className} style={{ position: 'relative', display: 'block' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Switch app"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          color: 'inherit',
          font: 'inherit',
          textAlign: 'left',
          borderRadius: 8,
          transition: 'background 140ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-app-nav-hover, rgba(30,41,59,0.03))')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <span style={{ flex: 1, minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          {children}
        </span>
        <span
          aria-hidden
          style={{
            color: 'var(--color-fg-3, #64748b)',
            fontSize: 12,
            opacity: 0.7,
            flexShrink: 0,
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
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            minWidth: 240,
            background: 'var(--color-card, #ffffff)',
            border: '1px solid var(--color-rule, rgba(30,41,59,0.10))',
            borderRadius: 10,
            boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.18)',
            padding: 6,
            zIndex: 60,
          }}
        >
          <div className="mono" style={{
            padding: '6px 10px 8px', fontSize: 9.5, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--color-fg-3, #64748b)',
          }}>Switch app</div>
          {apps.map(a => {
            const isCurrent = a.id === current;
            return (
              <a
                key={a.id}
                href={a.href}
                role="menuitem"
                aria-current={isCurrent ? 'page' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 7,
                  textDecoration: 'none', color: 'inherit',
                  background: isCurrent
                    ? `color-mix(in oklab, ${a.accent} 10%, transparent)`
                    : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'var(--color-app-nav-hover, rgba(30,41,59,0.03))';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 4, background: a.accent, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-fg, #1e293b)' }}>
                    {a.label}
                  </span>
                  <span className="mono" style={{ display: 'block', fontSize: 10.5, color: 'var(--color-fg-3, #64748b)', marginTop: 2 }}>
                    {a.tag}
                  </span>
                </span>
                {isCurrent && (
                  <span className="mono" style={{
                    fontSize: 9.5, color: a.accent,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                  }}>current</span>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
