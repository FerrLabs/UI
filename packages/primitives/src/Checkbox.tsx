import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'children'
> {
  label?: ReactNode;
  hint?: ReactNode;
  invalid?: boolean;
  indeterminate?: boolean;
}

const checkmarkSvg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m4 8 3 3 5-6'/%3E%3C/svg%3E\")";

const indeterminateSvg =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath stroke='white' stroke-linecap='round' stroke-width='2' d='M4 8h8'/%3E%3C/svg%3E\")";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    hint,
    invalid,
    indeterminate,
    className,
    style,
    disabled,
    id,
    checked,
    defaultChecked,
    onChange,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const isChecked = isControlled ? Boolean(checked) : internalChecked;
  const isOn = isChecked || Boolean(indeterminate);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  const accent = 'var(--color-accent, var(--color-ink))';
  const errorColor = '#dc2626';
  const borderColor = invalid ? errorColor : isOn ? accent : 'var(--color-rule-strong)';

  const boxStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
    borderRadius: 4,
    background: disabled ? 'var(--color-paper-2)' : isOn ? accent : 'var(--color-card)',
    border: `1px solid ${borderColor}`,
    boxShadow: focused
      ? `0 0 0 3px color-mix(in oklab, ${invalid ? '#dc2626' : 'var(--color-accent, var(--color-ink))'} 30%, transparent)`
      : undefined,
    transition: 'background 140ms, border-color 140ms, box-shadow 140ms',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
  };

  const inputStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    margin: 0,
    opacity: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const iconStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    backgroundImage: indeterminate ? indeterminateSvg : checkmarkSvg,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: '12px 12px',
    opacity: isOn ? 1 : 0,
    transition: 'opacity 120ms',
  };

  const inputElement = (
    <span style={boxStyle}>
      <input
        ref={innerRef}
        id={id}
        type="checkbox"
        disabled={disabled}
        checked={isControlled ? isChecked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        style={inputStyle}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          if (!isControlled) setInternalChecked(e.currentTarget.checked);
          onChange?.(e);
        }}
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
      <span aria-hidden style={iconStyle} />
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
        cursor: disabled ? 'not-allowed' : 'pointer',
        userSelect: 'none',
        opacity: disabled ? 0.6 : 1,
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
