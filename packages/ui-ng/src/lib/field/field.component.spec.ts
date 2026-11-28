import '@angular/compiler';
import type { Signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { createComponent, flushEffects } from '../testing/component-harness';
import { FieldComponent } from './field.component';

interface Internals {
  labelFor: Signal<string | null>;
}

class FakeControl {
  id = '';
  private readonly attributes = new Map<string, string>();

  constructor(describedBy?: string, id = '') {
    this.id = id;
    if (describedBy) this.attributes.set('aria-describedby', describedBy);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }
}

function setup(inputs: Record<string, unknown> = {}, control: FakeControl | null = null) {
  const component = createComponent(
    FieldComponent,
    { hint: null, error: null, group: false, ...inputs },
    { host: { querySelector: () => control } as unknown as Partial<HTMLElement> },
  );
  return { component, internals: component as unknown as Internals };
}

describe('FieldComponent state', () => {
  it('gives each field its own id family', () => {
    const a = setup().component;
    const b = setup().component;
    expect(a.fieldId).not.toBe(b.fieldId);
    expect([a.labelId, a.hintId, a.errorId]).toEqual([
      `${a.fieldId}-label`,
      `${a.fieldId}-hint`,
      `${a.fieldId}-error`,
    ]);
  });

  it('describes the control by the error before the hint', () => {
    const { component } = setup({ hint: 'help', error: 'bad' });
    expect(component.describedBy()).toBe(component.errorId);
  });

  it('falls back to the hint, then to nothing', () => {
    const withHint = setup({ hint: 'help' }).component;
    expect(withHint.describedBy()).toBe(withHint.hintId);
    expect(setup().component.describedBy()).toBeNull();
  });

  it('is invalid only for a non-empty error', () => {
    expect(setup({ error: 'bad' }).component.invalid()).toBe(true);
    expect(setup({ error: '' }).component.invalid()).toBe(false);
    expect(setup({ error: null }).component.invalid()).toBe(false);
  });

  it('points the label at the control, except for a group', () => {
    const single = setup();
    expect(single.internals.labelFor()).toBe(single.component.fieldId);
    expect(setup({ group: true }).internals.labelFor()).toBeNull();
  });
});

describe('FieldComponent control wiring', () => {
  it('assigns its id to a control without one and links the hint', () => {
    const control = new FakeControl();
    const { component } = setup({ hint: 'help' }, control);
    flushEffects(component);
    expect(control.id).toBe(component.fieldId);
    expect(control.getAttribute('aria-describedby')).toBe(component.hintId);
  });

  it('keeps an existing control id', () => {
    const control = new FakeControl(undefined, 'mine');
    const { component } = setup({ hint: 'help' }, control);
    flushEffects(component);
    expect(control.id).toBe('mine');
  });

  it('preserves foreign describedby ids and drops stale owned ones', () => {
    const control = new FakeControl();
    const { component } = setup({ error: 'bad' }, control);
    control.setAttribute('aria-describedby', `other ${component.hintId} ${component.errorId}`);
    flushEffects(component);
    expect(control.getAttribute('aria-describedby')).toBe(`other ${component.errorId}`);
  });

  it('removes aria-describedby when nothing remains', () => {
    const control = new FakeControl();
    const { component } = setup({}, control);
    control.setAttribute('aria-describedby', component.hintId);
    flushEffects(component);
    expect(control.getAttribute('aria-describedby')).toBeNull();
  });

  it('leaves the control untouched for a group', () => {
    const control = new FakeControl();
    const { component } = setup({ group: true, hint: 'help' }, control);
    flushEffects(component);
    expect(control.id).toBe('');
    expect(control.getAttribute('aria-describedby')).toBeNull();
  });

  it('does nothing when the field has no control', () => {
    const { component } = setup({ hint: 'help' }, null);
    expect(() => flushEffects(component)).not.toThrow();
  });
});
