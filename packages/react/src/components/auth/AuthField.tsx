import type { ChangeEvent, HTMLInputTypeAttribute, ReactNode } from 'react';

interface Props {
  id: string;
  name?: string;
  label: ReactNode;
  type?: HTMLInputTypeAttribute;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  /** Optional right-side decoration in the label row (e.g. "Forgot?" link). */
  trailingLabel?: ReactNode;
  /** Optional sub-row below the input (password strength bar, hint…). */
  hint?: ReactNode;
}

/** Bundle-styled labelled input. Accent-aware focus ring. */
export function AuthField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  disabled,
  trailingLabel,
  hint,
}: Props) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 8,
        }}
      >
        <label
          htmlFor={id}
          className="mono"
          style={{
            display: 'block',
            fontSize: 10.5,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-fg-3)',
          }}
        >
          {label}
        </label>
        {trailingLabel}
      </div>
      <input
        id={id}
        name={name ?? id}
        type={type}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '13px 14px',
          border: '1px solid var(--color-rule)',
          borderRadius: 8,
          background: 'var(--color-card)',
          fontFamily: 'var(--font-serif)',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.4,
          color: 'var(--color-fg)',
          outline: 'none',
          transition: 'border-color 140ms, box-shadow 140ms',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow =
            '0 0 0 4px color-mix(in oklab, var(--accent) 14%, transparent)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-rule)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {hint}
    </div>
  );
}
