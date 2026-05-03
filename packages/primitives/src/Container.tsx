import type { HTMLAttributes, ReactNode } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const sizeStyles = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1440px]',
  '2xl': 'max-w-[1600px]',
  full: 'max-w-full',
} as const;

const paddingStyles = {
  none: 'px-0',
  sm: 'px-3 sm:px-4',
  md: 'px-4 sm:px-6',
  lg: 'px-6 sm:px-10',
} as const;

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function Container({
  size = 'lg',
  padding = 'md',
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={classes('mx-auto w-full', sizeStyles[size], paddingStyles[padding], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
