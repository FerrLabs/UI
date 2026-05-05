import { useState, type ReactNode } from 'react';
import { Sidebar, SidebarSection, SidebarItem } from '../../../primitives';
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
  product: ProductSlug;
  productName: string;
  marketingHref: string;
  accent: string;

  sections: NavGroup[];

  currentPath: string;
  onNavigate: (href: string) => void;

  projectName?: string;
  projectMeta?: string;
  onProjectClick?: () => void;

  breadcrumb?: ReactNode[];
  topbarRight?: ReactNode;

  appSwitcher?: { current: BrandDropdownAppId; apps?: BrandDropdownApp[] };

  children: ReactNode;
}

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

  const brand = appSwitcher ? (
    <BrandDropdown current={appSwitcher.current} apps={appSwitcher.apps} collapsed={collapsed}>
      <LogoMark accent={accent} product={product} />
      {!collapsed && (
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}>
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: collapsed ? '20px 0' : '20px 20px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        width: '100%',
      }}
    >
      <LogoMark accent={accent} product={product} />
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}>
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
    </div>
  );

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
      <Sidebar
        brand={brand}
        project={
          projectName
            ? { name: projectName, meta: projectMeta, onClick: onProjectClick, accent }
            : undefined
        }
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      >
        {sections.map((group, gi) => (
          <SidebarSection key={group.title ?? `g-${gi}`} title={group.title} collapsed={collapsed}>
            {group.items.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={isActive(item.href)}
                collapsed={collapsed}
                accent={accent}
                badge={item.badge ?? undefined}
                onClick={() => onNavigate(item.href)}
              />
            ))}
          </SidebarSection>
        ))}
      </Sidebar>

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
