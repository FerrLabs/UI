import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import type { AriaLivePoliteness } from '@angular/cdk/a11y';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService, type ToastVariant } from './toast.service';

function createService() {
  const announce = vi.fn<(message: string, politeness: AriaLivePoliteness) => Promise<void>>();
  const injector = Injector.create({
    providers: [{ provide: LiveAnnouncer, useValue: { announce } }],
  });
  const service = runInInjectionContext(injector, () => new ToastService());
  return { service, announce };
}

describe('ToastService announcements', () => {
  it.each<[ToastVariant, AriaLivePoliteness]>([
    ['info', 'polite'],
    ['success', 'polite'],
    ['warning', 'polite'],
    ['error', 'assertive'],
  ])('announces a %s toast once with %s politeness', (variant, politeness) => {
    const { service, announce } = createService();
    service.show({ message: 'Redirected', variant, duration: 0 });
    expect(announce).toHaveBeenCalledTimes(1);
    expect(announce).toHaveBeenCalledWith('Redirected', politeness);
  });

  it('defaults to a polite announcement', () => {
    const { service, announce } = createService();
    service.show({ message: 'Saved', duration: 0 });
    expect(announce).toHaveBeenCalledExactlyOnceWith('Saved', 'polite');
  });

  it('announces once per toast', () => {
    const { service, announce } = createService();
    service.show({ message: 'a', duration: 0 });
    service.show({ message: 'b', variant: 'error', duration: 0 });
    expect(announce).toHaveBeenCalledTimes(2);
  });

  it('does not announce on dismiss or clear', () => {
    const { service, announce } = createService();
    const id = service.show({ message: 'a', duration: 0 });
    service.dismiss(id);
    service.clear();
    expect(announce).toHaveBeenCalledTimes(1);
  });
});

describe('ToastService action', () => {
  it('runs the action once and removes the toast', () => {
    const { service } = createService();
    const run = vi.fn<() => void>();
    const id = service.show({ message: 'Deleted', duration: 0, action: { label: 'Undo', run } });
    service.runAction(id);
    service.runAction(id);
    expect(run).toHaveBeenCalledTimes(1);
    expect(service.toasts()).toEqual([]);
  });

  it('removes the toast before the action runs', () => {
    const { service } = createService();
    let visibleDuringRun = -1;
    const id = service.show({
      message: 'Deleted',
      duration: 0,
      action: { label: 'Undo', run: () => (visibleDuringRun = service.toasts().length) },
    });
    service.runAction(id);
    expect(visibleDuringRun).toBe(0);
  });

  it('leaves other toasts in place', () => {
    const { service } = createService();
    const kept = service.show({ message: 'Saved', duration: 0 });
    const id = service.show({
      message: 'Deleted',
      duration: 0,
      action: { label: 'Undo', run: () => undefined },
    });
    service.runAction(id);
    expect(service.toasts().map((toast) => toast.id)).toEqual([kept]);
  });

  it('ignores a toast without action and an unknown id', () => {
    const { service } = createService();
    const id = service.show({ message: 'Saved', duration: 0 });
    service.runAction(id);
    service.runAction('flr-toast-404');
    expect(service.toasts()).toHaveLength(1);
  });

  it('does not run the action when the toast times out or is dismissed', () => {
    vi.useFakeTimers();
    try {
      const { service } = createService();
      const run = vi.fn<() => void>();
      service.show({ message: 'a', duration: 1000, action: { label: 'Undo', run } });
      const id = service.show({ message: 'b', duration: 0, action: { label: 'Undo', run } });
      vi.advanceTimersByTime(1000);
      service.dismiss(id);
      expect(service.toasts()).toEqual([]);
      expect(run).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it.each<[string, string, string | undefined, string]>([
    ['adds the label', 'Deleted key', undefined, 'Deleted key. Undo'],
    ['adds the shortcut', 'Deleted key', 'Ctrl+Z', 'Deleted key. Undo (Ctrl+Z)'],
    ['keeps the message punctuation', 'Deleted key.', 'Ctrl+Z', 'Deleted key. Undo (Ctrl+Z)'],
  ])('announces politely and %s', (_name, message, shortcut, expected) => {
    const { service, announce } = createService();
    service.show({
      message,
      duration: 0,
      action: { label: 'Undo', run: () => undefined, shortcut },
    });
    expect(announce).toHaveBeenCalledExactlyOnceWith(expected, 'polite');
  });

  it('announces the custom announcement instead of the message', () => {
    const { service, announce } = createService();
    service.show({
      message: 'Deleted key',
      announcement: 'Deleted key. Press Control Z to undo.',
      duration: 0,
      action: { label: 'Undo', run: () => undefined, shortcut: 'Ctrl+Z' },
    });
    expect(announce).toHaveBeenCalledExactlyOnceWith(
      'Deleted key. Press Control Z to undo.',
      'polite',
    );
  });
});

describe('ToastService duration', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('keeps a 6 s toast until its duration has passed', () => {
    const { service } = createService();
    service.show({ message: 'Deleted', duration: 6000 });
    vi.advanceTimersByTime(5999);
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts()).toEqual([]);
  });

  it('dismisses after 5 s by default', () => {
    const { service } = createService();
    service.show({ message: 'Saved' });
    vi.advanceTimersByTime(4999);
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts()).toEqual([]);
  });

  it('never dismisses a toast with a duration of 0', () => {
    const { service } = createService();
    service.show({ message: 'Saved', duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(service.toasts()).toHaveLength(1);
  });

  it('stops the countdown while paused and resumes with the time left', () => {
    const { service } = createService();
    const id = service.show({ message: 'Deleted', duration: 6000 });
    vi.advanceTimersByTime(4000);
    service.pause(id);
    vi.advanceTimersByTime(60_000);
    expect(service.toasts()).toHaveLength(1);
    service.resume(id);
    vi.advanceTimersByTime(1999);
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts()).toEqual([]);
  });

  it('counts a repeated pause or resume once', () => {
    const { service } = createService();
    const id = service.show({ message: 'Deleted', duration: 1000 });
    service.pause(id);
    vi.advanceTimersByTime(500);
    service.pause(id);
    service.resume(id);
    service.resume(id);
    vi.advanceTimersByTime(999);
    expect(service.toasts()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(service.toasts()).toEqual([]);
  });

  it('does not bring a toast back when resumed after dismiss or clear', () => {
    const { service } = createService();
    const first = service.show({ message: 'a', duration: 1000 });
    const second = service.show({ message: 'b', duration: 1000 });
    service.pause(first);
    service.dismiss(first);
    service.clear();
    service.resume(first);
    service.resume(second);
    const third = service.show({ message: 'c', duration: 5000 });
    vi.advanceTimersByTime(1000);
    expect(service.toasts().map((toast) => toast.id)).toEqual([third]);
  });
});
