import type { CSSProperties, ReactNode } from 'react';

export interface FooterColumn {
  title: ReactNode;
  links: Array<{ label: ReactNode; href: string; external?: boolean }>;
}

export interface FooterProps {
  /** Brand cluster — typically a logo (SVG) + wordmark. Sits in the left column. */
  brand?: ReactNode;
  /** Italic Fraunces tagline below the brand. */
  tagline?: ReactNode;
  /** Right-side link columns (Products / Resources / Company / Legal). */
  columns?: FooterColumn[];
  /** Bottom-row content — typically a `© FerrLabs` rights notice. */
  bottom?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Editorial site footer — paper background, Fraunces wordmark + italic
 * colophon, mono uppercase column titles, paper-ink links. Mirrors the
 * holding ferrlabs.com footer at `FerrLabs-Cloud/site/src/components/Footer.astro`.
 *
 * Uses the var(--color-paper / --color-ink / --color-rule / --font-display /
 * --font-mono) tokens from `@ferrlabs/styles`. No Tailwind classes — same
 * inline-style + token contract as the rest of the editorial bundle.
 */
export function Footer({ brand, tagline, columns, bottom, className, style }: FooterProps) {
  return (
    <footer
      className={className}
      style={{
        padding: '96px 0 48px',
        borderTop: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
        background: 'var(--color-paper, #faf8f4)',
        color: 'var(--color-ink, #1e293b)',
        ...style,
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 2fr)',
            gap: 64,
          }}
        >
          <div>
            {brand && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  color: 'var(--color-ink, #1e293b)',
                }}
              >
                {brand}
              </div>
            )}
            {tagline && (
              <p
                style={{
                  fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
                  fontStyle: 'italic',
                  fontSize: 18,
                  lineHeight: 1.5,
                  color: 'var(--color-ink-2, #475569)',
                  margin: '24px 0 0',
                  maxWidth: 380,
                }}
              >
                {tagline}
              </p>
            )}
          </div>

          {columns && columns.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, 1fr)`,
                gap: 24,
              }}
            >
              {columns.map((c, i) => (
                <div key={i}>
                  <div
                    className="mono"
                    style={{
                      fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                      fontSize: 11,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'var(--color-ink-3, #64748b)',
                      marginBottom: 16,
                    }}
                  >
                    {c.title}
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    {c.links.map((l, j) => (
                      <li key={j}>
                        <a
                          href={l.href}
                          target={l.external ? '_blank' : undefined}
                          rel={l.external ? 'noreferrer' : undefined}
                          style={{
                            fontSize: 14,
                            color: 'var(--color-ink-2, #475569)',
                            textDecoration: 'none',
                            transition: 'color 160ms ease',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = 'var(--color-ink, #1e293b)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = 'var(--color-ink-2, #475569)')
                          }
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {bottom && (
          <div
            style={{
              marginTop: 80,
              paddingTop: 24,
              borderTop: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <span
              className="mono"
              style={{
                fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                fontSize: 11,
                letterSpacing: '0.06em',
                color: 'var(--color-ink-3, #64748b)',
              }}
            >
              {bottom}
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}
