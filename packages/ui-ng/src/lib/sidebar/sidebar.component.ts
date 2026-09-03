import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/**
 * App sidebar shell — Angular 22 port of `@ferrlabs/ui-react`'s Sidebar.
 * Paper-app palette, collapsible (256px ↔ 64px). Project the brand into the
 * `[sidebar-brand]` slot and nav rows (`<flr-sidebar-section>` /
 * `<flr-sidebar-item>`) as default content. `collapsed` is two-way bindable.
 */
@Component({
  selector: 'flr-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="flr-sb" [class.flr-sb--collapsed]="collapsed()" [style.width]="widthPx()">
      <div class="flr-sb__brand"><ng-content select="[sidebar-brand]" /></div>
      <div class="flr-sb__project"><ng-content select="[sidebar-project]" /></div>
      <nav class="flr-sb__nav" [attr.aria-label]="navLabel()"><ng-content /></nav>
      <div class="flr-sb__footer">
        <button type="button" class="flr-sb__toggle mono" (click)="toggle()">
          <span aria-hidden="true">{{ collapsed() ? '→' : '←' }}</span>
          <span class="flr-sb__toggle-label">Collapse</span>
        </button>
      </div>
    </aside>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-sb {
      flex-shrink: 0;
      height: var(--flr-sidebar-height, 100vh);
      position: sticky;
      top: 0;
      display: flex;
      flex-direction: column;
      background: var(--color-app-sidebar, #f7f7f5);
      border-right: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      transition: width 220ms ease;
    }
    .flr-sb__brand {
      height: 64px;
      min-height: 64px;
      box-sizing: border-box;
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
    }
    .flr-sb--collapsed .flr-sb__brand {
      justify-content: center;
    }
    .flr-sb__brand:empty,
    .flr-sb__project:empty {
      display: none;
    }
    .flr-sb__nav {
      flex: 1;
      padding: 8px;
      overflow-y: auto;
    }
    .flr-sb__footer {
      border-top: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      padding: 8px;
    }
    .flr-sb__toggle {
      width: 100%;
      padding: 8px 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--color-ink-3, #64748b);
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 11px;
      letter-spacing: 0.06em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .flr-sb--collapsed .flr-sb__toggle {
      justify-content: center;
    }
    .flr-sb__toggle-label {
      overflow: hidden;
      white-space: nowrap;
      transition:
        opacity 160ms ease,
        max-width 220ms ease;
    }
    .flr-sb--collapsed .flr-sb__toggle-label {
      opacity: 0;
      max-width: 0;
    }
    @media (max-width: 880px) {
      .flr-sb {
        display: none;
      }
    }
  `,
})
export class SidebarComponent {
  readonly collapsed = model(false);
  readonly navLabel = input('Sections');
  readonly width = input(256);
  readonly collapsedWidth = input(64);

  protected readonly widthPx = computed(() =>
    this.collapsed() ? `${this.collapsedWidth()}px` : `${this.width()}px`,
  );

  protected toggle(): void {
    this.collapsed.set(!this.collapsed());
  }
}

/**
 * Section group inside `<flr-sidebar>` — optional mono uppercase title above a
 * cluster of `<flr-sidebar-item>`s.
 */
@Component({
  selector: 'flr-sidebar-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-sb-section">
      @if (title()) {
        <div
          class="mono flr-sb-section__title"
          [class.flr-sb-section__title--collapsed]="collapsed()"
        >
          {{ title() }}
        </div>
      }
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-sb-section {
      margin-bottom: 24px;
    }
    .flr-sb-section__title {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      padding: 4px 12px;
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
      margin-bottom: 6px;
      overflow: hidden;
      white-space: nowrap;
      transition:
        opacity 160ms ease,
        max-height 220ms ease,
        padding 220ms ease,
        margin-bottom 220ms ease;
    }
    .flr-sb-section__title--collapsed {
      padding: 0 12px;
      margin-bottom: 0;
      opacity: 0;
      max-height: 0;
    }
  `,
})
export class SidebarSectionComponent {
  readonly title = input<string | null>(null);
  readonly collapsed = input(false);
}

/**
 * Nav row inside a `<flr-sidebar-section>`. Renders an `<a>` when `href` is set,
 * otherwise a `<button>`. Active rows get a left accent bar; `danger` rows go red.
 */
@Component({
  selector: 'flr-sidebar-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (href() && !disabled()) {
      <a
        class="flr-sb-item"
        [class.flr-sb-item--active]="active()"
        [class.flr-sb-item--danger]="danger()"
        [class.flr-sb-item--collapsed]="collapsed()"
        [href]="href()"
        [attr.aria-current]="active() ? 'page' : null"
        [attr.title]="collapsed() ? label() : null"
        [style.--flr-sb-accent]="accentColor()"
        (click)="handleClick($event)"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </a>
    } @else {
      <button
        type="button"
        class="flr-sb-item"
        [class.flr-sb-item--active]="active()"
        [class.flr-sb-item--danger]="danger()"
        [class.flr-sb-item--collapsed]="collapsed()"
        [disabled]="disabled()"
        [attr.aria-current]="active() ? 'page' : null"
        [attr.title]="collapsed() ? label() : null"
        [style.--flr-sb-accent]="accentColor()"
        (click)="handleClick($event)"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </button>
    }

    <ng-template #body>
      <span class="flr-sb-item__icon"><ng-content select="[item-icon]" /></span>
      <span class="flr-sb-item__label">{{ label() }}</span>
      @if (badge() != null) {
        <span class="mono flr-sb-item__badge">{{ badge() }}</span>
      }
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
  styles: `
    :host {
      display: block;
    }
    .flr-sb-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      margin: 1px 0;
      border-radius: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--color-ink-2, #475569);
      font-size: 13.5px;
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      transition: background 120ms;
      position: relative;
      text-decoration: none;
      text-align: left;
      overflow: hidden;
    }
    .flr-sb-item:hover {
      background: var(--color-app-nav-hover, rgba(30, 41, 59, 0.03));
    }
    .flr-sb-item--active {
      background: var(--color-app-nav-active, rgba(30, 41, 59, 0.06));
      color: var(--color-ink, #1e293b);
    }
    .flr-sb-item--active:hover {
      background: var(--color-app-nav-active, rgba(30, 41, 59, 0.06));
    }
    .flr-sb-item--danger {
      color: var(--color-danger, #dc2626);
    }
    .flr-sb-item:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
    .flr-sb-item__icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      display: grid;
      place-items: center;
      color: var(--color-ink-3, #64748b);
      font-size: 14px;
      line-height: 1;
      transition:
        transform 220ms ease,
        color 160ms ease;
    }
    .flr-sb-item__icon ::ng-deep svg:not([width]) {
      width: 16px;
      height: 16px;
      display: block;
    }
    .flr-sb-item--active .flr-sb-item__icon {
      color: var(--flr-sb-accent, var(--color-accent, var(--color-ink, #1e293b)));
    }
    .flr-sb-item--collapsed .flr-sb-item__icon {
      transform: translateX(4px);
    }
    .flr-sb-item__label {
      flex: 1;
      text-align: left;
      overflow: hidden;
      white-space: nowrap;
      transition:
        opacity 160ms ease,
        max-width 220ms ease;
    }
    .flr-sb-item--collapsed .flr-sb-item__label {
      opacity: 0;
      max-width: 0;
    }
    .flr-sb-item__badge {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 10px;
      padding: 1px 7px;
      border-radius: 999px;
      background: var(--color-rule, rgba(30, 41, 59, 0.14));
      color: var(--color-ink-2, #475569);
      white-space: nowrap;
    }
    .flr-sb-item--active .flr-sb-item__badge {
      background: var(--flr-sb-accent, var(--color-accent, var(--color-ink, #1e293b)));
      color: #fff;
    }
    .flr-sb-item--collapsed .flr-sb-item__badge {
      opacity: 0;
      max-width: 0;
      padding: 0;
      overflow: hidden;
    }
  `,
})
export class SidebarItemComponent {
  readonly href = input<string | null>(null);
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly badge = input<string | number | null>(null);
  readonly collapsed = input(false);
  readonly accent = input<string | null>(null);
  readonly danger = input(false);
  readonly disabled = input(false);

  readonly selected = output<void>();

  protected readonly accentColor = computed(
    () => this.accent() ?? 'var(--color-accent, var(--color-ink, #1e293b))',
  );

  protected handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    if (this.href() && (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)) {
      return;
    }
    if (this.href()) event.preventDefault();
    this.selected.emit();
  }
}
