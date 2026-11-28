import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { SelectComponent } from './select.component';

interface Internals {
  value: Signal<string>;
  disabled: Signal<boolean>;
  focused: WritableSignal<boolean>;
  styles: Signal<Record<string, string | null>>;
  handleChange(event: Event): void;
  handleBlur(): void;
}

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(SelectComponent, inputs);
  const change = vi.fn();
  const touched = vi.fn();
  component.registerOnChange(change);
  component.registerOnTouched(touched);
  return { component, internals: component as unknown as Internals, change, touched };
}

const changeEvent = (value: string) => ({ target: { value } }) as unknown as Event;

describe('SelectComponent value accessor', () => {
  it('writeValue stores the value and maps null to an empty string', () => {
    const { component, internals } = setup();
    component.writeValue('b');
    expect(internals.value()).toBe('b');
    component.writeValue(null);
    expect(internals.value()).toBe('');
  });

  it('a native change updates the value and notifies the form', () => {
    const { internals, change } = setup();
    internals.handleChange(changeEvent('c'));
    expect(internals.value()).toBe('c');
    expect(change).toHaveBeenCalledWith('c');
  });

  it('blur clears focus and marks touched', () => {
    const { internals, touched } = setup();
    internals.focused.set(true);
    internals.handleBlur();
    expect(internals.focused()).toBe(false);
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('setDisabledState toggles the disabled signal', () => {
    const { component, internals } = setup();
    component.setDisabledState(true);
    expect(internals.disabled()).toBe(true);
    component.setDisabledState(false);
    expect(internals.disabled()).toBe(false);
  });
});

describe('SelectComponent styles', () => {
  it.each([
    ['sm', '12px', '10px', '28px'],
    ['md', '14px', '12px', '32px'],
    ['lg', '16px', '14px', '36px'],
  ])('size %s sets font and padding', (size, font, left, right) => {
    const { internals } = setup({ size, invalid: false });
    const styles = internals.styles();
    expect(styles['font-size']).toBe(font);
    expect(styles['padding-left']).toBe(left);
    expect(styles['padding-right']).toBe(right);
  });

  it('uses the danger border when invalid, even if focused', () => {
    const { internals } = setup({ size: 'md', invalid: true });
    internals.focused.set(true);
    expect(internals.styles()['border']).toContain('--color-danger');
    expect(internals.styles()['box-shadow']).toContain('--color-danger');
  });

  it('shows the accent border and ring only while focused', () => {
    const { internals } = setup({ size: 'md', invalid: false });
    expect(internals.styles()['border']).toContain('--color-rule-strong');
    expect(internals.styles()['box-shadow']).toBeNull();
    internals.focused.set(true);
    expect(internals.styles()['border']).toContain('--color-accent');
    expect(internals.styles()['box-shadow']).toContain('0 0 0 3px');
  });

  it('dims and blocks the cursor when disabled', () => {
    const { component, internals } = setup({ size: 'md', invalid: false });
    expect(internals.styles()['opacity']).toBe('1');
    expect(internals.styles()['cursor']).toBe('pointer');
    component.setDisabledState(true);
    expect(internals.styles()['opacity']).toBe('0.65');
    expect(internals.styles()['cursor']).toBe('not-allowed');
    expect(internals.styles()['background-color']).toContain('--color-paper-2');
  });
});
