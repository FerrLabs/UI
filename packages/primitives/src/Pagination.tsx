import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
  ariaLabel?: string;
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function pageList(page: number, totalPages: number, siblingCount: number): Array<number | 'gap'> {
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) return range(1, totalPages);

  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, totalPages);
  const showLeftGap = left > 2;
  const showRightGap = right < totalPages - 1;

  const result: Array<number | 'gap'> = [1];
  if (showLeftGap) result.push('gap');
  else if (left > 1) result.push(...range(2, left - 1));
  result.push(...range(left, right));
  if (showRightGap) result.push('gap');
  else if (right < totalPages) result.push(...range(right + 1, totalPages - 1));
  if (right < totalPages) result.push(totalPages);
  return result;
}

const HOVER_BG = 'color-mix(in oklab, var(--color-ink) 6%, transparent)';

interface ItemProps {
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  children: ReactNode;
  ariaLabel?: string;
}

function PageButton({ onClick, disabled, selected, children, ariaLabel }: ItemProps) {
  const [hovered, setHovered] = useState(false);
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    width: 32,
    height: 32,
    padding: '0 6px',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 120ms ease, color 120ms ease',
    opacity: disabled ? 0.4 : 1,
    color: 'var(--color-ink-2)',
  };
  const activeStyle: CSSProperties = {
    background: 'var(--color-accent)',
    color: '#fff',
    pointerEvents: 'none',
  };
  const hoverStyle: CSSProperties =
    !disabled && !selected && hovered ? { background: HOVER_BG, color: 'var(--color-ink)' } : {};

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={selected ? 'page' : undefined}
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...baseStyle, ...(selected ? activeStyle : null), ...hoverStyle }}
    >
      {children}
    </button>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className,
  ariaLabel = 'Pagination',
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = pageList(page, totalPages, siblingCount);

  return (
    <nav
      aria-label={ariaLabel}
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
    >
      {showFirstLast && (
        <PageButton onClick={() => onPageChange(1)} disabled={page === 1} ariaLabel="First page">
          «
        </PageButton>
      )}
      <PageButton
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        ariaLabel="Previous page"
      >
        ‹
      </PageButton>
      {items.map((it, i) =>
        it === 'gap' ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            style={{
              padding: '0 6px',
              color: 'var(--color-ink-3)',
              fontSize: 14,
            }}
          >
            …
          </span>
        ) : (
          <PageButton
            key={it}
            onClick={() => onPageChange(it)}
            selected={it === page}
            ariaLabel={`Page ${it}`}
          >
            {it}
          </PageButton>
        ),
      )}
      <PageButton
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        ariaLabel="Next page"
      >
        ›
      </PageButton>
      {showFirstLast && (
        <PageButton
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          ariaLabel="Last page"
        >
          »
        </PageButton>
      )}
    </nav>
  );
}
