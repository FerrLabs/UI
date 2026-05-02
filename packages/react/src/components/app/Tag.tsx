import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  color?: string;
  soft?: boolean;
}

/** Small pill with a leading dot — used for status, type, owner. */
export function Tag({ children, color = 'var(--color-fg-2)', soft }: Props) {
  return (
    <span
      className="mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 10.5,
        background: soft ? `color-mix(in oklab, ${color} 14%, transparent)` : 'transparent',
        border: soft ? 'none' : '1px solid var(--color-rule)',
        color,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: 3, background: color }} />
      {children}
    </span>
  );
}
