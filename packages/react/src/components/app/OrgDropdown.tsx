import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface OrgDropdownItem {
  id: string;
  name: string;
  meta?: ReactNode;
  accent?: string;
}

export interface OrgDropdownProps {
  current: OrgDropdownItem;
  orgs: OrgDropdownItem[];
  onSelect?: (orgId: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  collapsed?: boolean;
  className?: string;
}

export function OrgDropdown({
  current,
  orgs,
  onSelect,
  onCreate,
  createLabel = 'Create organization',
  collapsed = false,
  className,
}: OrgDropdownProps) {
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

  const accentColor = (a?: string) => a ?? 'var(--color-accent, var(--color-fg))';

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: 'relative',
        margin: collapsed ? '6px 8px 12px 20px' : '12px 12px 12px 8px',
        width: collapsed ? 36 : 'auto',
        transition: 'margin 220ms ease',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={collapsed ? current.name : undefined}
        title={collapsed ? current.name : undefined}
        data-org-switcher
        style={{
          width: collapsed ? 36 : '100%',
          height: collapsed ? 36 : 'auto',
          padding: collapsed ? 0 : '10px 12px',
          background: collapsed ? accentColor(current.accent) : 'var(--color-card, #fff)',
          border: collapsed ? 'none' : '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
          borderRadius: collapsed ? 9 : 10,
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
          cursor: 'pointer',
          color: collapsed ? '#fff' : 'var(--color-ink, #1e293b)',
          textAlign: 'left',
          overflow: 'hidden',
          transition:
            'width 220ms ease, height 220ms ease, padding 220ms ease, background 220ms ease, border-color 220ms ease, border-radius 220ms ease, color 220ms ease, gap 220ms ease',
        }}
      >
        <span
          style={{
            width: collapsed ? 36 : 28,
            height: collapsed ? 36 : 28,
            borderRadius: collapsed ? 9 : 8,
            background: collapsed ? 'transparent' : accentColor(current.accent),
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
            fontWeight: 900,
            fontSize: collapsed ? 15 : 14,
            flexShrink: 0,
            transition:
              'width 220ms ease, height 220ms ease, border-radius 220ms ease, background 220ms ease, font-size 220ms ease',
          }}
        >
          {current.name[0]?.toUpperCase()}
        </span>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 999,
            overflow: 'hidden',
            transition: 'opacity 160ms ease, max-width 220ms ease',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {current.name}
          </div>
          {current.meta && (
            <div
              className="mono"
              style={{
                fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                fontSize: 10,
                color: 'var(--color-ink-3, #64748b)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {current.meta}
            </div>
          )}
        </div>
        <span
          aria-hidden
          style={{
            color: 'var(--color-ink-3, #64748b)',
            fontSize: 10,
            flexShrink: 0,
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 16,
            overflow: 'hidden',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 160ms, opacity 160ms ease, max-width 220ms ease',
          }}
        >
          ▾
        </span>
      </button>
      {open && (
        <Panel
          orgs={orgs}
          current={current}
          onSelect={(id) => {
            setOpen(false);
            onSelect?.(id);
          }}
          onCreate={
            onCreate
              ? () => {
                  setOpen(false);
                  onCreate();
                }
              : undefined
          }
          createLabel={createLabel}
          collapsed={collapsed}
        />
      )}
    </div>
  );
}

function Panel({
  orgs,
  current,
  onSelect,
  onCreate,
  createLabel,
  collapsed = false,
}: {
  orgs: OrgDropdownItem[];
  current: OrgDropdownItem;
  onSelect: (orgId: string) => void;
  onCreate?: () => void;
  createLabel: string;
  collapsed?: boolean;
}) {
  const accentColor = (a?: string) => a ?? 'var(--color-accent, var(--color-fg))';
  return (
    <div
      role="menu"
      style={{
        position: 'absolute',
        top: '100%',
        left: collapsed ? '100%' : 0,
        right: collapsed ? 'auto' : 0,
        marginTop: 6,
        marginLeft: collapsed ? 8 : 0,
        minWidth: collapsed ? 240 : undefined,
        background: 'var(--color-card, #fff)',
        border: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
        borderRadius: 10,
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
        padding: '6px',
        zIndex: 60,
        animation: 'ferrlabs-org-panel-in 160ms ease-out',
      }}
    >
      <style>{`
        @keyframes ferrlabs-org-panel-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
      <div
        className="mono"
        style={{
          fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
          padding: '6px 10px 8px',
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-ink-3, #64748b)',
        }}
      >
        Switch organization
      </div>
      {orgs.map((o) => {
        const isCurrent = o.id === current.id;
        return (
          <button
            key={o.id}
            type="button"
            role="menuitem"
            onClick={() => onSelect(o.id)}
            aria-current={isCurrent ? 'true' : undefined}
            style={{
              width: '100%',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: isCurrent
                ? 'var(--color-app-nav-active, rgba(30, 41, 59, 0.06))'
                : 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--color-ink, #1e293b)',
              textAlign: 'left',
              transition: 'background 120ms',
            }}
            onMouseEnter={(e) => {
              if (!isCurrent)
                e.currentTarget.style.background =
                  'var(--color-app-nav-hover, rgba(30, 41, 59, 0.03))';
            }}
            onMouseLeave={(e) => {
              if (!isCurrent) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: accentColor(o.accent),
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
                fontWeight: 900,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {o.name[0]?.toUpperCase()}
            </span>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: isCurrent ? 600 : 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {o.name}
              </div>
              {o.meta && (
                <div
                  className="mono"
                  style={{
                    fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                    fontSize: 10,
                    color: 'var(--color-ink-3, #64748b)',
                  }}
                >
                  {o.meta}
                </div>
              )}
            </div>
            {isCurrent && (
              <span
                aria-hidden
                style={{
                  color: 'var(--color-ink-3, #64748b)',
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
            )}
          </button>
        );
      })}
      {onCreate && (
        <>
          <div
            style={{
              height: 1,
              background: 'var(--color-rule, rgba(30, 41, 59, 0.10))',
              margin: '6px -6px',
            }}
          />
          <button
            type="button"
            onClick={onCreate}
            style={{
              width: '100%',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--color-ink-2, #475569)',
              textAlign: 'left',
              fontSize: 13,
              transition: 'background 120ms, color 120ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'var(--color-app-nav-hover, rgba(30, 41, 59, 0.03))';
              e.currentTarget.style.color = 'var(--color-ink, #1e293b)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-ink-2, #475569)';
            }}
          >
            <span
              aria-hidden
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                border: '1px dashed var(--color-rule-strong, rgba(30, 41, 59, 0.24))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                color: 'var(--color-ink-3, #64748b)',
                flexShrink: 0,
              }}
            >
              +
            </span>
            {createLabel}
          </button>
        </>
      )}
    </div>
  );
}
