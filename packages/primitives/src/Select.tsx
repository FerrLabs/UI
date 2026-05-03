import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  invalid?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<NonNullable<SelectProps['size']>, string> = {
  sm: 'h-8 pl-2.5 pr-7 text-xs bg-[length:14px] bg-[right_8px_center]',
  md: 'h-10 pl-3 pr-8 text-sm bg-[length:16px] bg-[right_10px_center]',
  lg: 'h-12 pl-4 pr-10 text-base bg-[length:18px] bg-[right_12px_center]',
};

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")";

const baseStyles =
  'w-full appearance-none rounded-md bg-white text-slate-900 border border-slate-300 transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer bg-no-repeat';

const invalidStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/30';

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, size = 'md', className, style, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={classes(baseStyles, sizeStyles[size], invalid && invalidStyles, className)}
      style={{ backgroundImage: chevron, ...style }}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {children}
    </select>
  );
});
