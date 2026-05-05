import { useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

export interface CodeProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'style'> {
  children: string;
  style?: CSSProperties;
}

export function Code({ children, className, style, ...rest }: CodeProps) {
  return (
    <code
      className={className}
      style={{
        display: 'inline',
        padding: '1.5px 4px',
        borderRadius: 4,
        background: 'var(--color-paper-2, rgba(30, 41, 59, 0.06))',
        color: 'var(--color-ink, #1e293b)',
        fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
        fontSize: '0.92em',
        ...style,
      }}
      {...rest}
    >
      {children}
    </code>
  );
}

export interface CodeBlockProps {
  children: string;
  language?: ReactNode;
  filename?: ReactNode;
  copyable?: boolean;
  className?: string;
  style?: CSSProperties;
}

function CopyButton({ onClick, copied }: { onClick: () => void; copied: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
        fontSize: 11,
        color: hover ? 'var(--color-ink, #1e293b)' : 'var(--color-ink-3, #64748b)',
        background: hover ? 'var(--color-paper-2, rgba(30, 41, 59, 0.06))' : 'transparent',
        border: 'none',
        borderRadius: 4,
        padding: '2px 6px',
        cursor: 'pointer',
        transition: 'color 140ms ease, background 140ms ease',
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export function CodeBlock({
  children,
  language,
  filename,
  copyable = true,
  className,
  style,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(children).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className={className}
      style={{
        borderRadius: 10,
        border: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
        background: 'var(--color-paper-2, #f3efe7)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(filename || language || copyable) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '8px 12px',
            borderBottom: '1px solid var(--color-rule, rgba(30, 41, 59, 0.14))',
            background: 'var(--color-card, #ffffff)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minWidth: 0,
            }}
          >
            {filename && (
              <span
                style={{
                  fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                  fontSize: 12,
                  color: 'var(--color-ink-2, #475569)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {filename}
              </span>
            )}
            {language && (
              <span
                style={{
                  fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-ink-3, #64748b)',
                }}
              >
                {language}
              </span>
            )}
          </div>
          {copyable && <CopyButton onClick={handleCopy} copied={copied} />}
        </div>
      )}
      <pre
        style={{
          overflowX: 'auto',
          padding: 16,
          margin: 0,
          fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--color-ink, #1e293b)',
          background: 'transparent',
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}
