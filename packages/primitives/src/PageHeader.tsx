import type { ReactNode } from 'react';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
}

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={classes('flex flex-col gap-2 pb-4 mb-6 border-b border-slate-200', className)}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-slate-500">
            {breadcrumbs.map((item, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span aria-hidden className="text-slate-300">
                    /
                  </span>
                )}
                {item.href ? (
                  <a
                    href={item.href}
                    className="hover:text-slate-900 cursor-pointer transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-slate-700">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-slate-900 leading-tight">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
