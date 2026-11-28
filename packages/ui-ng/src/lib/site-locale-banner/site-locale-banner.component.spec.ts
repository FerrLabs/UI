import '@angular/compiler';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHarness, setInput } from '../testing/component-harness';
import { chromeConfig, FakeLocation, siteProviders } from '../testing/site-chrome-fixture';
import type { SiteChromeConfig } from '../site-chrome/site-chrome.model';
import { SiteLocaleBannerComponent } from './site-locale-banner.component';

const KEY = 'flr:locale-banner-dismissed';

class Probe extends SiteLocaleBannerComponent {
  get state() {
    return this.view();
  }
  get stay(): string {
    return this.stayLabel;
  }
  get locale() {
    return this.current;
  }
  close(code: Parameters<SiteLocaleBannerComponent['dismiss']>[0]): void {
    this.dismiss(code);
  }
}

function stubBrowser(languages: readonly string[], stored: Record<string, string> = {}) {
  const storage = {
    getItem: vi.fn((key: string) => stored[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      stored[key] = value;
    }),
  };
  vi.stubGlobal('navigator', { languages });
  vi.stubGlobal('localStorage', storage);
  return storage;
}

function setup(options: {
  languages: readonly string[];
  stored?: Record<string, string>;
  localeId?: string;
  config?: SiteChromeConfig;
  path?: string;
}) {
  const storage = stubBrowser(options.languages, options.stored);
  const harness = createHarness(
    siteProviders(
      options.config ?? chromeConfig({ locales: ['en', 'fr', 'de'] }),
      new FakeLocation('/'),
      options.localeId,
    ),
  );
  const banner = harness.create(() => new Probe());
  setInput(banner.path, options.path ?? '/pricing');
  harness.flush();
  return { banner, storage };
}

describe('SiteLocaleBannerComponent', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('stays hidden before the first render and when the browser language is the current one', () => {
    expect(setup({ languages: ['en-US'] }).banner.state).toBeNull();
  });

  it('suggests the first supported browser language with a switch link', () => {
    const { banner } = setup({ languages: ['ko', 'de-AT', 'fr'], path: '/pricing' });
    expect(banner.state).toEqual({
      code: 'de',
      target: expect.objectContaining({ read: 'Auf Deutsch lesen' }),
      href: '/de/pricing/',
    });
  });

  it('builds the switch link from the current locale path', () => {
    const { banner } = setup({ languages: ['en'], localeId: 'fr', path: '/fr/pricing' });
    expect(banner.state?.href).toBe('/pricing/');
    const other = setup({ languages: ['de'], localeId: 'fr', path: '/fr/pricing?x=1' });
    expect(other.banner.state?.href).toBe('/de/pricing/?x=1');
  });

  it('does not suggest locales that are not enabled', () => {
    expect(setup({ languages: ['ja'] }).banner.state).toBeNull();
  });

  it('exposes the stay label of the current locale', () => {
    expect(setup({ languages: ['de'], localeId: 'fr' }).banner.stay).toBe('Rester en français');
    expect(setup({ languages: [] }).banner.stay).toBe('Stay in English');
  });

  it('stays hidden when that suggestion was dismissed before', () => {
    expect(setup({ languages: ['de'], stored: { [KEY]: 'de' } }).banner.state).toBeNull();
  });

  it('still suggests when a different locale was dismissed before', () => {
    expect(setup({ languages: ['de'], stored: { [KEY]: 'fr' } }).banner.state?.code).toBe('de');
  });

  it('stays hidden when no browser language is supported', () => {
    expect(setup({ languages: ['zh', 'ko'] }).banner.state).toBeNull();
  });

  describe('dismiss', () => {
    it('hides the banner and remembers the choice', () => {
      const { banner, storage } = setup({ languages: ['de'] });
      banner.close('de');
      expect(banner.state).toBeNull();
      expect(storage.setItem).toHaveBeenCalledWith(KEY, 'de');
    });

    it('still hides the banner when storage throws', () => {
      const { banner, storage } = setup({ languages: ['de'] });
      storage.setItem.mockImplementation(() => {
        throw new Error('denied');
      });
      expect(() => banner.close('de')).not.toThrow();
      expect(banner.state).toBeNull();
    });
  });

  it('shows the suggestion when reading storage throws', () => {
    const storage = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: vi.fn(),
    };
    vi.stubGlobal('navigator', { languages: ['de'] });
    vi.stubGlobal('localStorage', storage);
    const harness = createHarness(
      siteProviders(chromeConfig({ locales: ['en', 'fr', 'de'] }), new FakeLocation('/')),
    );
    const banner = harness.create(() => new Probe());
    setInput(banner.path, '/');
    harness.flush();
    expect(banner.state?.code).toBe('de');
  });
});
