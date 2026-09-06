import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { MenuComponent, MenuItemComponent, MenuSeparatorComponent } from '../menu/menu.component';

export interface UserMenuItem {
  readonly id?: string;
  readonly label: string;
  readonly href?: string;
  readonly icon?: string;
  readonly danger?: boolean;
  readonly separatorAbove?: boolean;
}

@Component({
  selector: 'flr-user-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenuComponent, MenuItemComponent, MenuSeparatorComponent, AvatarComponent],
  template: `
    <flr-menu align="end" [minWidth]="220">
      <button flr-menu-trigger type="button" class="flr-um__trigger" [title]="name()">
        <flr-avatar [name]="name()" [src]="avatarSrc()" [accent]="accent()" [size]="28" />
        @if (showName()) {
          <span class="flr-um__name">{{ name() }}</span>
        }
        <span class="flr-um__chev" aria-hidden="true">▾</span>
      </button>

      <div flr-menu-content>
        <div class="flr-um__header">
          <div class="flr-um__header-name">{{ name() }}</div>
          @if (email()) {
            <div class="mono flr-um__header-email">{{ email() }}</div>
          }
        </div>
        @for (item of items(); track item.id ?? item.label) {
          @if (item.separatorAbove) {
            <flr-menu-separator />
          }
          <flr-menu-item
            [href]="item.href ?? null"
            [destructive]="item.danger ?? false"
            (selected)="select.emit(item)"
          >
            @if (item.icon) {
              <span menu-item-icon>{{ item.icon }}</span>
            }
            {{ item.label }}
          </flr-menu-item>
        }
      </div>
    </flr-menu>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .flr-um__trigger {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: none;
      padding: 4px 8px;
      margin: 0;
      cursor: pointer;
      color: inherit;
      font: inherit;
      border-radius: 8px;
      transition: background 140ms ease;
    }
    .flr-um__trigger:hover {
      background: var(--color-app-nav-hover, rgba(30, 41, 59, 0.03));
    }
    .flr-um__name {
      font-size: 13px;
      color: var(--color-ink-2, #475569);
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flr-um__chev {
      color: var(--color-ink-3, #64748b);
      font-size: 10px;
      opacity: 0.7;
      margin-left: 2px;
    }
    .flr-um__header {
      padding: 8px 12px 10px;
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.1));
      margin-bottom: 4px;
    }
    .flr-um__header-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-ink, #1e293b);
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .flr-um__header-email {
      font-size: 11px;
      color: var(--color-ink-3, #64748b);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
})
export class UserMenuComponent {
  readonly name = input.required<string>();
  readonly email = input<string | null>(null);
  readonly avatarSrc = input<string | null>(null);
  readonly accent = input<string | null>(null);
  readonly items = input<readonly UserMenuItem[]>([]);
  readonly showName = input(true);

  readonly select = output<UserMenuItem>();
}
