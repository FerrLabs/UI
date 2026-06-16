import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatDelta = 'up' | 'down' | 'flat';

/**
 * Bordered KPI card — Angular 22 port of `@ferrlabs/ui-react`'s Stat. Mono
 * label, Fraunces 700 number, accent delta. (The React original references a
 * non-existent `--font-serif`; this port uses the real `--font-sans` token.)
 */
@Component({
  selector: 'flr-stat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-stat">
      <div class="flr-stat__label mono">{{ label() }}</div>
      <div class="flr-stat__row">
        <span class="flr-stat__value">{{ value() }}</span>
        @if (delta(); as d) {
          <span class="flr-stat__delta mono" [style.color]="deltaColor()">
            {{ deltaSymbol() }} {{ d }}
          </span>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-stat {
      background: var(--color-card);
      border: 1px solid var(--color-rule);
      border-radius: 14px;
      padding: 20px;
    }
    .flr-stat__label {
      font-size: 10.5px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-fg-3);
      margin-bottom: 12px;
    }
    .flr-stat__row {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .flr-stat__value {
      font-family: var(--font-sans);
      font-weight: 700;
      font-size: 32px;
      letter-spacing: -0.025em;
      line-height: 1;
    }
    .flr-stat__delta {
      font-size: 12px;
    }
  `,
})
export class StatComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly delta = input<string | null>(null);
  readonly deltaType = input<StatDelta>('flat');
  readonly accent = input<string | null>(null);

  protected readonly deltaColor = computed(() => {
    switch (this.deltaType()) {
      case 'up':
        return this.accent() ?? 'var(--color-accent)';
      case 'down':
        return '#ef4444';
      default:
        return 'var(--color-fg-3)';
    }
  });

  protected readonly deltaSymbol = computed(() => {
    switch (this.deltaType()) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '·';
    }
  });
}
