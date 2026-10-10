import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { MenuComponent, MenuItemComponent, MenuSeparatorComponent } from '../menu/menu.component';
import { SHELL_CONTEXT } from '../shell/shell-context';

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
  host: {
    '[class.flr-um--rail]': 'inRail',
  },
  template: `
    <flr-menu
      [align]="inRail ? 'start' : 'end'"
      [direction]="inRail ? 'up' : 'down'"
      [block]="inRail"
      [minWidth]="220"
    >
      <button
        flr-menu-trigger
        type="button"
        class="flr-um__trigger"
        [class.flr-um__trigger--rail]="inRail"
        [class.flr-um__trigger--compact]="compact()"
        [title]="name()"
      >
        <flr-avatar
          [attr.aria-hidden]="nameShown() || null"
          [name]="name()"
          [src]="avatarSrc()"
          [accent]="accent()"
          [size]="inRail ? 30 : 28"
        />
        @if (inRail) {
          @if (!compact()) {
            <span class="flr-um__identity">
              <span class="flr-um__name">{{ name() }}</span>
              @if (email()) {
                <span class="mono flr-um__email">{{ email() }}</span>
              }
            </span>
            <span class="flr-um__chev flr-um__chev--up" aria-hidden="true">▾</span>
          }
        } @else {
          @if (showName()) {
            <span class="flr-um__name">{{ name() }}</span>
          }
          <span class="flr-um__chev" aria-hidden="true">▾</span>
        }
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
    :host(.flr-um--rail) {
      display: flex;
      width: 100%;
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
    .flr-um__trigger--rail {
      width: 100%;
      gap: 10px;
      padding: 8px;
      text-align: left;
    }
    .flr-um__trigger--compact {
      justify-content: center;
      padding: 6px 0;
    }
    .flr-um__identity {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      gap: 2px;
    }
    .flr-um__trigger--rail .flr-um__name {
      max-width: none;
      color: var(--color-ink, #1e293b);
    }
    .flr-um__email {
      font-size: 11px;
      color: var(--color-ink-3, #64748b);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flr-um__chev--up {
      transform: rotate(180deg);
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

  private readonly shell = inject(SHELL_CONTEXT, { optional: true });
  protected readonly inRail = this.shell !== null;
  protected readonly compact = computed(() => this.shell?.collapsed() ?? false);
  protected readonly nameShown = computed(() => (this.inRail ? !this.compact() : this.showName()));
}
