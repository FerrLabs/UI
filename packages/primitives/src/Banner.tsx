import { useState, type HTMLAttributes, type ReactNode } from 'react';

export type BannerVariant = 'info' | 'success' | 'warning' | 'danger';

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: BannerVariant;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles: Record<BannerVariant, string> = {
  info: 'bg-slate-50 text-slate-800 border-slate-200',
  success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  danger: 'bg-red-50 text-red-900 border-red-200',
};

const variantBars: Record<BannerVariant, string> = {
  info: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Banner({
  variant = 'info',
  title,
  children,
  action,
  dismissible = false,
  onDismiss,
  className,
  ...rest
}: BannerProps) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const handleDismiss = () => {
    setHidden(true);
    onDismiss?.();
  };

  return (
    <div
      role={variant === 'danger' ? 'alert' : 'status'}
      className={classes(
        'relative flex items-start gap-3 rounded-lg border px-4 py-3 overflow-hidden',
        variantStyles[variant],
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden
        className={classes('absolute left-0 top-0 bottom-0 w-1', variantBars[variant])}
      />
      <div className="flex-1 min-w-0 ml-1">
        {title && <div className="text-sm font-semibold leading-snug">{title}</div>}
        {children && (
          <div className={classes('text-sm leading-relaxed', Boolean(title) && 'mt-1 opacity-90')}>
            {children}
          </div>
        )}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="shrink-0 self-start opacity-60 hover:opacity-100 cursor-pointer text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}
