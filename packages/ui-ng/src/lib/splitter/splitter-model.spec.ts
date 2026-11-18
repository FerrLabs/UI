import { describe, expect, it } from 'vitest';
import {
  coerceSize,
  coerceStackBelow,
  coerceStep,
  defaultRatios,
  describeHandle,
  describePane,
  describeSize,
  resolveHandleLabel,
  resolvePaneLabel,
  fitSizes,
  intentDelta,
  keyIntent,
  layoutSizes,
  pointerDelta,
  ratiosAfterResize,
  resizePair,
  resolveBounds,
  resolveSize,
  toPercent,
  toggleTarget,
  type PaneBounds,
} from './splitter-model';

const free: PaneBounds = { min: 0, max: Infinity };
const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

describe('coerceSize', () => {
  it('keeps pixel numbers and percent strings', () => {
    expect(coerceSize(240)).toBe(240);
    expect(coerceSize('30%')).toBe('30%');
    expect(coerceSize('120px')).toBe(120);
    expect(coerceSize('120')).toBe(120);
  });

  it('rejects negatives, junk and non finite values', () => {
    expect(coerceSize(-1)).toBeUndefined();
    expect(coerceSize(Number.NaN)).toBeUndefined();
    expect(coerceSize('abc')).toBeUndefined();
    expect(coerceSize('-5%')).toBeUndefined();
    expect(coerceSize(null)).toBeUndefined();
  });
});

describe('resolveBounds', () => {
  it('resolves px and percent against the container', () => {
    expect(resolveBounds({ minSize: 100, maxSize: '50%', collapsed: false }, 800)).toEqual({
      min: 100,
      max: 400,
    });
  });

  it('is unbounded when no limits are given', () => {
    expect(
      resolveBounds({ minSize: undefined, maxSize: undefined, collapsed: false }, 800),
    ).toEqual(free);
  });

  it('never lets max fall under min', () => {
    expect(resolveBounds({ minSize: 300, maxSize: 100, collapsed: false }, 800)).toEqual({
      min: 300,
      max: 300,
    });
  });

  it('pins a collapsed pane to zero', () => {
    expect(resolveBounds({ minSize: 100, maxSize: 400, collapsed: true }, 800)).toEqual({
      min: 0,
      max: 0,
    });
  });
});

describe('defaultRatios', () => {
  it('splits unset panes equally', () => {
    expect(defaultRatios([undefined, undefined, undefined], 900)).toEqual([1 / 3, 1 / 3, 1 / 3]);
  });

  it('gives unset panes what the explicit ones leave', () => {
    const ratios = defaultRatios([200, undefined, '25%'], 800);
    expect(ratios[0]).toBeCloseTo(0.25);
    expect(ratios[2]).toBeCloseTo(0.25);
    expect(ratios[1]).toBeCloseTo(0.5);
    expect(sum(ratios)).toBeCloseTo(1);
  });

  it('falls back to equal shares before the container is measured', () => {
    expect(defaultRatios([200, undefined], 0)).toEqual([0.5, 0.5]);
  });

  it('never yields a negative share when explicit sizes overflow', () => {
    expect(defaultRatios([900, undefined], 800).every((r) => r >= 0)).toBe(true);
  });
});

describe('fitSizes', () => {
  it('scales to the container and keeps proportions', () => {
    const fitted = fitSizes([100, 300], [free, free], 800);
    expect(fitted[0]).toBeCloseTo(200);
    expect(fitted[1]).toBeCloseTo(600);
  });

  it('clamps to bounds and redistributes the surplus to free panes', () => {
    const fitted = fitSizes([400, 400], [{ min: 0, max: 300 }, free], 800);
    expect(fitted[0]).toBe(300);
    expect(fitted[1]).toBeCloseTo(500);
  });

  it('respects a min while the container shrinks', () => {
    const fitted = fitSizes([300, 300], [{ min: 250, max: Infinity }, free], 400);
    expect(fitted[0]).toBeCloseTo(250);
    expect(fitted[1]).toBeCloseTo(150);
  });

  it('converges across several constrained panes', () => {
    const bounds: PaneBounds[] = [{ min: 100, max: 150 }, { min: 100, max: 200 }, free];
    const fitted = fitSizes([300, 300, 300], bounds, 900);
    expect(fitted[0]).toBe(150);
    expect(fitted[1]).toBe(200);
    expect(fitted[2]).toBeCloseTo(550);
  });

  it('gives up gracefully when minimums exceed the container', () => {
    const fitted = fitSizes(
      [100, 100],
      [
        { min: 300, max: Infinity },
        { min: 300, max: Infinity },
      ],
      400,
    );
    expect(fitted).toEqual([300, 300]);
  });

  it('grows from all zero sizes', () => {
    expect(fitSizes([0, 0], [free, free], 100)).toEqual([50, 50]);
  });
});

describe('resizePair', () => {
  const bounds: PaneBounds[] = [{ min: 100, max: 500 }, { min: 100, max: 500 }, free];

  it('moves the boundary and the neighbour absorbs the delta', () => {
    expect(resizePair([300, 300, 200], 0, 50, bounds)).toEqual([350, 250, 200]);
    expect(resizePair([300, 300, 200], 0, -50, bounds)).toEqual([250, 350, 200]);
  });

  it('leaves panes outside the pair untouched', () => {
    expect(resizePair([300, 300, 200], 1, 40, bounds)[0]).toBe(300);
    expect(resizePair([300, 300, 200], 1, 40, bounds)[2]).toBe(160);
  });

  it('stops at the primary pane min', () => {
    expect(resizePair([300, 300, 200], 0, -999, bounds)).toEqual([100, 500, 200]);
  });

  it('stops when the neighbour hits its min', () => {
    expect(resizePair([300, 300, 200], 0, 999, bounds)).toEqual([500, 100, 200]);
  });

  it('stops when the primary pane hits its max before the neighbour is exhausted', () => {
    expect(resizePair([450, 450, 100], 0, 200, bounds)).toEqual([500, 400, 100]);
  });

  it('stops when the neighbour hits its max while shrinking the primary', () => {
    expect(resizePair([200, 450, 100], 0, -200, bounds)).toEqual([150, 500, 100]);
  });

  it('keeps the total constant', () => {
    expect(sum(resizePair([300, 300, 200], 0, 77, bounds))).toBe(800);
  });

  it('does not move next to a collapsed neighbour', () => {
    const collapsed: PaneBounds[] = [
      { min: 100, max: 500 },
      { min: 0, max: 0 },
    ];
    expect(resizePair([800, 0], 0, -100, collapsed)).toEqual([800, 0]);
  });

  it('ignores the last index', () => {
    expect(resizePair([300, 300], 1, 50, bounds)).toEqual([300, 300]);
  });

  it('does not push a pane that is already beyond its bounds further out', () => {
    const tight: PaneBounds[] = [{ min: 200, max: 300 }, free];
    expect(resizePair([100, 700], 0, -50, tight)).toEqual([100, 700]);
  });
});

describe('layout with collapse', () => {
  const open: PaneBounds[] = [{ min: 100, max: Infinity }, free, free];
  const collapsedBounds: PaneBounds[] = [{ min: 0, max: 0 }, free, free];

  it('hands a collapsed pane space to the others in proportion', () => {
    const sizes = layoutSizes([0.25, 0.25, 0.5], [true, false, false], collapsedBounds, 800);
    expect(sizes[0]).toBe(0);
    expect(sizes[1]).toBeCloseTo(266.67, 1);
    expect(sizes[2]).toBeCloseTo(533.33, 1);
    expect(sum(sizes)).toBeCloseTo(800);
  });

  it('restores the remembered ratio on expand', () => {
    const sizes = layoutSizes([0.25, 0.25, 0.5], [false, false, false], open, 800);
    expect(sizes).toEqual([200, 200, 400]);
  });

  it('keeps the collapsed pane ratio when others are resized', () => {
    const ratios = ratiosAfterResize([0.25, 0.25, 0.5], [0, 400, 400], [true, false, false], 800);
    expect(ratios).toEqual([0.25, 0.5, 0.5]);
    const expanded = layoutSizes(ratios, [false, false, false], open, 800);
    expect(sum(expanded)).toBeCloseTo(800);
    expect(expanded[0]).toBeCloseTo(160);
  });
});

describe('container resize keeps proportions', () => {
  it('scales sizes with the container when no bound is hit', () => {
    const ratios = [0.2, 0.3, 0.5];
    const bounds = [free, free, free];
    const small = layoutSizes(ratios, [false, false, false], bounds, 500);
    const large = layoutSizes(ratios, [false, false, false], bounds, 2000);
    expect(small.map((s) => s / 500)).toEqual([0.2, 0.3, 0.5].map((r) => expect.closeTo(r, 6)));
    expect(large.map((s) => s / 2000)).toEqual([0.2, 0.3, 0.5].map((r) => expect.closeTo(r, 6)));
  });

  it('returns to the original sizes after shrinking under a min and growing back', () => {
    const ratios = [0.5, 0.5];
    const bounds: PaneBounds[] = [{ min: 200, max: Infinity }, free];
    const tiny = layoutSizes(ratios, [false, false], bounds, 300);
    expect(tiny[0]).toBe(200);
    const restored = layoutSizes(ratios, [false, false], bounds, 1000);
    expect(restored).toEqual([500, 500]);
  });

  it('keeps ratios unchanged when the container is not measured', () => {
    expect(ratiosAfterResize([0.4, 0.6], [10, 20], [false, false], 0)).toEqual([0.4, 0.6]);
  });
});

describe('pointerDelta and keyIntent', () => {
  it('follows the pointer in ltr horizontal', () => {
    expect(pointerDelta('horizontal', false, 100, 130)).toBe(30);
  });

  it('inverts the horizontal delta in rtl', () => {
    expect(pointerDelta('horizontal', true, 100, 130)).toBe(-30);
  });

  it('never inverts vertical, even in rtl', () => {
    expect(pointerDelta('vertical', true, 100, 130)).toBe(30);
  });

  it('maps horizontal arrows and ignores vertical ones', () => {
    expect(keyIntent('ArrowRight', 'horizontal', false, 10)).toBe(10);
    expect(keyIntent('ArrowLeft', 'horizontal', false, 10)).toBe(-10);
    expect(keyIntent('ArrowDown', 'horizontal', false, 10)).toBeNull();
  });

  it('swaps horizontal arrows in rtl', () => {
    expect(keyIntent('ArrowRight', 'horizontal', true, 10)).toBe(-10);
    expect(keyIntent('ArrowLeft', 'horizontal', true, 10)).toBe(10);
  });

  it('maps vertical arrows and ignores horizontal ones', () => {
    expect(keyIntent('ArrowDown', 'vertical', false, 10)).toBe(10);
    expect(keyIntent('ArrowUp', 'vertical', false, 10)).toBe(-10);
    expect(keyIntent('ArrowRight', 'vertical', false, 10)).toBeNull();
  });

  it('scales with the given step', () => {
    expect(keyIntent('ArrowRight', 'horizontal', false, 50)).toBe(50);
  });

  it('maps Home and End to the bounds in every direction', () => {
    expect(keyIntent('Home', 'horizontal', true, 10)).toBe('min');
    expect(keyIntent('End', 'vertical', false, 10)).toBe('max');
  });

  it('turns intents into signed deltas, infinite for Home and End', () => {
    expect(intentDelta('min')).toBe(-Infinity);
    expect(intentDelta('max')).toBe(Infinity);
    expect(intentDelta(-10)).toBe(-10);
  });

  it('Home and End land exactly on min and max through resizePair', () => {
    const bounds: PaneBounds[] = [{ min: 120, max: 480 }, free];
    expect(resizePair([300, 500], 0, intentDelta('min'), bounds)[0]).toBe(120);
    expect(resizePair([300, 500], 0, intentDelta('max'), bounds)[0]).toBe(480);
  });

  it('a Shift sized step is bigger than a plain one', () => {
    const plain = keyIntent('ArrowRight', 'horizontal', false, 10) as number;
    const big = keyIntent('ArrowRight', 'horizontal', false, 50) as number;
    expect(big).toBeGreaterThan(plain);
  });
});

describe('toggleTarget', () => {
  it('collapses the primary pane when it is collapsible', () => {
    expect(toggleTarget(0, [true, true], [false, false])).toBe(0);
  });

  it('falls back to the neighbour when only it is collapsible', () => {
    expect(toggleTarget(0, [false, true], [false, false])).toBe(1);
  });

  it('expands whichever neighbour is collapsed first', () => {
    expect(toggleTarget(0, [true, true], [false, true])).toBe(1);
  });

  it('does nothing when neither pane is collapsible', () => {
    expect(toggleTarget(0, [false, false], [false, false])).toBeNull();
  });
});

describe('announcements', () => {
  it('rounds percentages and tolerates an unmeasured container', () => {
    expect(toPercent(333, 1000)).toBe(33);
    expect(toPercent(10, 0)).toBe(0);
  });

  it('describes collapsed and sized panes', () => {
    expect(describeSize('Sidebar', 25, false)).toBe('Sidebar 25 percent');
    expect(describeSize('Sidebar', 0, true)).toBe('Sidebar collapsed');
  });
});

describe('overridable accessible text', () => {
  it('falls back to the numbered pane label and honours a custom labeller', () => {
    expect(resolvePaneLabel(undefined, 1, describePane)).toBe('Pane 2');
    expect(resolvePaneLabel(undefined, 1, (n) => `Panneau ${n}`)).toBe('Panneau 2');
    expect(resolvePaneLabel('Sidebar', 1, (n) => `Panneau ${n}`)).toBe('Sidebar');
  });

  it('prefers an explicit handle label over the labeller', () => {
    expect(resolveHandleLabel(null, 'Sidebar', describeHandle)).toBe('Resize Sidebar');
    expect(resolveHandleLabel(null, 'Sidebar', (l) => `Redimensionner ${l}`)).toBe(
      'Redimensionner Sidebar',
    );
    expect(resolveHandleLabel('Poignee', 'Sidebar', describeHandle)).toBe('Poignee');
  });
});

describe('non finite input never reaches the layout', () => {
  const huge = '1'.repeat(400);

  it.each([huge, `${huge}px`, `${huge}%`, `${huge}.5`])('coerceSize rejects %s', (value) => {
    expect(coerceSize(value)).toBeUndefined();
  });

  it('keeps layouts finite when a percent resolves to infinity', () => {
    expect(resolveSize('50%', Infinity)).toBe(0);
    const ratios = defaultRatios(['50%', undefined], Infinity);
    expect(ratios.every(Number.isFinite)).toBe(true);
  });

  it('keeps defaults finite when the coerced size was dropped', () => {
    const ratios = defaultRatios([coerceSize(huge), undefined], 800);
    expect(ratios).toEqual([0.5, 0.5]);
    expect(layoutSizes(ratios, [false, false], [free, free], 800)).toEqual([400, 400]);
  });
});

describe('static attribute coercion', () => {
  it('parses stackBelow strings and maps empty values to null', () => {
    expect(coerceStackBelow('520')).toBe(520);
    expect(coerceStackBelow(520)).toBe(520);
    expect(coerceStackBelow(null)).toBeNull();
    expect(coerceStackBelow(undefined)).toBeNull();
    expect(coerceStackBelow('')).toBeNull();
    expect(coerceStackBelow('abc')).toBeNull();
  });

  it('parses keyboardStep strings and falls back to 10 on junk', () => {
    expect(coerceStep('20')).toBe(20);
    expect(coerceStep(5)).toBe(5);
    expect(coerceStep('abc')).toBe(10);
    expect(coerceStep(0)).toBe(10);
    expect(coerceStep(-4)).toBe(10);
    expect(coerceStep(null)).toBe(10);
  });
});
