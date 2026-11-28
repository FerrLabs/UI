import { describe, expect, it } from 'vitest';
import { switcherState, type SwitcherApp } from './switcher-state';

const app = (over: Partial<SwitcherApp> & { id: string }): SwitcherApp => ({
  label: over.id,
  href: `/${over.id}`,
  accent: '#000',
  tier: null,
  hidden: false,
  ...over,
});

describe('switcherState', () => {
  it('adds a capitalised tier as meta only when a tier is present', () => {
    const { items } = switcherState([app({ id: 'a', tier: 'pro' }), app({ id: 'b' })]);
    expect(items[0]).toEqual({ id: 'a', label: 'a', href: '/a', accent: '#000', meta: 'Pro' });
    expect(items[1]).toEqual({ id: 'b', label: 'b', href: '/b', accent: '#000' });
    expect('meta' in items[1]).toBe(false);
  });

  it('lists hidden apps but never the org hub', () => {
    const { hidden } = switcherState([
      app({ id: 'a', hidden: true }),
      app({ id: 'ferrlabs', hidden: true }),
      app({ id: 'c' }),
    ]);
    expect(hidden).toEqual(['a']);
  });

  it('exposes the hub href, or null when the hub is absent', () => {
    expect(switcherState([app({ id: 'ferrlabs' })]).hubHref).toBe('/ferrlabs');
    expect(switcherState([app({ id: 'a' })]).hubHref).toBeNull();
  });

  it('handles an empty list', () => {
    expect(switcherState([])).toEqual({ items: [], hidden: [], hubHref: null });
  });
});
