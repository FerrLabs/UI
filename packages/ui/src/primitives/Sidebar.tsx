import {
  cloneElement,
  isValidElement,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

export interface SidebarProps {
  /**
   * Brand cluster for the 64px top cell. For FerrLabs apps, pass a `<BrandDropdown>`
   * from `@ferrlabs/ui-react` so users can switch between the suite (FerrFlow / Vault /
   * Track / Growth / Fleet). The brand cell has zero horizontal padding — the brand
   * component owns its own padding (BrandDropdown already provides `0 20px` extended
   * and `0` collapsed). For a plain logo + name without dropdown, wrap content in a
   * `<div style={{ padding: '0 20px' }}>`.
   */
  brand?: ReactNode;
  /**
   * Optional project / org switcher row directly below the brand cell. For a static
   * tile (just shows the current project, opens nothing on click — or fires `onClick`),
   * pass the structured object form. For a real switcher dropdown listing multiple orgs,
   * use `projectSlot` with an `<OrgDropdown>` from `@ferrlabs/ui-react`.
   */
  project?: {
    name: string;
    meta?: ReactNode;
    onClick?: () => void;
    /** Hex accent for the leading initial tile. Defaults to var(--color-accent). */
    accent?: string;
  };
  /**
   * Custom node rendered in the project-switcher slot. Takes precedence over `project`.
   * Use with `<OrgDropdown>` from `@ferrlabs/ui-react` to give users a real org picker.
   * The component must handle its own outer margin (`OrgDropdown` already does).
   *
   * When passed a React element, the Sidebar will clone it with a `collapsed` prop
   * matching the current sidebar state — so an `<OrgDropdown>` automatically shrinks
   * to its 48px compact tile when the sidebar collapses. Pass a function form
   * (`(collapsed) => <OrgDropdown collapsed={collapsed} />`) for explicit control.
   */
  projectSlot?: ReactNode | ((collapsed: boolean) => ReactNode);
  /** Nav items + section headers — pass `<SidebarSection>` and `<SidebarItem>` children. */
  children?: ReactNode;
  /** Custom footer slot. When omitted, a built-in "Collapse / Expand" toggle renders instead. */
  footer?: ReactNode;
  /** Controlled collapse state. Omit to use the built-in toggle (uncontrolled). */
  collapsed?: boolean;
  /** Called when the built-in collapse toggle is clicked. Required if `collapsed` is controlled. */
  onCollapsedChange?: (next: boolean) => void;
  width?: number | string;
  collapsedWidth?: number | string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Editorial app sidebar — paper-app palette, Fraunces serif item labels,
 * left accent bar on the active item. Mirror of the Shell sidebar in
 * `@ferrlabs/ui-react/Shell`. Use this when you need the sidebar without
 * the full Shell chrome (no topbar, no breadcrumb, no main outlet).
 */
export function Sidebar({
  brand,
  project,
  projectSlot,
  children,
  footer,
  collapsed: collapsedProp,
  onCollapsedChange,
  width = 256,
  collapsedWidth = 64,
  className,
  style,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isControlled = collapsedProp !== undefined;
  const collapsed = isControlled ? Boolean(collapsedProp) : internalCollapsed;

  const toggle = () => {
    const next = !collapsed;
    if (isControlled) {
      onCollapsedChange?.(next);
    } else {
      setInternalCollapsed(next);
      onCollapsedChange?.(next);
    }
  };

  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={className}
      style={{
        flexShrink: 0,
        width: collapsed ? collapsedWidth : width,
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-app-sidebar, #f7f7f5)',
        borderRight: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
        transition: 'width 220ms ease',
        ...style,
      }}
    >
      {brand && (
        <div
          style={{
            height: 64,
            minHeight: 64,
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: collapsed ? 'center' : 'stretch',
            borderBottom: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
          }}
        >
          {brand}
        </div>
      )}

      {resolveProjectSlot(projectSlot, collapsed) ??
        (project &&
          (collapsed ? (
            <button
              type="button"
              onClick={project.onClick}
              aria-label={project.name}
              title={project.name}
              data-project-switcher
              style={{
                margin: '6px auto 12px',
                width: 36,
                height: 36,
                padding: 0,
                background: project.accent ?? 'var(--color-accent, var(--color-fg))',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
                fontWeight: 900,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              {project.name[0]?.toUpperCase()}
            </button>
          ) : (
            <button
              type="button"
              onClick={project.onClick}
              data-project-switcher
              style={{
                margin: 12,
                padding: '10px 12px',
                background: 'var(--color-card, #fff)',
                border: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                color: 'var(--color-ink, #1e293b)',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: project.accent ?? 'var(--color-accent, var(--color-fg))',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
                  fontWeight: 900,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {project.name[0]?.toUpperCase()}
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
                  {project.name}
                </div>
                {project.meta && (
                  <div
                    className="mono"
                    style={{
                      fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                      fontSize: 10,
                      color: 'var(--color-ink-3, #64748b)',
                    }}
                  >
                    {project.meta}
                  </div>
                )}
              </div>
              <span style={{ color: 'var(--color-ink-3, #64748b)', fontSize: 10 }}>▾</span>
            </button>
          )))}

      <nav
        style={{
          flex: 1,
          padding: '8px 8px',
          overflowY: 'auto',
        }}
      >
        {children}
      </nav>

      {footer ?? (
        <div
          style={{
            borderTop: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
            padding: 8,
          }}
        >
          <button
            type="button"
            onClick={toggle}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-ink-3, #64748b)',
              fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
              fontSize: 11,
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: 10,
            }}
          >
            <span aria-hidden>{collapsed ? '→' : '←'}</span>
            <span
              style={{
                opacity: collapsed ? 0 : 1,
                maxWidth: collapsed ? 0 : 999,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'opacity 160ms ease, max-width 220ms ease',
              }}
            >
              Collapse
            </span>
          </button>
        </div>
      )}
    </aside>
  );
}

export interface SidebarSectionProps {
  title?: ReactNode;
  collapsed?: boolean;
  children: ReactNode;
}

export function SidebarSection({ title, collapsed = false, children }: SidebarSectionProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {title && (
        <div
          className="mono"
          aria-hidden={collapsed || undefined}
          style={{
            fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
            padding: collapsed ? '0 12px' : '4px 12px',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-3, #64748b)',
            marginBottom: collapsed ? 0 : 6,
            opacity: collapsed ? 0 : 1,
            maxHeight: collapsed ? 0 : 24,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition:
              'opacity 160ms ease, max-height 220ms ease, padding 220ms ease, margin-bottom 220ms ease',
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Standard wrapper for nav-item icons. Renders content in a 16×16 grid cell,
 * line-height stripped, perfectly centered. Use this around any glyph (Unicode
 * char, SVG, emoji) so width / leading inconsistencies don't shift the icon
 * relative to its row. Already applied internally by `<SidebarItem icon={...}>`,
 * but exposed for consumers building custom rows or non-Sidebar surfaces.
 */
export function SidebarIcon({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        lineHeight: 1,
        fontSize: 14,
      }}
    >
      {children}
    </span>
  );
}

export interface SidebarItemProps {
  href?: string;
  icon?: ReactNode;
  label: ReactNode;
  active?: boolean;
  badge?: ReactNode;
  collapsed?: boolean;
  /** Override the accent used for the active state (defaults to var(--color-accent)). */
  accent?: string;
  onClick?: () => void;
  /**
   * Renders the item with a destructive red accent (label, icon, hover). Use
   * for "Delete vault", "Leave workspace", "Sign out of all sessions". Pairs
   * naturally with a confirm dialog on `onClick`.
   */
  danger?: boolean;
  /**
   * Greys out the item and intercepts clicks. Use to keep an admin-only row
   * visible to non-admins (so the surface is discoverable) while preventing
   * the action.
   */
  disabled?: boolean;
}

export function SidebarItem({
  href,
  icon,
  label,
  active = false,
  badge,
  collapsed = false,
  accent,
  onClick,
  danger = false,
  disabled = false,
}: SidebarItemProps) {
  const accentColor = accent ?? 'var(--color-accent, var(--color-fg))';
  const dangerColor = 'var(--color-danger, #dc2626)';
  const idleColor = danger ? dangerColor : 'var(--color-ink-2, #475569)';
  const activeColor = danger ? dangerColor : 'var(--color-ink, #1e293b)';

  const baseStyle: CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    justifyContent: 'flex-start',
    margin: '1px 0',
    borderRadius: 8,
    background: active ? 'var(--color-app-nav-active, rgba(30, 41, 59, 0.06))' : 'transparent',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    color: active ? activeColor : idleColor,
    opacity: disabled ? 0.45 : 1,
    fontSize: 13.5,
    fontFamily: 'var(--font-display, "Fraunces", Georgia, ui-serif, serif)',
    transition: 'background 120ms',
    position: 'relative',
    textDecoration: 'none',
    textAlign: 'left',
    overflow: 'hidden',
  };

  const onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (active || disabled) return;
    e.currentTarget.style.background = danger
      ? 'color-mix(in oklab, var(--color-danger, #dc2626) 8%, transparent)'
      : 'var(--color-app-nav-hover, rgba(30, 41, 59, 0.03))';
  };
  const onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (active || disabled) return;
    e.currentTarget.style.background = 'transparent';
  };

  const content = (
    <>
      {active && !collapsed && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 8,
            bottom: 8,
            width: 2,
            background: accentColor,
            borderRadius: 2,
          }}
        />
      )}
      {icon && (
        <span
          style={{
            width: 16,
            height: 16,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            color: active ? accentColor : 'var(--color-ink-3, #64748b)',
            fontSize: 14,
            lineHeight: 1,
            transform: collapsed ? 'translateX(4px)' : 'none',
            transition: 'transform 220ms ease, color 160ms ease',
          }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          flex: 1,
          textAlign: 'left',
          opacity: collapsed ? 0 : 1,
          maxWidth: collapsed ? 0 : 999,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          transition: 'opacity 160ms ease, max-width 220ms ease',
        }}
      >
        {label}
      </span>
      {badge != null && (
        <span
          className="mono"
          aria-hidden={collapsed || undefined}
          style={{
            fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
            fontSize: 10,
            padding: collapsed ? 0 : '1px 7px',
            borderRadius: 999,
            background: collapsed
              ? 'transparent'
              : active
                ? accentColor
                : 'var(--color-rule, rgba(30, 41, 59, 0.14))',
            color: active ? '#fff' : 'var(--color-ink-3, #64748b)',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 999,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition:
              'opacity 160ms ease, max-width 220ms ease, padding 220ms ease, background 160ms ease',
          }}
        >
          {badge}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        title={collapsed && typeof label === 'string' ? label : undefined}
        aria-current={active ? 'page' : undefined}
        aria-disabled={disabled || undefined}
        style={baseStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          if (!onClick) return;
          if (
            e.defaultPrevented ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
          ) {
            return;
          }
          e.preventDefault();
          onClick();
        }}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={collapsed && typeof label === 'string' ? label : undefined}
      aria-current={active ? 'page' : undefined}
      style={baseStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {content}
    </button>
  );
}

/**
 * Resolve `projectSlot` into a renderable node. Three input shapes:
 * - Function `(collapsed) => ReactNode` — call with current collapse state.
 * - React element (e.g. `<OrgDropdown />`) — clone with a `collapsed` prop
 *   injected so components like OrgDropdown shrink to their compact tile
 *   when the sidebar collapses, without the caller wiring it manually.
 *   We only inject if the element doesn't already define `collapsed`, so
 *   explicit overrides win.
 * - Any other ReactNode — returned as-is (text, fragments, arrays).
 */
function resolveProjectSlot(
  projectSlot: SidebarProps['projectSlot'],
  collapsed: boolean,
): ReactNode {
  if (projectSlot === undefined) return undefined;
  if (typeof projectSlot === 'function') {
    return (projectSlot as (collapsed: boolean) => ReactNode)(collapsed);
  }
  if (isValidElement(projectSlot)) {
    const props = (projectSlot as ReactElement<{ collapsed?: boolean }>).props;
    if (props && 'collapsed' in props && props.collapsed !== undefined) {
      return projectSlot;
    }
    return cloneElement(projectSlot as ReactElement<{ collapsed?: boolean }>, {
      collapsed,
    });
  }
  return projectSlot;
}
