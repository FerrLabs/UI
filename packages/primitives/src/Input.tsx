import { forwardRef, type InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
};

const baseStyles =
  'w-full rounded-md bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 transition-colors duration-150 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

const invalidStyles = 'border-red-500 focus:border-red-500 focus:ring-red-500/30';

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, size = 'md', className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={classes(baseStyles, sizeStyles[size], invalid && invalidStyles, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});
