import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import { SkeletonComponent, type SkeletonShape } from './skeleton.component';

class SkeletonProbe extends SkeletonComponent {
  readonly style = () => this.styles();
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createSkeleton(shape?: SkeletonShape): SkeletonProbe {
  const skeleton = runInInjectionContext(
    Injector.create({ providers: [] }),
    () => new SkeletonProbe(),
  );
  if (shape) setInput(skeleton.shape, shape);
  return skeleton;
}

describe('SkeletonComponent default dimensions', () => {
  it.each<[SkeletonShape, string, string]>([
    ['rect', '100%', '16px'],
    ['text', '100%', '12px'],
    ['circle', '32px', '32px'],
  ])('%s is %s wide and %s tall', (shape, width, height) => {
    const style = createSkeleton(shape).style();
    expect(style['width']).toBe(width);
    expect(style['height']).toBe(height);
  });
});

describe('SkeletonComponent explicit dimensions', () => {
  it('turns numbers into pixels and keeps strings as they are', () => {
    const skeleton = createSkeleton();
    setInput(skeleton.width, 120);
    setInput(skeleton.height, '3rem');
    expect(skeleton.style()['width']).toBe('120px');
    expect(skeleton.style()['height']).toBe('3rem');
  });

  it('treats 0 as a real size, not as unset', () => {
    const skeleton = createSkeleton();
    setInput(skeleton.width, 0);
    setInput(skeleton.height, 0);
    expect(skeleton.style()['width']).toBe('0px');
    expect(skeleton.style()['height']).toBe('0px');
  });

  it('overrides the circle defaults independently', () => {
    const skeleton = createSkeleton('circle');
    setInput(skeleton.width, 48);
    expect(skeleton.style()['width']).toBe('48px');
    expect(skeleton.style()['height']).toBe('32px');
  });
});

describe('SkeletonComponent shape styling', () => {
  it.each<[SkeletonShape, string]>([
    ['rect', 'var(--radius-card, 16px)'],
    ['text', 'var(--radius-control, 8px)'],
    ['circle', 'var(--radius-full, 999px)'],
  ])('%s has radius %s', (shape, radius) => {
    expect(createSkeleton(shape).style()['border-radius']).toBe(radius);
  });

  it('only the circle forces round corners', () => {
    expect(createSkeleton('circle').style()['corner-shape']).toBe('round');
    expect(createSkeleton('rect').style()['corner-shape']).toBe('var(--corner-shape, round)');
  });
});
