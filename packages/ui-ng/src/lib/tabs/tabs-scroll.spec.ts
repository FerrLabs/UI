import { describe, expect, it } from 'vitest';
import { centeredScrollLeft, fadeEdges, scrollBehavior } from './tabs-scroll';

describe('fadeEdges', () => {
  it('fades only the end at the start of an overflowing strip', () => {
    expect(fadeEdges(0, 300, 600)).toEqual({ start: false, end: true });
  });

  it('fades both edges in the middle', () => {
    expect(fadeEdges(150, 300, 600)).toEqual({ start: true, end: true });
  });

  it('fades only the start at the end', () => {
    expect(fadeEdges(300, 300, 600)).toEqual({ start: true, end: false });
  });

  it('does not fade when everything fits', () => {
    expect(fadeEdges(0, 300, 300)).toEqual({ start: false, end: false });
    expect(fadeEdges(0, 300, 200)).toEqual({ start: false, end: false });
  });

  it('ignores sub-pixel overflow', () => {
    expect(fadeEdges(0, 300, 300.6)).toEqual({ start: false, end: false });
    expect(fadeEdges(299.5, 300, 600)).toEqual({ start: true, end: false });
  });

  it('reads negative RTL offsets as distance from the logical start', () => {
    expect(fadeEdges(0, 300, 600)).toEqual({ start: false, end: true });
    expect(fadeEdges(-150, 300, 600)).toEqual({ start: true, end: true });
    expect(fadeEdges(-300, 300, 600)).toEqual({ start: true, end: false });
  });
});

describe('centeredScrollLeft', () => {
  const strip = { left: 10, width: 300 };

  it('centers a tab that sits past the right edge', () => {
    const tab = { left: 410, width: 100 };
    expect(centeredScrollLeft(0, tab, strip)).toBe(300);
  });

  it('adds to the current scroll offset', () => {
    const tab = { left: 10, width: 100 };
    expect(centeredScrollLeft(200, tab, strip)).toBe(100);
  });

  it('leaves a tab that is already centered where it is', () => {
    const tab = { left: 110, width: 100 };
    expect(centeredScrollLeft(40, tab, strip)).toBe(40);
  });
});

describe('scrollBehavior', () => {
  it('is instant on first placement', () => {
    expect(scrollBehavior(false, false)).toBe('auto');
  });

  it('is smooth on later changes', () => {
    expect(scrollBehavior(false, true)).toBe('smooth');
  });

  it('is always instant under reduced motion', () => {
    expect(scrollBehavior(true, true)).toBe('auto');
    expect(scrollBehavior(true, false)).toBe('auto');
  });
});
