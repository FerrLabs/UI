import type { ReactNode, MouseEvent } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  /** Hex accent color (used only for primary variant). Defaults to `--color-fg`. */
  accent?: string;
  icon?: ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * The bundle's editorial app button — mono label, accent-filled (primary)
 * or ghost-bordered. Distinct from the marketing `Button` in this package
 * (which is the larger Tailwind-styled CTA used on landing pages).
 */
export function AppButton({
  children,
  variant = 'primary',
  accent,
  icon,
  type = 'button',
  disabled,
  onClick,
}: Props) {
  const isPrimary = variant === 'primary';
  const bg = isPrimary ? accent ?? 'var(--color-fg)' : 'transparent';
  const fg = isPrimary ? '#fff' : 'var(--color-fg)';
  const border = isPrimary ? bg : 'var(--color-rule-strong)';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="mono"
      style={{
        padding: '8px 14px',
        borderRadius: 8,
        fontSize: 12,
        letterSpacing: '0.04em',
        border: `1px solid ${border}`,
        background: bg,
        color: fg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'transform 140ms, opacity 140ms',
      }}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {children}
    </button>
  );
}
