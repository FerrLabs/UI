interface Props {
  name: string;
  src?: string | null;
  accent?: string;
  size?: number;
}

/** Circle avatar — image if `src`, otherwise initials over `accent`. */
export function Avatar({ name, src, accent, size = 28 }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        style={{ width: size, height: size, borderRadius: size / 2, display: 'block' }}
      />
    );
  }
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: accent ?? 'var(--color-rule-strong)',
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: size * 0.4,
        fontWeight: 500,
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}
