import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'flr-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-empty">
      <div class="flr-empty__icon"><ng-content select="[empty-icon]" /></div>
      @if (title(); as t) {
        <p class="flr-empty__title">{{ t }}</p>
      }
      <div class="flr-empty__body"><ng-content /></div>
      <div class="flr-empty__action"><ng-content select="[empty-action]" /></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-empty {
      padding: 40px 32px;
      color: var(--color-fg-3, var(--color-ink-3, #64748b));
      font-size: 14px;
    }
    .flr-empty__icon:empty,
    .flr-empty__body:empty,
    .flr-empty__action:empty {
      display: none;
    }
    .flr-empty__icon {
      margin-bottom: 12px;
      color: var(--color-fg-3, var(--color-ink-3, #64748b));
    }
    .flr-empty__title {
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-weight: 700;
      font-size: 16px;
      letter-spacing: -0.01em;
      color: var(--color-fg, var(--color-ink, #1e293b));
      margin: 0 0 6px;
    }
    .flr-empty__action {
      margin-top: 16px;
    }
  `,
})
export class EmptyStateComponent {
  readonly title = input<string | null>(null);
}

@Component({
  selector: 'flr-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="flr-loading" role="status" aria-live="polite">{{ label() }}</p>`,
  styles: `
    :host {
      display: block;
    }
    .flr-loading {
      margin: 0;
      padding: 40px 32px;
      color: var(--color-fg-3, var(--color-ink-3, #64748b));
      font-size: 13px;
    }
  `,
})
export class LoadingStateComponent {
  readonly label = input('Loading…');
}

@Component({
  selector: 'flr-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-error" role="alert">
      <p class="flr-error__title">{{ title() }}</p>
      <p class="flr-error__msg">{{ message() }}</p>
      @if (canRetry()) {
        <button type="button" class="flr-error__retry" (click)="retry.emit()">
          {{ retryLabel() }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-error {
      margin: 40px 32px;
      border: 1px solid color-mix(in oklab, var(--color-danger, #dc2626) 26%, transparent);
      background: color-mix(
        in oklab,
        var(--color-danger, #dc2626) 10%,
        var(--color-paper, #faf8f4)
      );
      border-radius: 10px;
      padding: 20px;
      color: var(--color-danger-fg, #7f1d1d);
    }
    .flr-error__title {
      font-size: 14px;
      font-weight: 500;
      margin: 0;
    }
    .flr-error__msg {
      font-size: 12px;
      margin: 4px 0 0;
      opacity: 0.85;
    }
    .flr-error__retry {
      margin-top: 12px;
      border-radius: 8px;
      background: color-mix(in oklab, var(--color-danger, #dc2626) 16%, transparent);
      color: inherit;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      border: none;
      cursor: pointer;
    }
    .flr-error__retry:hover {
      background: color-mix(in oklab, var(--color-danger, #dc2626) 24%, transparent);
    }
  `,
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly title = input('Something went wrong.');
  readonly retryLabel = input('Retry');
  readonly canRetry = input(true);

  readonly retry = output<void>();
}
