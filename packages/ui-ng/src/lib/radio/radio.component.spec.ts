import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { RadioComponent, RadioGroupComponent } from './radio.component';

interface RadioInternals {
  focused: WritableSignal<boolean>;
  checked: Signal<boolean>;
  isDisabled: Signal<boolean>;
  groupName: Signal<string | null>;
  select(): void;
  handleBlur(): void;
}

function group(inputs: Record<string, unknown> = {}) {
  const component = createComponent(RadioGroupComponent, inputs);
  const change = vi.fn();
  const touched = vi.fn();
  component.registerOnChange(change);
  component.registerOnTouched(touched);
  return { component, change, touched };
}

function radio(parent: RadioGroupComponent | null, inputs: Record<string, unknown>) {
  const component = createComponent(
    RadioComponent,
    { disabled: false, ...inputs },
    { providers: parent ? [{ provide: RadioGroupComponent, useValue: parent }] : [] },
  );
  return component as unknown as RadioInternals;
}

describe('RadioGroupComponent', () => {
  it('select stores the value, reports it and marks touched', () => {
    const { component, change, touched } = group();
    component.select('b');
    expect(component.value()).toBe('b');
    expect(change).toHaveBeenCalledWith('b');
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('keeps numeric values as numbers', () => {
    const { component, change } = group();
    component.select(3);
    expect(change).toHaveBeenCalledWith(3);
  });

  it('writeValue stores without notifying the form', () => {
    const { component, change } = group();
    component.writeValue('a');
    expect(component.value()).toBe('a');
    component.writeValue(null);
    expect(component.value()).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });

  it('setDisabledState toggles disabled', () => {
    const { component } = group();
    component.setDisabledState(true);
    expect(component.disabled()).toBe(true);
  });

  it('gives each group a distinct default name', () => {
    expect(group().component.name()).not.toBe(group().component.name());
  });
});

describe('RadioComponent', () => {
  it('is checked when its value matches the group value', () => {
    const { component } = group();
    component.writeValue('a');
    expect(radio(component, { value: 'a' }).checked()).toBe(true);
    expect(radio(component, { value: 'b' }).checked()).toBe(false);
  });

  it('compares numbers and strings by their string form', () => {
    const { component } = group();
    component.writeValue(2);
    expect(radio(component, { value: '2' }).checked()).toBe(true);
    component.writeValue('2');
    expect(radio(component, { value: 2 }).checked()).toBe(true);
  });

  it('is unchecked while the group has no value, and 0 counts as a value', () => {
    const { component } = group();
    expect(radio(component, { value: 'a' }).checked()).toBe(false);
    component.writeValue(0);
    expect(radio(component, { value: 0 }).checked()).toBe(true);
  });

  it('is unchecked and nameless outside a group', () => {
    const standalone = radio(null, { value: 'a' });
    expect(standalone.checked()).toBe(false);
    expect(standalone.groupName()).toBeNull();
    expect(() => {
      standalone.select();
      standalone.handleBlur();
    }).not.toThrow();
  });

  it('inherits the group name', () => {
    const { component } = group({ name: 'colours' });
    expect(radio(component, { value: 'a' }).groupName()).toBe('colours');
  });

  it('is disabled by itself or by its group', () => {
    const { component } = group();
    expect(radio(component, { value: 'a' }).isDisabled()).toBe(false);
    expect(radio(component, { value: 'a', disabled: true }).isDisabled()).toBe(true);
    component.setDisabledState(true);
    expect(radio(component, { value: 'a' }).isDisabled()).toBe(true);
  });

  it('selecting forwards its value to the group', () => {
    const { component, change } = group();
    radio(component, { value: 'z' }).select();
    expect(change).toHaveBeenCalledWith('z');
    expect(component.value()).toBe('z');
  });

  it('blur clears focus and touches the group', () => {
    const { component, touched } = group();
    const item = radio(component, { value: 'a' });
    item.focused.set(true);
    item.handleBlur();
    expect(item.focused()).toBe(false);
    expect(touched).toHaveBeenCalledTimes(1);
  });
});
