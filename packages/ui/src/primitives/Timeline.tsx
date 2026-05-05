import type { ReactNode } from 'react';

export interface TimelineEvent {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const dotColor = {
  neutral: 'var(--color-ink-3)',
  accent: 'var(--color-accent)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
} as const;

export function Timeline({ events, className }: TimelineProps) {
  return (
    <ol
      className={className}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 7,
          top: 4,
          bottom: 4,
          width: 1,
          background: 'var(--color-rule)',
        }}
      />
      {events.map((event) => {
        const variant = event.variant ?? 'neutral';
        return (
          <li key={event.id} style={{ position: 'relative', paddingLeft: 32 }}>
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 0,
                top: 4,
                width: 14,
                height: 14,
                borderRadius: 999,
                background: dotColor[variant],
                boxShadow: '0 0 0 2px var(--color-card)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 8,
                color: '#fff',
              }}
            >
              {event.icon}
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display, var(--font-serif))',
                  fontWeight: 700,
                  fontSize: 14,
                  color: 'var(--color-ink)',
                }}
              >
                {event.title}
              </span>
              {event.meta && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: '0.06em',
                    color: 'var(--color-ink-3)',
                  }}
                >
                  {event.meta}
                </span>
              )}
            </div>
            {event.description && (
              <p
                style={{
                  marginTop: 4,
                  marginBottom: 0,
                  fontSize: 13,
                  color: 'var(--color-ink-2)',
                  lineHeight: 1.55,
                }}
              >
                {event.description}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
