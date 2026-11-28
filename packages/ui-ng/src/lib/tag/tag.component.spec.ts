import '@angular/compiler';
import type { Signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { TagComponent } from './tag.component';

interface Internals {
  dim: Signal<{ dot: number; fontSize: string }>;
  resolvedColor: Signal<string>;
  resolvedTextColor: Signal<string>;
  styles: Signal<Record<string, string>>;
  dotStyles: Signal<Record<string, string>>;
  remove(event: MouseEvent): void;
}

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(TagComponent, {
    variant: null,
    color: null,
    soft: true,
    size: 'md',
    ...inputs,
  });
  const removed = vi.fn();
  component.removed.subscribe(removed);
  return { internals: component as unknown as Internals, removed };
}

describe('TagComponent colours', () => {
  it('defaults to the neutral variant', () => {
    const { internals } = setup();
    expect(internals.resolvedColor()).toContain('--color-fg-2');
    expect(internals.resolvedTextColor()).toBe(
      setup({ variant: 'neutral' }).internals.resolvedTextColor(),
    );
  });

  it.each([
    ['success', '--color-success'],
    ['warning', '--color-warning'],
    ['danger', '--color-danger'],
    ['accent', '--color-accent'],
  ])('variant %s resolves to %s', (variant, token) => {
    expect(setup({ variant }).internals.resolvedColor()).toContain(token);
  });

  it('an explicit colour overrides the variant for fill and text', () => {
    const { internals } = setup({ variant: 'danger', color: '#123456' });
    expect(internals.resolvedColor()).toBe('#123456');
    expect(internals.resolvedTextColor()).toBe('#123456');
  });
});

describe('TagComponent styles', () => {
  it('soft tags tint the background and have no border', () => {
    const { internals } = setup({ color: '#abcdef' });
    expect(internals.styles()['background']).toBe('color-mix(in oklab, #abcdef 20%, transparent)');
    expect(internals.styles()['border']).toBe('none');
  });

  it('outline tags are transparent with a border', () => {
    const { internals } = setup({ soft: false, color: '#abcdef' });
    expect(internals.styles()['background']).toBe('transparent');
    expect(internals.styles()['border']).toContain('1px solid');
  });

  it.each([
    ['sm', '9.5px', '2px 6px', 4],
    ['md', '10px', '3px 8px', 5],
  ])('size %s sets font, padding and dot size', (size, font, padding, dot) => {
    const { internals } = setup({ size });
    expect(internals.styles()['font-size']).toBe(font);
    expect(internals.styles()['padding']).toBe(padding);
    expect(internals.dotStyles()['width']).toBe(`${dot}px`);
    expect(internals.dotStyles()['height']).toBe(`${dot}px`);
  });

  it('the dot takes the resolved colour', () => {
    const { internals } = setup({ color: 'tomato' });
    expect(internals.dotStyles()['background']).toBe('tomato');
  });
});

describe('TagComponent remove', () => {
  it('emits removed and stops the click from reaching the tag', () => {
    const { internals, removed } = setup();
    const stopPropagation = vi.fn();
    internals.remove({ stopPropagation } as unknown as MouseEvent);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(removed).toHaveBeenCalledTimes(1);
  });
});
