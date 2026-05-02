import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

/** Bundle's accent-filled primary submit button. */
export function AuthSubmit({ children, loading, disabled, type = 'submit' }: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        padding: '13px 14px',
        borderRadius: 8,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        fontFamily: 'var(--font-serif)',
        fontWeight: 500,
        fontSize: 14,
        lineHeight: 1,
        border: '1px solid var(--accent)',
        background: 'var(--accent)',
        color: '#fff',
        transition: 'transform 80ms, background 140ms',
        marginTop: 6,
      }}
    >
      {loading && (
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: 999,
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            animation: 'auth-spin 720ms linear infinite',
          }}
        />
      )}
      <span>{children}</span>
      {!loading && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      )}
      <style>{`
        @keyframes auth-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </button>
  );
}
