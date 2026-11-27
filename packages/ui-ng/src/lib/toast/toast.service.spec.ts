import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import type { AriaLivePoliteness } from '@angular/cdk/a11y';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { describe, expect, it, vi } from 'vitest';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService, type ToastVariant } from './toast.service';

interface ComponentAnnotation {
  template: string;
}

function createService() {
  const announce = vi.fn<(message: string, politeness: AriaLivePoliteness) => Promise<void>>();
  const injector = Injector.create({
    providers: [{ provide: LiveAnnouncer, useValue: { announce } }],
  });
  const service = runInInjectionContext(injector, () => new ToastService());
  return { service, announce };
}

function containerTemplate(): string {
  const annotations = (
    ToastContainerComponent as unknown as { __annotations__: ComponentAnnotation[] }
  ).__annotations__;
  return annotations[0].template;
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

describe('ToastContainerComponent template', () => {
  it('declares no live region role, leaving announcements to LiveAnnouncer', () => {
    const template = containerTemplate();
    expect(template).not.toMatch(/\brole\s*=\s*"(status|alert|log)"/);
    expect(template).not.toMatch(/\baria-live\b/);
  });
});
