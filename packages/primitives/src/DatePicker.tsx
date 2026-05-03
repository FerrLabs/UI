import { forwardRef, type InputHTMLAttributes } from 'react';

export interface DatePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'value' | 'onChange'
> {
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  variant?: 'date' | 'datetime-local' | 'time' | 'month' | 'week';
}

const sizeStyles = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
} as const;

const baseStyles =
  'rounded-md bg-white text-slate-900 border border-slate-300 transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer';

const invalidStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/30';

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { value, onChange, size = 'md', invalid, variant = 'date', className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      type={variant}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      className={classes(baseStyles, sizeStyles[size], invalid && invalidStyles, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});
