import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'flat' | 'raised' | 'outlined';
  interactive?: boolean;
  children: ReactNode;
}

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
} as const;

const variantStyles = {
  flat: 'bg-white',
  raised: 'bg-white shadow-sm',
  outlined: 'bg-white ring-1 ring-slate-200',
} as const;

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Card({
  padding = 'md',
  variant = 'outlined',
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={classes(
        'rounded-xl text-slate-900 transition-shadow duration-150',
        paddingStyles[padding],
        variantStyles[variant],
        interactive && 'cursor-pointer hover:shadow-md',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
}

export function CardHeader({ title, description, trailing, className, ...rest }: CardHeaderProps) {
  return (
    <div className={classes('flex items-start justify-between gap-3', className)} {...rest}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 leading-tight">{title}</h3>
        {description && <p className="mt-1 text-xs text-slate-500 leading-snug">{description}</p>}
      </div>
      {trailing && <div className="shrink-0">{trailing}</div>}
    </div>
  );
}
