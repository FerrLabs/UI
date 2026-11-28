import { Injectable, inject, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  run: () => void;
  shortcut?: string;
}

export interface ToastInput {
  message: string;
  title?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
  announcement?: string;
}

export interface ToastItem extends ToastInput {
  readonly id: string;
  readonly variant: ToastVariant;
  readonly duration: number;
}

interface ToastTimer {
  handle: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
}

function announcementOf(toast: ToastItem): string {
  if (toast.announcement) return toast.announcement;
  if (!toast.action) return toast.message;
  const { label, shortcut } = toast.action;
  const sentence = /[.!?]$/.test(toast.message) ? toast.message : `${toast.message}.`;
  const actionText = shortcut ? `${label} (${shortcut})` : label;
  return `${sentence} ${actionText}`;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly items = signal<ToastItem[]>([]);
  private readonly timers = new Map<string, ToastTimer>();
  private counter = 0;

  readonly toasts = this.items.asReadonly();

  show(toast: ToastInput): string {
    const id = `flr-toast-${++this.counter}`;
    const item: ToastItem = { variant: 'info', duration: 5000, ...toast, id };
    this.items.update((list) => [...list, item]);
    this.liveAnnouncer.announce(
      announcementOf(item),
      item.variant === 'error' ? 'assertive' : 'polite',
    );
    if (item.duration > 0) {
      this.timers.set(id, { handle: null, remaining: item.duration, startedAt: 0 });
      this.resume(id);
    }
    return id;
  }

  runAction(id: string): void {
    const action = this.items().find((toast) => toast.id === id)?.action;
    if (!action) return;
    this.dismiss(id);
    action.run();
  }

  pause(id: string): void {
    const timer = this.timers.get(id);
    if (timer?.handle == null) return;
    clearTimeout(timer.handle);
    timer.handle = null;
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
  }

  resume(id: string): void {
    const timer = this.timers.get(id);
    if (timer?.handle !== null) return;
    timer.startedAt = Date.now();
    timer.handle = setTimeout(() => this.dismiss(id), timer.remaining);
  }

  dismiss(id: string): void {
    this.stopTimer(id);
    this.items.update((list) => list.filter((toast) => toast.id !== id));
  }

  clear(): void {
    for (const id of this.timers.keys()) this.stopTimer(id);
    this.items.set([]);
  }

  private stopTimer(id: string): void {
    const handle = this.timers.get(id)?.handle;
    if (handle != null) clearTimeout(handle);
    this.timers.delete(id);
  }
}
