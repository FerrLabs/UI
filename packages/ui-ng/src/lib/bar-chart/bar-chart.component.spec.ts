import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import { BarChartComponent, type BarChartPoint } from './bar-chart.component';

class BarChartProbe extends BarChartComponent {
  readonly scale = () => this.max();
  readonly scaleTicks = () => this.ticks();
  readonly widest = () => this.widestTick();
  readonly rendered = () => this.bars();
  readonly tooltip = () => this.tip();
  hoverOn(index: number): void {
    this.hover.set(index);
  }
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createChart(points: readonly BarChartPoint[]): BarChartProbe {
  const chart = runInInjectionContext(
    Injector.create({ providers: [] }),
    () => new BarChartProbe(),
  );
  setInput(chart.points, points);
  return chart;
}

const points = (...values: number[]): BarChartPoint[] =>
  values.map((value, i) => ({ label: `d${i}`, value }));

describe('BarChartComponent scale', () => {
  it.each([
    [[0], 1],
    [[1], 1],
    [[1.2], 1.5],
    [[7], 8],
    [[9], 10],
    [[11], 15],
    [[100], 100],
    [[101], 150],
    [[3, 42, 17], 50],
    [[0.4], 1],
    [[950], 1000],
  ])('values %j give a ceiling of %d', (values, expected) => {
    expect(createChart(points(...values)).scale()).toBe(expected);
  });

  it('never goes below 1, even for an empty or negative-only series', () => {
    expect(createChart([]).scale()).toBe(1);
    expect(createChart(points(-5)).scale()).toBe(1);
  });

  it('places ticks at 0, 50 and 100 percent using the formatter', () => {
    const chart = createChart(points(40));
    setInput(chart.format, (v: number) => `${v}ms`);
    expect(chart.scaleTicks()).toEqual([
      { at: 0, text: '0ms' },
      { at: 50, text: '20ms' },
      { at: 100, text: '40ms' },
    ]);
  });

  it('exposes the widest tick label so the axis keeps a stable width', () => {
    const chart = createChart(points(1000));
    expect(chart.widest()).toBe('1000');
  });
});

describe('BarChartComponent bars', () => {
  it('scales bar heights against the ceiling and flags zero values', () => {
    const rendered = createChart(points(0, 25, 50)).rendered();
    expect(rendered.map((b) => b.pct)).toEqual([0, 50, 100]);
    expect(rendered.map((b) => b.zero)).toEqual([true, false, false]);
  });

  it('clamps the danger share to the bar value and to zero', () => {
    const rendered = createChart([
      { label: 'a', value: 10, danger: 4 },
      { label: 'b', value: 10, danger: 99 },
      { label: 'c', value: 10, danger: -3 },
      { label: 'd', value: 10 },
    ]).rendered();
    expect(rendered.map((b) => b.dangerPct)).toEqual([40, 100, 0, 0]);
    expect(rendered.map((b) => b.danger)).toEqual([
      '4 of which failed',
      '10 of which failed',
      '',
      '',
    ]);
  });

  it('uses a custom danger label', () => {
    const chart = createChart([{ label: 'a', value: 10, danger: 2 }]);
    setInput(chart.dangerLabel, 'errors');
    expect(chart.rendered()[0]?.danger).toBe('2 errors');
  });

  it('builds the aria label from label, value and danger', () => {
    const rendered = createChart([
      { label: 'Mon', value: 5, danger: 1 },
      { label: 'Tue', value: 5 },
    ]).rendered();
    expect(rendered[0]?.aria).toBe('Mon, 5, 1 of which failed');
    expect(rendered[1]?.aria).toBe('Tue, 5');
  });

  it('prefers the custom title over label and value', () => {
    const [bar] = createChart([{ label: 'Mon', value: 5, title: 'Monday: 5 builds' }]).rendered();
    expect(bar?.label).toBe('Monday: 5 builds');
    expect(bar?.value).toBe('');
    expect(bar?.aria).toBe('Monday: 5 builds');
  });

  it('labels every Nth axis tick and keeps keys unique for repeated labels', () => {
    const chart = createChart([1, 2, 3, 4, 5].map((value) => ({ label: 'x', value })));
    setInput(chart.labelEvery, 2);
    const rendered = chart.rendered();
    expect(rendered.map((b) => b.tick)).toEqual(['x', '', 'x', '', 'x']);
    expect(new Set(rendered.map((b) => b.key)).size).toBe(5);
  });

  it('labels every tick when labelEvery is below 1', () => {
    const chart = createChart(points(1, 2, 3));
    setInput(chart.labelEvery, 0);
    expect(chart.rendered().map((b) => b.tick)).toEqual(['d0', 'd1', 'd2']);
  });
});

describe('BarChartComponent tooltip', () => {
  it('is hidden until a bar is hovered or focused', () => {
    expect(createChart(points(1, 2)).tooltip()).toBeNull();
  });

  it('hides again for an index outside the series', () => {
    const chart = createChart(points(1, 2));
    chart.hoverOn(5);
    expect(chart.tooltip()).toBeNull();
    chart.hoverOn(-1);
    expect(chart.tooltip()).toBeNull();
  });

  it('centres on the hovered slot and carries its text', () => {
    const chart = createChart([
      { label: 'a', value: 1 },
      { label: 'b', value: 2, danger: 1 },
      { label: 'c', value: 3 },
      { label: 'd', value: 4 },
    ]);
    chart.hoverOn(1);
    expect(chart.tooltip()).toEqual({
      at: 37.5,
      edge: 'mid',
      label: 'b',
      value: '2',
      danger: '1 of which failed',
    });
  });

  it('flips the tooltip toward the inside near either edge', () => {
    const chart = createChart(points(...Array.from({ length: 10 }, () => 1)));
    chart.hoverOn(0);
    expect(chart.tooltip()?.edge).toBe('start');
    chart.hoverOn(9);
    expect(chart.tooltip()?.edge).toBe('end');
    chart.hoverOn(4);
    expect(chart.tooltip()?.edge).toBe('mid');
  });
});
