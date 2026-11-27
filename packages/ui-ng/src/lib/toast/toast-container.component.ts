import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastVariant } from './toast.service';

const ICON: Record<ToastVariant, string> = {
  info: '·',
  success: '✓',
  warning: '!',
  error: '×',
};

@Component({
  selector: 'flr-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css',
})
export class ToastContainerComponent {
  private readonly service = inject(ToastService);

  protected readonly toasts = this.service.toasts;

  protected icon(variant: ToastVariant): string {
    return ICON[variant];
  }

  private returnFocus: HTMLElement | null = null;

  protected dismiss(event: Event, id: string): void {
    this.service.dismiss(id);
    this.restoreFocus(event);
  }

  protected runAction(event: Event, id: string): void {
    this.service.runAction(id);
    this.restoreFocus(event);
  }

  protected pause(id: string): void {
    this.service.pause(id);
  }

  protected onFocusIn(event: FocusEvent, id: string): void {
    const from = event.relatedTarget;
    const region = (event.currentTarget as HTMLElement).parentElement;
    if (from instanceof HTMLElement && !region?.contains(from)) this.returnFocus = from;
    this.service.pause(id);
  }

  protected resumeWhenIdle(event: MouseEvent | FocusEvent, id: string): void {
    const toast = event.currentTarget as HTMLElement;
    const focusTarget = event.type === 'focusout' ? event.relatedTarget : document.activeElement;
    const focused = focusTarget instanceof Node && toast.contains(focusTarget);
    if (!focused && !toast.matches(':hover')) this.service.resume(id);
  }

  private restoreFocus(event: Event): void {
    const toast = (event.currentTarget as HTMLElement).closest('.flr-toast');
    if (toast?.contains(document.activeElement) && this.returnFocus?.isConnected) {
      this.returnFocus.focus();
    }
  }
}
