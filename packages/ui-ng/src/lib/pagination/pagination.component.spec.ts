import '@angular/compiler';
import type { Signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { PaginationComponent } from './pagination.component';

interface Item {
  kind: string;
  page: number;
  text: string | null;
  ariaLabel: string | null;
  current: boolean;
  disabled: boolean;
  href: string | null;
}

interface Internals {
  resolvedTotalPages: Signal<number>;
  currentPage: Signal<number>;
  visible: Signal<boolean>;
  summary: Signal<string | null>;
  items: Signal<Item[]>;
  resolvedLabels: Signal<{ root: string; next: string }>;
  goTo(page: number): void;
}

const DEFAULTS = {
  totalPages: null,
  totalItems: null,
  pageSize: 20,
  siblingCount: 1,
  showFirstLast: true,
  showSummary: false,
  hideOnSinglePage: true,
  disabled: false,
  variant: 'pages',
  pageHref: null,
  labels: {},
};

function setup(inputs: Record<string, unknown>) {
  const component = createComponent(PaginationComponent, { ...DEFAULTS, ...inputs });
  const pageChange = vi.fn();
  component.pageChange.subscribe(pageChange);
  return { internals: component as unknown as Internals, pageChange };
}

const pageTexts = (items: Item[]) =>
  items.filter((i) => i.kind === 'page' || i.kind === 'gap').map((i) => i.text);

describe('PaginationComponent totals', () => {
  it('prefers an explicit totalPages, floored and at least 1', () => {
    expect(setup({ page: 1, totalPages: 7.9 }).internals.resolvedTotalPages()).toBe(7);
    expect(setup({ page: 1, totalPages: 0 }).internals.resolvedTotalPages()).toBe(1);
    expect(setup({ page: 1, totalPages: -3 }).internals.resolvedTotalPages()).toBe(1);
  });

  it('derives pages from items and page size, guarding a zero page size', () => {
    expect(setup({ page: 1, totalItems: 41, pageSize: 20 }).internals.resolvedTotalPages()).toBe(3);
    expect(setup({ page: 1, totalItems: 0 }).internals.resolvedTotalPages()).toBe(1);
    expect(setup({ page: 1, totalItems: 5, pageSize: 0 }).internals.resolvedTotalPages()).toBe(5);
  });

  it('is a single page when neither total is given', () => {
    expect(setup({ page: 1 }).internals.resolvedTotalPages()).toBe(1);
  });

  it('clamps and floors the current page', () => {
    expect(setup({ page: 99, totalPages: 5 }).internals.currentPage()).toBe(5);
    expect(setup({ page: -2, totalPages: 5 }).internals.currentPage()).toBe(1);
    expect(setup({ page: 2.7, totalPages: 5 }).internals.currentPage()).toBe(2);
  });

  it('hides on a single page only when asked to', () => {
    expect(setup({ page: 1, totalPages: 1 }).internals.visible()).toBe(false);
    expect(setup({ page: 1, totalPages: 1, hideOnSinglePage: false }).internals.visible()).toBe(
      true,
    );
    expect(setup({ page: 1, totalPages: 2 }).internals.visible()).toBe(true);
  });
});

describe('PaginationComponent summary', () => {
  it('is null unless enabled and totalItems is known', () => {
    expect(setup({ page: 1, totalItems: 50 }).internals.summary()).toBeNull();
    expect(setup({ page: 1, showSummary: true }).internals.summary()).toBeNull();
  });

  it('reports the range for the current page', () => {
    const { internals } = setup({ page: 2, totalItems: 45, pageSize: 20, showSummary: true });
    expect(internals.summary()).toBe('21–40 of 45');
  });

  it('caps the range end at the total on the last page', () => {
    const { internals } = setup({ page: 3, totalItems: 45, pageSize: 20, showSummary: true });
    expect(internals.summary()).toBe('41–45 of 45');
  });

  it('starts at 0 when there are no items', () => {
    const { internals } = setup({ page: 1, totalItems: 0, showSummary: true });
    expect(internals.summary()).toBe('0–0 of 0');
  });

  it('uses overridden labels and keeps the other defaults', () => {
    const { internals } = setup({
      page: 1,
      totalItems: 3,
      showSummary: true,
      labels: { summary: (a: number, b: number, t: number) => `${a}/${b}/${t}` },
    });
    expect(internals.summary()).toBe('1/3/3');
    expect(internals.resolvedLabels().next).toBe('Next page');
  });
});

describe('PaginationComponent page slots', () => {
  it('shows every page when they fit', () => {
    const { internals } = setup({ page: 1, totalPages: 7 });
    expect(pageTexts(internals.items())).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('collapses the tail near the start', () => {
    const { internals } = setup({ page: 2, totalPages: 10 });
    expect(pageTexts(internals.items())).toEqual(['1', '2', '3', '4', '5', '…', '10']);
  });

  it('collapses both sides in the middle', () => {
    const { internals } = setup({ page: 5, totalPages: 10 });
    expect(pageTexts(internals.items())).toEqual(['1', '…', '4', '5', '6', '…', '10']);
  });

  it('collapses the head near the end', () => {
    const { internals } = setup({ page: 9, totalPages: 10 });
    expect(pageTexts(internals.items())).toEqual(['1', '…', '6', '7', '8', '9', '10']);
  });

  it('always yields the same slot count regardless of position', () => {
    for (let page = 1; page <= 20; page++) {
      const { internals } = setup({ page, totalPages: 20 });
      expect(pageTexts(internals.items())).toHaveLength(7);
    }
  });

  it('widens with siblingCount and treats a negative count as zero', () => {
    const wide = setup({ page: 10, totalPages: 20, siblingCount: 2 }).internals;
    expect(pageTexts(wide.items())).toEqual(['1', '…', '8', '9', '10', '11', '12', '…', '20']);
    const none = setup({ page: 10, totalPages: 20, siblingCount: -4 }).internals;
    expect(pageTexts(none.items())).toEqual(['1', '…', '10', '…', '20']);
  });

  it('marks only the current page and gives it no href', () => {
    const { internals } = setup({ page: 2, totalPages: 3, pageHref: (p: number) => `?p=${p}` });
    const pages = internals.items().filter((i) => i.kind === 'page');
    expect(pages.map((p) => p.current)).toEqual([false, true, false]);
    expect(pages.map((p) => p.href)).toEqual(['?p=1', null, '?p=3']);
    expect(pages[0].ariaLabel).toBe('Page 1');
  });

  it('gaps are disabled and non-interactive', () => {
    const { internals } = setup({ page: 1, totalPages: 20 });
    const gap = internals.items().find((i) => i.kind === 'gap');
    expect(gap).toMatchObject({ disabled: true, href: null, page: 0 });
  });
});

describe('PaginationComponent controls', () => {
  it('disables first and previous on page 1 and next and last on the final page', () => {
    const start = setup({ page: 1, totalPages: 5 }).internals.items();
    expect(start.filter((i) => i.disabled && i.kind !== 'gap').map((i) => i.kind)).toEqual([
      'first',
      'prev',
    ]);
    const end = setup({ page: 5, totalPages: 5 }).internals.items();
    expect(end.filter((i) => i.disabled && i.kind !== 'gap').map((i) => i.kind)).toEqual([
      'next',
      'last',
    ]);
  });

  it('targets neighbouring pages and the edges', () => {
    const items = setup({ page: 3, totalPages: 5 }).internals.items();
    const by = (kind: string) => items.find((i) => i.kind === kind)?.page;
    expect([by('first'), by('prev'), by('next'), by('last')]).toEqual([1, 2, 4, 5]);
  });

  it('omits first and last when showFirstLast is off', () => {
    const kinds = setup({ page: 3, totalPages: 5, showFirstLast: false })
      .internals.items()
      .map((i) => i.kind);
    expect(kinds).not.toContain('first');
    expect(kinds).not.toContain('last');
    expect(kinds[0]).toBe('prev');
  });

  it('drops the href of disabled controls', () => {
    const items = setup({
      page: 1,
      totalPages: 5,
      pageHref: (p: number) => `?p=${p}`,
    }).internals.items();
    expect(items.find((i) => i.kind === 'prev')?.href).toBeNull();
    expect(items.find((i) => i.kind === 'next')?.href).toBe('?p=2');
  });

  it('disables every control and page when disabled', () => {
    const items = setup({ page: 3, totalPages: 5, disabled: true }).internals.items();
    expect(items.every((i) => i.disabled)).toBe(true);
  });

  it('compact variant renders a status item instead of page buttons', () => {
    const items = setup({ page: 3, totalPages: 8, variant: 'compact' }).internals.items();
    expect(items.some((i) => i.kind === 'page')).toBe(false);
    expect(items.find((i) => i.kind === 'status')?.text).toBe('Page 3 of 8');
  });
});

describe('PaginationComponent goTo', () => {
  it('emits the target page', () => {
    const { internals, pageChange } = setup({ page: 2, totalPages: 5 });
    internals.goTo(4);
    expect(pageChange).toHaveBeenCalledWith(4);
  });

  it('clamps out of range targets', () => {
    const { internals, pageChange } = setup({ page: 2, totalPages: 5 });
    internals.goTo(50);
    expect(pageChange).toHaveBeenLastCalledWith(5);
    internals.goTo(-1);
    expect(pageChange).toHaveBeenLastCalledWith(1);
  });

  it('does not emit for the current page or when disabled', () => {
    const current = setup({ page: 2, totalPages: 5 });
    current.internals.goTo(2);
    expect(current.pageChange).not.toHaveBeenCalled();
    const off = setup({ page: 2, totalPages: 5, disabled: true });
    off.internals.goTo(3);
    expect(off.pageChange).not.toHaveBeenCalled();
  });

  it('does not emit when clamping lands on the current page', () => {
    const { internals, pageChange } = setup({ page: 5, totalPages: 5 });
    internals.goTo(9);
    expect(pageChange).not.toHaveBeenCalled();
  });
});
