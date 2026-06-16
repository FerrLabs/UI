import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export type BannerVariant = 'info' | 'success' | 'warning' | 'danger';

interface BannerTokens {
  readonly bg: string;
  readonly fg: string;
  readonly bar: string;
  readonly border: string;
}

const TOKENS: Record<BannerVariant, BannerTokens> = {
  info: {
    bg: 'color-mix(in oklab, var(--color-ink-3, #64748b) 8%, var(--color-paper, #faf8f4))',
    fg: 'var(--color-ink, #1e293b)',
    bar: 'var(--color-ink-3, #64748b)',
    border: 'var(--color-rule, rgba(30, 41, 59, 0.14))',
  },
  success: {
    bg: 'color-mix(in oklab, #10b981 10%, var(--color-paper, #faf8f4))',
    fg: '#065f46',
    bar: '#10b981',
    border: 'color-mix(in oklab, #10b981 24%, transparent)',
  },
  warning: {
    bg: 'color-mix(in oklab, #f59e0b 12%, var(--color-paper, #faf8f4))',
    fg: '#78350f',
    bar: '#f59e0b',
    border: 'color-mix(in oklab, #f59e0b 28%, transparent)',
  },
  danger: {
    bg: 'color-mix(in oklab, #dc2626 10%, var(--color-paper, #faf8f4))',
    fg: '#7f1d1d',
    bar: '#dc2626',
    border: 'color-mix(in oklab, #dc2626 26%, transparent)',
  },
};

/**
 * Inline message banner — Angular 22 port of `@ferrlabs/ui-react`'s Banner.
 * Project the body as default content and an optional action via the
 * `[banner-action]` slot. `dismissible` shows a close button and emits
 * `dismissed`.
 */
@Component({
  selector: 'flr-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!hidden()) {
      <div
        class="flr-banner"
        [attr.role]="variant() === 'danger' ? 'alert' : 'status'"
        [style]="styles()"
      >
        <span class="flr-banner__bar" aria-hidden="true" [style.background]="tokens().bar"></span>
        <div class="flr-banner__body">
          @if (title(); as t) {
            <div class="flr-banner__title">{{ t }}</div>
          }
          <div class="flr-banner__content" [class.flr-banner__content--with-title]="!!title()">
            <ng-content />
          </div>
        </div>
        <div class="flr-banner__action"><ng-content select="[banner-action]" /></div>
        @if (dismissible()) {
          <button
            type="button"
            class="flr-banner__dismiss"
            aria-label="Dismiss"
            (click)="dismiss()"
          >
            ×
          </button>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-banner {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      border-radius: 10px;
      padding: 12px 16px;
      overflow: hidden;
    }
    .flr-banner__bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
    }
    .flr-banner__body {
      flex: 1;
      min-width: 0;
      margin-left: 4px;
    }
    .flr-banner__title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.35;
    }
    .flr-banner__content {
      font-size: 14px;
      line-height: 1.55;
    }
    .flr-banner__content--with-title {
      margin-top: 4px;
      opacity: 0.9;
    }
    .flr-banner__action {
      flex-shrink: 0;
      align-self: center;
    }
    .flr-banner__dismiss {
      flex-shrink: 0;
      align-self: flex-start;
      background: transparent;
      border: none;
      color: inherit;
      opacity: 0.6;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      padding: 2px;
    }
    .flr-banner__dismiss:hover {
      opacity: 1;
    }
  `,
})
export class BannerComponent {
  readonly variant = input<BannerVariant>('info');
  readonly title = input<string | null>(null);
  readonly dismissible = input(false);

  readonly dismissed = output<void>();

  protected readonly hidden = signal(false);
  protected readonly tokens = computed(() => TOKENS[this.variant()]);

  protected readonly styles = computed<Record<string, string>>(() => {
    const t = this.tokens();
    return {
      border: `1px solid ${t.border}`,
      background: t.bg,
      color: t.fg,
    };
  });

  protected dismiss(): void {
    this.hidden.set(true);
    this.dismissed.emit();
  }
}
