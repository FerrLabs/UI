import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'flr-site-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flr-sc"
      [class.flr-sc--interactive]="interactive()"
      [attr.role]="interactive() ? 'button' : null"
      [attr.tabindex]="interactive() ? 0 : null"
      (click)="onActivate()"
      (keydown)="onKeydown($event)"
    >
      <span class="flr-sc__icon"><ng-content select="[site-card-icon]" /></span>
      <div class="flr-sc__body">
        <span class="flr-sc__eyebrow mono"><ng-content select="[site-card-eyebrow]" /></span>
        <div class="flr-sc__label">{{ label() }}</div>
        <div class="flr-sc__meta"><ng-content select="[site-card-meta]" /></div>
      </div>
      @if (showChevron()) {
        <svg
          class="flr-sc__chev"
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-sc {
      margin: 8px 12px;
      padding: 10px 12px;
      background: var(--color-card, #fff);
      border: 1px solid var(--color-rule, #e2e8f0);
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: default;
    }
    .flr-sc--interactive {
      cursor: pointer;
    }
    .flr-sc__icon {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }
    .flr-sc__icon ::ng-deep svg:not([width]) {
      width: 18px;
      height: 18px;
      display: block;
    }
    .flr-sc__body {
      flex: 1;
      min-width: 0;
    }
    .flr-sc__eyebrow {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #94a3b8);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }
    .flr-sc__eyebrow:empty {
      display: none;
    }
    .flr-sc__label {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-ink, #0f172a);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .flr-sc__meta {
      font-size: 11px;
      color: var(--color-ink-2, #475569);
      margin-top: 1px;
      display: flex;
      gap: 6px;
      align-items: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .flr-sc__meta:empty {
      display: none;
    }
    .flr-sc__chev {
      color: var(--color-ink-3, #94a3b8);
      flex-shrink: 0;
      display: block;
    }
  `,
})
export class SiteCardComponent {
  readonly label = input.required<string>();
  readonly showChevron = input(true);
  readonly interactive = input(true);

  readonly select = output<void>();

  protected onActivate(): void {
    if (this.interactive()) this.select.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.interactive()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select.emit();
    }
  }
}
