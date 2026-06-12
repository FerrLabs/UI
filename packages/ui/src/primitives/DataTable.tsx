import { useMemo, useState, type CSSProperties, type Key, type ReactNode } from 'react';

export interface Column<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  sortBy?: (row: Row) => string | number | Date | null | undefined;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  className?: string;
}

export interface DataTableProps<Row> {
  rows: Row[];
  columns: Array<Column<Row>>;
  rowKey: (row: Row) => Key;
  onRowClick?: (row: Row) => void;
  selection?: {
    selected: Set<Key>;
    onChange: (selected: Set<Key>) => void;
  };
  initialSort?: { key: string; direction: 'asc' | 'desc' };
  empty?: ReactNode;
  loading?: boolean;
  loadingRows?: number;
  className?: string;
  density?: 'compact' | 'normal';
  stickyHeader?: boolean;
}

const SELECTED_BG = 'color-mix(in oklab, var(--color-accent) 6%, transparent)';
const HOVER_BG = 'color-mix(in oklab, var(--color-ink) 4%, transparent)';

export function DataTable<Row>({
  rows,
  columns,
  rowKey,
  onRowClick,
  selection,
  initialSort,
  empty,
  loading,
  loadingRows = 5,
  className,
  density = 'normal',
  stickyHeader,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState(initialSort);
  const [hoverKey, setHoverKey] = useState<Key | null>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col || !col.sortBy) return rows;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortBy!(a);
      const bv = col.sortBy!(b);
      if (av == null && bv == null) return 0;
      if (av == null) return -dir;
      if (bv == null) return dir;
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });
  }, [rows, columns, sort]);

  const allSelected = selection
    ? sorted.length > 0 && sorted.every((r) => selection.selected.has(rowKey(r)))
    : false;
  const someSelected = selection
    ? sorted.some((r) => selection.selected.has(rowKey(r))) && !allSelected
    : false;

  const cellPadding = density === 'compact' ? '6px 12px' : '10px 16px';
  const headerPadding = density === 'compact' ? '8px 12px' : '12px 16px';

  const containerStyle: CSSProperties = {
    width: '100%',
    overflowX: 'auto',
    borderRadius: 10,
    border: '1px solid var(--color-card-rule)',
    background: 'var(--color-card)',
  };

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    color: 'var(--color-ink)',
  };

  const theadStyle: CSSProperties = {
    background: 'var(--color-paper-2)',
    color: 'var(--color-ink-3)',
    ...(stickyHeader ? { position: 'sticky', top: 0, zIndex: 10 } : null),
  };

  return (
    <div className={className} style={containerStyle}>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            {selection && (
              <th
                style={{
                  width: 40,
                  padding: headerPadding,
                  borderBottom: '1px solid var(--color-rule)',
                }}
              >
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => {
                    if (e.currentTarget.checked) {
                      selection.onChange(new Set(sorted.map(rowKey)));
                    } else {
                      selection.onChange(new Set());
                    }
                  }}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: 'var(--color-accent)',
                    cursor: 'pointer',
                  }}
                />
              </th>
            )}
            {columns.map((col) => {
              const sortable = Boolean(col.sortBy);
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={col.className}
                  style={{
                    padding: headerPadding,
                    borderBottom: '1px solid var(--color-rule)',
                    textAlign: col.align ?? 'left',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    color: 'var(--color-ink-3)',
                    ...(col.width ? { width: col.width } : null),
                  }}
                  aria-sort={
                    active ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSort((prev) =>
                          prev?.key === col.key
                            ? { key: col.key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
                            : { key: col.key, direction: 'asc' },
                        )
                      }
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-ink)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        font: 'inherit',
                        letterSpacing: 'inherit',
                        textTransform: 'inherit',
                        color: 'inherit',
                        transition: 'color 120ms ease',
                      }}
                    >
                      {col.header}
                      <span aria-hidden style={{ opacity: active ? 1 : 0.55 }}>
                        {active ? (sort?.direction === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={`loading-${i}`}>
                {selection && (
                  <td
                    style={{
                      padding: cellPadding,
                      borderBottom: '1px solid var(--color-rule)',
                    }}
                  />
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: cellPadding,
                      borderBottom: '1px solid var(--color-rule)',
                    }}
                  >
                    <div
                      style={{
                        height: 16,
                        borderRadius: 4,
                        background: 'var(--color-rule)',
                        animation: 'pulse 1.6s ease-in-out infinite',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selection ? 1 : 0)}
                style={{
                  padding: '48px 16px',
                  textAlign: 'center',
                  color: 'var(--color-ink-3)',
                  fontSize: 14,
                }}
              >
                {empty ?? 'No data.'}
              </td>
            </tr>
          ) : (
            sorted.map((row) => {
              const k = rowKey(row);
              const isSelected = selection?.selected.has(k) ?? false;
              const isHovered = hoverKey === k;
              const rowBg = isSelected
                ? SELECTED_BG
                : onRowClick && isHovered
                  ? HOVER_BG
                  : undefined;
              return (
                <tr
                  key={k}
                  data-selected={isSelected || undefined}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  onMouseEnter={onRowClick ? () => setHoverKey(k) : undefined}
                  onMouseLeave={onRowClick ? () => setHoverKey(null) : undefined}
                  onFocus={onRowClick ? () => setHoverKey(k) : undefined}
                  onBlur={onRowClick ? () => setHoverKey(null) : undefined}
                  style={{
                    cursor: onRowClick ? 'pointer' : undefined,
                    background: rowBg,
                    transition: 'background 120ms ease',
                  }}
                >
                  {selection && (
                    <td
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: cellPadding,
                        borderBottom: '1px solid var(--color-rule)',
                      }}
                    >
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={isSelected}
                        onChange={(e) => {
                          const next = new Set(selection.selected);
                          if (e.currentTarget.checked) next.add(k);
                          else next.delete(k);
                          selection.onChange(next);
                        }}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: 'var(--color-accent)',
                          cursor: 'pointer',
                        }}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={col.className}
                      style={{
                        padding: cellPadding,
                        borderBottom: '1px solid var(--color-rule)',
                        textAlign: col.align ?? 'left',
                        fontSize: 14,
                        color: 'var(--color-ink)',
                      }}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }
      `}</style>
    </div>
  );
}
