import { forwardRef, useState, type CSSProperties, type InputHTMLAttributes } from 'react';

export interface SearchFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size'
> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  onClear?: () => void;
}

const sizeMap: Record<
  NonNullable<SearchFieldProps['size']>,
  { height: number; padX: number; fontSize: number; iconSize: number; iconInset: number }
> = {
  sm: { height: 32, padX: 28, fontSize: 12, iconSize: 14, iconInset: 8 },
  md: { height: 40, padX: 36, fontSize: 14, iconSize: 16, iconInset: 12 },
  lg: { height: 48, padX: 44, fontSize: 16, iconSize: 20, iconInset: 14 },
};

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { size = 'md', invalid, onClear, value, defaultValue, className, disabled, style, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const dim = sizeMap[size];
  const showClear =
    onClear && (value !== undefined ? String(value).length > 0 : Boolean(defaultValue));

  const errorColor = '#dc2626';
  const ringColor = invalid
    ? `0 0 0 4px color-mix(in oklab, ${errorColor} 14%, transparent)`
    : '0 0 0 4px color-mix(in oklab, var(--color-accent, var(--color-fg, #1e293b)) 14%, transparent)';
  const borderColor = invalid
    ? errorColor
    : focused
      ? 'var(--color-accent, var(--color-fg, #1e293b))'
      : 'var(--color-rule-strong, rgba(30, 41, 59, 0.24))';

  const inputStyle: CSSProperties = {
    width: '100%',
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
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 140ms, box-shadow 140ms',
    boxShadow: focused ? ringColor : 'none',
    ...style,
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: dim.iconInset,
          pointerEvents: 'none',
          color: 'var(--color-ink-3, #64748b)',
          display: 'inline-flex',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" width={dim.iconSize} height={dim.iconSize}>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <input
        ref={ref}
        type="search"
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={inputStyle}
        {...rest}
      />
      {showClear && !disabled && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: dim.iconInset,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--color-ink-3, #64748b)',
            transition: 'color 140ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-ink, #1e293b)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-ink-3, #64748b)')}
        >
          <svg viewBox="0 0 24 24" fill="none" width={dim.iconSize} height={dim.iconSize}>
            <path
              d="m6 6 12 12M6 18 18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
});
