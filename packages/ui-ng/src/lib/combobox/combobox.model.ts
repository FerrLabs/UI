export interface ComboboxOption {
  readonly value: string;
  readonly label: string;
  readonly hint?: string;
}

export type ComboboxIntent = 'next' | 'previous' | 'select' | 'close';

export type ComboboxEmpty = 'loading' | 'empty' | 'no-match';

export function filterOptions(
  options: readonly ComboboxOption[],
  query: string,
): readonly ComboboxOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter(
    (o) => o.label.toLowerCase().includes(q) || (o.hint?.toLowerCase().includes(q) ?? false),
  );
}

export function intentFor(key: string): ComboboxIntent | null {
  switch (key) {
    case 'ArrowDown':
      return 'next';
    case 'ArrowUp':
      return 'previous';
    case 'Enter':
      return 'select';
    case 'Escape':
      return 'close';
    default:
      return null;
  }
}

export function clampIndex(index: number, count: number): number {
  return Math.min(Math.max(index, 0), Math.max(count - 1, 0));
}

export function stepActive(active: number, count: number, intent: 'next' | 'previous'): number {
  return clampIndex(active + (intent === 'next' ? 1 : -1), count);
}

export function emptyState(
  loading: boolean,
  totalCount: number,
  visibleCount: number,
  query: string,
): ComboboxEmpty | null {
  if (visibleCount > 0) return null;
  if (loading) return 'loading';
  return totalCount === 0 && query.trim() === '' ? 'empty' : 'no-match';
}

export function labelFor(
  options: readonly ComboboxOption[],
  value: string | null,
  picked: ComboboxOption | null,
): string | null {
  if (value === null) return null;
  const known = options.find((o) => o.value === value);
  if (known) return known.label;
  return picked?.value === value ? picked.label : value;
}
