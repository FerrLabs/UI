import { computed, signal, type Signal } from '@angular/core';

export const DEFAULT_PAGE_SIZE = 25;

export interface Paged<T> {
  readonly page: Signal<number>;
  readonly total: Signal<number>;
  readonly items: Signal<readonly T[]>;
  readonly pageSize: number;
  setPage(page: number): void;
}

/**
 * Client-side paging state for a signal of rows, shaped for `flr-pagination`:
 * `page` feeds `[page]`, `total` feeds `[totalItems]`, `pageSize` feeds
 * `[pageSize]`, `setPage` takes `(pageChange)`, and `items` is what the
 * template iterates.
 *
 * The page is derived rather than stored, so a source that shrinks under the
 * current page (a filter narrowing a table) falls back to the last page that
 * has rows instead of rendering an empty one, and returns to the requested
 * page once the source grows back.
 *
 * Server-paged lists don't need this: pass the API's own total and page size
 * to the component directly.
 */
export function paged<T>(source: Signal<readonly T[]>, pageSize = DEFAULT_PAGE_SIZE): Paged<T> {
  const requested = signal(1);
  const total = computed(() => source().length);
  const lastPage = computed(() => Math.max(1, Math.ceil(total() / pageSize)));
  const page = computed(() => Math.min(Math.max(1, requested()), lastPage()));
  const items = computed(() => {
    const start = (page() - 1) * pageSize;
    return source().slice(start, start + pageSize);
  });

  return {
    page,
    total,
    items,
    pageSize,
    setPage: (next: number) => requested.set(next),
  };
}
