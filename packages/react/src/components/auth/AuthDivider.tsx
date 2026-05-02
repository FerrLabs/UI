import type { ReactNode } from 'react';

/** "or" divider — two hairlines flanking small mono-uppercase text. */
export function AuthDivider({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '22px 0',
      }}
    >
      <span style={{ flex: 1, height: 1, background: 'var(--color-rule)' }} />
      <span
        className="mono"
        style={{
          fontWeight: 500,
          fontSize: 10.5,
          color: 'var(--color-fg-3)',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </span>
      <span style={{ flex: 1, height: 1, background: 'var(--color-rule)' }} />
    </div>
  );
}
