import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';
import { SwitchComponent } from '../switch/switch.component';
import { LogoMarkComponent, type ProductSlug } from '../logo-mark/logo-mark.component';
import type { AppRailItem } from '../app-rail/app-rail.component';
import { markColorOnDark } from '../app-rail/mark-color';
import { ORG_HUB } from './entitled-apps';
import { SHELL_CONTEXT } from '../shell/shell-context';

let panelCount = 0;

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
  imports: [LogoMarkComponent, ModalComponent, SwitchComponent, ButtonComponent, FormsModule],
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
  readonly customizeLabel = input('Customize apps');
  readonly customizeHint = input(
    'Pick the apps this menu shows. FerrLabs always stays, it holds your account.',
  );
  readonly doneLabel = input('Done');
  readonly hidden = model<readonly string[]>([]);

  readonly selected = output<AppRailItem>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly shell = inject(SHELL_CONTEXT, { optional: true });

  protected readonly compact = computed(
    () => this.collapsed() || (this.shell?.collapsed() ?? false),
  );

  protected readonly panelId = `flr-as-list-${(panelCount += 1)}`;
  protected readonly open = signal(false);
  protected readonly customizing = signal(false);

  protected readonly visibleItems = computed(() => {
    const hidden = new Set(this.hidden());
    const current = this.current();
    return this.items().filter(
      (item) => item.id === ORG_HUB || item.id === current || !hidden.has(item.id),
    );
  });

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
    if (!this.open()) return;
    const doc = this.host.nativeElement.ownerDocument;
    const active = doc.activeElement;
    const heldFocus = active instanceof Node && this.host.nativeElement.contains(active);
    this.open.set(false);
    if (heldFocus) this.trigger().nativeElement.focus();
  }

  protected onSelect(item: AppRailItem): void {
    this.close();
    this.selected.emit(item);
  }

  protected openCustomize(): void {
    this.close();
    this.customizing.set(true);
  }

  protected isLocked(item: AppRailItem): boolean {
    return item.id === ORG_HUB;
  }

  protected isShown(item: AppRailItem): boolean {
    return this.isLocked(item) || !this.hidden().includes(item.id);
  }

  protected setShown(item: AppRailItem, shown: boolean): void {
    const next = this.hidden().filter((id) => id !== item.id);
    this.hidden.set(shown ? next : [...next, item.id]);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target;
    const inside = target instanceof Node && this.host.nativeElement.contains(target);
    const followedFooterLink = target instanceof Element && !!target.closest('.flr-as__footer a');
    if (!inside || followedFooterLink) this.close();
  }

  protected markColor(item: AppRailItem): string {
    return markColorOnDark(item.accent);
  }

  protected glyph(item: AppRailItem): ProductSlug {
    if (item.product) return item.product;
    return PRODUCT_SLUGS.has(item.id) ? (item.id as ProductSlug) : 'ferrlabs';
  }
}
