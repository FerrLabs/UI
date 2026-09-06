import { computed, signal, type Signal } from '@angular/core';

export const DEFAULT_PAGE_SIZE = 25;

export interface Paged<T> {
  readonly page: Signal<number>;
  readonly total: Signal<number>;
  readonly items: Signal<readonly T[]>;
  readonly pageSize: number;
  setPage(page: number): void;
}

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
