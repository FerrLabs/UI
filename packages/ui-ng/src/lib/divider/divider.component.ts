import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DividerOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'flr-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (orientation() === 'vertical') {
      <div class="flr-divider flr-divider--v" role="separator" aria-orientation="vertical"></div>
    } @else if (label(); as text) {
      <div class="flr-divider flr-divider--labelled" role="separator" aria-orientation="horizontal">
        <span class="flr-divider__line"></span>
        <span class="flr-divider__label">{{ text }}</span>
        <span class="flr-divider__line"></span>
      </div>
    } @else {
      <hr class="flr-divider flr-divider--h" role="separator" aria-orientation="horizontal" />
    }
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-divider--v {
      display: inline-block;
      width: 1px;
      align-self: stretch;
      background: var(--color-rule, rgba(30, 41, 59, 0.14));
    }
    .flr-divider--h {
      border: 0;
      height: 1px;
      background: var(--color-rule, rgba(30, 41, 59, 0.14));
      margin: 0;
    }
    .flr-divider--labelled {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .flr-divider__line {
      flex: 1;
      height: 1px;
      background: var(--color-rule, rgba(30, 41, 59, 0.14));
    }
    .flr-divider__label {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
    }
  `,
})
export class DividerComponent {
  readonly orientation = input<DividerOrientation>('horizontal');
  readonly label = input<string | null>(null);
}
