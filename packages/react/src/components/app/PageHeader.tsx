import type { ReactNode } from 'react';

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}

/** Per-page top chrome — Fraunces 900 title + mono eyebrow + sub + actions. */
export function PageHeader({ eyebrow, title, sub, actions }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 24,
        padding: '32px 32px 24px',
        borderBottom: '1px solid var(--color-rule)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 240 }}>
        {eyebrow && (
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-fg-3)',
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 900,
            fontSize: 'clamp(28px, 3vw, 40px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {sub && (
          <p
            style={{
              fontSize: 15,
              color: 'var(--color-fg-2)',
              marginTop: 8,
              marginBottom: 0,
              maxWidth: 600,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}
