export type ProductSlug = 'ferrflow' | 'ferrvault' | 'ferrtrack' | 'ferrgrowth' | 'ferragents' | 'ferrfleet' | 'ferrlabs';

interface Props {
  size?: number;
  accent?: string;
  product: ProductSlug;
}

/**
 * Per-product wordless logo mark. Same SVG paths as the brand bundle's
 * `app-shell.jsx` `AppLogoMark` — the source of truth for these icons is
 * `FerrLabs-Cloud/docs/design-bundle/app-shell.jsx`. Update both if a
 * mark changes.
 */
export function AppLogoMark({ size = 24, accent = 'currentColor', product }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ display: 'block' }}>
      {product === 'ferrflow' && (
        <g>
          <line x1="6" y1="16" x2="14" y2="16" stroke={accent} strokeWidth="1.6" />
          <line x1="18" y1="16" x2="24" y2="10" stroke={accent} strokeWidth="1.6" />
          <line x1="18" y1="16" x2="24" y2="22" stroke={accent} strokeWidth="1.6" />
          <circle cx="4"  cy="16" r="3" fill={accent} />
          <circle cx="16" cy="16" r="3" fill={accent} />
          <circle cx="26" cy="10" r="3" fill={accent} opacity="0.6" />
          <circle cx="26" cy="22" r="3" fill={accent} opacity="0.6" />
        </g>
      )}
      {product === 'ferrvault' && (
        <g>
          <circle cx="16" cy="14" r="9" stroke={accent} strokeWidth="2" fill="none" />
          <circle cx="16" cy="13" r="3" fill={accent} />
          <rect x="14.5" y="14" width="3" height="7" fill={accent} />
        </g>
      )}
      {product === 'ferrtrack' && (
        <g>
          <circle cx="16" cy="16" r="11" stroke={accent} strokeWidth="1" fill="none" opacity="0.3" />
          <circle cx="16" cy="16" r="7" stroke={accent} strokeWidth="1.4" fill="none" opacity="0.55" />
          <circle cx="16" cy="16" r="3" fill={accent} />
          <line x1="16" y1="16" x2="26" y2="6" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
      {product === 'ferrgrowth' && (
        <g>
          <line x1="16" y1="28" x2="16" y2="14" stroke={accent} strokeWidth="2" strokeLinecap="round" />
          <path d="M 16 18 Q 8 16, 6 8 Q 14 8, 16 14" fill={accent} />
          <path d="M 16 14 Q 24 12, 26 4 Q 18 4, 16 12" fill={accent} opacity="0.65" />
        </g>
      )}
      {product === 'ferrlabs' && (
        <g>
          <text x="4"  y="22" fontFamily="DM Mono, ui-monospace, monospace" fontSize="12" fill={accent} opacity="0.5">[</text>
          <text x="16" y="22" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="900" fontSize="14" fill={accent} letterSpacing="-0.02em">FL</text>
          <text x="28" y="22" textAnchor="end" fontFamily="DM Mono, ui-monospace, monospace" fontSize="12" fill={accent} opacity="0.5">]</text>
        </g>
      )}
      {(product === 'ferragents' || product === 'ferrfleet') && (
        <g>
          <circle cx="16" cy="16" r="3.5" fill={accent} />
          <circle cx="16" cy="16" r="10" stroke={accent} strokeWidth="1.2" fill="none" opacity="0.35" />
          <circle cx="16" cy="16" r="14" stroke={accent} strokeWidth="0.9" fill="none" opacity="0.2" />
          <circle cx="26" cy="16" r="2.5" fill={accent} />
          <circle cx="9" cy="9" r="2" fill={accent} opacity="0.7" />
        </g>
      )}
    </svg>
  );
}
