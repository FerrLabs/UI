import type { ReactNode, MouseEvent as ReactMouseEvent, CSSProperties } from 'react';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  /** Hex accent color override. Used as the bg on `primary`, the text on `ghost`. Defaults to `var(--color-fg)`. */
  accent?: string;
  size?: ButtonSize;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Render as an `<a>` instead of a `<button>`. Requires `href`. */
  as?: 'button' | 'a';
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: ReactMouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  'aria-label'?: string;
}

const sizeMap: Record<
  ButtonSize,
  { padding: string; fontSize: number; gap: number; radius: number }
> = {
  sm: { padding: '5px 10px', fontSize: 11, gap: 6, radius: 6 },
  md: { padding: '8px 14px', fontSize: 12, gap: 8, radius: 8 },
  lg: { padding: '12px 20px', fontSize: 14, gap: 10, radius: 10 },
};

/**
 * Editorial app button — mono label, accent-filled (primary), ghost-bordered,
 * or danger (red). Sizes sm/md/lg, optional loading spinner, optional anchor
 * via `as="a"`. Same DM-Mono + var(--color-fg) tokens as the rest of the
 * editorial bundle.
 */
export function Button({
  children,
  variant = 'primary',
  accent,
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  style,
  as,
  href,
  target,
  rel,
  type,
  onClick,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const dangerColor = '#dc2626';

  let bg: string;
  let fg: string;
  let border: string;
  if (isDanger) {
    bg = accent ?? dangerColor;
    fg = '#fff';
    border = bg;
  } else if (isPrimary) {
    bg = accent ?? 'var(--color-fg)';
    fg = '#fff';
    border = bg;
  } else {
    bg = 'transparent';
    fg = accent ?? 'var(--color-fg)';
    border = 'var(--color-rule-strong)';
  }

  const dim = sizeMap[size];
  const isInactive = Boolean(disabled || loading);

  const sharedStyle: CSSProperties = {
    padding: dim.padding,
    borderRadius: dim.radius,
    fontSize: dim.fontSize,
    letterSpacing: '0.04em',
    border: `1px solid ${border}`,
    background: bg,
    color: fg,
    cursor: isInactive ? 'not-allowed' : 'pointer',
    opacity: isInactive ? 0.55 : 1,
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: dim.gap,
    textDecoration: 'none',
    transition: 'background 160ms ease-out, opacity 160ms, box-shadow 160ms',
    ...style,
  };

  const content = (
    <>
      {loading ? (
        <span
          aria-hidden
          style={{
            width: dim.fontSize,
            height: dim.fontSize,
            border: `1.5px solid ${fg}`,
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'ferrlabs-spin 700ms linear infinite',
          }}
        />
      ) : (
        icon && <span aria-hidden>{icon}</span>
      )}
      {children}
      {!loading && trailingIcon && <span aria-hidden>{trailingIcon}</span>}
      <style>{`@keyframes ferrlabs-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );

  if (as === 'a' && href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        className={['mono', className].filter(Boolean).join(' ')}
        style={sharedStyle}
        aria-label={ariaLabel}
        aria-disabled={isInactive || undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type ?? 'button'}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      disabled={isInactive}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      className={['mono', className].filter(Boolean).join(' ')}
      style={sharedStyle}
    >
      {content}
    </button>
  );
}
