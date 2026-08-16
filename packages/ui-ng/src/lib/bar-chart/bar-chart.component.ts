import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

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
  /**
   * Replaces the whole tooltip text, which otherwise reads `label` above the
   * formatted value.
   */
  readonly title?: string;
}

/**
 * Rounds up to the next round number of the same magnitude, so the axis reads
 * 0 / 250 / 500 rather than 0 / 237 / 474.
 *
 * The ladder is finer than the usual 1/2/5 because the overshoot is dead space:
 * 1/2/5 turns a peak of 13.7k into a ceiling of 20k and leaves the tallest bar
 * at two thirds of the plot, which wastes exactly the height the chart exists
 * to use. Every rung still halves into a number worth printing on the midpoint
 * tick.
 */
const STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function niceCeil(raw: number): number {
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  return (STEPS.find((s) => n <= s + 1e-9) ?? 10) * pow;
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
        <div class="flr-bc__grid">
          <div class="flr-bc__scale" [style.height.px]="height()" aria-hidden="true">
            <!-- The ticks are positioned, so they give the gutter no width and
                 the longest one would spill past the figure's left edge. This
                 sizer is the only thing in flow, and it is the widest tick. -->
            <span class="flr-bc__scale-sizer">{{ widestTick() }}</span>
            @for (t of ticks(); track t.at) {
              <span class="flr-bc__scale-tick" [style.bottom.%]="t.at">{{ t.text }}</span>
            }
          </div>

          <div class="flr-bc__plot" [style.height.px]="height()" (pointerleave)="hover.set(-1)">
            @for (t of ticks(); track t.at) {
              <span class="flr-bc__rule" [style.bottom.%]="t.at" aria-hidden="true"></span>
            }

            @for (b of bars(); track b.key) {
              <div
                class="flr-bc__slot"
                tabindex="0"
                role="img"
                [attr.aria-label]="b.aria"
                [class.flr-bc__slot--on]="hover() === b.index"
                (pointerenter)="hover.set(b.index)"
                (focus)="hover.set(b.index)"
                (blur)="hover.set(-1)"
              >
                <div class="flr-bc__stack">
                  <div
                    class="flr-bc__bar"
                    [style.height.%]="b.pct"
                    [style.background]="color()"
                    [class.flr-bc__bar--zero]="b.zero"
                  ></div>
                  @if (b.dangerPct > 0) {
                    <div
                      class="flr-bc__bar flr-bc__bar--danger"
                      [style.height.%]="b.dangerPct"
                    ></div>
                  }
                </div>
              </div>
            }

            @if (tip(); as t) {
              <div
                class="flr-bc__tip"
                [style.left.%]="t.at"
                [class.flr-bc__tip--start]="t.edge === 'start'"
                [class.flr-bc__tip--end]="t.edge === 'end'"
                role="status"
              >
                <span class="flr-bc__tip-label">{{ t.label }}</span>
                @if (t.value) {
                  <span class="flr-bc__tip-value">{{ t.value }}</span>
                }
                @if (t.danger) {
                  <span class="flr-bc__tip-danger">{{ t.danger }}</span>
                }
              </div>
            }
          </div>
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
    .flr-bc__grid {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }
    /* Sized by its widest tick so the plot starts at a stable offset whatever
       the magnitude, instead of shifting when the data crosses a digit. */
    .flr-bc__scale {
      position: relative;
      flex: 0 0 auto;
    }
    .flr-bc__scale-sizer {
      visibility: hidden;
      font: 400 10px/1 var(--flr-font-mono, ui-monospace, monospace);
      white-space: nowrap;
    }
    .flr-bc__scale-tick {
      position: absolute;
      right: 0;
      transform: translateY(50%);
      white-space: nowrap;
      font: 400 10px/1 var(--flr-font-mono, ui-monospace, monospace);
      opacity: 0.45;
    }
    .flr-bc__plot {
      position: relative;
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: flex-end;
      gap: 2px;
    }
    .flr-bc__rule {
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: currentColor;
      opacity: 0.1;
      pointer-events: none;
    }
    .flr-bc__slot {
      position: relative;
      flex: 1;
      min-width: 0;
      height: 100%;
      display: flex;
      align-items: flex-end;
      cursor: default;
    }
    .flr-bc__slot:focus-visible {
      outline: 1px solid currentColor;
      outline-offset: 1px;
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
    /* The hovered column brightens rather than the rest dimming: dimming 29 of
       30 bars redraws the whole plot to answer a question about one of them. */
    .flr-bc__slot--on .flr-bc__stack {
      filter: brightness(1.25);
    }
    .flr-bc__bar {
      width: 100%;
      border-radius: 2px 2px 0 0;
    }
    /* A day with no run still draws a hairline. A slot left blank reads as
       missing data; a flat line reads as zero, which is what it is.
       The min-height is what makes that true: a zero value is 0% of the plot,
       so opacity alone had nothing to paint. */
    .flr-bc__bar--zero {
      opacity: 0.28;
      min-height: 2px;
    }
    .flr-bc__bar--danger {
      background: #ef4444;
      border-radius: 0;
      order: -1;
    }
    /* Anchored to the plot, not the column, so it is never clipped by a slot
       narrower than the text. The edge modifiers stop it overflowing the card
       on the first and last columns. */
    .flr-bc__tip {
      position: absolute;
      bottom: calc(100% + 6px);
      transform: translateX(-50%);
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 1px;
      padding: 5px 8px;
      border-radius: 4px;
      background: var(--flr-tooltip-bg, rgba(20, 20, 20, 0.94));
      color: var(--flr-tooltip-fg, #fff);
      box-shadow: 0 2px 8px rgb(0 0 0 / 0.25);
      pointer-events: none;
      white-space: nowrap;
    }
    .flr-bc__tip--start {
      transform: none;
    }
    .flr-bc__tip--end {
      transform: translateX(-100%);
    }
    .flr-bc__tip-label {
      font: 400 10px/1.3 var(--flr-font-mono, ui-monospace, monospace);
      opacity: 0.7;
    }
    .flr-bc__tip-value {
      font: 500 12px/1.3 var(--flr-font-sans, system-ui);
    }
    .flr-bc__tip-danger {
      font: 400 10px/1.3 var(--flr-font-mono, ui-monospace, monospace);
      color: #fca5a5;
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
    @media (prefers-reduced-motion: no-preference) {
      .flr-bc__stack {
        transition: filter 120ms ease-out;
      }
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
  /** Formats values in the tooltip and on the scale. Defaults to a plain number. */
  readonly format = input<(value: number) => string>((v) => `${v}`);
  /** Labels the danger portion in the tooltip, when a point carries one. */
  readonly dangerLabel = input<string>('of which failed');

  protected readonly hover = signal(-1);

  /**
   * Bars are measured against the rounded-up maximum rather than the tallest
   * column, so the tallest bar rarely touches the ceiling. That is the price of
   * having a scale at all: against a raw maximum the top gridline would sit at
   * an arbitrary number, and the axis would be decoration rather than a
   * reference the reader can measure against.
   *
   * The floor of 1 keeps an all-zero series drawing a flat baseline instead of
   * dividing by zero.
   */
  protected readonly max = computed(() =>
    niceCeil(Math.max(1, ...this.points().map((p) => p.value))),
  );

  /** 0, half, full. Three lines read as a scale; more read as graph paper. */
  protected readonly ticks = computed(() => {
    const max = this.max();
    const fmt = this.format();
    return [0, 0.5, 1].map((f) => ({ at: f * 100, text: fmt(max * f) }));
  });

  protected readonly widestTick = computed(() =>
    this.ticks().reduce((a, t) => (t.text.length > a.length ? t.text : a), ''),
  );

  protected readonly bars = computed(() => {
    const pts = this.points();
    const max = this.max();
    const every = Math.max(1, this.labelEvery());
    const fmt = this.format();
    return pts.map((p, i) => {
      const danger = Math.min(Math.max(0, p.danger ?? 0), p.value);
      // A point that carries its own `title` already spells out what it wants
      // to say, values included. Adding the formatted value under it would
      // print the same number twice, so the custom text stands alone.
      const label = p.title ?? p.label;
      const value = p.title ? '' : fmt(p.value);
      const dangerText = danger > 0 ? `${fmt(danger)} ${this.dangerLabel()}` : '';
      return {
        key: `${i}-${p.label}`,
        index: i,
        pct: (p.value / max) * 100,
        dangerPct: (danger / max) * 100,
        zero: p.value === 0,
        tick: i % every === 0 ? p.label : '',
        label,
        value,
        danger: dangerText,
        aria: [label, value, dangerText].filter(Boolean).join(', '),
      };
    });
  });

  /**
   * `null` when nothing is hovered, so the template can bind it with `@if (…; as t)`
   * and never render an empty bubble.
   */
  protected readonly tip = computed(() => {
    const i = this.hover();
    const bars = this.bars();
    const b = bars[i];
    if (!b) return null;
    const at = ((i + 0.5) / bars.length) * 100;
    return {
      at,
      edge: at < 12 ? 'start' : at > 88 ? 'end' : 'mid',
      label: b.label,
      value: b.value,
      danger: b.danger,
    };
  });
}
