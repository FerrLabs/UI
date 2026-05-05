import { Fragment, type ReactNode } from 'react';

export interface BreadcrumbCrumb {
  label: ReactNode;
  href?: string;
}

interface Props {
  /** Mono uppercase label above the title. Free-form ReactNode. */
  eyebrow?: ReactNode;
  /** Optional breadcrumbs row above the eyebrow / title. */
  breadcrumbs?: BreadcrumbCrumb[];
  /** Fraunces 900 title. */
  title: ReactNode;
  /** Sub-headline below the title. */
  sub?: ReactNode;
  /** Inline node next to the title — typically a Tag for status / version. */
  badge?: ReactNode;
  /** Right-aligned action slot — typically Button(s). */
  actions?: ReactNode;
}

/** Per-page top chrome — Fraunces 900 title + mono eyebrow + sub + actions + optional breadcrumbs + badge. */
export function PageHeader({ eyebrow, breadcrumbs, title, sub, badge, actions }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 24,
        padding: '32px 32px 24px',
        borderBottom: '1px solid var(--color-rule)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 240 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.06em',
              color: 'var(--color-fg-3)',
              marginBottom: eyebrow ? 8 : 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {breadcrumbs.map((c, i) => (
              <Fragment key={i}>
                {i > 0 && (
                  <span aria-hidden style={{ opacity: 0.5 }}>
                    /
                  </span>
                )}
                {c.href ? (
                  <a
                    href={c.href}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-fg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                  >
                    {c.label}
                  </a>
                ) : (
                  <span aria-current="page" style={{ color: 'var(--color-fg-2)' }}>
                    {c.label}
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
        )}
        {eyebrow && (
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--color-fg-3)',
              marginBottom: 12,
            }}
          >
            {eyebrow}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 900,
              fontSize: 'clamp(28px, 3vw, 40px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              margin: 0,
            }}
          >
            {title}
          </h1>
          {badge}
        </div>
        {sub && (
          <p
            style={{
              fontSize: 15,
              color: 'var(--color-fg-2)',
              marginTop: 8,
              marginBottom: 0,
              maxWidth: 600,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}
