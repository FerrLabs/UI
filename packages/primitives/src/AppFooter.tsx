import type { ReactNode } from 'react';

export interface FooterColumn {
  title: ReactNode;
  links: Array<{ label: ReactNode; href: string; external?: boolean }>;
}

export interface AppFooterProps {
  brand?: ReactNode;
  tagline?: ReactNode;
  columns?: FooterColumn[];
  bottom?: ReactNode;
  variant?: 'light' | 'dark';
  className?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

const variantStyles = {
  light: 'bg-white text-slate-900 border-t border-slate-200',
  dark: 'bg-slate-900 text-slate-200 border-t border-slate-800',
} as const;

const linkStyles = {
  light: 'text-slate-500 hover:text-slate-900 cursor-pointer transition-colors',
  dark: 'text-slate-400 hover:text-white cursor-pointer transition-colors',
} as const;

const titleStyles = {
  light: 'text-[11px] font-mono uppercase tracking-wider text-slate-500',
  dark: 'text-[11px] font-mono uppercase tracking-wider text-slate-400',
} as const;

export function AppFooter({
  brand,
  tagline,
  columns,
  bottom,
  variant = 'light',
  className,
}: AppFooterProps) {
  return (
    <footer className={classes(variantStyles[variant], className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
        <div>
          {brand && <div className="flex items-center gap-3">{brand}</div>}
          {tagline && (
            <p
              className={classes(
                'mt-4 text-sm leading-relaxed max-w-sm',
                variant === 'dark' ? 'text-slate-400' : 'text-slate-500',
              )}
            >
              {tagline}
            </p>
          )}
        </div>
        {columns && columns.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {columns.map((col, i) => (
              <div key={i}>
                <h3 className={classes('mb-4', titleStyles[variant])}>{col.title}</h3>
                <ul className="flex flex-col gap-2.5 text-sm">
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <a
                        href={l.href}
                        target={l.external ? '_blank' : undefined}
                        rel={l.external ? 'noreferrer' : undefined}
                        className={linkStyles[variant]}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      {bottom && (
        <div
          className={classes(
            'border-t',
            variant === 'dark' ? 'border-slate-800' : 'border-slate-200',
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
            {bottom}
          </div>
        </div>
      )}
    </footer>
  );
}
