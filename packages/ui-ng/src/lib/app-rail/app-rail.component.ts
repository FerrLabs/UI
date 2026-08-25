import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LogoMarkComponent, type ProductSlug } from '../logo-mark/logo-mark.component';

export interface AppRailItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  /** Product accent, per the one-product-one-accent rule. Drives the tile gradient and the active glow. */
  readonly accent: string;
  /** Glyph to render. Falls back to `id` when it is already a product slug. */
  readonly product?: ProductSlug;
  /** No active subscription on this org: rendered dimmed, still navigable so it can carry the upsell. */
  readonly locked?: boolean;
  readonly newTab?: boolean;
}

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

/**
 * Persistent product rail for the authenticated app chrome.
 *
 * Replaces the `flr-brand-dropdown` trigger at the top of the sidebar: every
 * product the org can reach is visible at once instead of hidden behind a
 * menu. Sits left of `flr-sidebar`, which keeps the org switcher and the
 * per-product nav.
 *
 * `[rail-top]` takes the suite monogram, `[rail-utility]` the bottom actions
 * (add product, settings). Reads `--color-app-rail*` tokens.
 */
@Component({
  selector: 'flr-app-rail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoMarkComponent],
  templateUrl: './app-rail.component.html',
  styleUrl: './app-rail.component.css',
})
export class AppRailComponent {
  readonly items = input<readonly AppRailItem[]>([]);
  readonly current = input<string | null>(null);
  readonly ariaLabel = input('Products');

  readonly selected = output<AppRailItem>();

  protected glyph(item: AppRailItem): ProductSlug {
    if (item.product) return item.product;
    return PRODUCT_SLUGS.has(item.id) ? (item.id as ProductSlug) : 'ferrlabs';
  }

  protected markColor(item: AppRailItem): string {
    return this.readsOnRail(item.accent) ? item.accent : '#ffffff';
  }

  private readsOnRail(accent: string): boolean {
    const hex = accent.trim().replace('#', '');
    if (hex.length !== 3 && hex.length !== 6) return true;
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 70;
  }

  protected itemLabel(item: AppRailItem): string {
    const parts = [item.label];
    if (item.locked) parts.push('no active subscription');
    if (item.newTab) parts.push('opens in a new tab');
    return parts.join(', ');
  }

  protected onSelect(item: AppRailItem): void {
    this.selected.emit(item);
  }
}
