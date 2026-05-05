import { forwardRef, useState, type CSSProperties, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, style, rows = 4, disabled, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
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
    minHeight: 96,
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: 'var(--font-serif)',
    lineHeight: 1.5,
    color: 'var(--color-ink)',
    background: disabled ? 'var(--color-paper-2)' : 'var(--color-card)',
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    outline: 'none',
    resize: 'vertical',
    cursor: disabled ? 'not-allowed' : 'text',
    opacity: disabled ? 0.65 : 1,
    boxShadow: focused ? `0 0 0 3px ${ringColor}` : undefined,
    transition: 'border-color 140ms, box-shadow 140ms',
    ...style,
  };

  return (
    <textarea
      ref={ref}
      rows={rows}
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
