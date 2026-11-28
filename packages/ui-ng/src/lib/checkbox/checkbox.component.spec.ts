import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { CheckboxComponent } from './checkbox.component';

interface Internals {
  checked: Signal<boolean>;
  disabled: Signal<boolean>;
  focused: WritableSignal<boolean>;
  isOn: Signal<boolean>;
  toggle(event: Event): void;
  handleBlur(): void;
}

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(CheckboxComponent, { indeterminate: false, ...inputs });
  const change = vi.fn();
  const touched = vi.fn();
  component.registerOnChange(change);
  component.registerOnTouched(touched);
  return { component, internals: component as unknown as Internals, change, touched };
}

const checkedEvent = (checked: boolean) => ({ target: { checked } }) as unknown as Event;

describe('CheckboxComponent', () => {
  it('writeValue coerces to boolean', () => {
    const { component, internals } = setup();
    component.writeValue(true);
    expect(internals.checked()).toBe(true);
    component.writeValue(null);
    expect(internals.checked()).toBe(false);
  });

  it('toggle follows the native checked state and notifies the form', () => {
    const { internals, change } = setup();
    internals.toggle(checkedEvent(true));
    expect(internals.checked()).toBe(true);
    expect(change).toHaveBeenLastCalledWith(true);
    internals.toggle(checkedEvent(false));
    expect(internals.checked()).toBe(false);
    expect(change).toHaveBeenLastCalledWith(false);
  });

  it('indeterminate renders as on without changing the model value', () => {
    const { internals } = setup({ indeterminate: true });
    expect(internals.checked()).toBe(false);
    expect(internals.isOn()).toBe(true);
  });

  it('is off only when neither checked nor indeterminate', () => {
    const { internals } = setup();
    expect(internals.isOn()).toBe(false);
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
