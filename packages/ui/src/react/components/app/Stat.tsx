interface Props {
  label: string;
  value: string;
  delta?: string;
  deltaType?: 'up' | 'down' | 'flat';
  /** Override the "up" delta color (defaults to var(--color-accent)). */
  accent?: string;
}

/** Bordered KPI card. Mono label, Fraunces 700 number, accent delta. */
export function Stat({ label, value, delta, deltaType = 'flat', accent }: Props) {
  const dColor =
    deltaType === 'up'
      ? accent ?? 'var(--color-accent)'
      : deltaType === 'down'
        ? '#ef4444'
        : 'var(--color-fg-3)';
  return (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-rule)',
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-fg-3)',
          marginBottom: 12,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {delta && (
          <span className="mono" style={{ fontSize: 12, color: dColor }}>
            {deltaType === 'up' ? '↑' : deltaType === 'down' ? '↓' : '·'} {delta}
          </span>
        )}
      </div>
    </div>
  );
}
