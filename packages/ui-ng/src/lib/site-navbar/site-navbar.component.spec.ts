import '@angular/compiler';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SiteChromeConfig } from '../site-chrome/site-chrome.model';
import { createHarness } from '../testing/component-harness';
import {
  chromeConfig,
  FakeLocation,
  siteProviders,
  SVG_LOGO,
  trustedHtml,
} from '../testing/site-chrome-fixture';
import { SiteNavbarComponent } from './site-navbar.component';

class Probe extends SiteNavbarComponent {
  get logoHtml() {
    return this.logo;
  }
  get activeLocale() {
    return this.locale;
  }
  get brand() {
    return [this.wordmark, this.wordmarkAccent];
  }
  get home() {
    return this.homeHref;
  }
  get navLinks() {
    return this.links;
  }
  get cta$() {
    return this.cta;
  }
  get isScrolled() {
    return this.scrolled();
  }
  get mobile() {
    return this.mobileOpen;
  }
  get language() {
    return this.languageLabel;
  }
  get options() {
    return this.localeOptions();
  }
  get enabledLocales() {
    return this.locales;
  }
  scroll(): void {
    this.onScroll();
  }
  padded(n: number): string {
    return this.pad(n);
  }
}

function setup(
  config: SiteChromeConfig = chromeConfig(),
  options: { localeId?: string; path?: string } = {},
) {
  const location = new FakeLocation(options.path ?? '/');
  const harness = createHarness(siteProviders(config, location, options.localeId));
  return { nav: harness.create(() => new Probe()), location, harness };
}

describe('SiteNavbarComponent', () => {
  afterEach(() => vi.unstubAllGlobals());

  describe('logo', () => {
    it('trusts a valid svg logo', () => {
      expect(setup().nav.logoHtml).toEqual(trustedHtml(SVG_LOGO));
    });

    it('drops an untrusted logo instead of injecting it', () => {
      const { nav } = setup(chromeConfig({ logoSvg: '<svg onload="x()"></svg>' }));
      expect(nav.logoHtml).toEqual(trustedHtml(''));
    });
  });

  describe('locale', () => {
    it('resolves from LOCALE_ID', () => {
      expect(setup(chromeConfig(), { localeId: 'fr-CA' }).nav.activeLocale).toBe('fr');
    });

    it('falls back to the default when the locale is not enabled', () => {
      expect(setup(chromeConfig(), { localeId: 'de' }).nav.activeLocale).toBe('en');
    });

    it('prefixes the home link for non default locales', () => {
      expect(setup(chromeConfig(), { localeId: 'fr' }).nav.home).toBe('/fr/');
      expect(setup().nav.home).toBe('/');
    });
  });

  describe('links', () => {
    it('localises internal links with a trailing slash and leaves external ones alone', () => {
      const { nav } = setup(chromeConfig(), { localeId: 'fr' });
      expect(nav.navLinks.map((l) => l.href)).toEqual([
        '/fr/pricing/',
        'https://docs.test/start',
        '/fr/',
      ]);
    });

    it('flags external links, defaulting to false', () => {
      const { nav } = setup(
        chromeConfig({
          navLinks: [
            { label: 'A', href: '/a' },
            { label: 'B', href: '/b', external: true },
          ],
        }),
      );
      expect(nav.navLinks.map((l) => l.external)).toEqual([false, true]);
    });

    it('localises the cta', () => {
      expect(setup(chromeConfig(), { localeId: 'fr' }).nav.cta$).toEqual({
        label: 'Start',
        href: '/fr/signup/',
      });
    });

    it('has no cta when none is configured', () => {
      expect(setup(chromeConfig({ cta: null })).nav.cta$).toBeNull();
      expect(setup(chromeConfig({ cta: undefined })).nav.cta$).toBeNull();
    });
  });

  describe('branding', () => {
    it('exposes the wordmark and an empty accent by default', () => {
      expect(setup().nav.brand).toEqual(['Ferr', 'Labs']);
      expect(setup(chromeConfig({ wordmarkAccent: undefined })).nav.brand).toEqual(['Ferr', '']);
    });
  });

  describe('language label', () => {
    it('prefers the configured label', () => {
      const config = chromeConfig({
        labels: { menu: 'm', close: 'c', openMenu: 'o', language: 'Lang' },
      });
      expect(setup(config).nav.language).toBe('Lang');
    });

    it('falls back to the locale catalog entry', () => {
      expect(setup(chromeConfig(), { localeId: 'fr' }).nav.language).toBe('Langue');
      expect(setup().nav.language).toBe('Language');
    });
  });

  describe('locale options', () => {
    it('uses the enabled locales, defaulting to en and fr', () => {
      expect(setup().nav.enabledLocales).toEqual(['en', 'fr']);
      expect(setup(chromeConfig({ locales: undefined })).nav.enabledLocales).toEqual(['en', 'fr']);
      expect(setup(chromeConfig({ locales: [] })).nav.enabledLocales).toEqual(['en', 'fr']);
    });

    it('builds switch links from the current path and follows navigation', () => {
      const { nav, location } = setup(chromeConfig(), { path: '/fr/pricing?ref=a' });
      expect(nav.options.map((o) => [o.code, o.href])).toEqual([
        ['en', '/pricing/?ref=a'],
        ['fr', '/fr/pricing/?ref=a'],
      ]);
      location.navigate('/about');
      expect(nav.options.map((o) => o.href)).toEqual(['/about/', '/fr/about/']);
    });
  });

  describe('scroll state', () => {
    it('is scrolled once past 8px', () => {
      const { nav } = setup();
      const win = { scrollY: 0 };
      vi.stubGlobal('window', win);
      nav.scroll();
      expect(nav.isScrolled).toBe(false);
      win.scrollY = 8;
      nav.scroll();
      expect(nav.isScrolled).toBe(false);
      win.scrollY = 9;
      nav.scroll();
      expect(nav.isScrolled).toBe(true);
      win.scrollY = 0;
      nav.scroll();
      expect(nav.isScrolled).toBe(false);
    });

    it('is not scrolled without a window', () => {
      const { nav } = setup();
      nav.scroll();
      expect(nav.isScrolled).toBe(false);
    });
  });

  it('starts with the mobile menu closed', () => {
    expect(setup().nav.mobile()).toBe(false);
  });

  it.each([
    [1, '01'],
    [9, '09'],
    [10, '10'],
    [123, '123'],
  ])('pads %i to %s', (n, expected) => {
    expect(setup().nav.padded(n)).toBe(expected);
  });
});
