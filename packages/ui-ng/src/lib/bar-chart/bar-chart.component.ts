import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** One column of the chart. */
export interface BarChartPoint {
  /** Axis label. Only some are drawn — see `labelEvery`. */
  readonly label: string;
  readonly value: number;
  /**
   * Portion of `value` to draw in the accent-danger colour, for a "how much of
   * this was failures" reading. Must be <= `value`; anything above is clamped.
   */
  readonly danger?: number;
  /** Overrides the tooltip text, which otherwise shows the formatted value. */
  readonly title?: string;
}

/**
 * Small dependency-free bar chart.
 *
 * Exists because a row of headline numbers answers "how much in total" and
 * nothing else: it cannot show that an agent stopped running four days ago, or
 * that one bad afternoon accounts for most of the month's cost. Those are the
 * questions people actually bring to a detail page.
 *
 * Deliberately not a charting library: SVG, no axes machinery, no animation,
 * no external dependency. The moment this needs zooming or a second Y axis it
 * should become one, not grow into one.
 */
@Component({
  selector: 'flr-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="flr-bc">
      @if (title()) {
        <figcaption class="flr-bc__head">
          <span class="flr-bc__title">{{ title() }}</span>
          @if (summary()) {
            <span class="flr-bc__summary">{{ summary() }}</span>
          }
        </figcaption>
      }

      @if (points().length === 0) {
        <p class="flr-bc__empty">{{ emptyText() }}</p>
      } @else {
        <div class="flr-bc__plot" [style.height.px]="height()">
          @for (b of bars(); track b.key) {
            <div class="flr-bc__slot" [title]="b.title">
              <div class="flr-bc__stack">
                <div
                  class="flr-bc__bar"
                  [style.height.%]="b.pct"
                  [style.background]="color()"
                  [class.flr-bc__bar--zero]="b.zero"
                ></div>
                @if (b.dangerPct > 0) {
                  <div class="flr-bc__bar flr-bc__bar--danger" [style.height.%]="b.dangerPct"></div>
                }
              </div>
            </div>
          }
        </div>
        <div class="flr-bc__axis">
          @for (b of bars(); track b.key) {
            <span class="flr-bc__tick">{{ b.tick }}</span>
          }
        </div>
      }
    </figure>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-bc {
      margin: 0;
    }
    .flr-bc__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }
    .flr-bc__title {
      font: 500 12px/1.2 var(--flr-font-sans, system-ui);
      opacity: 0.75;
    }
    .flr-bc__summary {
      font: 400 11.5px/1.2 var(--flr-font-mono, ui-monospace, monospace);
      opacity: 0.55;
    }
    .flr-bc__plot {
      display: flex;
      align-items: flex-end;
      gap: 2px;
    }
    .flr-bc__slot {
      flex: 1;
      min-width: 0;
      height: 100%;
      display: flex;
      align-items: flex-end;
    }
    .flr-bc__stack {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      border-radius: 2px 2px 0 0;
      overflow: hidden;
    }
    .flr-bc__bar {
      width: 100%;
      border-radius: 2px 2px 0 0;
    }
    /* A day with no run still draws a hairline. A slot left blank reads as
       missing data; a flat line reads as zero, which is what it is. */
    .flr-bc__bar--zero {
      opacity: 0.28;
    }
    .flr-bc__bar--danger {
      background: #ef4444;
      border-radius: 0;
      order: -1;
    }
    .flr-bc__axis {
      display: flex;
      gap: 2px;
      margin-top: 6px;
    }
    .flr-bc__tick {
      flex: 1;
      min-width: 0;
      text-align: center;
      font: 400 10px/1 var(--flr-font-mono, ui-monospace, monospace);
      opacity: 0.45;
      white-space: nowrap;
      overflow: hidden;
    }
    .flr-bc__empty {
      margin: 0;
      padding: 18px 0;
      font: 400 12px/1.4 var(--flr-font-sans, system-ui);
      opacity: 0.55;
    }
  `,
})
export class BarChartComponent {
  readonly points = input.required<readonly BarChartPoint[]>();
  readonly title = input<string>('');
  /** Shown right of the title — a total, an average, a window. */
  readonly summary = input<string>('');
  readonly color = input<string>('var(--flr-accent, #f59e0b)');
  readonly height = input<number>(96);
  /** Draw one label every N columns, so a 30-day axis stays readable. */
  readonly labelEvery = input<number>(7);
  readonly emptyText = input<string>('No data yet.');
  /** Formats the tooltip value. Defaults to a plain number. */
  readonly format = input<(value: number) => string>((v) => `${v}`);

  /**
   * Scaled against the largest column, never against the sum: the question a
   * reader brings to this chart is "which day stands out", and a proportional
   * scale flattens exactly that.
   *
   * `max` floors at 1 so an all-zero series draws a flat baseline instead of
   * dividing by zero.
   */
  protected readonly bars = computed(() => {
    const pts = this.points();
    const max = Math.max(1, ...pts.map((p) => p.value));
    const every = Math.max(1, this.labelEvery());
    return pts.map((p, i) => {
      const danger = Math.min(Math.max(0, p.danger ?? 0), p.value);
      return {
        key: `${i}-${p.label}`,
        pct: (p.value / max) * 100,
        dangerPct: (danger / max) * 100,
        zero: p.value === 0,
        tick: i % every === 0 ? p.label : '',
        title: p.title ?? `${p.label}: ${this.format()(p.value)}`,
      };
    });
  });
}
