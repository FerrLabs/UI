import { describe, expect, it } from 'vitest';
import { hiddenAppsFromPreferences, withHiddenApps } from './switcher-preferences';

describe('hiddenAppsFromPreferences', () => {
  it.each([null, undefined, {}, { hiddenApps: 'ferrtrack' }, { hiddenApps: { a: 1 } }])(
    'returns an empty list for %j',
    (prefs) => {
      expect(hiddenAppsFromPreferences(prefs)).toEqual([]);
    },
  );

  it('drops non-string entries', () => {
    expect(hiddenAppsFromPreferences({ hiddenApps: ['a', 1, null, 'b', {}] })).toEqual(['a', 'b']);
  });
});

describe('withHiddenApps', () => {
  it('preserves other preferences and replaces the hidden list', () => {
    expect(withHiddenApps({ theme: 'dark', hiddenApps: ['a'] }, ['b'])).toEqual({
      theme: 'dark',
      hiddenApps: ['b'],
    });
  });

  it('works without existing preferences and copies the list', () => {
    const hidden = ['a'];
    const result = withHiddenApps(null, hidden);
    expect(result).toEqual({ hiddenApps: ['a'] });
    expect(result['hiddenApps']).not.toBe(hidden);
  });
});
