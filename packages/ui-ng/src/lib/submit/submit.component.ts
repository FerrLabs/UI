import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'flr-submit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="submit"
      class="flr-submit mono"
      [class.flr-submit--full]="fullWidth()"
      [disabled]="inactive()"
      [attr.aria-busy]="loading() || null"
    >
      @if (loading()) {
        <span class="flr-submit__spinner" aria-hidden="true"></span>
      }
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-submit {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 40px;
      padding: 0 16px;
      font-family: var(
        --font-mono,
        'DM Mono',
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Consolas,
        monospace
      );
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      line-height: 1;
      white-space: nowrap;
      user-select: none;
      color: #fff;
      background: var(--color-accent, var(--color-ink, #1e293b));
      border: 1px solid var(--color-accent, var(--color-ink, #1e293b));
      border-radius: 8px;
      cursor: pointer;
      transition:
        background 160ms ease-out,
        opacity 160ms,
        box-shadow 160ms;
    }
    .flr-submit--full {
      display: flex;
      width: 100%;
    }
    .flr-submit:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
    .flr-submit__spinner {
      width: 12px;
      height: 12px;
      border: 1.5px solid #fff;
      border-right-color: transparent;
      border-radius: 50%;
      display: inline-block;
      animation: flr-submit-spin 700ms linear infinite;
    }
    @keyframes flr-submit-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class SubmitComponent {
  readonly loading = input(false);
  readonly fullWidth = input(false);
  readonly disabled = input(false);

  protected readonly inactive = computed(() => this.disabled() || this.loading());
}
