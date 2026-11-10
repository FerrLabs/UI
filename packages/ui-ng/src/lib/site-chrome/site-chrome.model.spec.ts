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
  const cases: readonly [string, string, readonly SiteLocale[]][] = [
    ['/de', '/', ALL_SITE_LOCALES],
    ['/de/', '/', ALL_SITE_LOCALES],
    ['/de/x', '/x', ALL_SITE_LOCALES],
    ['/design/', '/design/', ALL_SITE_LOCALES],
    ['/fresh', '/fresh', ALL_SITE_LOCALES],
    ['/de?ref=nav', '/?ref=nav', ALL_SITE_LOCALES],
    ['/de#top', '/#top', ALL_SITE_LOCALES],
    ['/fr//evil.com', '/evil.com', ALL_SITE_LOCALES],
    ['//evil.com', '/evil.com', ALL_SITE_LOCALES],
    ['///evil.com/x', '/evil.com/x', ALL_SITE_LOCALES],
    ['/\\evil.com', '/evil.com', ALL_SITE_LOCALES],
    ['\\\\evil.com', '/evil.com', ALL_SITE_LOCALES],
    ['//fr/pricing', '/pricing', ALL_SITE_LOCALES],
    ['\t/evil.com', '/evil.com', ALL_SITE_LOCALES],
    ['/f\tr/pricing', '/pricing', ALL_SITE_LOCALES],
    ['/', '/', ALL_SITE_LOCALES],
    ['/en/x', '/en/x', ALL_SITE_LOCALES],
    ['/it/', '/it/', ['en', 'fr']],
    ['/fr/x', '/x', ['en', 'fr']],
    ['/fr/x', '/fr/x', ['en']],
  ];

  it.each(cases)('%s with %j -> %s', (path, expected, locales) => {
    expect(stripLocalePrefix(path, locales)).toBe(expected);
  });

  it.each([
    ['/fr/x', '/x'],
    ['/de/x', '/de/x'],
    ['', '/'],
    ['x', '/x'],
  ])('defaults to the en and fr locales: %j -> %s', (path, expected) => {
    expect(stripLocalePrefix(path)).toBe(expected);
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
    ['en', '\t/evil.com', '/evil.com'],
    ['de', '\t/evil.com', '/de/evil.com'],
    ['en', '\n//evil.com', '/evil.com'],
    ['de', '\n//evil.com', '/de/evil.com'],
    ['en', '/fr/\n/evil.com', '/evil.com'],
    ['en', ' //evil.com', '/evil.com'],
    ['en', '\u0000//evil.com', '/evil.com'],
    ['en', '/f\tr/pricing', '/pricing/'],
  ];

  it.each(cases)('%s from %s -> %s', (target, path, expected) => {
    expect(localeSwitchHref(target, path, ALL_SITE_LOCALES)).toBe(expected);
  });

  it('only strips locales that are enabled', () => {
    expect(localeSwitchHref('fr', '/it/x', ['en', 'fr'])).toBe('/fr/it/x/');
    expect(localeSwitchHref('fr', '/it/x', ALL_SITE_LOCALES)).toBe('/fr/x/');
  });

  it.each([
    ['fr', '/de/x', '/fr/de/x/'],
    ['en', '/fr/x', '/x/'],
    ['en', 'https://evil.example', '/https://evil.example'],
    ['fr', '', '/fr/'],
  ] as const)('defaults to the en and fr locales: %s from %j -> %s', (target, path, expected) => {
    expect(localeSwitchHref(target, path)).toBe(expected);
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
    '\t/evil.com',
    '\n//evil.com',
    '\r\n//evil.com',
    '/fr/\n/evil.com',
    ' //evil.com',
    '\u0000//evil.com',
    '/\\evil.com',
  ];

  it.each(ALL_SITE_LOCALES.flatMap((t) => hostilePaths.map((p) => [t, p] as const)))(
    '%s from %s stays same-origin',
    (target, path) => {
      const href = localeSwitchHref(target, path, ALL_SITE_LOCALES);
      expect(href.startsWith('/')).toBe(true);
      expect(href.startsWith('//')).toBe(false);
      expect(new URL(href, 'https://site.example').host).toBe('site.example');
    },
  );

  it.each(
    ALL_SITE_LOCALES.flatMap((t) =>
      ALL_SITE_LOCALES.flatMap((u) => hostilePaths.map((p) => [t, u, p] as const)),
    ),
  )('hopping %s via %s from %s equals switching directly', (target, via, path) => {
    expect(
      localeSwitchHref(target, localeSwitchHref(via, path, ALL_SITE_LOCALES), ALL_SITE_LOCALES),
    ).toBe(localeSwitchHref(target, path, ALL_SITE_LOCALES));
  });

  it.each([
    ['en', '/fr/fr', '/fr/'],
    ['fr', '/fr/', '/fr/'],
    ['fr', '/fr/fr', '/fr/fr/'],
  ] as const)(
    '%s from %s -> %s (locale-like first slug is read as a prefix)',
    (target, path, expected) => {
      expect(localeSwitchHref(target, path)).toBe(expected);
    },
  );

  describe('properties', () => {
    const locale = fc.constantFrom(...ALL_SITE_LOCALES);
    const segment = fc.stringMatching(/^[a-z0-9._~?#\-/]{0,12}$/);
    const path = fc.tuple(segment, segment).map(([a, b]) => `/${a}${b}`);
    const startsWithLocale = new RegExp(
      `^/(?:${ALL_SITE_LOCALES.filter((code) => code !== DEFAULT_LOCALE).join('|')})(?=[/?#]|$)`,
    );
    const pathWithoutLocaleLikeSlug = path.filter(
      (p) => !startsWithLocale.test(stripLocalePrefix(p, ALL_SITE_LOCALES)),
    );

    const hostileChars = fc
      .array(fc.constantFrom('a', 'b', '.', '/', '\\', '\t', '\n', '\r', ' ', '\u0000', '?', '#'), {
        maxLength: 16,
      })
      .map((chars) => chars.join(''));
    const hostilePath = fc.tuple(hostileChars, hostileChars).map(([a, b]) => `${a}/${b}`);

    it('always resolves to the site host', () => {
      fc.assert(
        fc.property(locale, hostilePath, (target, p) => {
          const href = localeSwitchHref(target, p, ALL_SITE_LOCALES);
          expect(new URL(href, 'https://site.example').host).toBe('site.example');
        }),
      );
    });

    it('never produces a protocol-relative href', () => {
      fc.assert(
        fc.property(locale, path, (target, p) => {
          expect(localeSwitchHref(target, p, ALL_SITE_LOCALES).startsWith('//')).toBe(false);
        }),
      );
    });

    it('is independent of the previous hop', () => {
      fc.assert(
        fc.property(locale, locale, pathWithoutLocaleLikeSlug, (target, via, p) => {
          expect(
            localeSwitchHref(target, localeSwitchHref(via, p, ALL_SITE_LOCALES), ALL_SITE_LOCALES),
          ).toBe(localeSwitchHref(target, p, ALL_SITE_LOCALES));
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
    [['en', 'fr'], 'xx', 'en'],
    [['en', 'fr'], null, 'en'],
    [undefined, 'fr', 'fr'],
    [undefined, 'de', 'en'],
    [[], 'fr', 'fr'],
    [['fr', 'de'], 'en-US', 'fr'],
    [['fr', 'de'], 'ja', 'fr'],
    [['fr', 'de'], null, 'fr'],
    [['de'], 'fr', 'de'],
  ];

  it.each(cases)('locales %j with %s -> %s', (locales, localeId, expected) => {
    expect(resolveSiteLocale(configWith(locales), localeId)).toBe(expected);
  });
});
