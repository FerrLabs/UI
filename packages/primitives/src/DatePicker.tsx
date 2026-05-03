import { forwardRef, useState, type CSSProperties, type InputHTMLAttributes } from 'react';

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

const sizeMap: Record<
  NonNullable<DatePickerProps['size']>,
  { height: number; padX: number; fontSize: number }
> = {
  sm: { height: 32, padX: 10, fontSize: 12 },
  md: { height: 40, padX: 14, fontSize: 14 },
  lg: { height: 48, padX: 16, fontSize: 16 },
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  { value, onChange, size = 'md', invalid, variant = 'date', className, disabled, style, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const dim = sizeMap[size];

  const errorColor = '#dc2626';
  const accent = 'var(--color-accent, var(--color-fg, #1e293b))';
  const ringShadow = invalid
    ? `0 0 0 4px color-mix(in oklab, ${errorColor} 14%, transparent)`
    : `0 0 0 4px color-mix(in oklab, ${accent} 14%, transparent)`;
  const borderColor = invalid
    ? errorColor
    : focused
      ? accent
      : 'var(--color-rule-strong, rgba(30, 41, 59, 0.24))';

  const inputStyle: CSSProperties = {
    boxSizing: 'border-box',
    height: dim.height,
    paddingLeft: dim.padX,
    paddingRight: dim.padX,
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    background: disabled ? 'var(--color-paper-2, #f4f4f2)' : 'var(--color-card, #ffffff)',
    fontFamily: 'var(--font-serif, "Fraunces", Georgia, ui-serif, serif)',
    fontWeight: 400,
    fontSize: dim.fontSize,
    lineHeight: 1.4,
    color: disabled ? 'var(--color-ink-3, #64748b)' : 'var(--color-ink, #1e293b)',
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 140ms, box-shadow 140ms',
    boxShadow: focused ? ringShadow : 'none',
    ...style,
  };

  return (
    <input
      ref={ref}
      type={variant}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.currentTarget.value)}
      onFocus={(e) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        rest.onBlur?.(e);
      }}
      className={className}
      style={inputStyle}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});
