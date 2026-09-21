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
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { SiteCardComponent } from '../site-card/site-card.component';
import { isTrustedIconMarkup } from '../icon/icon-markup';
import { SHELL_CONTEXT } from '../shell/shell-context';

export interface ProjectSwitcherItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly meta?: string;
  readonly href?: string;
  readonly searchTerms?: string;
}

export interface ProjectSwitcherPlaceholder {
  readonly label: string;
  readonly icon?: string;
  readonly meta?: string;
}

@Component({
  selector: 'flr-project-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteCardComponent],
  host: {
    '(document:mousedown)': 'onDocumentDown($event)',
    '(document:keydown.escape)': 'close()',
    '[class.flr-ps--brand]': "variant() === 'brand'",
    '[class.flr-ps--compact]': 'compact()',
  },
  template: `
    @if (variant() === 'brand') {
      <button
        type="button"
        class="flr-ps__brand"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="compact() ? displayedLabel() : null"
        (click)="toggle()"
      >
        @if (displayedIcon()) {
          @let icon = trustedIcon(displayedIcon());
          <span class="flr-ps__trigger-icon">
            @if (icon) {
              <span [innerHTML]="icon"></span>
            } @else {
              {{ displayedIcon() }}
            }
          </span>
        } @else if (compact()) {
          <span class="flr-ps__monogram" aria-hidden="true">{{ monogram() }}</span>
        }
        @if (!compact()) {
          <span class="flr-ps__brand-text">
            <span class="flr-ps__brand-label">{{ displayedLabel() }}</span>
            @if (displayedMeta()) {
              <span class="flr-ps__brand-meta">{{ displayedMeta() }}</span>
            }
          </span>
          <span class="flr-ps__brand-chev" aria-hidden="true">▾</span>
        }
      </button>
    } @else {
      <flr-site-card [label]="displayedLabel()" (select)="toggle()">
        @if (displayedIcon()) {
          @let icon = trustedIcon(displayedIcon());
          <span site-card-icon class="flr-ps__trigger-icon">
            @if (icon) {
              <span [innerHTML]="icon"></span>
            } @else {
              {{ displayedIcon() }}
            }
          </span>
        }
        @if (triggerEyebrow()) {
          <span site-card-eyebrow>{{ triggerEyebrow() }}</span>
        }
        @if (displayedMeta()) {
          <span site-card-meta>{{ displayedMeta() }}</span>
        }
      </flr-site-card>
    }

    @if (open()) {
      <div class="flr-ps__panel">
        <div class="mono flr-ps__title">{{ title() }}</div>
        <div class="flr-ps__search-wrap">
          <input
            #searchInput
            type="text"
            class="flr-ps__search"
            [value]="query()"
            [placeholder]="searchPlaceholder()"
            (input)="query.set($any($event.target).value)"
            (keydown)="onInputKey($event)"
          />
        </div>
        <div class="flr-ps__list">
          @if (filtered().length === 0) {
            <div class="flr-ps__empty">{{ emptyState() }}</div>
          } @else {
            @for (item of filtered(); track item.id; let idx = $index) {
              <button
                type="button"
                class="flr-ps__item"
                [class.flr-ps__item--hl]="idx === highlight()"
                [attr.aria-current]="item.id === current()?.id ? 'true' : null"
                (mouseenter)="highlight.set(idx)"
                (click)="onSelect(item)"
              >
                @let itemIcon = trustedIcon(item.icon);
                <span class="flr-ps__item-icon">
                  @if (itemIcon) {
                    <span [innerHTML]="itemIcon"></span>
                  } @else {
                    {{ item.icon }}
                  }
                </span>
                <span class="flr-ps__item-body">
                  <span
                    class="flr-ps__item-label"
                    [class.flr-ps__item-label--current]="item.id === current()?.id"
                    >{{ item.label }}</span
                  >
                  @if (item.meta) {
                    <span class="flr-ps__item-meta">{{ item.meta }}</span>
                  }
                </span>
                @if (item.id === current()?.id) {
                  <span class="flr-ps__check" aria-hidden="true">✓</span>
                }
              </button>
            }
          }
        </div>
        @if (viewAllLabel() || createLabel()) {
          <div class="flr-ps__sep"></div>
          @if (viewAllLabel(); as label) {
            <button type="button" class="flr-ps__footer-btn" (click)="onViewAll()">
              <span class="mono" aria-hidden="true">→</span>
              <span class="flr-ps__footer-label">{{ label }}</span>
            </button>
          }
          @if (createLabel(); as label) {
            <button type="button" class="flr-ps__footer-btn" (click)="onCreate()">
              <span aria-hidden="true">+</span>
              <span class="flr-ps__footer-label">{{ label }}</span>
            </button>
          }
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      position: relative;
    }
    :host(.flr-ps--brand) {
      display: flex;
      flex: 1;
      min-width: 0;
      align-self: stretch;
      height: 100%;
    }
    .flr-ps__brand {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 0 18px;
      margin: 0;
      border: none;
      border-radius: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      text-align: left;
      cursor: pointer;
      overflow: hidden;
      transition: background 140ms ease;
    }
    .flr-ps__brand:hover {
      background: var(--color-app-nav-hover, rgba(30, 41, 59, 0.03));
    }
    .flr-ps__brand-text {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .flr-ps__brand-label {
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-weight: 700;
      font-size: 15px;
      line-height: 1.1;
      color: var(--color-ink, #1e293b);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flr-ps__brand-meta {
      font-size: 11px;
      line-height: 1.1;
      color: var(--color-ink-3, #64748b);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flr-ps__brand-chev {
      flex-shrink: 0;
      font-size: 12px;
      opacity: 0.7;
      color: var(--color-ink-3, #64748b);
    }
    :host(.flr-ps--brand) .flr-ps__panel {
      left: 0;
      right: 0;
      top: 100%;
      border-radius: 0 0 10px 10px;
    }
    :host(.flr-ps--compact) .flr-ps__brand {
      justify-content: center;
      padding: 0;
    }
    :host(.flr-ps--compact) .flr-ps__panel {
      left: calc(100% + 10px);
      right: auto;
      top: 8px;
      width: 280px;
      border-radius: 10px;
    }
    .flr-ps__monogram {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      flex: none;
      border-radius: 10px;
      background: var(--color-app-bg-2, #f4f4f2);
      color: var(--color-ink, #1e293b);
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-weight: 700;
      font-size: 15px;
    }
    .flr-ps__trigger-icon,
    .flr-ps__item-icon {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }
    .flr-ps__trigger-icon ::ng-deep svg:not([width]),
    .flr-ps__item-icon ::ng-deep svg:not([width]) {
      width: 18px;
      height: 18px;
      display: block;
    }
    .flr-ps__panel {
      position: absolute;
      top: calc(100% + 4px);
      left: 12px;
      right: 12px;
      background: var(--color-card, #fff);
      border: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.14);
      padding: 6px;
      z-index: 60;
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 360px;
      animation: flr-ps-in 140ms ease-out;
    }
    @keyframes flr-ps-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    .flr-ps__title {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      padding: 6px 10px 4px;
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
    }
    .flr-ps__search-wrap {
      padding: 0 6px 6px;
    }
    .flr-ps__search {
      width: 100%;
      padding: 6px 10px;
      font-size: 13px;
      border: 1px solid var(--color-rule, #e2e8f0);
      border-radius: 6px;
      background: var(--color-app-bg-2, #f8fafc);
      color: var(--color-ink, #0f172a);
      outline: none;
      box-sizing: border-box;
    }
    .flr-ps__list {
      overflow-y: auto;
      max-height: 260px;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .flr-ps__empty {
      padding: 12px 10px;
      font-size: 12px;
      color: var(--color-ink-3, #94a3b8);
      text-align: center;
    }
    .flr-ps__item {
      width: 100%;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      color: var(--color-ink, #0f172a);
      text-align: left;
      transition: background 80ms;
    }
    .flr-ps__item--hl {
      background: var(--color-app-nav-hover, rgba(30, 41, 59, 0.06));
    }
    .flr-ps__item-body {
      flex: 1;
      min-width: 0;
    }
    .flr-ps__item-label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .flr-ps__item-label--current {
      font-weight: 600;
    }
    .flr-ps__item-meta {
      display: block;
      font-size: 11px;
      color: var(--color-ink-3, #94a3b8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .flr-ps__check {
      color: var(--color-ink-3, #64748b);
      font-size: 11px;
      flex-shrink: 0;
    }
    .flr-ps__sep {
      height: 1px;
      background: var(--color-rule, rgba(30, 41, 59, 0.1));
      margin: 4px -6px;
    }
    .flr-ps__footer-btn {
      width: 100%;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: transparent;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      color: var(--color-ink-2, #475569);
      text-align: left;
      font-size: 13px;
      transition: background 80ms;
    }
    .flr-ps__footer-btn:hover {
      background: var(--color-app-nav-hover, rgba(30, 41, 59, 0.06));
    }
    .flr-ps__footer-label {
      flex: 1;
    }
  `,
})
export class ProjectSwitcherComponent {
  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly shell = inject(SHELL_CONTEXT, { optional: true });
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly current = input<ProjectSwitcherItem | null>(null);
  readonly items = input<readonly ProjectSwitcherItem[]>([]);
  readonly title = input('Switch');
  readonly searchPlaceholder = input('Search…');
  readonly createLabel = input<string | null>(null);
  readonly viewAllLabel = input<string | null>(null);
  readonly placeholder = input<ProjectSwitcherPlaceholder | null>(null);
  readonly variant = input<'card' | 'brand'>('card');
  readonly triggerEyebrow = input<string | null>(null);
  readonly emptyState = input('No results');

  readonly selectItem = output<string>();
  readonly create = output<void>();
  readonly viewAll = output<void>();

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly highlight = signal(0);

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const items = this.items();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) || (it.searchTerms?.toLowerCase().includes(q) ?? false),
    );
  });

  protected readonly displayedIcon = computed(
    () => this.current()?.icon ?? this.placeholder()?.icon ?? '',
  );
  protected readonly displayedLabel = computed(
    () => this.current()?.label ?? this.placeholder()?.label ?? 'All items',
  );
  protected readonly compact = computed(
    () => this.variant() === 'brand' && (this.shell?.collapsed() ?? false),
  );

  protected readonly monogram = computed(
    () => Array.from(this.displayedLabel().trim())[0]?.toLocaleUpperCase() ?? '',
  );

  protected readonly displayedMeta = computed(
    () => this.current()?.meta ?? this.placeholder()?.meta ?? '',
  );

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

  protected trustedIcon(markup: string | undefined): SafeHtml | null {
    return markup && isTrustedIconMarkup(markup)
      ? this.sanitizer.bypassSecurityTrustHtml(markup)
      : null;
  }

  protected toggle(): void {
    this.open.set(!this.open());
  }

  protected close(): void {
    this.open.set(false);
    this.query.set('');
  }

  protected onSelect(item: ProjectSwitcherItem): void {
    this.selectItem.emit(item.id);
    this.close();
  }

  protected onCreate(): void {
    this.create.emit();
    this.close();
  }

  protected onViewAll(): void {
    this.viewAll.emit();
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
