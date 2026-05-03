import type { ReactNode } from 'react';

export interface NavbarProps {
  brand?: ReactNode;
  links?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

const variantStyles = {
  light: 'bg-white text-slate-900 border-b border-slate-200',
  dark: 'bg-slate-900 text-white border-b border-slate-800',
} as const;

export function Navbar({
  brand,
  links,
  actions,
  sticky = false,
  variant = 'light',
  className,
}: NavbarProps) {
  return (
    <header
      className={classes(
        'w-full',
        sticky && 'sticky top-0 z-30 backdrop-blur-md',
        sticky && variant === 'light' && 'bg-white/85',
        sticky && variant === 'dark' && 'bg-slate-900/85',
        !sticky && variantStyles[variant],
        sticky && variantStyles[variant].replace(/^bg-\S+\s/, ''),
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 shrink-0">{brand}</div>
        {links && (
          <nav className="hidden md:flex items-center gap-1 ml-4 flex-1 min-w-0">{links}</nav>
        )}
        {actions && <div className="ml-auto flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

export interface NavLinkProps {
  href: string;
  children: ReactNode;
  active?: boolean;
  variant?: 'light' | 'dark';
  external?: boolean;
}

export function NavLink({
  href,
  children,
  active = false,
  variant = 'light',
  external,
}: NavLinkProps) {
  const base =
    'px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer';
  const styles =
    variant === 'dark'
      ? active
        ? 'bg-white/10 text-white'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
      : active
        ? 'bg-slate-900/5 text-slate-900'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5';

  return (
    <a
      href={href}
      className={`${base} ${styles}`}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </a>
  );
}
