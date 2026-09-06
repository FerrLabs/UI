import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'flr-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <div class="flr-section__head">
        <h2 class="flr-section__title">{{ title() }}</h2>
        @if (hint(); as h) {
          <span class="mono flr-section__hint">{{ h }}</span>
        }
      </div>
      <ng-content />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-section__head {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 12px;
    }
    .flr-section__title {
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-weight: 700;
      font-size: 18px;
      letter-spacing: -0.02em;
      margin: 0;
      color: var(--color-fg, var(--color-ink, #1e293b));
    }
    .flr-section__hint {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 11px;
      color: var(--color-fg-3, var(--color-ink-3, #64748b));
    }
  `,
})
export class SectionComponent {
  readonly title = input.required<string>();
  readonly hint = input<string | null>(null);
}
