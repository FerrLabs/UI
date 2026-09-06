import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

export interface BarChartPoint {
  readonly label: string;
  readonly value: number;
  readonly danger?: number;
  readonly title?: string;
}

const STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

function niceCeil(raw: number): number {
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  return (STEPS.find((s) => n <= s + 1e-9) ?? 10) * pow;
}

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
            <span class="flr-bc__scale-sizer">{{ widestTick() }}</span>
            @for (t of ticks(); track t.at) {
              <span class="flr-bc__scale-tick" [style.bottom.%]="t.at">{{ t.text }}</span>
            }
          </div>

          <div class="flr-bc__col">
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

            <div class="flr-bc__axis">
              @for (b of bars(); track b.key) {
                <span class="flr-bc__tick">{{ b.tick }}</span>
              }
            </div>
          </div>
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
      color: var(--color-ink-3, #5d6b80);
    }
    .flr-bc__grid {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .flr-bc__col {
      flex: 1;
      min-width: 0;
    }
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
      color: var(--color-ink-3, #5d6b80);
    }
    .flr-bc__plot {
      position: relative;
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
    .flr-bc__slot--on .flr-bc__stack {
      filter: brightness(1.25);
    }
    .flr-bc__bar {
      width: 100%;
      border-radius: 2px 2px 0 0;
    }
    .flr-bc__bar--zero {
      opacity: 0.28;
      min-height: 2px;
    }
    .flr-bc__bar--danger {
      background: var(--color-danger, #dc2626);
      border-radius: 0;
      order: -1;
    }
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
      color: var(--color-ink-3, #5d6b80);
      white-space: nowrap;
      overflow: hidden;
    }
    .flr-bc__empty {
      margin: 0;
      padding: 18px 0;
      font: 400 12px/1.4 var(--flr-font-sans, system-ui);
      color: var(--color-ink-3, #5d6b80);
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
  readonly summary = input<string>('');
  readonly color = input<string>('var(--flr-accent, #f59e0b)');
  readonly height = input<number>(96);
  readonly labelEvery = input<number>(7);
  readonly emptyText = input<string>('No data yet.');
  readonly format = input<(value: number) => string>((v) => `${v}`);
  readonly dangerLabel = input<string>('of which failed');

  protected readonly hover = signal(-1);

  protected readonly max = computed(() =>
    niceCeil(Math.max(1, ...this.points().map((p) => p.value))),
  );

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
