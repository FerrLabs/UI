import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '64px 24px',
        borderRadius: 14,
        border: '1px dashed var(--color-rule-strong, rgba(30, 41, 59, 0.28))',
        background: 'transparent',
      }}
    >
      {icon && (
        <div
          style={{
            marginBottom: 16,
            color: 'var(--color-ink-3, #64748b)',
            display: 'inline-flex',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
          fontWeight: 700,
          fontSize: 18,
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          color: 'var(--color-ink, #1e293b)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            marginTop: 8,
            fontSize: 14,
            lineHeight: 1.55,
            color: 'var(--color-ink-3, #64748b)',
            maxWidth: 380,
            marginBottom: 0,
          }}
        >
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}
