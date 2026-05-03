import { forwardRef, type InputHTMLAttributes } from 'react';

export interface SearchFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  onClear?: () => void;
}

const sizeStyles = {
  sm: 'h-8 text-xs pl-7 pr-7',
  md: 'h-10 text-sm pl-9 pr-9',
  lg: 'h-12 text-base pl-11 pr-11',
} as const;

const iconSize = { sm: 'size-3.5', md: 'size-4', lg: 'size-5' } as const;
const iconPos = { sm: 'left-2', md: 'left-2.5', lg: 'left-3.5' } as const;
const clearPos = { sm: 'right-2', md: 'right-2.5', lg: 'right-3.5' } as const;

const baseStyles =
  'w-full rounded-md bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

const invalidStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/30';

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { size = 'md', invalid, onClear, value, defaultValue, className, disabled, ...rest },
  ref,
) {
  const showClear =
    onClear && (value !== undefined ? String(value).length > 0 : Boolean(defaultValue));

  return (
    <div className="relative inline-flex w-full items-center">
      <span
        aria-hidden
        className={classes('absolute pointer-events-none text-slate-400', iconPos[size])}
      >
        <svg viewBox="0 0 24 24" fill="none" className={iconSize[size]}>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input
        ref={ref}
        type="search"
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        className={classes(baseStyles, sizeStyles[size], invalid && invalidStyles, className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {showClear && !disabled && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className={classes(
            'absolute inline-flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer rounded',
            clearPos[size],
          )}
        >
          <svg viewBox="0 0 24 24" fill="none" className={iconSize[size]}>
            <path
              d="m6 6 12 12M6 18 18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
});
