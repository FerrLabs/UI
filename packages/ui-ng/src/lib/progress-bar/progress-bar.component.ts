import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ProgressBarSize = 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'accent' | 'success' | 'warning' | 'danger';

const HEIGHT: Record<ProgressBarSize, string> = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

const FILL: Record<ProgressBarVariant, string> = {
  accent: 'var(--color-accent, var(--accent, var(--color-ferrlabs-slate, #1e293b)))',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
};

/**
 * Determinate / indeterminate progress bar — Angular 22 port of
 * `@ferrlabs/ui-react`'s ProgressBar. Set `indeterminate` for an animated
 * sweep; otherwise `value`/`max` drive the fill width.
 */
@Component({
  selector: 'flr-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-progress">
      @if (label() || displayValue()) {
        <div class="flr-progress__meta">
          <span>{{ label() }}</span>
          @if (displayValue(); as d) {
            <span class="flr-progress__value">{{ d }}</span>
          }
        </div>
      }
      <div
        class="flr-progress__track"
        role="progressbar"
        [attr.aria-valuenow]="indeterminate() ? null : value()"
        [attr.aria-valuemin]="0"
        [attr.aria-valuemax]="max()"
        [attr.aria-label]="label()"
        [style.height]="height()"
      >
        <div
          class="flr-progress__fill"
          [class.flr-progress__fill--indeterminate]="indeterminate()"
          [style.background]="fill()"
          [style.width]="indeterminate() ? '40%' : pct() + '%'"
        ></div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-progress {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .flr-progress__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: var(--color-ink-2, #475569);
    }
    .flr-progress__value {
      font-family: var(
        --font-mono,
        'DM Mono',
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Consolas,
        monospace
      );
      color: var(--color-ink-3, #64748b);
    }
    .flr-progress__track {
      width: 100%;
      background: var(--color-rule, rgba(30, 41, 59, 0.14));
      border-radius: 999px;
      overflow: hidden;
    }
    .flr-progress__fill {
      height: 100%;
      border-radius: 999px;
      transition: width 300ms ease-out;
    }
    .flr-progress__fill--indeterminate {
      transition: none;
      animation: flr-progress-indeterminate 1.4s ease-in-out infinite;
    }
    @keyframes flr-progress-indeterminate {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(250%);
      }
    }
  `,
})
export class ProgressBarComponent {
  readonly value = input(0);
  readonly max = input(100);
  readonly label = input<string | null>(null);
  readonly showValue = input(false);
  readonly size = input<ProgressBarSize>('md');
  readonly variant = input<ProgressBarVariant>('accent');
  readonly indeterminate = input(false);

  protected readonly pct = computed(() =>
    Math.max(0, Math.min(100, (this.value() / this.max()) * 100)),
  );
  protected readonly displayValue = computed(() =>
    this.showValue() ? `${Math.round(this.pct())}%` : null,
  );
  protected readonly height = computed(() => HEIGHT[this.size()]);
  protected readonly fill = computed(() => FILL[this.variant()]);
}
