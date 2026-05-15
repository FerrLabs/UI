import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';

export interface SiteCardProps {
  icon: ReactNode;
  label: string;
  meta?: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => void;
  showChevron?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function SiteCard({
  icon,
  label,
  meta,
  onClick,
  showChevron = true,
  className,
  style,
}: SiteCardProps) {
  const interactive = !!onClick;
  return (
    <div
      className={className}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e);
              }
            }
          : undefined
      }
      style={{
        margin: '8px 12px',
        padding: '10px 12px',
        background: 'var(--color-card, #fff)',
        border: '1px solid var(--color-rule, #e2e8f0)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
    >
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-fg, #0f172a)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </div>
        {meta ? (
          <div
            style={{
              fontSize: 11,
              color: 'var(--color-fg-2, #475569)',
              marginTop: 1,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meta}
          </div>
        ) : null}
      </div>
      {showChevron ? (
        <svg
          aria-hidden
          width={12}
          height={12}
          viewBox="0 0 12 12"
          fill="none"
          style={{
            color: 'var(--color-fg-3, #94a3b8)',
            flexShrink: 0,
            display: 'block',
          }}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </div>
  );
}
