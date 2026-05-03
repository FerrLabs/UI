import type { HTMLAttributes } from 'react';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'accent' | 'current' | 'slate';
  label?: string;
}

const sizeStyles = {
  xs: 'size-3 border-[1.5px]',
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
  lg: 'size-7 border-[3px]',
} as const;

const colorStyles = {
  accent: 'border-accent border-r-transparent',
  current: 'border-current border-r-transparent',
  slate: 'border-slate-400 border-r-transparent',
} as const;

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Spinner({
  size = 'md',
  color = 'accent',
  label = 'Loading…',
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={classes(
        'inline-block rounded-full animate-spin',
        sizeStyles[size],
        colorStyles[color],
        className,
      )}
      {...rest}
    />
  );
}
