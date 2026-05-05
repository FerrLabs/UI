import type { CSSProperties, HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: 'rect' | 'text' | 'circle';
  width?: string | number;
  height?: string | number;
}

const shapeRadius = {
  rect: 8,
  text: 4,
  circle: 999,
} as const;

export function Skeleton({
  shape = 'rect',
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-block',
    borderRadius: shapeRadius[shape],
    width: width ?? (shape === 'circle' ? 32 : '100%'),
    height: height ?? (shape === 'circle' ? 32 : shape === 'text' ? 12 : 16),
    background:
      'linear-gradient(90deg, var(--color-rule, rgba(30,41,59,0.14)) 0%, var(--color-rule-strong, rgba(30,41,59,0.28)) 50%, var(--color-rule, rgba(30,41,59,0.14)) 100%)',
    backgroundSize: '200% 100%',
    animation: 'ferrlabs-skeleton-shine 1.6s linear infinite',
    ...style,
  };

  return (
    <div aria-hidden className={className} style={baseStyle} {...rest}>
      <style>{`
        @keyframes ferrlabs-skeleton-shine {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
