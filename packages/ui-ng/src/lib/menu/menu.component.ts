import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  ViewEncapsulation,
} from '@angular/core';
import { type ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';

export type MenuAlign = 'start' | 'end';

@Component({
  selector: 'flr-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [OverlayModule],
  template: `
    <span
      class="flr-menu"
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      [attr.aria-haspopup]="'menu'"
      [attr.aria-expanded]="open()"
      (click)="toggle()"
    >
      <ng-content select="[flr-menu-trigger]" />
    </span>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions()"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="open.set(false)"
      (detach)="open.set(false)"
    >
      <div
        class="flr-menu__panel"
        role="menu"
        [style.min-width.px]="minWidth()"
        (click)="open.set(false)"
      >
        <ng-content select="[flr-menu-content]" />
      </div>
    </ng-template>
  `,
  styles: `
    flr-menu {
      display: inline-flex;
      position: relative;
    }
    .flr-menu__panel {
      background: var(--color-card, #ffffff);
      border: 1px solid var(--color-card-rule, rgba(30, 41, 59, 0.1));
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
      padding: 6px;
    }
  `,
})
export class MenuComponent {
  readonly align = input<MenuAlign>('start');
  readonly minWidth = input(220);
  readonly open = model(false);

  protected readonly positions = computed<ConnectedPosition[]>(() => {
    const x = this.align() === 'end' ? 'end' : 'start';
    return [
      { originX: x, originY: 'bottom', overlayX: x, overlayY: 'top', offsetY: 6 },
      { originX: x, originY: 'top', overlayX: x, overlayY: 'bottom', offsetY: -6 },
    ];
  });

  protected toggle(): void {
    this.open.set(!this.open());
  }
}

@Component({
  selector: 'flr-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    @if (href() && !disabled()) {
      <a
        class="flr-menu-item"
        [class.flr-menu-item--danger]="destructive()"
        [href]="href()"
        role="menuitem"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </a>
    } @else {
      <button
        type="button"
        class="flr-menu-item"
        [class.flr-menu-item--danger]="destructive()"
        role="menuitem"
        [disabled]="disabled()"
        (click)="onClick()"
      >
        <ng-container [ngTemplateOutlet]="body" />
      </button>
    }

    <ng-template #body>
      <span class="flr-menu-item__icon"><ng-content select="[menu-item-icon]" /></span>
      <span class="flr-menu-item__label"><ng-content /></span>
      <span class="flr-menu-item__shortcut"><ng-content select="[menu-item-shortcut]" /></span>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-menu-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      color: var(--color-ink-2, #475569);
      background: transparent;
      border: none;
      cursor: pointer;
      width: 100%;
      text-align: left;
      text-decoration: none;
      transition:
        background 140ms ease,
        color 140ms ease;
    }
    .flr-menu-item:hover {
      background: var(--color-paper-2, rgba(30, 41, 59, 0.04));
      color: var(--color-ink, #1e293b);
    }
    .flr-menu-item:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .flr-menu-item:disabled:hover {
      background: transparent;
      color: var(--color-ink-2, #475569);
    }
    .flr-menu-item--danger {
      color: var(--color-danger, #dc2626);
    }
    .flr-menu-item--danger:hover {
      color: var(--color-danger, #dc2626);
      background: color-mix(
        in oklab,
        var(--color-danger, #dc2626) 8%,
        var(--color-paper, transparent)
      );
    }
    .flr-menu-item__icon {
      width: 16px;
      display: inline-flex;
      justify-content: center;
      flex-shrink: 0;
    }
    .flr-menu-item__icon:empty {
      display: none;
    }
    .flr-menu-item__label {
      flex: 1;
      min-width: 0;
    }
    .flr-menu-item__shortcut {
      font-size: 11px;
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      color: var(--color-ink-3, #64748b);
    }
    .flr-menu-item__shortcut:empty {
      display: none;
    }
  `,
})
export class MenuItemComponent {
  readonly href = input<string | null>(null);
  readonly disabled = input(false);
  readonly destructive = input(false);

  readonly selected = output<void>();

  protected onClick(): void {
    if (this.disabled()) return;
    this.selected.emit();
  }
}

@Component({
  selector: 'flr-menu-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="flr-menu-separator" role="separator"></div>`,
  styles: `
    :host {
      display: block;
    }
    .flr-menu-separator {
      margin: 4px 0;
      height: 1px;
      background: var(--color-rule, rgba(30, 41, 59, 0.14));
    }
  `,
})
export class MenuSeparatorComponent {}

@Component({
  selector: 'flr-menu-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="flr-menu-label"><ng-content /></div>`,
  styles: `
    :host {
      display: block;
    }
    .flr-menu-label {
      padding: 6px 12px;
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
    }
  `,
})
export class MenuLabelComponent {}
