import {
  createContext,
  forwardRef,
  useContext,
  useId,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

interface RadioGroupContextValue {
  name: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  name?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  ariaLabel?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  disabled,
  children,
  orientation = 'vertical',
  className,
  ariaLabel,
}: RadioGroupProps) {
  const fallbackName = useId();
  return (
    <RadioGroupContext.Provider value={{ name: name ?? fallbackName, value, onChange, disabled }}>
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={className}
        style={{
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          gap: orientation === 'vertical' ? 10 : 16,
        }}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'children'
> {
  value: string | number;
  label?: ReactNode;
  hint?: ReactNode;
  invalid?: boolean;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, hint, invalid, className, style, disabled, id, onFocus, onBlur, ...rest },
  ref,
) {
  const ctx = useContext(RadioGroupContext);
  const checked = ctx?.value !== undefined ? String(ctx.value) === String(value) : undefined;
  const isDisabled = disabled || ctx?.disabled;
  const [focused, setFocused] = useState(false);

  const accent = 'var(--color-accent, var(--color-ink))';
  const errorColor = '#dc2626';
  const borderColor = invalid ? errorColor : checked ? accent : 'var(--color-rule-strong)';

  const boxStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
    borderRadius: 999,
    background: isDisabled ? 'var(--color-paper-2)' : 'var(--color-card)',
    border: `1px solid ${borderColor}`,
    boxShadow: focused
      ? `0 0 0 3px color-mix(in oklab, ${invalid ? '#dc2626' : 'var(--color-accent, var(--color-ink))'} 30%, transparent)`
      : undefined,
    transition: 'border-color 140ms, box-shadow 140ms',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.55 : 1,
  };

  const inputStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    opacity: 0,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
  };

  const dotStyle: CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: accent,
    opacity: checked ? 1 : 0,
    transition: 'opacity 120ms',
    pointerEvents: 'none',
  };

  const inputElement = (
    <span style={boxStyle}>
      <input
        ref={ref}
        id={id}
        type="radio"
        name={ctx?.name}
        value={value}
        checked={checked}
        disabled={isDisabled}
        onChange={(e) => ctx?.onChange?.(e.currentTarget.value)}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={inputStyle}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      <span aria-hidden style={dotStyle} />
    </span>
  );

  if (!label && !hint) {
    return (
      <span className={className} style={style}>
        {inputElement}
      </span>
    );
  }

  return (
    <label
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'flex-start',
        gap: 10,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: isDisabled ? 0.6 : 1,
        ...style,
      }}
    >
      {inputElement}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {label && (
          <span style={{ fontSize: 14, color: 'var(--color-ink)', lineHeight: 1.25 }}>{label}</span>
        )}
        {hint && (
          <span style={{ fontSize: 12, color: 'var(--color-ink-3)', lineHeight: 1.25 }}>
            {hint}
          </span>
        )}
      </span>
    </label>
  );
});
