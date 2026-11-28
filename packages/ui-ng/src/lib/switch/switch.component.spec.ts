import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { SwitchComponent } from './switch.component';

interface Internals {
  checked: Signal<boolean>;
  disabled: Signal<boolean>;
  focused: WritableSignal<boolean>;
  trackStyles: Signal<Record<string, string | null>>;
  thumbStyles: Signal<Record<string, string>>;
  toggle(): void;
  handleBlur(): void;
}

function setup(size: 'sm' | 'md' = 'md') {
  const component = createComponent(SwitchComponent, { size });
  const change = vi.fn();
  const touched = vi.fn();
  component.registerOnChange(change);
  component.registerOnTouched(touched);
  return { component, internals: component as unknown as Internals, change, touched };
}

describe('SwitchComponent', () => {
  it('toggle flips the state, reports it and marks touched', () => {
    const { internals, change, touched } = setup();
    internals.toggle();
    expect(internals.checked()).toBe(true);
    expect(change).toHaveBeenLastCalledWith(true);
    internals.toggle();
    expect(internals.checked()).toBe(false);
    expect(change).toHaveBeenLastCalledWith(false);
    expect(touched).toHaveBeenCalledTimes(2);
  });

  it('writeValue coerces and does not notify', () => {
    const { component, internals, change } = setup();
    component.writeValue(true);
    expect(internals.checked()).toBe(true);
    component.writeValue(null);
    expect(internals.checked()).toBe(false);
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

  it.each([
    ['md', 36, 20, 16, 2, 16],
    ['sm', 28, 16, 12, 2, 12],
  ] as const)('%s geometry puts the thumb at the start and end', (size, w, h, thumb, off, end) => {
    const { component, internals } = setup(size);
    expect(internals.trackStyles()['width']).toBe(`${w}px`);
    expect(internals.trackStyles()['height']).toBe(`${h}px`);
    expect(internals.thumbStyles()['width']).toBe(`${thumb}px`);
    expect(internals.thumbStyles()['transform']).toBe(`translateX(${off}px)`);
    component.writeValue(true);
    expect(internals.thumbStyles()['transform']).toBe(`translateX(${end}px)`);
  });

  it('track uses the accent colour only when on', () => {
    const { component, internals } = setup();
    expect(internals.trackStyles()['background']).toContain('--color-rule-strong');
    component.writeValue(true);
    expect(internals.trackStyles()['background']).toContain('--color-accent');
  });

  it('shows the focus ring only while focused', () => {
    const { internals } = setup();
    expect(internals.trackStyles()['box-shadow']).toBeNull();
    internals.focused.set(true);
    expect(internals.trackStyles()['box-shadow']).toContain('0 0 0 3px');
  });
});
