import { useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export type BannerVariant = 'info' | 'success' | 'warning' | 'danger';

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: BannerVariant;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

interface VariantTokens {
  bg: string;
  fg: string;
  bar: string;
  border: string;
}

const variantTokens: Record<BannerVariant, VariantTokens> = {
  info: {
    bg: 'color-mix(in oklab, var(--color-ink-3, #64748b) 8%, var(--color-paper, #faf8f4))',
    fg: 'var(--color-ink, #1e293b)',
    bar: 'var(--color-ink-3, #64748b)',
    border: 'var(--color-rule, rgba(30, 41, 59, 0.14))',
  },
  success: {
    bg: 'color-mix(in oklab, #10b981 10%, var(--color-paper, #faf8f4))',
    fg: '#065f46',
    bar: '#10b981',
    border: 'color-mix(in oklab, #10b981 24%, transparent)',
  },
  warning: {
    bg: 'color-mix(in oklab, #f59e0b 12%, var(--color-paper, #faf8f4))',
    fg: '#78350f',
    bar: '#f59e0b',
    border: 'color-mix(in oklab, #f59e0b 28%, transparent)',
  },
  danger: {
    bg: 'color-mix(in oklab, #dc2626 10%, var(--color-paper, #faf8f4))',
    fg: '#7f1d1d',
    bar: '#dc2626',
    border: 'color-mix(in oklab, #dc2626 26%, transparent)',
  },
};

export function Banner({
  variant = 'info',
  title,
  children,
  action,
  dismissible = false,
  onDismiss,
  className,
  style,
  ...rest
}: BannerProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const tokens = variantTokens[variant];

  const handleDismiss = () => {
    setHidden(true);
    onDismiss?.();
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 10,
    border: `1px solid ${tokens.border}`,
    background: tokens.bg,
    color: tokens.fg,
    padding: '12px 16px',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={className}
      style={containerStyle}
      {...rest}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: tokens.bar,
        }}
      />
      <div style={{ flex: 1, minWidth: 0, marginLeft: 4 }}>
        {title && <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{title}</div>}
        {children && (
          <div
            style={{
              fontSize: 14,
              lineHeight: 1.55,
              marginTop: title ? 4 : 0,
              opacity: title ? 0.9 : 1,
            }}
          >
            {children}
          </div>
        )}
      </div>
      {action && <div style={{ flexShrink: 0, alignSelf: 'center' }}>{action}</div>}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            flexShrink: 0,
            alignSelf: 'flex-start',
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            opacity: 0.6,
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: 2,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
        >
          ×
        </button>
      )}
    </div>
  );
}
