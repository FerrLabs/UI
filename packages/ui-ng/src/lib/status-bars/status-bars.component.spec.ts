import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import { StatusBarsComponent, type StatusBucket, type StatusLevel } from './status-bars.component';

class StatusBarsProbe extends StatusBarsComponent {
  readonly rendered = () => this.bars();
  readonly text = () => this.summary();
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createBars(
  buckets: readonly StatusBucket[],
  slots?: number,
  locale?: string,
): StatusBarsProbe {
  const bars = runInInjectionContext(
    Injector.create({ providers: [] }),
    () => new StatusBarsProbe(),
  );
  setInput(bars.buckets, buckets);
  if (slots !== undefined) setInput(bars.slots, slots);
  if (locale !== undefined) setInput(bars.locale, locale);
  return bars;
}

const bucket = (status: StatusLevel, at = '2026-01-02T03:04:05Z', uptimePct?: number) =>
  ({ at, status, uptimePct }) satisfies StatusBucket;

describe('StatusBarsComponent bars', () => {
  it('left-pads missing history with unknown bars so recent data sits on the right', () => {
    const rendered = createBars([bucket('up'), bucket('down')], 5).rendered();
    expect(rendered.map((b) => b.status)).toEqual(['unknown', 'unknown', 'unknown', 'up', 'down']);
    expect(rendered[0]?.title).toBe('No data');
  });

  it('keeps only the most recent buckets when there are more than slots', () => {
    const buckets = ['up', 'degraded', 'down', 'up'].map((s, i) =>
      bucket(s as StatusLevel, `2026-01-0${i + 1}T00:00:00Z`),
    );
    const rendered = createBars(buckets, 2).rendered();
    expect(rendered.map((b) => b.status)).toEqual(['down', 'up']);
  });

  it('renders 90 slots by default', () => {
    expect(createBars([bucket('up')]).rendered()).toHaveLength(90);
  });

  it.each([0, -3])('clamps %d slots to a single bar', (slots) => {
    const rendered = createBars([bucket('up'), bucket('down')], slots).rendered();
    expect(rendered.map((b) => b.status)).toEqual(['down']);
  });

  it('shows the status label and uptime in the title', () => {
    const [bar] = createBars([bucket('degraded', '2026-01-02T03:04:05Z', 97.456)], 1).rendered();
    const expectedStamp = new Date('2026-01-02T03:04:05Z').toLocaleString(undefined);
    expect(bar?.title).toBe(`${expectedStamp} · Degraded · 97.46% uptime`);
  });

  it('formats the timestamp with the given locale', () => {
    const [bar] = createBars([bucket('up', '2026-01-02T03:04:05Z')], 1, 'fr-FR').rendered();
    expect(bar?.title.startsWith(new Date('2026-01-02T03:04:05Z').toLocaleString('fr-FR'))).toBe(
      true,
    );
  });

  it('omits the uptime when it is not provided or the bucket is unknown', () => {
    const rendered = createBars(
      [bucket('up'), bucket('unknown', '2026-01-02T03:04:05Z', 50)],
      2,
    ).rendered();
    expect(rendered[0]?.title).not.toContain('uptime');
    expect(rendered[1]?.title).not.toContain('uptime');
    expect(rendered[1]?.title).toContain('No data');
  });

  it('keeps an unparseable timestamp verbatim instead of showing Invalid Date', () => {
    const [bar] = createBars([bucket('down', 'yesterday')], 1).rendered();
    expect(bar?.title).toBe('yesterday · Down');
  });

  it('shows 0% uptime rather than dropping it', () => {
    const [bar] = createBars([bucket('down', 'n/a', 0)], 1).rendered();
    expect(bar?.title).toBe('n/a · Down · 0.00% uptime');
  });
});

describe('StatusBarsComponent summary', () => {
  it('reports no data when there are no buckets', () => {
    expect(createBars([]).text()).toBe('Availability: no data');
  });

  it('reports no data when every bucket is unknown', () => {
    expect(createBars([bucket('unknown'), bucket('unknown')]).text()).toBe('Availability: no data');
  });

  it('computes the share of up buckets, ignoring unknown ones', () => {
    const text = createBars([bucket('up'), bucket('up'), bucket('down'), bucket('unknown')]).text();
    expect(text).toBe('Availability: 66.67% operational over the last 3 intervals');
  });

  it('counts degraded as not operational', () => {
    expect(createBars([bucket('up'), bucket('degraded')]).text()).toBe(
      'Availability: 50.00% operational over the last 2 intervals',
    );
  });

  it('summarises all buckets even when fewer slots are drawn', () => {
    expect(createBars([bucket('down'), bucket('up'), bucket('up')], 1).text()).toContain(
      'over the last 3 intervals',
    );
  });

  it('uses the custom label', () => {
    const bars = createBars([bucket('up')]);
    setInput(bars.label, 'API');
    expect(bars.text()).toBe('API: 100.00% operational over the last 1 intervals');
  });
});
