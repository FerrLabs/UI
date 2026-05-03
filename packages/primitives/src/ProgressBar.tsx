import type { HTMLAttributes, ReactNode } from 'react';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'accent' | 'success' | 'warning' | 'danger';
  indeterminate?: boolean;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
} as const;

const variantStyles = {
  accent: 'bg-accent',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
} as const;

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'accent',
  indeterminate = false,
  className,
  ...rest
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const display = showValue ? `${Math.round(pct)}%` : null;

  return (
    <div className={classes('flex flex-col gap-1.5', className)} {...rest}>
      {(label || display) && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>{label}</span>
          {display && <span className="font-mono">{display}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={typeof label === 'string' ? label : undefined}
        className={classes('w-full bg-slate-200 rounded-full overflow-hidden', sizeStyles[size])}
      >
        <div
          className={classes(
            'h-full rounded-full transition-[width] duration-300 ease-out',
            variantStyles[variant],
            indeterminate && 'animate-[progress-indeterminate_1.4s_ease-in-out_infinite]',
          )}
          style={indeterminate ? { width: '40%' } : { width: `${pct}%` }}
        />
        {indeterminate && (
          <style>{`
            @keyframes progress-indeterminate {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
            }
          `}</style>
        )}
      </div>
    </div>
  );
}
