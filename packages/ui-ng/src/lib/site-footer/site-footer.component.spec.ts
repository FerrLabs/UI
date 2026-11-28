import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import type { SiteChromeConfig } from '../site-chrome/site-chrome.model';
import { createHarness } from '../testing/component-harness';
import {
  chromeConfig,
  FakeLocation,
  siteProviders,
  SVG_LOGO,
  trustedHtml,
} from '../testing/site-chrome-fixture';
import { SiteFooterComponent } from './site-footer.component';

class Probe extends SiteFooterComponent {
  get logoHtml() {
    return this.logo;
  }
  get brand() {
    return [this.wordmark, this.wordmarkAccent];
  }
  get config() {
    return this.footer;
  }
  get cols() {
    return this.columns;
  }
}

function setup(config: SiteChromeConfig = chromeConfig(), localeId = 'en') {
  const harness = createHarness(siteProviders(config, new FakeLocation('/'), localeId));
  return harness.create(() => new Probe());
}

describe('SiteFooterComponent', () => {
  it('trusts a valid svg logo and drops an invalid one', () => {
    expect(setup().logoHtml).toEqual(trustedHtml(SVG_LOGO));
    expect(setup(chromeConfig({ logoSvg: '<script></script>' })).logoHtml).toEqual(trustedHtml(''));
  });

  it('exposes the wordmark with an empty accent default', () => {
    expect(setup().brand).toEqual(['Ferr', 'Labs']);
    expect(setup(chromeConfig({ wordmarkAccent: undefined })).brand).toEqual(['Ferr', '']);
  });

  it('exposes the footer config as is', () => {
    expect(setup().config.tagline).toBe('tag');
  });

  describe('columns', () => {
    it('localises internal links, adds trailing slashes except for files', () => {
      expect(setup(chromeConfig(), 'fr').cols[0].links.map((l) => l.href)).toEqual([
        '/fr/changelog/',
        'https://status.test',
        '/fr/feed.xml',
      ]);
    });

    it('keeps the default locale links unprefixed', () => {
      expect(setup().cols[0].links.map((l) => l.href)).toEqual([
        '/changelog/',
        'https://status.test',
        '/feed.xml',
      ]);
    });

    it('leaves external links untouched even when they are relative', () => {
      const config = chromeConfig({
        footer: {
          ...chromeConfig().footer,
          columns: [{ title: 'T', links: [{ label: 'x', href: '/raw', external: true }] }],
        },
      });
      expect(setup(config, 'fr').cols[0].links[0]).toEqual({
        label: 'x',
        href: '/raw',
        external: true,
      });
    });

    it('defaults external to false and keeps titles', () => {
      const { cols } = setup();
      expect(cols[0].title).toBe('Product');
      expect(cols[0].links.map((l) => l.external)).toEqual([false, true, false]);
    });

    it('falls back to the default locale when the requested one is not enabled', () => {
      expect(setup(chromeConfig(), 'de').cols[0].links[0].href).toBe('/changelog/');
    });
  });
});
