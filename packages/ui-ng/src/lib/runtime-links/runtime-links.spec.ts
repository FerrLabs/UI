import { afterEach, describe, expect, it } from 'vitest';
import {
  accountUrl,
  brandApps,
  marketingUrl,
  orgCreateUrl,
  readRuntimeEnv,
  runtimeUrl,
  userMenuItems,
} from './runtime-links';

describe('runtimeUrl', () => {
  it.each([undefined, '', '   '])('returns null for %j', (value) => {
    expect(runtimeUrl(value)).toBeNull();
  });

  it('trims whitespace and trailing slashes only', () => {
    expect(runtimeUrl('  https://a.test/path//  ')).toBe('https://a.test/path');
    expect(runtimeUrl('https://a.test/a/b')).toBe('https://a.test/a/b');
  });
});

describe('readRuntimeEnv', () => {
  afterEach(() => {
    delete (globalThis as { __ENV?: unknown }).__ENV;
  });

  it('returns an empty object without a global __ENV', () => {
    expect(readRuntimeEnv()).toEqual({});
  });

  it('returns the global __ENV and feeds the default parameters', () => {
    (globalThis as { __ENV?: unknown }).__ENV = {
      accountUrl: 'https://acc.test/',
      marketingUrl: 'https://m.test//',
    };
    expect(accountUrl()).toBe('https://acc.test');
    expect(marketingUrl()).toBe('https://m.test');
    expect(orgCreateUrl()).toBe('https://acc.test/onboarding/org-create');
    expect(userMenuItems().map((i) => i.id)).toEqual(['profile', 'prefs', 'signout']);
    expect(brandApps()).toEqual([]);
  });
});

describe('orgCreateUrl', () => {
  it('is null without an account url', () => {
    expect(orgCreateUrl({})).toBeNull();
    expect(orgCreateUrl({ accountUrl: ' ' })).toBeNull();
  });
});

describe('brandApps', () => {
  it('includes only configured apps, in product then tool order, with normalised hrefs', () => {
    const apps = brandApps({
      env: {
        apps: {
          storybook: 'https://sb.test/',
          ferrtrack: 'https://track.test//',
          ferrlabs: 'https://labs.test',
          ferrvault: '  ',
        },
      },
    });
    expect(apps.map((a) => [a.id, a.href])).toEqual([
      ['ferrlabs', 'https://labs.test'],
      ['ferrtrack', 'https://track.test'],
      ['storybook', 'https://sb.test'],
    ]);
  });

  it('marks tools with a section and new tab', () => {
    const [storybook] = brandApps({ env: { apps: { storybook: 'https://sb.test' } } });
    expect(storybook).toMatchObject({ section: 'Tools', newTab: true });
  });

  it('returns nothing when no apps are configured', () => {
    expect(brandApps({ env: {} })).toEqual([]);
  });
});

describe('userMenuItems', () => {
  it('has only a sign out item without account url, and no separator', () => {
    expect(userMenuItems({ env: {} })).toEqual([
      { id: 'signout', label: 'Sign out', danger: true, separatorAbove: false },
    ]);
  });

  it('adds profile and prefs links under the normalised account url', () => {
    const items = userMenuItems({ env: { accountUrl: 'https://acc.test/' } });
    expect(items.map((i) => [i.id, i.href])).toEqual([
      ['profile', 'https://acc.test/profile'],
      ['prefs', 'https://acc.test/prefs'],
      ['signout', undefined],
    ]);
    expect(items.at(-1)?.separatorAbove).toBe(true);
  });

  it('inserts extra items before sign out and separates sign out when only extras exist', () => {
    const extra = [{ id: 'x', label: 'X' }];
    const items = userMenuItems({ extra, env: {} });
    expect(items.map((i) => i.id)).toEqual(['x', 'signout']);
    expect(items[1].separatorAbove).toBe(true);
  });

  it('ignores an empty extra list', () => {
    expect(userMenuItems({ extra: [], env: {} }).map((i) => i.id)).toEqual(['signout']);
  });
});
