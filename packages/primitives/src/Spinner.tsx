import type { CSSProperties, HTMLAttributes } from 'react';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'accent' | 'current' | 'slate';
  label?: string;
}

const sizeMap = {
  xs: { box: 12, border: 1.5 },
  sm: { box: 16, border: 2 },
  md: { box: 20, border: 2 },
  lg: { box: 28, border: 3 },
} as const;

export function Spinner({
  size = 'md',
  color = 'accent',
  label = 'Loading…',
  className,
  style,
  ...rest
}: SpinnerProps) {
  const dim = sizeMap[size];
  const ringColor =
    color === 'accent'
      ? 'var(--color-accent, #e8733a)'
      : color === 'current'
        ? 'currentColor'
        : 'var(--color-ink-3, #64748b)';

  const baseStyle: CSSProperties = {
    display: 'inline-block',
    width: dim.box,
    height: dim.box,
    borderRadius: 999,
    borderStyle: 'solid',
    borderWidth: dim.border,
    borderColor: ringColor,
    borderRightColor: 'transparent',
    animation: 'ferrlabs-spinner-rotate 0.8s linear infinite',
    ...style,
  };

  return (
    <span role="status" aria-label={label} className={className} style={baseStyle} {...rest}>
      <style>{`
        @keyframes ferrlabs-spinner-rotate {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
}
