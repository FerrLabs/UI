import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const sizeMap: Record<NonNullable<ContainerProps['size']>, string | number> = {
  sm: 768,
  md: 1024,
  lg: 1280,
  xl: 1440,
  '2xl': 1600,
  full: '100%',
};

const paddingMap: Record<NonNullable<ContainerProps['padding']>, string> = {
  none: '0',
  sm: '0 16px',
  md: '0 24px',
  lg: '0 40px',
};

export function Container({
  size = 'lg',
  padding = 'md',
  className,
  children,
  style,
  ...rest
}: ContainerProps) {
  const containerStyle: CSSProperties = {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    maxWidth: sizeMap[size],
    padding: paddingMap[padding],
    ...style,
  };
  return (
    <div className={className} style={containerStyle} {...rest}>
      {children}
    </div>
  );
}
