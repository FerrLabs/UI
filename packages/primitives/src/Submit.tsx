import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';

export interface SubmitProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'children'
> {
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

export const Submit = forwardRef<HTMLButtonElement, SubmitProps>(function Submit(
  { loading = false, fullWidth = false, disabled, className, style, children, ...rest },
  ref,
) {
  const isInactive = Boolean(disabled || loading);
  const accent = 'var(--color-accent, var(--color-ink))';

  const baseStyle: CSSProperties = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    padding: '0 16px',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    color: '#fff',
    background: accent,
    border: `1px solid ${accent}`,
    borderRadius: 8,
    cursor: isInactive ? 'not-allowed' : 'pointer',
    opacity: isInactive ? 0.55 : 1,
    transition: 'background 160ms ease-out, opacity 160ms, box-shadow 160ms',
    ...style,
  };

  return (
    <button
      ref={ref}
      type="submit"
      className={['mono', className].filter(Boolean).join(' ')}
      style={baseStyle}
      disabled={isInactive}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          style={{
            width: 12,
            height: 12,
            border: '1.5px solid #fff',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'ferrlabs-spin 700ms linear infinite',
          }}
        />
      )}
      {children}
      <style>{`@keyframes ferrlabs-spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
});
