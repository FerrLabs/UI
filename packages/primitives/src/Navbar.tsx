import type { CSSProperties, ReactNode } from 'react';

export interface NavbarProps {
  /** Brand cluster — typically a logo (SVG) + Fraunces wordmark anchored to `/`. */
  brand?: ReactNode;
  /** Centre nav (`<NavLink>`s) — mono uppercase links with underline on hover. */
  links?: ReactNode;
  /** Right-side action cluster (lang pill, GitHub button, sign-in). */
  actions?: ReactNode;
  /** When true, sticks to the top with a backdrop blur. */
  sticky?: boolean;
  className?: string;
  style?: CSSProperties;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Editorial site navbar — paper background + backdrop blur, 72px tall,
 * 1440px max-width, mono uppercase links. Mirrors the holding ferrlabs.com
 * navbar at `FerrLabs-Cloud/site/src/components/Navbar.astro`.
 */
export function Navbar({ brand, links, actions, sticky = true, className, style }: NavbarProps) {
  return (
    <header
      className={className}
      style={{
        position: sticky ? 'sticky' : 'relative',
        top: sticky ? 0 : undefined,
        zIndex: 50,
        background: 'rgba(250, 248, 244, 0.85)',
        WebkitBackdropFilter: sticky ? 'saturate(140%) blur(14px)' : undefined,
        backdropFilter: sticky ? 'saturate(140%) blur(14px)' : undefined,
        borderBottom: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
        ...style,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 40px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {brand && (
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'var(--color-ink, #1e293b)',
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {brand}
          </a>
        )}
        {links && (
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              marginLeft: 'auto',
            }}
          >
            {links}
          </nav>
        )}
        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginLeft: links ? 0 : 'auto',
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export interface NavLinkProps {
  href: string;
  children: ReactNode;
  active?: boolean;
  external?: boolean;
  className?: string;
}

/**
 * Editorial navbar link — mono uppercase 12px, with an underline that
 * scales-in on hover. Same pattern as the real ferrlabs.com nav.
 */
export function NavLink({ href, children, active = false, external, className }: NavLinkProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      aria-current={active ? 'page' : undefined}
      className={classes('mono', className)}
      style={{
        position: 'relative',
        fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
        fontSize: 12,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: active ? 'var(--color-ink, #1e293b)' : 'var(--color-ink-2, #475569)',
        textDecoration: 'none',
        padding: '6px 0',
        cursor: 'pointer',
        transition: 'color 180ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-ink, #1e293b)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = active
          ? 'var(--color-ink, #1e293b)'
          : 'var(--color-ink-2, #475569)';
      }}
    >
      {children}
      {external && (
        <span aria-hidden style={{ marginLeft: 6, opacity: 0.6 }}>
          ↗
        </span>
      )}
    </a>
  );
}
