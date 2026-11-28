import '@angular/compiler';
import { describe, expect, it, vi } from 'vitest';
import { createHarness } from '../testing/component-harness';
import { AppRailComponent, type AppRailItem } from './app-rail.component';

class Probe extends AppRailComponent {
  slug(item: AppRailItem) {
    return this.glyph(item);
  }
  color(item: AppRailItem): string {
    return this.markColor(item);
  }
  label(item: AppRailItem): string {
    return this.itemLabel(item);
  }
  select(item: AppRailItem): void {
    this.onSelect(item);
  }
}

const item = (over: Partial<AppRailItem> = {}): AppRailItem => ({
  id: 'custom',
  label: 'Custom',
  href: '/custom',
  accent: '#7c3aed',
  ...over,
});

const create = () => createHarness().create(() => new Probe());

describe('AppRailComponent', () => {
  it('has sensible defaults', () => {
    const rail = create();
    expect(rail.items()).toEqual([]);
    expect(rail.current()).toBeNull();
    expect(rail.ariaLabel()).toBe('Products');
  });

  describe('glyph', () => {
    it('prefers the explicit product', () => {
      expect(create().slug(item({ id: 'ferrtrack', product: 'ferrlens' }))).toBe('ferrlens');
    });

    it.each([
      'ferrflow',
      'ferrvault',
      'ferrtrack',
      'ferrgrowth',
      'ferragents',
      'ferrfleet',
      'ferrlens',
      'ferrlabs',
    ])('uses the id %s when it names a product', (id) => {
      expect(create().slug(item({ id }))).toBe(id);
    });

    it('falls back to the org mark for unknown ids', () => {
      expect(create().slug(item({ id: 'storybook' }))).toBe('ferrlabs');
    });
  });

  describe('markColor', () => {
    it('keeps readable accents and turns dark ones white', () => {
      const rail = create();
      expect(rail.color(item({ accent: '#f59e0b' }))).toBe('#f59e0b');
      expect(rail.color(item({ accent: '#1e293b' }))).toBe('#ffffff');
    });
  });

  describe('itemLabel', () => {
    it('is the plain label by default', () => {
      expect(create().label(item())).toBe('Custom');
    });

    it('announces a locked item', () => {
      expect(create().label(item({ locked: true }))).toBe('Custom, no active subscription');
    });

    it('announces a new tab link', () => {
      expect(create().label(item({ newTab: true }))).toBe('Custom, opens in a new tab');
    });

    it('announces both, locked first', () => {
      expect(create().label(item({ locked: true, newTab: true }))).toBe(
        'Custom, no active subscription, opens in a new tab',
      );
    });
  });

  it('emits the selected item', () => {
    const rail = create();
    const selected = vi.fn();
    rail.selected.subscribe(selected);
    const chosen = item({ id: 'ferrvault' });
    rail.select(chosen);
    expect(selected).toHaveBeenCalledExactlyOnceWith(chosen);
  });
});
