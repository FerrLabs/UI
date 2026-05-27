import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface OrgChipItem {
  id: string;
  name: string;
  meta?: ReactNode;
}

export interface OrgChipProps {
  current: OrgChipItem;
  orgs: OrgChipItem[];
  onSelect?: (orgId: string) => void;
  onCreate?: () => void;
  createLabel?: string;
  className?: string;
  defaultOpen?: boolean;
  /**
   * Collapsed sidebar mode — renders a compact 32×32 initial tile instead of
   * the full-width text chip. Click still opens the same dropdown (anchored
   * left so the panel doesn't get cropped by the narrow sidebar).
   */
  collapsed?: boolean;
}

export function OrgChip({
  current,
  orgs,
  onSelect,
  onCreate,
  createLabel = 'Create organization',
  className,
  defaultOpen = false,
  collapsed = false,
}: OrgChipProps) {
  const [open, setOpen] = useState(defaultOpen);
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
    <div
      ref={rootRef}
      className={className}
      style={{
        position: 'relative',
        margin: collapsed ? '8px auto 4px' : '8px 8px 4px',
        width: collapsed ? 32 : undefined,
      }}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={current.name}
          title={current.name}
          style={{
            all: 'unset',
            boxSizing: 'border-box',
            width: 32,
            height: 32,
            borderRadius: 7,
            display: 'grid',
            placeItems: 'center',
            background: 'var(--color-bg-2, rgba(15,23,42,0.05))',
            border: '1px solid var(--color-rule, rgba(30,41,59,0.12))',
            color: 'var(--color-fg-2, #475569)',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = 'var(--color-bg-3, rgba(15,23,42,0.10))';
            el.style.borderColor = 'var(--color-rule-strong, rgba(30,41,59,0.22))';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = 'var(--color-bg-2, rgba(15,23,42,0.05))';
            el.style.borderColor = 'var(--color-rule, rgba(30,41,59,0.12))';
          }}
        >
          {current.name[0]?.toUpperCase() ?? '?'}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          style={{
            all: 'unset',
            boxSizing: 'border-box',
            width: '100%',
            padding: '8px 12px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11.5,
            color: 'var(--color-fg-3, #6e7585)',
            cursor: 'pointer',
            border: '1px solid transparent',
            transition: 'background 0.15s, border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.background = 'var(--color-bg-2, rgba(255,255,255,0.04))';
            el.style.borderColor = 'var(--color-rule, rgba(30,41,59,0.14))';
            el.style.color = 'var(--color-fg-2, #aeb3c0)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.background = 'transparent';
            el.style.borderColor = 'transparent';
            el.style.color = 'var(--color-fg-3, #6e7585)';
          }}
        >
          <span
            style={{
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {current.name}
          </span>
          <svg
            aria-hidden
            width={9}
            height={9}
            viewBox="0 0 12 12"
            fill="none"
            style={{ opacity: 0.7, flexShrink: 0 }}
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {open ? (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: collapsed ? undefined : 0,
            width: collapsed ? 220 : undefined,
            background: 'var(--color-card, #fff)',
            border: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
            borderRadius: 8,
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.14)',
            padding: 4,
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            maxHeight: 280,
            overflow: 'auto',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
              padding: '6px 10px 4px',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-fg-3, #94a3b8)',
            }}
          >
            Organizations
          </div>
          {orgs.map((o) => {
            const isCurrent = o.id === current.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onSelect?.(o.id);
                  setOpen(false);
                }}
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  padding: '7px 10px',
                  borderRadius: 5,
                  fontSize: 12.5,
                  color: 'var(--color-fg, #0f172a)',
                  background: isCurrent ? 'var(--color-bg-2, rgba(15,23,42,0.05))' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: isCurrent ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = 'var(--color-bg-2, rgba(15,23,42,0.04))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span
                  style={{
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {o.name}
                </span>
                {o.meta ? (
                  <span style={{ fontSize: 11, color: 'var(--color-fg-3, #94a3b8)' }}>
                    {o.meta}
                  </span>
                ) : null}
                {isCurrent ? (
                  <span
                    aria-hidden
                    style={{ color: 'var(--color-accent, currentColor)', fontSize: 12 }}
                  >
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
          {onCreate ? (
            <>
              <div
                style={{
                  height: 1,
                  background: 'var(--color-rule, rgba(30,41,59,0.10))',
                  margin: '4px 4px',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  onCreate();
                  setOpen(false);
                }}
                style={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  padding: '7px 10px',
                  borderRadius: 5,
                  fontSize: 12.5,
                  color: 'var(--color-fg-2, #475569)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-2, rgba(15,23,42,0.04))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>+</span>
                <span>{createLabel}</span>
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
