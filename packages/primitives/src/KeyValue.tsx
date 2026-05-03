import type { CSSProperties, ReactNode } from 'react';

export interface KeyValueItem {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
}

export interface KeyValueProps {
  items: KeyValueItem[];
  orientation?: 'vertical' | 'horizontal';
  density?: 'compact' | 'normal';
  className?: string;
}

const labelStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--color-ink-3)',
};

const valueStyle: CSSProperties = {
  fontSize: 14,
  color: 'var(--color-ink)',
};

const hintStyle: CSSProperties = {
  fontSize: 12,
  color: 'var(--color-ink-3)',
};

export function KeyValue({
  items,
  orientation = 'horizontal',
  density = 'normal',
  className,
}: KeyValueProps) {
  const rowGap = density === 'compact' ? 8 : 12;
  const innerGap = density === 'compact' ? 2 : 4;

  if (orientation === 'vertical') {
    return (
      <dl
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          rowGap,
          margin: 0,
        }}
      >
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: innerGap }}>
            <dt style={labelStyle}>{item.label}</dt>
            <dd style={{ ...valueStyle, margin: 0 }}>{item.value}</dd>
            {item.hint && <p style={{ ...hintStyle, margin: 0 }}>{item.hint}</p>}
          </div>
        ))}
      </dl>
    );
  }

  return (
    <dl
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        columnGap: 24,
        rowGap,
        margin: 0,
      }}
    >
      {items.map((item, i) => (
        <div key={i} style={{ display: 'contents' }}>
          <dt
            style={{
              ...labelStyle,
              alignSelf: 'start',
              paddingTop: 2,
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </dt>
          <dd style={{ display: 'flex', flexDirection: 'column', margin: 0 }}>
            <span style={valueStyle}>{item.value}</span>
            {item.hint && <span style={{ ...hintStyle, marginTop: 2 }}>{item.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
