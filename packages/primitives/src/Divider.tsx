import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: ReactNode;
}

export function Divider({
  orientation = 'horizontal',
  label,
  className,
  style,
  ...rest
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={className}
        style={{
          display: 'inline-block',
          width: 1,
          alignSelf: 'stretch',
          background: 'var(--color-rule, rgba(30, 41, 59, 0.14))',
          ...style,
        }}
        {...rest}
      />
    );
  }

  if (label) {
    const lineStyle: CSSProperties = {
      flex: 1,
      height: 1,
      background: 'var(--color-rule, rgba(30, 41, 59, 0.14))',
    };
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          ...style,
        }}
        {...rest}
      >
        <span style={lineStyle} />
        <span
          style={{
            fontFamily: 'var(--font-mono, "DM Mono", ui-monospace, monospace)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-ink-3, #64748b)',
          }}
        >
          {label}
        </span>
        <span style={lineStyle} />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={className}
      style={{
        border: 0,
        height: 1,
        background: 'var(--color-rule, rgba(30, 41, 59, 0.14))',
        margin: 0,
        ...style,
      }}
      {...(rest as React.HTMLAttributes<HTMLHRElement>)}
    />
  );
}
