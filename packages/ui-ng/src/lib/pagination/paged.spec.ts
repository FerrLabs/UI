import { signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { DEFAULT_PAGE_SIZE, paged } from './paged';

const numbers = (count: number) => Array.from({ length: count }, (_, i) => i);

describe('paged', () => {
  it('defaults to page 1 and the default page size', () => {
    const view = paged(signal(numbers(60)));
    expect(view.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(view.page()).toBe(1);
    expect(view.items()).toEqual(numbers(25));
    expect(view.total()).toBe(60);
  });

  it('slices the requested page, with a short last page', () => {
    const view = paged(signal(numbers(25)), 10);
    view.setPage(2);
    expect(view.items()).toEqual(numbers(20).slice(10));
    view.setPage(3);
    expect(view.items()).toEqual([20, 21, 22, 23, 24]);
  });

  it('clamps pages below 1 and past the end', () => {
    const view = paged(signal(numbers(25)), 10);
    view.setPage(0);
    expect(view.page()).toBe(1);
    view.setPage(-4);
    expect(view.page()).toBe(1);
    view.setPage(99);
    expect(view.page()).toBe(3);
    expect(view.items()).toEqual([20, 21, 22, 23, 24]);
  });

  it('is on page 1 with no items for an empty source', () => {
    const view = paged(signal<number[]>([]), 10);
    view.setPage(5);
    expect(view.page()).toBe(1);
    expect(view.items()).toEqual([]);
    expect(view.total()).toBe(0);
  });

  it('re-clamps when the source shrinks and recovers when it grows back', () => {
    const source = signal(numbers(30));
    const view = paged(source, 10);
    view.setPage(3);
    source.set(numbers(12));
    expect(view.page()).toBe(2);
    expect(view.items()).toEqual([10, 11]);
    source.set(numbers(30));
    expect(view.page()).toBe(3);
  });
});
