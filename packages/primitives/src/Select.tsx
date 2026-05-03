import { forwardRef, useState, type CSSProperties, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  invalid?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")";

const sizeMap: Record<
  NonNullable<SelectProps['size']>,
  {
    height: number;
    fontSize: number;
    paddingLeft: number;
    paddingRight: number;
    chevronSize: number;
    chevronOffset: number;
  }
> = {
  sm: {
    height: 32,
    fontSize: 12,
    paddingLeft: 10,
    paddingRight: 28,
    chevronSize: 14,
    chevronOffset: 8,
  },
  md: {
    height: 40,
    fontSize: 14,
    paddingLeft: 12,
    paddingRight: 32,
    chevronSize: 16,
    chevronOffset: 10,
  },
  lg: {
    height: 48,
    fontSize: 16,
    paddingLeft: 14,
    paddingRight: 36,
    chevronSize: 18,
    chevronOffset: 12,
  },
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, size = 'md', className, style, disabled, onFocus, onBlur, children, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const dim = sizeMap[size];
  const errorColor = '#dc2626';

  const borderColor = invalid
    ? errorColor
    : focused
      ? 'var(--color-accent, var(--color-ink))'
      : 'var(--color-rule-strong)';

  const ringColor = invalid
    ? 'color-mix(in oklab, #dc2626 25%, transparent)'
    : 'color-mix(in oklab, var(--color-accent, var(--color-ink)) 30%, transparent)';

  const baseStyle: CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    height: dim.height,
    paddingLeft: dim.paddingLeft,
    paddingRight: dim.paddingRight,
    fontSize: dim.fontSize,
    fontFamily: 'var(--font-serif)',
    lineHeight: 1.4,
    color: 'var(--color-ink)',
    background: disabled ? 'var(--color-paper-2)' : 'var(--color-card)',
    backgroundImage: chevron,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${dim.chevronOffset}px center`,
    backgroundSize: `${dim.chevronSize}px ${dim.chevronSize}px`,
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.65 : 1,
    boxShadow: focused ? `0 0 0 3px ${ringColor}` : undefined,
    transition: 'border-color 140ms, box-shadow 140ms',
    ...style,
  };

  return (
    <select
      ref={ref}
      className={className}
      style={baseStyle}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...rest}
    >
      {children}
    </select>
  );
});
