import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'accent' | 'success' | 'warning' | 'danger';
  indeterminate?: boolean;
}

const sizeHeight = { sm: 4, md: 8, lg: 12 } as const;

const variantColor = {
  accent: 'var(--color-accent)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
} as const;

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'accent',
  indeterminate = false,
  className,
  style,
  ...rest
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const display = showValue ? `${Math.round(pct)}%` : null;
  const height = sizeHeight[size];
  const fill = variantColor[variant];

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    ...style,
  };

  const fillStyle: CSSProperties = indeterminate
    ? {
        height: '100%',
        width: '40%',
        borderRadius: 999,
        background: fill,
        animation: 'progress-indeterminate 1.4s ease-in-out infinite',
      }
    : {
        height: '100%',
        width: `${pct}%`,
        borderRadius: 999,
        background: fill,
        transition: 'width 300ms ease-out',
      };

  return (
    <div className={className} style={wrapperStyle} {...rest}>
      {(label || display) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--color-ink-2)',
          }}
        >
          <span>{label}</span>
          {display && (
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-ink-3)' }}>
              {display}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={typeof label === 'string' ? label : undefined}
        style={{
          width: '100%',
          height,
          background: 'var(--color-rule)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div style={fillStyle} />
        {indeterminate && (
          <style>{`
            @keyframes progress-indeterminate {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
            }
          `}</style>
        )}
      </div>
    </div>
  );
}
