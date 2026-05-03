import { useId, type ReactNode } from 'react';

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  optional?: boolean;
  trailingLabel?: ReactNode;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
  className?: string;
}

export function Field({
  label,
  hint,
  error,
  required,
  optional,
  trailingLabel,
  children,
  className,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <label
          htmlFor={id}
          className="mono"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-3)',
          }}
        >
          {label}
          {required && (
            <span aria-hidden style={{ marginLeft: 4, color: '#dc2626' }}>
              *
            </span>
          )}
          {optional && !required && (
            <span style={{ marginLeft: 6, color: 'var(--color-ink-3)', fontWeight: 400 }}>
              (optional)
            </span>
          )}
        </label>
        {trailingLabel && <div style={{ fontSize: 12 }}>{trailingLabel}</div>}
      </div>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} style={{ margin: 0, fontSize: 12, color: 'var(--color-ink-3)' }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
