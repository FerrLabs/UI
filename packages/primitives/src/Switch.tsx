import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  hint?: ReactNode;
  size?: 'sm' | 'md';
}

const trackStyles: Record<NonNullable<SwitchProps['size']>, string> = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
};

const thumbStyles: Record<NonNullable<SwitchProps['size']>, string> = {
  sm: 'size-3 translate-x-0.5 data-[checked=true]:translate-x-3.5',
  md: 'size-4 translate-x-0.5 data-[checked=true]:translate-x-4.5',
};

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onChange, label, hint, size = 'md', className, disabled, ...rest },
  ref,
) {
  const switchEl = (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={classes(
        'relative inline-flex items-center rounded-full border border-transparent cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-accent' : 'bg-slate-300',
        trackStyles[size],
      )}
      {...rest}
    >
      <span
        aria-hidden
        data-checked={checked}
        className={classes(
          'inline-block rounded-full bg-white shadow-sm transition-transform duration-150',
          thumbStyles[size],
        )}
      />
    </button>
  );

  if (!label && !hint) {
    return <span className={className}>{switchEl}</span>;
  }

  return (
    <label
      className={classes(
        'inline-flex items-start gap-2.5 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      {switchEl}
      <span className="flex flex-col gap-0.5">
        {label && <span className="text-sm text-slate-900 leading-tight">{label}</span>}
        {hint && <span className="text-xs text-slate-500 leading-tight">{hint}</span>}
      </span>
    </label>
  );
});
