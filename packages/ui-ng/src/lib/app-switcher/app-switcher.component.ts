import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LogoMarkComponent, type ProductSlug } from '../logo-mark/logo-mark.component';
import type { AppRailItem } from '../app-rail/app-rail.component';
import { markColorOnDark } from '../app-rail/mark-color';

const PRODUCT_SLUGS: ReadonlySet<string> = new Set<ProductSlug>([
  'ferrflow',
  'ferrvault',
  'ferrtrack',
  'ferrgrowth',
  'ferragents',
  'ferrfleet',
  'ferrlens',
  'ferrlabs',
]);

@Component({
  selector: 'flr-app-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoMarkComponent],
  templateUrl: './app-switcher.component.html',
  styleUrl: './app-switcher.component.css',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
})
export class AppSwitcherComponent {
  readonly items = input.required<readonly AppRailItem[]>();
  readonly current = input<string | null>(null);
  readonly caption = input('Switch app');
  readonly listLabel = input('Your apps');
  readonly collapsed = input(false);
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly selected = output<AppRailItem>();

  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly open = signal(false);

  protected readonly currentItem = computed<AppRailItem | null>(() => {
    const id = this.current();
    return this.items().find((item) => item.id === id) ?? null;
  });

  protected readonly triggerLabel = computed(() => {
    const label = this.ariaLabel();
    if (label) return label;
    const item = this.currentItem();
    return item ? `${this.caption()}, ${item.label}` : this.caption();
  });

  protected toggle(): void {
    this.open.update((open) => !open);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onSelect(item: AppRailItem): void {
    this.close();
    this.selected.emit(item);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) return;
    this.close();
  }

  protected markColor(item: AppRailItem): string {
    return markColorOnDark(item.accent);
  }

  protected glyph(item: AppRailItem): ProductSlug {
    if (item.product) return item.product;
    return PRODUCT_SLUGS.has(item.id) ? (item.id as ProductSlug) : 'ferrlabs';
  }
}
