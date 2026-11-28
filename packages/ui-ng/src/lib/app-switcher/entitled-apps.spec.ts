import { describe, expect, it } from 'vitest';
import type { AppRailItem } from '../app-rail/app-rail.component';
import { entitledApps, tierLabel } from './entitled-apps';

const apps: AppRailItem[] = [
  { id: 'ferrtrack', label: 'FerrTrack', href: '/t', accent: '#6366f1' },
  { id: 'ferrvault', label: 'FerrVault', href: '/v', accent: '#10b981' },
];

describe('tierLabel', () => {
  it('capitalises the first letter only', () => {
    expect(tierLabel('pro')).toBe('Pro');
    expect(tierLabel('enterprise plus')).toBe('Enterprise plus');
  });

  it('handles an empty tier', () => {
    expect(tierLabel('')).toBe('');
  });
});

describe('entitledApps', () => {
  it.each(['trialing', 'active', 'past_due'])('labels an app with a %s subscription', (status) => {
    const result = entitledApps(apps, [{ product: 'ferrtrack', tier: 'team', status }], 'x');
    expect(result[0].meta).toBe('Team');
    expect(result[1].meta).toBeUndefined();
  });

  it.each(['canceled', 'incomplete', 'unpaid'])('ignores a %s subscription', (status) => {
    const result = entitledApps(apps, [{ product: 'ferrtrack', tier: 'team', status }], 'x');
    expect(result[0].meta).toBeUndefined();
  });

  it('does not mutate the input items', () => {
    entitledApps(apps, [{ product: 'ferrtrack', tier: 'team', status: 'active' }], 'x');
    expect(apps[0].meta).toBeUndefined();
  });

  it('keeps the original item reference when not entitled', () => {
    expect(entitledApps(apps, [], 'x')[1]).toBe(apps[1]);
  });

  it('uses the last entitled subscription for a product', () => {
    const result = entitledApps(
      apps,
      [
        { product: 'ferrvault', tier: 'free', status: 'active' },
        { product: 'ferrvault', tier: 'pro', status: 'active' },
      ],
      'x',
    );
    expect(result[1].meta).toBe('Pro');
  });
});
