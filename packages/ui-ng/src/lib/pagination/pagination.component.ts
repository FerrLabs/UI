import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type PaginationSize = 'sm' | 'md';
export type PaginationVariant = 'pages' | 'compact';
export type PaginationAlign = 'start' | 'center' | 'end' | 'between';

export interface PaginationLabels {
  readonly root: string;
  readonly first: string;
  readonly previous: string;
  readonly next: string;
  readonly last: string;
  readonly page: (page: number) => string;
  readonly status: (page: number, totalPages: number) => string;
  readonly summary: (from: number, to: number, total: number) => string;
}

export const DEFAULT_PAGINATION_LABELS: PaginationLabels = {
  root: 'Pagination',
  first: 'First page',
  previous: 'Previous page',
  next: 'Next page',
  last: 'Last page',
  page: (page) => `Page ${page}`,
  status: (page, totalPages) => `Page ${page} of ${totalPages}`,
  summary: (from, to, total) => `${from}–${to} of ${total}`,
};

type ItemKind = 'first' | 'prev' | 'page' | 'next' | 'last' | 'gap' | 'status';

interface PaginationItem {
  readonly kind: ItemKind;
  readonly page: number;
  readonly text: string | null;
  readonly icon: string | null;
  readonly ariaLabel: string | null;
  readonly current: boolean;
  readonly disabled: boolean;
  readonly href: string | null;
}

const ICON: Record<'first' | 'prev' | 'next' | 'last', string> = {
  first: 'M11.5 3.5 7 8l4.5 4.5M7 3.5 2.5 8 7 12.5',
  prev: 'M10 3.5 5.5 8 10 12.5',
  next: 'M6 3.5 10.5 8 6 12.5',
  last: 'M4.5 3.5 9 8l-4.5 4.5M9 3.5 13.5 8 9 12.5',
};

function range(from: number, to: number): number[] {
  return from > to ? [] : Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function pageSlots(page: number, totalPages: number, siblings: number): (number | 'gap')[] {
  const slots = siblings * 2 + 5;
  if (totalPages <= slots) return range(1, totalPages);
  if (page <= siblings + 3) return [...range(1, slots - 2), 'gap', totalPages];
  if (page >= totalPages - siblings - 2)
    return [1, 'gap', ...range(totalPages - slots + 3, totalPages)];
  return [1, 'gap', ...range(page - siblings, page + siblings), 'gap', totalPages];
}

@Component({
  selector: 'flr-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input<number | null>(null);
  readonly totalItems = input<number | null>(null);
  readonly pageSize = input(20);
  readonly siblingCount = input(1);
  readonly showFirstLast = input(true);
  readonly showSummary = input(false);
  readonly hideOnSinglePage = input(true);
  readonly disabled = input(false);
  readonly size = input<PaginationSize>('md');
  readonly variant = input<PaginationVariant>('pages');
  readonly align = input<PaginationAlign>('center');
  readonly pageHref = input<((page: number) => string) | null>(null);
  readonly labels = input<Partial<PaginationLabels>>({});
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly pageChange = output<number>();

  protected readonly resolvedLabels = computed<PaginationLabels>(() => ({
    ...DEFAULT_PAGINATION_LABELS,
    ...this.labels(),
  }));

  protected readonly resolvedTotalPages = computed(() => {
    const explicit = this.totalPages();
    if (explicit !== null) return Math.max(1, Math.floor(explicit));
    const total = this.totalItems();
    if (total === null) return 1;
    return Math.max(1, Math.ceil(total / Math.max(1, this.pageSize())));
  });

  protected readonly currentPage = computed(() =>
    clamp(Math.floor(this.page()), 1, this.resolvedTotalPages()),
  );

  protected readonly visible = computed(
    () => !this.hideOnSinglePage() || this.resolvedTotalPages() > 1,
  );

  protected readonly summary = computed(() => {
    const total = this.totalItems();
    if (!this.showSummary() || total === null) return null;
    const size = Math.max(1, this.pageSize());
    const from = total === 0 ? 0 : (this.currentPage() - 1) * size + 1;
    return this.resolvedLabels().summary(from, Math.min(this.currentPage() * size, total), total);
  });

  protected readonly items = computed<PaginationItem[]>(() => {
    const page = this.currentPage();
    const totalPages = this.resolvedTotalPages();
    const labels = this.resolvedLabels();
    const items: PaginationItem[] = [];

    if (this.showFirstLast()) {
      items.push(this.control('first', 1, labels.first, page === 1));
    }
    items.push(this.control('prev', page - 1, labels.previous, page === 1));

    if (this.variant() === 'compact') {
      items.push({
        kind: 'status',
        page,
        text: labels.status(page, totalPages),
        icon: null,
        ariaLabel: null,
        current: false,
        disabled: false,
        href: null,
      });
    } else {
      for (const slot of pageSlots(page, totalPages, Math.max(0, this.siblingCount()))) {
        items.push(
          slot === 'gap'
            ? {
                kind: 'gap',
                page: 0,
                text: '…',
                icon: null,
                ariaLabel: null,
                current: false,
                disabled: true,
                href: null,
              }
            : {
                kind: 'page',
                page: slot,
                text: String(slot),
                icon: null,
                ariaLabel: labels.page(slot),
                current: slot === page,
                disabled: this.disabled(),
                href: slot === page ? null : this.hrefFor(slot),
              },
        );
      }
    }

    items.push(this.control('next', page + 1, labels.next, page === totalPages));
    if (this.showFirstLast()) {
      items.push(this.control('last', totalPages, labels.last, page === totalPages));
    }
    return items;
  });

  protected goTo(page: number): void {
    const target = clamp(page, 1, this.resolvedTotalPages());
    if (this.disabled() || target === this.currentPage()) return;
    this.pageChange.emit(target);
  }

  private control(
    kind: 'first' | 'prev' | 'next' | 'last',
    page: number,
    ariaLabel: string,
    atEdge: boolean,
  ): PaginationItem {
    const disabled = atEdge || this.disabled();
    return {
      kind,
      page,
      text: null,
      icon: ICON[kind],
      ariaLabel,
      current: false,
      disabled,
      href: disabled ? null : this.hrefFor(page),
    };
  }

  private hrefFor(page: number): string | null {
    return this.pageHref()?.(page) ?? null;
  }
}
