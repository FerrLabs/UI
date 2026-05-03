import { Fragment, type ReactNode } from 'react';

export interface BreadcrumbCrumb {
  label: ReactNode;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbCrumb[];
  separator?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Breadcrumb({
  items,
  separator = '/',
  className,
  ariaLabel = 'Breadcrumb',
}: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} className={classes('text-xs', className)}>
      <ol className="flex items-center flex-wrap gap-1.5 text-slate-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li className="flex items-center min-w-0">
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    className="hover:text-slate-900 cursor-pointer transition-colors truncate"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={classes('truncate', isLast ? 'text-slate-900 font-medium' : '')}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li aria-hidden className="text-slate-300">
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
