import {
  forwardRef,
  useId,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'value' | 'onChange'
> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: ReactNode;
  showValue?: boolean;
  format?: (value: number) => ReactNode;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = false,
    format,
    className,
    disabled,
    id,
    style,
    ...rest
  },
  ref,
) {
  const internalId = useId();
  const inputId = id ?? internalId;
  const pct = ((value - min) / (max - min)) * 100;
  const accent = 'var(--color-accent, var(--color-fg, #1e293b))';
  const track = 'var(--color-rule, rgba(30, 41, 59, 0.14))';

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    ...style,
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    height: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    borderRadius: 999,
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, ${track} ${pct}%, ${track} 100%)`,
  };

  return (
    <div className={className} style={containerStyle}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {label && (
            <label
              htmlFor={inputId}
              className="mono"
              style={{
                fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 500,
                color: 'var(--color-ink-3, #64748b)',
              }}
            >
              {label}
            </label>
          )}
          {showValue && (
            <span
              className="mono"
              style={{
                fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                fontSize: 12,
                color: 'var(--color-ink-2, #475569)',
              }}
            >
              {format ? format(value) : value}
            </span>
          )}
        </div>
      )}
      <input
        ref={ref}
        type="range"
        id={inputId}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        style={inputStyle}
        {...rest}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--color-rule-strong, rgba(30, 41, 59, 0.24));
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--color-rule-strong, rgba(30, 41, 59, 0.24));
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.18);
          cursor: pointer;
        }
        input[type="range"]:focus-visible {
          box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-accent, var(--color-fg, #1e293b)) 14%, transparent);
        }
      `}</style>
    </div>
  );
});
