import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatDelta = 'up' | 'down' | 'flat';

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
      background: var(--color-card, #ffffff);
      border: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      border-radius: 14px;
      padding: 20px;
    }
    .flr-stat__label {
      font-size: 10.5px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-fg-3, var(--color-ink-3, #64748b));
      margin-bottom: 12px;
    }
    .flr-stat__row {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .flr-stat__value {
      font-family: var(--font-sans, 'Fraunces', Georgia, ui-serif, serif);
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
        return (
          this.accent() ??
          'var(--color-accent, var(--accent, var(--color-ferrlabs-slate, #1e293b)))'
        );
      case 'down':
        return 'var(--color-danger, #dc2626)';
      default:
        return 'var(--color-fg-3, var(--color-ink-3, #64748b))';
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
