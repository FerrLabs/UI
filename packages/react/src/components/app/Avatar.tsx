import { useState } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
export type AvatarShape = 'circle' | 'square';

interface Props {
  name: string;
  src?: string | null;
  /** Hex accent for the initials background. Defaults to `--color-rule-strong`. */
  accent?: string;
  /** Number (px) or token (xs=20, sm=24, md=28, lg=40, xl=56). */
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
  alt?: string;
}

const sizeMap: Record<Exclude<AvatarSize, number>, number> = {
  xs: 20,
  sm: 24,
  md: 28,
  lg: 40,
  xl: 56,
};

function resolveSize(size: AvatarSize): number {
  return typeof size === 'number' ? size : sizeMap[size];
}

/**
 * Editorial avatar — image when `src` set, otherwise mono initials over `accent`.
 * Falls back to initials if the image errors. Square or circle.
 */
export function Avatar({ name, src, accent, size = 28, shape = 'circle', className, alt }: Props) {
  const [errored, setErrored] = useState(false);
  const px = resolveSize(size);
  const radius = shape === 'circle' ? px / 2 : Math.max(4, px * 0.18);

  if (src && !errored) {
    return (
      <img
        src={src}
        alt={alt ?? name}
        title={name}
        className={className}
        onError={() => setErrored(true)}
        style={{
          width: px,
          height: px,
          borderRadius: radius,
          display: 'block',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  const initials =
    name
      .split(' ')
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  return (
    <span
      className={className}
      title={name}
      style={{
        width: px,
        height: px,
        borderRadius: radius,
        background: accent ?? 'var(--color-rule-strong)',
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: px * 0.4,
        fontWeight: 500,
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initials}
    </span>
  );
}
