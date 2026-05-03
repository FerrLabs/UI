import { useMemo, useState, type Key, type ReactNode } from 'react';

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

const alignStyles = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const;

function classes(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

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

  const cellPad = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-2.5';
  const headerPad = density === 'compact' ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div
      className={classes(
        'w-full overflow-x-auto rounded-lg ring-1 ring-slate-200 bg-white',
        className,
      )}
    >
      <table className="w-full text-sm border-collapse">
        <thead
          className={classes('bg-slate-50 text-slate-500', stickyHeader && 'sticky top-0 z-10')}
        >
          <tr>
            {selection && (
              <th className={classes('w-10', headerPad)}>
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
                  className="size-4 rounded border-slate-300 text-accent focus:ring-accent/40 cursor-pointer"
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
                  className={classes(
                    headerPad,
                    'text-[11px] font-mono font-semibold uppercase tracking-wider whitespace-nowrap',
                    alignStyles[col.align ?? 'left'],
                    col.className,
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={
                    active ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  {sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900"
                      onClick={() =>
                        setSort((prev) =>
                          prev?.key === col.key
                            ? { key: col.key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
                            : { key: col.key, direction: 'asc' },
                        )
                      }
                    >
                      {col.header}
                      <span aria-hidden className="text-slate-400">
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
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={`loading-${i}`}>
                {selection && <td className={cellPad} />}
                {columns.map((col) => (
                  <td key={col.key} className={cellPad}>
                    <div className="h-4 rounded bg-slate-100 animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selection ? 1 : 0)}
                className="py-12 text-center text-slate-500 text-sm"
              >
                {empty ?? 'No data.'}
              </td>
            </tr>
          ) : (
            sorted.map((row) => {
              const k = rowKey(row);
              const isSelected = selection?.selected.has(k) ?? false;
              return (
                <tr
                  key={k}
                  data-selected={isSelected || undefined}
                  className={classes(
                    onRowClick && 'cursor-pointer hover:bg-slate-50',
                    isSelected && 'bg-accent/5',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {selection && (
                    <td className={cellPad} onClick={(e) => e.stopPropagation()}>
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
                        className="size-4 rounded border-slate-300 text-accent focus:ring-accent/40 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={classes(cellPad, alignStyles[col.align ?? 'left'], col.className)}
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
    </div>
  );
}
