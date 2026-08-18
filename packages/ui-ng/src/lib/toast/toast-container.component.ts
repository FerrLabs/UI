import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastVariant } from './toast.service';

const ICON: Record<ToastVariant, string> = {
  info: '·',
  success: '✓',
  warning: '!',
  error: '×',
};

/**
 * Toast viewport — Angular 22 port of `@ferrlabs/ui-react`'s toast region.
 * Mount once near the app root; it renders the queue held by `ToastService`
 * (screen-reader announcements are handled by the service via `LiveAnnouncer`).
 */
@Component({
  selector: 'flr-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-toasts">
      @for (toast of toasts(); track toast.id) {
        <div class="flr-toast" [class]="'flr-toast--' + toast.variant" role="status">
          <span class="flr-toast__icon mono" aria-hidden="true">{{ icon(toast.variant) }}</span>
          <div class="flr-toast__body">
            @if (toast.title; as title) {
              <div class="flr-toast__title">{{ title }}</div>
            }
            <div class="flr-toast__message" [class.flr-toast__message--with-title]="!!toast.title">
              {{ toast.message }}
            </div>
          </div>
          <button
            type="button"
            class="flr-toast__close"
            aria-label="Dismiss"
            (click)="dismiss(toast.id)"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      position: fixed;
      bottom: 16px;
      right: 16px;
      z-index: 50;
      pointer-events: none;
    }
    .flr-toasts {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .flr-toast {
      pointer-events: auto;
      min-width: 288px;
      max-width: 384px;
      border-radius: 10px;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 12px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      color: #fff;
      animation: flr-toast-in 180ms ease-out;
    }
    .flr-toast--info {
      background: var(--color-ink, #1e293b);
    }
    .flr-toast--success {
      background: var(--color-success, #10b981);
    }
    .flr-toast--warning {
      background: var(--color-warning, #f59e0b);
    }
    .flr-toast--error {
      background: var(--color-danger, #dc2626);
    }
    @keyframes flr-toast-in {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .flr-toast__icon {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      line-height: 1;
      margin-top: 2px;
      opacity: 0.8;
    }
    .flr-toast__body {
      flex: 1;
      min-width: 0;
    }
    .flr-toast__title {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.25;
    }
    .flr-toast__message {
      font-size: 14px;
      line-height: 1.4;
    }
    .flr-toast__message--with-title {
      margin-top: 2px;
      opacity: 0.9;
    }
    .flr-toast__close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      line-height: 1;
      font-size: 18px;
      padding: 0;
      transition: color 120ms ease;
    }
    .flr-toast__close:hover {
      color: #fff;
    }
  `,
})
export class ToastContainerComponent {
  private readonly service = inject(ToastService);

  protected readonly toasts = this.service.toasts;

  protected icon(variant: ToastVariant): string {
    return ICON[variant];
  }

  protected dismiss(id: string): void {
    this.service.dismiss(id);
  }
}
