import { useState, type CSSProperties } from 'react';

export interface SiteFaviconProps {
  domain?: string | null;
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const FAVICON_PALETTE = [
  '#7c3aed',
  '#10b981',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
  '#0ea5e9',
  '#84cc16',
  '#f43f5e',
];

function hashIndex(input: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h % mod;
}

function deriveInitials(name: string): string {
  return name
    .replace(/^www\./, '')
    .replace(/\.[a-z]{2,}$/i, '')
    .slice(0, 2)
    .toUpperCase();
}

export function SiteFavicon({ domain, name, size = 18, className, style }: SiteFaviconProps) {
  const [errored, setErrored] = useState(false);
  const initials = deriveInitials(name);
  const bg = FAVICON_PALETTE[hashIndex(domain ?? name, FAVICON_PALETTE.length)];

  if (!domain || errored) {
    return (
      <span
        aria-hidden
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: Math.max(3, Math.floor(size * 0.22)),
          background: bg,
          color: '#fff',
          fontSize: Math.max(8, Math.floor(size * 0.5)),
          fontWeight: 600,
          letterSpacing: '0.02em',
          flexShrink: 0,
          ...style,
        }}
      >
        {initials}
      </span>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
      alt=""
      width={size}
      height={size}
      onError={() => setErrored(true)}
      className={className}
      style={{
        borderRadius: Math.max(3, Math.floor(size * 0.22)),
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
