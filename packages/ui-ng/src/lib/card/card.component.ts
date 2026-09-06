import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardVariant = 'flat' | 'raised' | 'outlined';

const PADDING: Record<CardPadding, string> = {
  none: '0',
  sm: '16px',
  md: '24px',
  lg: '32px',
};

@Component({
  selector: 'flr-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-card" [class.flr-card--interactive]="interactive()" [style]="styles()">
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-card {
      border-radius: 14px;
      transition:
        box-shadow 160ms ease,
        transform 160ms ease;
    }
    .flr-card--interactive {
      cursor: pointer;
    }
    .flr-card--interactive:hover {
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
    }
  `,
})
export class CardComponent {
  readonly padding = input<CardPadding>('md');
  readonly variant = input<CardVariant>('outlined');
  readonly interactive = input(false);

  protected readonly styles = computed<Record<string, string | null>>(() => {
    const variant = this.variant();
    return {
      background: 'var(--color-card, #fff)',
      color: 'var(--color-ink, #1e293b)',
      padding: PADDING[this.padding()],
      border:
        variant === 'outlined'
          ? '1px solid var(--color-card-rule, rgba(30, 41, 59, 0.1))'
          : '1px solid transparent',
      'box-shadow': variant === 'raised' ? '0 1px 2px rgba(15, 23, 42, 0.06)' : null,
    };
  });
}

@Component({
  selector: 'flr-card-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-card-header">
      <div class="flr-card-header__text">
        <h3 class="flr-card-header__title">{{ title() }}</h3>
        @if (description(); as desc) {
          <p class="flr-card-header__desc">{{ desc }}</p>
        }
      </div>
      <div class="flr-card-header__trailing">
        <ng-content select="[card-trailing]" />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }
    .flr-card-header__text {
      min-width: 0;
    }
    .flr-card-header__title {
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-weight: 700;
      font-size: 16px;
      line-height: 1.25;
      color: var(--color-ink, #1e293b);
      margin: 0;
      letter-spacing: -0.01em;
    }
    .flr-card-header__desc {
      margin: 6px 0 0;
      font-size: 13px;
      line-height: 1.45;
      color: var(--color-ink-3, #64748b);
    }
    .flr-card-header__trailing {
      flex-shrink: 0;
    }
  `,
})
export class CardHeaderComponent {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
}
