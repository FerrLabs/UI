import { describe, expect, it } from 'vitest';
import { toLocaleOptions } from './site-locale-option';

describe('toLocaleOptions', () => {
  it('maps each enabled locale to its endonym and switch href', () => {
    expect(toLocaleOptions(['en', 'fr', 'de', 'ja'], '/de/about?ref=nav')).toEqual([
      { code: 'en', endonym: 'English', href: '/about/?ref=nav' },
      { code: 'fr', endonym: 'Français', href: '/fr/about/?ref=nav' },
      { code: 'de', endonym: 'Deutsch', href: '/de/about/?ref=nav' },
      { code: 'ja', endonym: '日本語', href: '/ja/about/?ref=nav' },
    ]);
  });

  it('keeps the given order and does not strip disabled locale prefixes', () => {
    expect(toLocaleOptions(['fr', 'en'], '/it/x')).toEqual([
      { code: 'fr', endonym: 'Français', href: '/fr/it/x/' },
      { code: 'en', endonym: 'English', href: '/it/x/' },
    ]);
  });

  it('returns no options for no locales', () => {
    expect(toLocaleOptions([], '/')).toEqual([]);
  });
});
