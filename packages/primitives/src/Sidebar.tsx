import type { CSSProperties, ReactNode } from 'react';

export interface SidebarProps {
  brand?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  collapsed?: boolean;
  width?: number | string;
  collapsedWidth?: number | string;
  className?: string;
  style?: CSSProperties;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/**
 * Editorial app sidebar — paper-app palette + DM Mono section labels +
 * accent active state. Same visual language as the Shell sidebar in
 * `@ferrlabs/ui-react`. Use this when you need a sidebar without the full
 * Shell chrome (no topbar, no breadcrumb).
 */
export function Sidebar({
  brand,
  children,
  footer,
  collapsed = false,
  width = 256,
  collapsedWidth = 64,
  className,
  style,
}: SidebarProps) {
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
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '20px 0' : '20px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderBottom: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
          }}
        >
          {brand}
        </div>
      )}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: collapsed ? '12px 6px' : '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {children}
      </nav>
      {footer && (
        <div
          style={{
            padding: 12,
            borderTop: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
          }}
        >
          {footer}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
      {title && !collapsed && (
        <div
          className="mono"
          style={{
            fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-3, #64748b)',
            padding: '8px 10px 4px',
          }}
        >
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export interface SidebarItemProps {
  href?: string;
  icon?: ReactNode;
  label: ReactNode;
  active?: boolean;
  badge?: ReactNode;
  collapsed?: boolean;
  onClick?: () => void;
}

export function SidebarItem({
  href,
  icon,
  label,
  active = false,
  badge,
  collapsed = false,
  onClick,
}: SidebarItemProps) {
  const baseStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: collapsed ? '8px' : '8px 10px',
    justifyContent: collapsed ? 'center' : 'flex-start',
    borderRadius: 8,
    fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
    fontSize: 12,
    letterSpacing: '0.04em',
    color: active ? 'var(--color-ink, #1e293b)' : 'var(--color-ink-2, #475569)',
    background: active ? 'var(--color-app-nav-active, rgba(30, 41, 59, 0.06))' : 'transparent',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 140ms, color 140ms',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  };

  const content = (
    <>
      {icon && (
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 16,
            flexShrink: 0,
            color: active ? 'var(--color-ink, #1e293b)' : 'var(--color-ink-3, #64748b)',
          }}
        >
          {icon}
        </span>
      )}
      {!collapsed && (
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
      )}
      {!collapsed && badge && <span style={{ flexShrink: 0 }}>{badge}</span>}
    </>
  );

  const onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!active) {
      e.currentTarget.style.background = 'var(--color-app-nav-hover, rgba(30, 41, 59, 0.03))';
      e.currentTarget.style.color = 'var(--color-ink, #1e293b)';
    }
  };
  const onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (!active) {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--color-ink-2, #475569)';
    }
  };

  if (href) {
    return (
      <a
        href={href}
        className={classes('mono', active && 'is-active')}
        title={collapsed && typeof label === 'string' ? label : undefined}
        aria-current={active ? 'page' : undefined}
        style={baseStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={classes('mono', active && 'is-active')}
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
