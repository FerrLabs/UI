import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import {
  ContainerComponent,
  type ContainerPadding,
  type ContainerSize,
} from './container.component';

class ContainerProbe extends ContainerComponent {
  readonly style = () => this.styles();
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createContainer(): ContainerProbe {
  return runInInjectionContext(Injector.create({ providers: [] }), () => new ContainerProbe());
}

describe('ContainerComponent styles', () => {
  it('defaults to a large container with medium padding', () => {
    expect(createContainer().style()).toEqual({ 'max-width': '1280px', padding: '0 24px' });
  });

  it.each<[ContainerSize, string]>([
    ['sm', '768px'],
    ['md', '1024px'],
    ['lg', '1280px'],
    ['xl', '1440px'],
    ['2xl', '1600px'],
    ['full', '100%'],
  ])('size %s caps the width at %s', (size, expected) => {
    const container = createContainer();
    setInput(container.size, size);
    expect(container.style()['max-width']).toBe(expected);
  });

  it.each<[ContainerPadding, string]>([
    ['none', '0'],
    ['sm', '0 16px'],
    ['md', '0 24px'],
    ['lg', '0 40px'],
  ])('padding %s resolves to %s', (padding, expected) => {
    const container = createContainer();
    setInput(container.padding, padding);
    expect(container.style()['padding']).toBe(expected);
  });
});
