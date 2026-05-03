import { forwardRef, useState, type CSSProperties, type InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap: Record<
  NonNullable<InputProps['size']>,
  { height: number; fontSize: number; padding: string }
> = {
  sm: { height: 32, fontSize: 12, padding: '0 10px' },
  md: { height: 40, fontSize: 14, padding: '0 12px' },
  lg: { height: 48, fontSize: 16, padding: '0 14px' },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, size = 'md', className, style, disabled, onFocus, onBlur, ...rest },
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
    padding: dim.padding,
    fontSize: dim.fontSize,
    fontFamily: 'var(--font-serif)',
    lineHeight: 1.4,
    color: 'var(--color-ink)',
    background: disabled ? 'var(--color-paper-2)' : 'var(--color-card)',
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.65 : 1,
    boxShadow: focused ? `0 0 0 3px ${ringColor}` : undefined,
    transition: 'border-color 140ms, box-shadow 140ms',
    ...style,
  };

  return (
    <input
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
    />
  );
});
