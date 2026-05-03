import type { ReactNode } from 'react';

export interface SidebarProps {
  brand?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  collapsed?: boolean;
  width?: string;
  collapsedWidth?: string;
  className?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Sidebar({
  brand,
  children,
  footer,
  collapsed = false,
  width = '15rem',
  collapsedWidth = '3.5rem',
  className,
}: SidebarProps) {
  return (
    <aside
      data-collapsed={collapsed}
      style={{ width: collapsed ? collapsedWidth : width }}
      className={classes(
        'shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-200 transition-[width] duration-200 ease-out',
        className,
      )}
    >
      {brand && (
        <div className="h-14 flex items-center px-3 border-b border-slate-100 shrink-0">
          {brand}
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">{children}</nav>
      {footer && <div className="p-2 border-t border-slate-100 shrink-0">{footer}</div>}
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
    <div className="flex flex-col gap-0.5 mb-2">
      {title && !collapsed && (
        <div className="px-2 py-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
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
  const baseStyles =
    'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors duration-150 cursor-pointer';
  const stateStyles = active
    ? 'bg-accent/10 text-accent'
    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900';

  const content = (
    <>
      {icon && <span className="shrink-0 size-4 flex items-center justify-center">{icon}</span>}
      {!collapsed && <span className="flex-1 min-w-0 truncate">{label}</span>}
      {!collapsed && badge && <span className="shrink-0">{badge}</span>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${baseStyles} ${stateStyles}`}
        aria-current={active ? 'page' : undefined}
        title={collapsed ? String(label) : undefined}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseStyles} ${stateStyles} text-left w-full`}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? String(label) : undefined}
    >
      {content}
    </button>
  );
}
