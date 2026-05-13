import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar, SidebarSection, SidebarItem } from '../../../primitives';
import { LogoMark, type ProductSlug } from './LogoMark';
import { BrandDropdown, type BrandDropdownAppId, type BrandDropdownApp } from './BrandDropdown';
import { UserMenu, type UserMenuItem } from './UserMenu';
import { Button } from './Button';

/**
 * One topbar action — typically a "+ New <thing>" button. Each product
 * declares 1–3 of these so the right side of the topbar (between
 * `onSearch` and `userMenu`) lays out the same way across products.
 *
 * The first action defaults to `primary`, the rest to `ghost` so a single
 * call site looks like "+ New ticket" with one prominent button. Override
 * `variant` per-action when you want two equally weighted CTAs.
 */
export interface ShellAction {
  id: string;
  label: string;
  /** Defaults to `'+'` for primary actions when omitted. Pass `null` to suppress. */
  icon?: ReactNode | string | null;
  onClick: () => void;
  variant?: 'primary' | 'ghost';
  /** Displayed inside a kbd next to the label; bind the actual shortcut yourself. */
  shortcut?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

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

  /**
   * Custom node rendered in the sidebar's project-switcher slot, taking
   * precedence over the static `projectName`/`projectMeta` tile. Designed
   * for `<OrgDropdown>` from this same package — drop it in here to put
   * the org switcher in the sidebar instead of the topbar.
   *
   * If a React element is passed, the sidebar's collapse state is auto-injected
   * as a `collapsed` prop — so `<OrgDropdown>` shrinks to its 48px compact tile
   * when the sidebar collapses without the caller wiring anything. Pass a
   * function (`(collapsed) => <OrgDropdown collapsed={collapsed} />`) for
   * explicit control.
   */
  projectSlot?: ReactNode | ((collapsed: boolean) => ReactNode);

  breadcrumb?: ReactNode[];
  /**
   * Primary topbar actions — typically "+ New <thing>". Renders between
   * the search button and `topbarRight`. The first action gets the
   * `primary` style (accent-filled), the rest go `ghost` unless overridden.
   * Prefer this over hand-composing buttons in `topbarRight`; that slot
   * stays available for unusual cases (custom switchers, badges, etc).
   */
  actions?: ShellAction[];
  topbarRight?: ReactNode;

  appSwitcher?: { current: BrandDropdownAppId; apps?: BrandDropdownApp[] };

  /**
   * When present, the topbar renders a clickable search trigger styled as
   * a `⌘K` hint button. The handler is the consumer's responsibility — it
   * typically opens a command palette / search modal. The same handler is
   * also bound to the cmd/ctrl+K keyboard shortcut globally on the Shell.
   */
  onSearch?: () => void;

  /**
   * When present, an avatar + name button appears at the far right of the
   * topbar. Clicking opens a dropdown with the supplied items (Profile,
   * Sign out, etc.). Pass `null` to omit on auth/login surfaces.
   */
  userMenu?: {
    name: string;
    email?: string;
    avatarSrc?: string | null;
    items: UserMenuItem[];
    showName?: boolean;
  };

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
  projectSlot,
  breadcrumb,
  actions,
  topbarRight,
  appSwitcher,
  onSearch,
  userMenu,
  children,
}: ShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!onSearch) return;
    const handler = (e: KeyboardEvent) => {
      const isK = e.key === 'k' || e.key === 'K';
      if (isK && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        onSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSearch]);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  const brand = appSwitcher ? (
    <BrandDropdown current={appSwitcher.current} apps={appSwitcher.apps} collapsed={collapsed}>
      <LogoMark accent={accent} product={product} />
      {!collapsed && (
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1.1,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 900,
              fontSize: 17,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1.1,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 900,
              fontSize: 17,
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
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
        projectSlot={projectSlot}
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
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              aria-label="Open search (Cmd+K)"
              className="mono"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px 6px 12px',
                borderRadius: 8,
                border: '1px solid var(--color-rule)',
                background: 'var(--color-bg-2, #f4f4f2)',
                color: 'var(--color-fg-3)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'background 120ms, border-color 120ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-card, #fff)';
                e.currentTarget.style.borderColor = 'var(--color-rule-strong)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-2, #f4f4f2)';
                e.currentTarget.style.borderColor = 'var(--color-rule)';
              }}
            >
              <span style={{ opacity: 0.7 }}>Search</span>
              <kbd
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '1px 5px',
                  borderRadius: 4,
                  border: '1px solid var(--color-rule)',
                  background: 'var(--color-card, #fff)',
                  fontFamily: 'inherit',
                  fontSize: 10.5,
                  letterSpacing: '0.04em',
                }}
              >
                ⌘K
              </kbd>
            </button>
          )}
          {actions && actions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {actions.map((action, i) => (
                <ShellActionButton
                  key={action.id}
                  action={action}
                  accent={accent}
                  defaultVariant={i === 0 ? 'primary' : 'ghost'}
                />
              ))}
            </div>
          )}
          {topbarRight && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{topbarRight}</div>
          )}
          {userMenu && (
            <UserMenu
              name={userMenu.name}
              email={userMenu.email}
              avatarSrc={userMenu.avatarSrc}
              accent={accent}
              items={userMenu.items}
              showName={userMenu.showName}
            />
          )}
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

function ShellActionButton({
  action,
  accent,
  defaultVariant,
}: {
  action: ShellAction;
  accent: string;
  defaultVariant: 'primary' | 'ghost';
}) {
  const variant = action.variant ?? defaultVariant;
  const icon =
    action.icon === null
      ? undefined
      : action.icon === undefined
        ? variant === 'primary'
          ? '+'
          : undefined
        : action.icon;
  return (
    <Button
      variant={variant}
      accent={accent}
      size="sm"
      icon={icon}
      onClick={action.onClick}
      disabled={action.disabled}
      aria-label={action.ariaLabel ?? action.label}
      trailingIcon={
        action.shortcut ? (
          <kbd
            className="mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0 4px',
              borderRadius: 3,
              border: '1px solid currentColor',
              opacity: 0.6,
              fontSize: 9.5,
              letterSpacing: '0.04em',
              background: 'transparent',
              fontFamily: 'inherit',
            }}
          >
            {action.shortcut}
          </kbd>
        ) : undefined
      }
    >
      {action.label}
    </Button>
  );
}
