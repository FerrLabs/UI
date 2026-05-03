import { useState, type ReactNode } from 'react';
import { LogoMark, type ProductSlug } from './LogoMark';
import { BrandDropdown, type BrandDropdownAppId, type BrandDropdownApp } from './BrandDropdown';

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  href: string;
  badge?: string | number | null;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface ShellProps {
  /** Product slug — selects the brand mark and is the canonical identifier. */
  product: ProductSlug;
  /** Display name shown next to the mark in the sidebar header. */
  productName: string;
  /** Link to the marketing site (opens with the small "by ferrlabs ↗" hint). */
  marketingHref: string;
  /** Hex accent color for active state, brand mark, project switcher tile. */
  accent: string;

  sections: NavGroup[];

  /**
   * Active route — the Shell highlights the nav item whose `href` matches.
   * Match policy: exact match OR `currentPath` starts with `href + '/'`.
   * The caller (router-aware) supplies this; the Shell stays agnostic of
   * react-router / next / wouter / …
   */
  currentPath: string;

  /**
   * Navigation handler — fires on nav-item click. Caller wires it to its
   * own router (`navigate(href)`, `router.push(href)`, …).
   */
  onNavigate: (href: string) => void;

  /** Optional project switcher in the sidebar (top of nav). */
  projectName?: string;
  projectMeta?: string;
  onProjectClick?: () => void;

  /** Topbar breadcrumb segments — strings or React nodes. */
  breadcrumb?: ReactNode[];

  /** Topbar right-side cluster (search hint, primary action, avatar, …). */
  topbarRight?: ReactNode;

  /**
   * When set, wraps the sidebar brand block in a clickable dropdown that
   * lets the user switch between FerrLabs apps. Pass `current` to mark the
   * active app; optionally override the app list.
   */
  appSwitcher?: { current: BrandDropdownAppId; apps?: BrandDropdownApp[] };

  /** Page content. */
  children: ReactNode;
}

/**
 * Canonical product-app shell — sidebar (256px / 64px collapsed) +
 * topbar (64px) + main outlet. Token-driven (`--color-bg`,
 * `--color-app-sidebar`, `--color-rule`, `--color-fg*`) — the consuming app
 * provides them via `_app-base.css` (see
 * `FerrLabs-Cloud/docs/design-bundle/_app-base.css`).
 *
 * Router-agnostic: pass `currentPath` + `onNavigate`. Adapters for
 * react-router / next live in the consuming app.
 */
export function Shell({
  product,
  productName,
  marketingHref,
  accent,
  sections,
  currentPath,
  onNavigate,
  projectName,
  projectMeta,
  onProjectClick,
  breadcrumb,
  topbarRight,
  appSwitcher,
  children,
}: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <div
      className="ferrlabs-app-shell"
      style={{
        display: 'grid',
        gridTemplateColumns: collapsed ? '64px 1fr' : '256px 1fr',
        minHeight: '100vh',
        transition: 'grid-template-columns 220ms ease',
      }}
    >
      <aside
        style={{
          background: 'var(--color-app-sidebar)',
          borderRight: '1px solid var(--color-rule)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          alignSelf: 'start',
          height: '100vh',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: appSwitcher && !collapsed ? 0 : collapsed ? '20px 0' : '20px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid var(--color-rule)',
            height: 64,
            minHeight: 64,
            boxSizing: 'border-box',
          }}
        >
          {appSwitcher ? (
            <BrandDropdown
              current={appSwitcher.current}
              apps={appSwitcher.apps}
              collapsed={collapsed}
            >
              <LogoMark accent={accent} product={product} />
              {!collapsed && (
                <span
                  style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 900,
                      fontSize: 17,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {productName.toLowerCase()}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 9.5,
                      color: 'var(--color-fg-3)',
                      letterSpacing: '0.08em',
                      marginTop: 2,
                    }}
                  >
                    by ferrlabs
                  </span>
                </span>
              )}
            </BrandDropdown>
          ) : (
            <>
              <LogoMark accent={accent} product={product} />
              {!collapsed && (
                <div
                  style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 900,
                      fontSize: 17,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {productName.toLowerCase()}
                  </span>
                  <a
                    href={marketingHref}
                    className="mono"
                    style={{
                      fontSize: 9.5,
                      color: 'var(--color-fg-3)',
                      letterSpacing: '0.08em',
                      marginTop: 2,
                    }}
                  >
                    by ferrlabs ↗
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {projectName &&
          (collapsed ? (
            <button
              type="button"
              onClick={onProjectClick}
              aria-label={projectName}
              title={projectName}
              data-project-switcher
              style={{
                margin: '6px auto 12px',
                width: 36,
                height: 36,
                padding: 0,
                background: accent,
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-serif)',
                fontWeight: 900,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              {projectName[0]?.toUpperCase()}
            </button>
          ) : (
            <button
              type="button"
              onClick={onProjectClick}
              data-project-switcher
              style={{
                margin: 12,
                padding: '10px 12px',
                background: 'var(--color-card)',
                border: '1px solid var(--color-rule)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                color: 'var(--color-fg)',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: accent,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 900,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {projectName[0]?.toUpperCase()}
              </span>
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {projectName}
                </div>
                {projectMeta && (
                  <div className="mono" style={{ fontSize: 10, color: 'var(--color-fg-3)' }}>
                    {projectMeta}
                  </div>
                )}
              </div>
              <span style={{ color: 'var(--color-fg-3)', fontSize: 10 }}>▾</span>
            </button>
          ))}

        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {sections.map((group, gi) => (
            <div key={group.title ?? `g-${gi}`} style={{ marginBottom: 24 }}>
              {!collapsed && group.title && (
                <div
                  className="mono"
                  style={{
                    padding: '4px 12px',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--color-fg-3)',
                    marginBottom: 6,
                  }}
                >
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.href)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: collapsed ? '10px 0' : '8px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      margin: '1px 0',
                      borderRadius: 8,
                      background: active ? 'var(--color-app-nav-active)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: active ? 'var(--color-fg)' : 'var(--color-fg-2)',
                      fontSize: 13.5,
                      fontFamily: 'var(--font-serif)',
                      transition: 'background 120ms',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = 'var(--color-app-nav-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {active && !collapsed && (
                      <span
                        aria-hidden
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 8,
                          bottom: 8,
                          width: 2,
                          background: accent,
                          borderRadius: 2,
                        }}
                      />
                    )}
                    <span
                      style={{
                        width: 16,
                        display: 'inline-flex',
                        justifyContent: 'center',
                        color: active ? accent : 'var(--color-fg-3)',
                        fontSize: 14,
                      }}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
                    {!collapsed && item.badge != null && (
                      <span
                        className="mono"
                        style={{
                          fontSize: 10,
                          padding: '1px 7px',
                          borderRadius: 999,
                          background: active ? accent : 'var(--color-rule)',
                          color: active ? '#fff' : 'var(--color-fg-3)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--color-rule)', padding: 8 }}>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-fg-3)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10,
            }}
          >
            <span aria-hidden>{collapsed ? '→' : '←'}</span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 28px',
            borderBottom: '1px solid var(--color-rule)',
            background: 'var(--color-bg)',
            position: 'sticky',
            top: 0,
            zIndex: 5,
            gap: 16,
          }}
        >
          <div
            className="mono"
            style={{
              fontSize: 12,
              color: 'var(--color-fg-3)',
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}
          >
            {(breadcrumb ?? []).map((b, i, a) => (
              <span key={i} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <span
                  style={{ color: i === a.length - 1 ? 'var(--color-fg)' : 'var(--color-fg-3)' }}
                >
                  {b}
                </span>
                {i < a.length - 1 && <span style={{ opacity: 0.5 }}>/</span>}
              </span>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{topbarRight}</div>
        </header>
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg)' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .ferrlabs-app-shell { grid-template-columns: 1fr !important; }
          .ferrlabs-app-shell > aside { display: none; }
        }
      `}</style>
    </div>
  );
}
