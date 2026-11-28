import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import { SpinnerComponent, type SpinnerColor, type SpinnerSize } from './spinner.component';

class SpinnerProbe extends SpinnerComponent {
  readonly style = () => this.styles();
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createSpinner(): SpinnerProbe {
  return runInInjectionContext(Injector.create({ providers: [] }), () => new SpinnerProbe());
}

describe('SpinnerComponent styles', () => {
  it('defaults to a 20px accent ring with a gap', () => {
    expect(createSpinner().style()).toEqual({
      width: '20px',
      height: '20px',
      'border-width': '2px',
      'border-color': 'var(--color-accent, #e8733a)',
      'border-right-color': 'transparent',
    });
  });

  it.each<[SpinnerSize, string, string]>([
    ['xs', '12px', '1.5px'],
    ['sm', '16px', '2px'],
    ['md', '20px', '2px'],
    ['lg', '28px', '3px'],
  ])('size %s is %s with a %s border', (size, box, border) => {
    const spinner = createSpinner();
    setInput(spinner.size, size);
    const style = spinner.style();
    expect(style['width']).toBe(box);
    expect(style['height']).toBe(box);
    expect(style['border-width']).toBe(border);
  });

  it.each<[SpinnerColor, string]>([
    ['accent', 'var(--color-accent, #e8733a)'],
    ['current', 'currentColor'],
    ['slate', 'var(--color-ink-3, #64748b)'],
  ])('colour %s uses %s', (color, expected) => {
    const spinner = createSpinner();
    setInput(spinner.color, color);
    expect(spinner.style()['border-color']).toBe(expected);
    expect(spinner.style()['border-right-color']).toBe('transparent');
  });

  it('labels itself for assistive tech by default', () => {
    expect(createSpinner().label()).toBe('Loading…');
  });
});
