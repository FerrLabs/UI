import { Fragment, useState, type CSSProperties, type ReactNode } from 'react';

export interface BreadcrumbCrumb {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbCrumb[];
  separator?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

function CrumbLink({ href, children }: { href: string; children: ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        color: hover ? 'var(--color-ink, #1e293b)' : 'var(--color-ink-3, #64748b)',
        textDecoration: 'none',
        transition: 'color 140ms ease',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </a>
  );
}

export function Breadcrumb({
  items,
  separator = '/',
  className,
  style,
  ariaLabel = 'Breadcrumb',
}: BreadcrumbProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={className}
      style={{
        fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
        fontSize: 11,
        letterSpacing: '0.06em',
        ...style,
      }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
          listStyle: 'none',
          padding: 0,
          margin: 0,
        }}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 0,
                }}
              >
                {item.href && !isLast ? (
                  <CrumbLink href={item.href}>{item.label}</CrumbLink>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: isLast ? 'var(--color-ink, #1e293b)' : 'var(--color-ink-3, #64748b)',
                      fontWeight: isLast ? 600 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li
                  aria-hidden
                  style={{
                    color: 'var(--color-ink-3, #64748b)',
                    opacity: 0.6,
                  }}
                >
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
