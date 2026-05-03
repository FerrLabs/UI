import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: 'rect' | 'text' | 'circle';
  width?: string | number;
  height?: string | number;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

const shapeStyles = {
  rect: 'rounded-md',
  text: 'rounded h-3',
  circle: 'rounded-full',
} as const;

export function Skeleton({
  shape = 'rect',
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={classes(
        'inline-block bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-[skeleton-shine_1.6s_linear_infinite]',
        shapeStyles[shape],
        className,
      )}
      style={{
        width: width ?? (shape === 'circle' ? 32 : '100%'),
        height: height ?? (shape === 'circle' ? 32 : shape === 'text' ? 12 : 16),
        ...style,
      }}
      {...rest}
    >
      <style>{`
        @keyframes skeleton-shine {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
