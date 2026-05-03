import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'flat' | 'raised' | 'outlined';
  interactive?: boolean;
  children: ReactNode;
}

const paddingMap = {
  none: 0,
  sm: 16,
  md: 24,
  lg: 32,
} as const;

export function Card({
  padding = 'md',
  variant = 'outlined',
  interactive = false,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  const baseStyle: CSSProperties = {
    background: 'var(--color-card, #fff)',
    color: 'var(--color-ink, #1e293b)',
    borderRadius: 14,
    padding: paddingMap[padding],
    border:
      variant === 'outlined'
        ? '1px solid var(--color-card-rule, rgba(30, 41, 59, 0.10))'
        : '1px solid transparent',
    boxShadow: variant === 'raised' ? '0 1px 2px rgba(15, 23, 42, 0.06)' : undefined,
    cursor: interactive ? 'pointer' : undefined,
    transition: 'box-shadow 160ms ease, transform 160ms ease',
    ...style,
  };

  const handleMouseEnter = interactive
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
        rest.onMouseEnter?.(e);
      }
    : rest.onMouseEnter;

  const handleMouseLeave = interactive
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.boxShadow =
          variant === 'raised' ? '0 1px 2px rgba(15, 23, 42, 0.06)' : '';
        rest.onMouseLeave?.(e);
      }
    : rest.onMouseLeave;

  return (
    <div
      className={className}
      style={baseStyle}
      {...rest}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
}

export function CardHeader({
  title,
  description,
  trailing,
  className,
  style,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        ...style,
      }}
      {...rest}
    >
      <div style={{ minWidth: 0 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
            fontWeight: 700,
            fontSize: 16,
            lineHeight: 1.25,
            color: 'var(--color-ink, #1e293b)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              marginTop: 6,
              fontSize: 13,
              lineHeight: 1.45,
              color: 'var(--color-ink-3, #64748b)',
              marginBottom: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {trailing && <div style={{ flexShrink: 0 }}>{trailing}</div>}
    </div>
  );
}
