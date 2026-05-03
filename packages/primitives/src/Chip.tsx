import type { HTMLAttributes, ReactNode } from 'react';

export type ChipVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  variant?: ChipVariant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
  onRemove?: () => void;
}

const variantStyles: Record<ChipVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  accent: 'bg-accent/15 text-accent border-accent/30',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
};

const removeStyles: Record<ChipVariant, string> = {
  neutral: 'hover:bg-slate-300/60',
  accent: 'hover:bg-accent/30',
  success: 'hover:bg-emerald-300/60',
  warning: 'hover:bg-amber-300/60',
  danger: 'hover:bg-red-300/60',
};

const sizeStyles = {
  sm: 'h-5 px-1.5 text-[11px] gap-1',
  md: 'h-6 px-2 text-xs gap-1.5',
} as const;

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Chip({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  onRemove,
  className,
  ...rest
}: ChipProps) {
  return (
    <span
      className={classes(
        'inline-flex items-center rounded-md border font-medium leading-none whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={classes(
            'shrink-0 inline-flex items-center justify-center size-3.5 rounded-full cursor-pointer transition-colors',
            removeStyles[variant],
          )}
        >
          <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
            <path
              d="m3 3 6 6M3 9 9 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
