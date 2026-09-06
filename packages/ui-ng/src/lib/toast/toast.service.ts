import { Injectable, inject, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastInput {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastItem extends ToastInput {
  readonly id: string;
  readonly variant: ToastVariant;
  readonly duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly items = signal<ToastItem[]>([]);
  private counter = 0;

  readonly toasts = this.items.asReadonly();

  show(toast: ToastInput): string {
    const id = `flr-toast-${++this.counter}`;
    const item: ToastItem = { variant: 'info', duration: 5000, ...toast, id };
    this.items.update((list) => [...list, item]);
    this.liveAnnouncer.announce(item.message, item.variant === 'error' ? 'assertive' : 'polite');
    if (item.duration > 0) {
      setTimeout(() => this.dismiss(id), item.duration);
    }
    return id;
  }

  dismiss(id: string): void {
    this.items.update((list) => list.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.items.set([]);
  }
}
