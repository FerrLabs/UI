import type { ReactNode } from 'react';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
  ariaLabel?: string;
}

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
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

const btn =
  'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed';

const inactive = 'text-slate-700 hover:bg-slate-100';
const active = 'bg-accent text-white pointer-events-none';

interface ItemProps {
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  children: ReactNode;
  ariaLabel?: string;
}

function PageButton({ onClick, disabled, selected, children, ariaLabel }: ItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={selected ? 'page' : undefined}
      aria-label={ariaLabel}
      className={classes(btn, selected ? active : inactive)}
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
    <nav aria-label={ariaLabel} className={classes('flex items-center gap-1', className)}>
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
          <span key={`gap-${i}`} aria-hidden className="px-2 text-slate-400">
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
