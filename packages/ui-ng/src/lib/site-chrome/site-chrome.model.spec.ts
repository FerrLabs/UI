import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  ALL_SITE_LOCALES,
  DEFAULT_LOCALE,
  localeSwitchHref,
  matchSiteLocale,
  resolveLocale,
  resolveSiteLocale,
  type SiteChromeConfig,
  stripLocalePrefix,
  type SiteLocale,
} from './site-chrome.model';

describe('stripLocalePrefix', () => {
  const cases: readonly [string, string, readonly SiteLocale[] | undefined][] = [
    ['/de', '/', undefined],
    ['/de/', '/', undefined],
    ['/de/x', '/x', undefined],
    ['/design/', '/design/', undefined],
    ['/fresh', '/fresh', undefined],
    ['/de?ref=nav', '/?ref=nav', undefined],
    ['/de#top', '/#top', undefined],
    ['/fr//evil.com', '/evil.com', undefined],
    ['//evil.com', '/evil.com', undefined],
    ['///evil.com/x', '/evil.com/x', undefined],
    ['/\\evil.com', '/evil.com', undefined],
    ['\\\\evil.com', '/evil.com', undefined],
    ['//fr/pricing', '/pricing', undefined],
    ['/', '/', undefined],
    ['/en/x', '/en/x', undefined],
    ['/it/', '/it/', ['en', 'fr']],
    ['/fr/x', '/x', ['en', 'fr']],
    ['/fr/x', '/fr/x', ['en']],
  ];

  it.each(cases)('%s with %j -> %s', (path, expected, locales) => {
    const result =
      locales === undefined ? stripLocalePrefix(path) : stripLocalePrefix(path, locales);
    expect(result).toBe(expected);
  });
});

describe('localeSwitchHref', () => {
  const cases: readonly [SiteLocale, string, string][] = [
    ['en', '/', '/'],
    ['fr', '/', '/fr/'],
    ['fr', '/?a=1#h', '/fr/?a=1#h'],
    ['en', '/de/?a=1', '/?a=1'],
    ['en', '/ja/?utm=x', '/?utm=x'],
    ['ja', '/ja/?utm=x', '/ja/?utm=x'],
    ['fr', '/about', '/fr/about/'],
    ['fr', '/about?x=1#y', '/fr/about/?x=1#y'],
    ['en', '/de/about', '/about/'],
    ['fr', '/logo.svg', '/fr/logo.svg'],
    ['en', '//evil.com', '/evil.com'],
    ['en', '/fr//evil.com', '/evil.com'],
    ['fr', '///evil.com', '/fr/evil.com'],
    ['en', '//fr/pricing', '/pricing/'],
    ['en', '/\\evil.com', '/evil.com'],
  ];

  it.each(cases)('%s from %s -> %s', (target, path, expected) => {
    expect(localeSwitchHref(target, path)).toBe(expected);
  });

  it('only strips locales that are enabled', () => {
    expect(localeSwitchHref('fr', '/it/x', ['en', 'fr'])).toBe('/fr/it/x/');
    expect(localeSwitchHref('fr', '/it/x')).toBe('/fr/x/');
  });

  const hostilePaths = [
    '/',
    '//evil.com',
    '///evil.com',
    '/fr//evil.com',
    '/de//evil.com/x',
    '/ja///evil.com?a=1',
    '/de?//evil.com',
    '/fr#//evil.com',
  ];

  it.each(ALL_SITE_LOCALES.flatMap((t) => hostilePaths.map((p) => [t, p] as const)))(
    '%s from %s stays same-origin',
    (target, path) => {
      const href = localeSwitchHref(target, path);
      expect(href.startsWith('/')).toBe(true);
      expect(href.startsWith('//')).toBe(false);
    },
  );

  it.each(
    ALL_SITE_LOCALES.flatMap((t) =>
      ALL_SITE_LOCALES.flatMap((u) => hostilePaths.map((p) => [t, u, p] as const)),
    ),
  )('hopping %s via %s from %s equals switching directly', (target, via, path) => {
    expect(localeSwitchHref(target, localeSwitchHref(via, path))).toBe(
      localeSwitchHref(target, path),
    );
  });

  describe('properties', () => {
    const locale = fc.constantFrom(...ALL_SITE_LOCALES);
    const segment = fc.stringMatching(/^[a-z0-9._~?#\-/]{0,12}$/);
    const path = fc.tuple(segment, segment).map(([a, b]) => `/${a}${b}`);

    it('never produces a protocol-relative href', () => {
      fc.assert(
        fc.property(locale, path, (target, p) => {
          expect(localeSwitchHref(target, p).startsWith('//')).toBe(false);
        }),
      );
    });

    it('is independent of the previous hop', () => {
      fc.assert(
        fc.property(locale, locale, path, (target, via, p) => {
          expect(localeSwitchHref(target, localeSwitchHref(via, p))).toBe(
            localeSwitchHref(target, p),
          );
        }),
      );
    });
  });
});

describe('matchSiteLocale and resolveLocale', () => {
  const cases: readonly [string | null | undefined, SiteLocale | null][] = [
    ['de-CH', 'de'],
    ['pt-BR', 'pt'],
    ['ja_JP', 'ja'],
    ['EN', 'en'],
    ['FR-ca', 'fr'],
    ['fr', 'fr'],
    ['zh-CN', null],
    ['deutsch', null],
    ['', null],
    [null, null],
    [undefined, null],
  ];

  it.each(cases)('%s -> %s', (tag, expected) => {
    expect(matchSiteLocale(tag)).toBe(expected);
    expect(resolveLocale(tag)).toBe(expected ?? DEFAULT_LOCALE);
  });
});

describe('resolveSiteLocale', () => {
  const configWith = (locales?: readonly SiteLocale[]): SiteChromeConfig =>
    ({ locales }) as SiteChromeConfig;

  const cases: readonly [readonly SiteLocale[] | undefined, string | null, SiteLocale][] = [
    [['en', 'fr', 'de'], 'de-CH', 'de'],
    [['en', 'fr'], 'de-CH', 'en'],
    [['en', 'fr'], 'FR', 'fr'],
    [['fr', 'de'], 'ja', 'en'],
    [['en', 'fr'], 'xx', 'en'],
    [['en', 'fr'], null, 'en'],
    [undefined, 'fr', 'fr'],
    [undefined, 'de', 'en'],
    [[], 'fr', 'fr'],
  ];

  it.each(cases)('locales %j with %s -> %s', (locales, localeId, expected) => {
    expect(resolveSiteLocale(configWith(locales), localeId)).toBe(expected);
  });
});
