import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react';

export type TagVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
export type TagSize = 'sm' | 'md';

interface Props {
  children: ReactNode;
  /** Semantic variant — picks colour automatically. Mutually exclusive with `color`. */
  variant?: TagVariant;
  /** Explicit hex / CSS color override. Wins over `variant`. */
  color?: string;
  /** When true, fills the chip with a soft tint. When false, transparent + bordered. */
  soft?: boolean;
  /** Show the leading dot. Default true (the editorial look). */
  dot?: boolean;
  size?: TagSize;
  icon?: ReactNode;
  onRemove?: () => void;
  className?: string;
}

const variantColor: Record<TagVariant, string> = {
  neutral: 'var(--color-fg-2)',
  accent: 'var(--color-accent)',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
};

const sizeMap: Record<TagSize, { padding: string; fontSize: number; gap: number; dot: number }> = {
  sm: { padding: '2px 7px', fontSize: 9.5, gap: 5, dot: 4 },
  md: { padding: '3px 9px', fontSize: 10.5, gap: 6, dot: 5 },
};

/**
 * Editorial pill — mono uppercase label with a leading dot. Used for status,
 * type, owner, role. Pick a `variant` for semantic meaning, or pass `color`
 * for full control.
 */
export function Tag({
  children,
  variant,
  color,
  soft,
  dot = true,
  size = 'md',
  icon,
  onRemove,
  className,
}: Props) {
  const c = color ?? (variant ? variantColor[variant] : 'var(--color-fg-2)');
  const dim = sizeMap[size];

  return (
    <span
      className={['mono', className].filter(Boolean).join(' ')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dim.gap,
        padding: dim.padding,
        borderRadius: 999,
        fontSize: dim.fontSize,
        background: soft ? `color-mix(in oklab, ${c} 14%, transparent)` : 'transparent',
        border: soft ? 'none' : '1px solid var(--color-rule)',
        color: c,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span
          aria-hidden
          style={{
            width: dim.dot,
            height: dim.dot,
            borderRadius: dim.dot / 2,
            background: c,
            flexShrink: 0,
          }}
        />
      )}
      {icon && <span aria-hidden>{icon}</span>}
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: dim.dot * 2.4,
            height: dim.dot * 2.4,
            border: 'none',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            padding: 0,
            opacity: 0.6,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
        >
          <svg viewBox="0 0 12 12" width="8" height="8" fill="none">
            <path
              d="m3 3 6 6M3 9 9 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
