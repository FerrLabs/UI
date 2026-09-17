import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LogoMarkComponent, type ProductSlug } from '../logo-mark/logo-mark.component';
import { markColorOnDark } from './mark-color';

export interface AppRailItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly accent: string;
  readonly product?: ProductSlug;
  readonly meta?: string;
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
    return markColorOnDark(item.accent);
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
