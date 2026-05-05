import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from 'react';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  hint?: ReactNode;
  size?: 'sm' | 'md';
}

const sizeMap: Record<
  NonNullable<SwitchProps['size']>,
  { trackW: number; trackH: number; thumb: number; offset: number }
> = {
  sm: { trackW: 28, trackH: 16, thumb: 12, offset: 2 },
  md: { trackW: 36, trackH: 20, thumb: 16, offset: 2 },
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  {
    checked,
    onChange,
    label,
    hint,
    size = 'md',
    className,
    style,
    disabled,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const dim = sizeMap[size];
  const accent = 'var(--color-accent, var(--color-ink))';

  const trackStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    width: dim.trackW,
    height: dim.trackH,
    padding: 0,
    borderRadius: 999,
    border: '1px solid transparent',
    background: checked ? accent : 'var(--color-rule-strong)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'background 160ms',
    boxShadow: focused
      ? `0 0 0 3px color-mix(in oklab, var(--color-accent, var(--color-ink)) 30%, transparent)`
      : undefined,
    flexShrink: 0,
  };

  const thumbStyle: CSSProperties = {
    display: 'inline-block',
    width: dim.thumb,
    height: dim.thumb,
    borderRadius: 999,
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
    transform: `translateX(${checked ? dim.trackW - dim.thumb - dim.offset - 2 : dim.offset}px)`,
    transition: 'transform 160ms',
  };

  const switchEl = (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={trackStyle}
      {...rest}
    >
      <span aria-hidden style={thumbStyle} />
    </button>
  );

  if (!label && !hint) {
    return (
      <span className={className} style={style}>
        {switchEl}
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
      {switchEl}
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
