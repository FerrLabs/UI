import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it, vi } from 'vitest';
import { ButtonComponent } from './button.component';

class ButtonProbe extends ButtonComponent {
  readonly isInactive = () => this.inactive();
  readonly style = () => this.styles();
  readonly dimensions = () => this.dim();
  click(event: MouseEvent): void {
    this.handleClick(event);
  }
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createButton(): ButtonProbe {
  return runInInjectionContext(Injector.create({ providers: [] }), () => new ButtonProbe());
}

function fakeClick() {
  return {
    preventDefault: vi.fn(),
    stopImmediatePropagation: vi.fn(),
  };
}

describe('ButtonComponent click handling', () => {
  it('emits pressed with the event when enabled', () => {
    const button = createButton();
    const pressed = vi.fn();
    button.pressed.subscribe(pressed);
    const event = fakeClick();
    button.click(event as unknown as MouseEvent);
    expect(pressed).toHaveBeenCalledWith(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it.each([
    ['disabled', 'disabled'],
    ['loading', 'loading'],
  ] as const)('swallows the click while %s', (_name, flag) => {
    const button = createButton();
    setInput(button[flag], true);
    const pressed = vi.fn();
    button.pressed.subscribe(pressed);
    const event = fakeClick();
    button.click(event as unknown as MouseEvent);
    expect(pressed).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
  });

  it('is inactive when either disabled or loading', () => {
    const button = createButton();
    expect(button.isInactive()).toBe(false);
    setInput(button.loading, true);
    expect(button.isInactive()).toBe(true);
    setInput(button.loading, false);
    setInput(button.disabled, true);
    expect(button.isInactive()).toBe(true);
  });

  it('emits again once re-enabled', () => {
    const button = createButton();
    const pressed = vi.fn();
    button.pressed.subscribe(pressed);
    setInput(button.disabled, true);
    button.click(fakeClick() as unknown as MouseEvent);
    setInput(button.disabled, false);
    button.click(fakeClick() as unknown as MouseEvent);
    expect(pressed).toHaveBeenCalledTimes(1);
  });
});

describe('ButtonComponent styles', () => {
  it('primary fills with the accent token and white text', () => {
    const style = createButton().style();
    expect(style['background']).toBe(
      'var(--color-accent, var(--color-fg, var(--color-ink, #1e293b)))',
    );
    expect(style['color']).toBe('#fff');
    expect(style['border']).toBe(`1px solid ${style['background']}`);
  });

  it('primary uses the accent override for fill and border', () => {
    const button = createButton();
    setInput(button.accent, '#123456');
    const style = button.style();
    expect(style['background']).toBe('#123456');
    expect(style['border']).toBe('1px solid #123456');
  });

  it('danger defaults to the danger token and accepts an override', () => {
    const button = createButton();
    setInput(button.variant, 'danger');
    expect(button.style()['background']).toBe('var(--color-danger, #dc2626)');
    setInput(button.accent, '#abcdef');
    expect(button.style()['background']).toBe('#abcdef');
    expect(button.style()['color']).toBe('#fff');
  });

  it('ghost is transparent and colours the text with the accent', () => {
    const button = createButton();
    setInput(button.variant, 'ghost');
    let style = button.style();
    expect(style['background']).toBe('transparent');
    expect(style['color']).toBe('var(--color-fg, var(--color-ink, #1e293b))');
    expect(style['border']).toContain('--color-rule-strong');
    setInput(button.accent, '#ff0000');
    style = button.style();
    expect(style['color']).toBe('#ff0000');
    expect(style['background']).toBe('transparent');
  });

  it('full width switches to block flex at 100%', () => {
    const button = createButton();
    expect(button.style()['display']).toBe('inline-flex');
    expect(button.style()['width']).toBeNull();
    setInput(button.fullWidth, true);
    expect(button.style()['display']).toBe('flex');
    expect(button.style()['width']).toBe('100%');
  });

  it.each([
    ['sm', '0 12px', '11px'],
    ['md', '0 16px', '13px'],
    ['lg', '0 20px', '14px'],
  ] as const)('size %s sets padding and font size', (size, padding, fontSize) => {
    const button = createButton();
    setInput(button.size, size);
    expect(button.style()['padding']).toBe(padding);
    expect(button.style()['font-size']).toBe(fontSize);
    expect(button.dimensions().fontSize).toBe(fontSize);
  });

  it('grows the minimum height with the size', () => {
    const button = createButton();
    setInput(button.size, 'sm');
    expect(button.style()['min-height']).toBe('calc(var(--control-height, 40px) - 8px)');
    setInput(button.size, 'lg');
    expect(button.style()['min-height']).toBe('calc(var(--control-height, 40px) + 8px)');
  });
});
