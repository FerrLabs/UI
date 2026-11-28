import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { InputComponent } from './input.component';

interface Internals {
  value: Signal<string>;
  disabled: Signal<boolean>;
  focused: WritableSignal<boolean>;
  styles: Signal<Record<string, string | null>>;
  handleInput(event: Event): void;
  handleBlur(): void;
}

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(InputComponent, { size: 'md', invalid: false, ...inputs });
  const change = vi.fn();
  const touched = vi.fn();
  component.registerOnChange(change);
  component.registerOnTouched(touched);
  return { component, internals: component as unknown as Internals, change, touched };
}

describe('InputComponent value accessor', () => {
  it('typing updates the value and notifies the form', () => {
    const { internals, change } = setup();
    internals.handleInput({ target: { value: 'hello' } } as unknown as Event);
    expect(internals.value()).toBe('hello');
    expect(change).toHaveBeenCalledWith('hello');
  });

  it('writeValue maps null to empty and does not notify', () => {
    const { component, internals, change } = setup();
    component.writeValue('x');
    expect(internals.value()).toBe('x');
    component.writeValue(null);
    expect(internals.value()).toBe('');
    expect(change).not.toHaveBeenCalled();
  });

  it('blur clears focus and marks touched', () => {
    const { internals, touched } = setup();
    internals.focused.set(true);
    internals.handleBlur();
    expect(internals.focused()).toBe(false);
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('setDisabledState toggles disabled', () => {
    const { component, internals } = setup();
    component.setDisabledState(true);
    expect(internals.disabled()).toBe(true);
  });
});

describe('InputComponent styles', () => {
  it.each([
    ['sm', '12px', '0 10px'],
    ['md', '14px', '0 12px'],
    ['lg', '16px', '0 14px'],
  ])('size %s sets font size and padding', (size, font, padding) => {
    const { internals } = setup({ size });
    expect(internals.styles()['font-size']).toBe(font);
    expect(internals.styles()['padding']).toBe(padding);
  });

  it('taller sizes get taller heights', () => {
    const heights = ['sm', 'md', 'lg'].map((size) => setup({ size }).internals.styles()['height']);
    expect(heights[0]).toContain('- 8px');
    expect(heights[1]).toBe('var(--control-height, 40px)');
    expect(heights[2]).toContain('+ 8px');
  });

  it('invalid takes the danger border over focus', () => {
    const { internals } = setup({ invalid: true });
    internals.focused.set(true);
    expect(internals.styles()['border']).toContain('--color-danger');
    expect(internals.styles()['box-shadow']).toContain('--color-danger');
  });

  it('focus gives accent border and a ring that blur removes', () => {
    const { internals } = setup();
    expect(internals.styles()['border']).toContain('--color-rule-strong');
    expect(internals.styles()['box-shadow']).toBeNull();
    internals.focused.set(true);
    expect(internals.styles()['border']).toContain('--color-accent');
    expect(internals.styles()['box-shadow']).toContain('0 0 0 3px');
    internals.handleBlur();
    expect(internals.styles()['box-shadow']).toBeNull();
  });

  it('disabled dims, blocks the cursor and swaps the background', () => {
    const { component, internals } = setup();
    expect(internals.styles()['cursor']).toBe('text');
    expect(internals.styles()['opacity']).toBe('1');
    component.setDisabledState(true);
    expect(internals.styles()['cursor']).toBe('not-allowed');
    expect(internals.styles()['opacity']).toBe('0.65');
    expect(internals.styles()['background']).toContain('--color-paper-2');
  });
});
