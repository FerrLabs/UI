import { describe, expect, it } from 'vitest';
import {
  centeredScrollLeft,
  fadeEdges,
  focusScrollLeft,
  scrollBehavior,
  shouldReveal,
} from './tabs-scroll';

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

describe('shouldReveal', () => {
  const fitted = { clientWidth: 300, scrollWidth: 600 };

  it('reveals the first time the strip is measured', () => {
    expect(shouldReveal(null, fitted, false)).toBe(true);
  });

  it('does not reveal when the geometry is unchanged', () => {
    expect(shouldReveal(fitted, { ...fitted }, false)).toBe(false);
  });

  it('reveals when the strip width or the content width changed', () => {
    expect(shouldReveal(fitted, { clientWidth: 320, scrollWidth: 600 }, false)).toBe(true);
    expect(shouldReveal(fitted, { clientWidth: 300, scrollWidth: 640 }, false)).toBe(true);
  });

  it('never reveals after the user scrolled the strip', () => {
    expect(shouldReveal(null, fitted, true)).toBe(false);
    expect(shouldReveal(fitted, { clientWidth: 320, scrollWidth: 640 }, true)).toBe(false);
  });
});

describe('focusScrollLeft', () => {
  const strip = { left: 10, width: 300 };

  it('needs no scroll for a tab inside the fade insets', () => {
    expect(focusScrollLeft(50, { left: 100, width: 80 }, strip)).toBeNull();
    expect(focusScrollLeft(50, { left: 34, width: 80 }, strip)).toBeNull();
    expect(focusScrollLeft(50, { left: 206, width: 80 }, strip)).toBeNull();
  });

  it('scrolls a tab hanging past the end in with the end inset', () => {
    expect(focusScrollLeft(0, { left: 250, width: 80 }, strip)).toBe(44);
  });

  it('scrolls a tab hanging past the start in with the start inset', () => {
    expect(focusScrollLeft(100, { left: 20, width: 80 }, strip)).toBe(86);
  });

  it('keeps a tab under the fade out of the fade', () => {
    expect(focusScrollLeft(0, { left: 300, width: 40 }, strip)).toBe(54);
  });

  it('prefers the start edge for a tab wider than the visible area', () => {
    expect(focusScrollLeft(100, { left: 0, width: 400 }, strip)).toBe(66);
  });
});
