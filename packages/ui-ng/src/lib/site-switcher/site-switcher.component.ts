import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface SiteSwitcherItem {
  readonly id: string;
  readonly label: string;
  readonly meta?: string;
  readonly href?: string;
  readonly searchTerms?: string;
}

@Component({
  selector: 'flr-site-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-switcher.component.html',
  styleUrl: './site-switcher.component.css',
  host: {
    '(document:mousedown)': 'onDocumentDown($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class SiteSwitcherComponent {
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly items = input<readonly SiteSwitcherItem[]>([]);
  readonly activeId = input<string | null>(null);
  readonly placeholder = input('Select site');
  readonly searchPlaceholder = input('Search…');
  readonly createLabel = input<string | null>(null);
  readonly emptyState = input('No results');

  readonly select = output<string>();
  readonly create = output<void>();

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly highlight = signal(0);

  protected readonly active = computed<SiteSwitcherItem | null>(() => {
    const id = this.activeId();
    if (!id) return null;
    return this.items().find((it) => it.id === id) ?? null;
  });

  protected readonly triggerLabel = computed(() => this.active()?.label ?? this.placeholder());
  protected readonly triggerMeta = computed(() => this.active()?.meta ?? null);

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const items = this.items();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) || (it.searchTerms?.toLowerCase().includes(q) ?? false),
    );
  });

  constructor() {
    effect(() => {
      this.query();
      this.open();
      this.highlight.set(0);
    });
    effect(() => {
      if (!this.open()) return;
      const el = this.searchInput()?.nativeElement;
      if (el) setTimeout(() => el.focus(), 0);
    });
  }

  protected toggle(): void {
    this.open.set(!this.open());
  }

  protected close(): void {
    this.open.set(false);
    this.query.set('');
  }

  protected onSelect(item: SiteSwitcherItem): void {
    this.select.emit(item.id);
    this.close();
  }

  protected onCreate(): void {
    this.create.emit();
    this.close();
  }

  protected onInputKey(event: KeyboardEvent): void {
    const items = this.filtered();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlight.set(Math.min(this.highlight() + 1, Math.max(items.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlight.set(Math.max(this.highlight() - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[this.highlight()];
      if (item) this.onSelect(item);
    }
  }

  protected onDocumentDown(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.hostEl.nativeElement.contains(event.target as Node)) this.close();
  }
}
