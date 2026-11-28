import '@angular/compiler';
import type { Signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { ProgressBarComponent } from './progress-bar.component';

interface Internals {
  pct: Signal<number>;
  displayValue: Signal<string | null>;
  height: Signal<string>;
  fill: Signal<string>;
}

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(ProgressBarComponent, {
    value: 0,
    max: 100,
    showValue: false,
    size: 'md',
    variant: 'accent',
    ...inputs,
  });
  return component as unknown as Internals;
}

describe('ProgressBarComponent percentage', () => {
  it.each([
    [25, 100, 25],
    [1, 4, 25],
    [50, 200, 25],
    [0, 100, 0],
    [100, 100, 100],
  ])('value %d of %d is %d%%', (value, max, expected) => {
    expect(setup({ value, max }).pct()).toBe(expected);
  });

  it('clamps overshoot to 100 and negatives to 0', () => {
    expect(setup({ value: 150, max: 100 }).pct()).toBe(100);
    expect(setup({ value: -20, max: 100 }).pct()).toBe(0);
  });

  it('clamps a positive value over a zero max to 100', () => {
    expect(setup({ value: 5, max: 0 }).pct()).toBe(100);
  });
});

describe('ProgressBarComponent display', () => {
  it('hides the value text unless showValue is set', () => {
    expect(setup({ value: 42 }).displayValue()).toBeNull();
  });

  it('rounds the percentage when shown', () => {
    expect(setup({ value: 1, max: 3, showValue: true }).displayValue()).toBe('33%');
    expect(setup({ value: 2, max: 3, showValue: true }).displayValue()).toBe('67%');
  });

  it('shows 0% and 100% at the clamped extremes', () => {
    expect(setup({ value: -5, showValue: true }).displayValue()).toBe('0%');
    expect(setup({ value: 500, showValue: true }).displayValue()).toBe('100%');
  });

  it.each([
    ['sm', '4px'],
    ['md', '8px'],
    ['lg', '12px'],
  ])('size %s is %s tall', (size, height) => {
    expect(setup({ size }).height()).toBe(height);
  });

  it('maps each variant to a distinct colour token', () => {
    const fills = (['accent', 'success', 'warning', 'danger'] as const).map((variant) =>
      setup({ variant }).fill(),
    );
    expect(new Set(fills).size).toBe(4);
    expect(fills[1]).toContain('--color-success');
    expect(fills[3]).toContain('--color-danger');
  });
});
