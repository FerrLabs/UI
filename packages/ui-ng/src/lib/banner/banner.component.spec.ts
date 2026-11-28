import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it, vi } from 'vitest';
import { BannerComponent, type BannerVariant } from './banner.component';

class BannerProbe extends BannerComponent {
  readonly style = () => this.styles();
  readonly isHidden = () => this.hidden();
  clickDismiss(): void {
    this.dismiss();
  }
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createBanner(): BannerProbe {
  return runInInjectionContext(Injector.create({ providers: [] }), () => new BannerProbe());
}

describe('BannerComponent styles', () => {
  it('uses the info variant by default', () => {
    expect(createBanner().style()['color']).toBe('var(--color-ink, #1e293b)');
  });

  it.each<[BannerVariant, string]>([
    ['info', 'var(--color-ink, #1e293b)'],
    ['success', 'var(--color-success-fg, #065f46)'],
    ['warning', 'var(--color-warning-fg, #78350f)'],
    ['danger', 'var(--color-danger-fg, #7f1d1d)'],
  ])('%s sets its foreground token', (variant, fg) => {
    const banner = createBanner();
    setInput(banner.variant, variant);
    expect(banner.style()['color']).toBe(fg);
  });

  it('keeps the border and background in step with the variant', () => {
    const banner = createBanner();
    setInput(banner.variant, 'danger');
    const style = banner.style();
    expect(style['background']).toContain('--color-danger');
    expect(style['border']).toMatch(/^1px solid .*--color-danger/);
    setInput(banner.variant, 'success');
    expect(banner.style()['background']).toContain('--color-success');
  });
});

describe('BannerComponent dismiss', () => {
  it('hides the banner and emits once', () => {
    const banner = createBanner();
    const dismissed = vi.fn();
    banner.dismissed.subscribe(dismissed);
    expect(banner.isHidden()).toBe(false);
    banner.clickDismiss();
    expect(banner.isHidden()).toBe(true);
    expect(dismissed).toHaveBeenCalledTimes(1);
  });
});
