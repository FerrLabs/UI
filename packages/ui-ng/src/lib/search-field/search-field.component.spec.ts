import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { SearchFieldComponent } from './search-field.component';

interface Internals {
  value: Signal<string>;
  disabled: Signal<boolean>;
  focused: WritableSignal<boolean>;
  dim: Signal<{ height: string; padX: number; fontSize: number; iconSize: number }>;
  inputStyles: Signal<Record<string, string>>;
  handleInput(event: Event): void;
  handleBlur(): void;
  clear(): void;
}

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(SearchFieldComponent, {
    size: 'md',
    invalid: false,
    ...inputs,
  });
  const change = vi.fn();
  const touched = vi.fn();
  const cleared = vi.fn();
  component.registerOnChange(change);
  component.registerOnTouched(touched);
  component.cleared.subscribe(cleared);
  return { component, internals: component as unknown as Internals, change, touched, cleared };
}

describe('SearchFieldComponent', () => {
  it('typing updates the value and notifies the form', () => {
    const { internals, change } = setup();
    internals.handleInput({ target: { value: 'ferr' } } as unknown as Event);
    expect(internals.value()).toBe('ferr');
    expect(change).toHaveBeenCalledWith('ferr');
  });

  it('clear resets to empty, notifies the form and emits cleared', () => {
    const { component, internals, change, cleared } = setup();
    component.writeValue('abc');
    internals.clear();
    expect(internals.value()).toBe('');
    expect(change).toHaveBeenCalledWith('');
    expect(cleared).toHaveBeenCalledTimes(1);
  });

  it('writeValue maps null to empty', () => {
    const { component, internals } = setup();
    component.writeValue('x');
    component.writeValue(null);
    expect(internals.value()).toBe('');
  });

  it('blur drops focus and marks touched', () => {
    const { internals, touched } = setup();
    internals.focused.set(true);
    internals.handleBlur();
    expect(internals.focused()).toBe(false);
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('disabled state is reflected in the signal and the colours', () => {
    const { component, internals } = setup();
    component.setDisabledState(true);
    expect(internals.disabled()).toBe(true);
    expect(internals.inputStyles()['background']).toContain('--color-paper-2');
    expect(internals.inputStyles()['color']).toContain('--color-ink-3');
  });

  it.each([
    ['sm', 28, 12, 14],
    ['md', 36, 14, 16],
    ['lg', 44, 16, 20],
  ])('size %s maps to padding, font and icon size', (size, padX, font, icon) => {
    const { internals } = setup({ size });
    expect(internals.dim()).toMatchObject({ padX, fontSize: font, iconSize: icon });
    expect(internals.inputStyles()['padding-left']).toBe(`${padX}px`);
    expect(internals.inputStyles()['padding-right']).toBe(`${padX}px`);
    expect(internals.inputStyles()['font-size']).toBe(`${font}px`);
  });

  it('invalid wins over focus for border and ring', () => {
    const { internals } = setup({ invalid: true });
    internals.focused.set(true);
    expect(internals.inputStyles()['border']).toContain('--color-danger');
    expect(internals.inputStyles()['box-shadow']).toContain('--color-danger');
  });

  it('focus gives the accent border and ring; blur removes the ring', () => {
    const { internals } = setup();
    expect(internals.inputStyles()['box-shadow']).toBe('none');
    internals.focused.set(true);
    expect(internals.inputStyles()['border']).toContain('--color-accent');
    expect(internals.inputStyles()['box-shadow']).toContain('4px');
  });
});
