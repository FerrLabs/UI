import '@angular/compiler';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import type { SiteChromeConfig } from '../site-chrome/site-chrome.model';
import { createHarness, setInput } from '../testing/component-harness';
import { chromeConfig, FakeLocation, siteProviders } from '../testing/site-chrome-fixture';
import { SiteShellComponent } from './site-shell.component';

class FakeLink {
  readonly attrs: Record<string, string> = {};

  setAttribute(name: string, value: string): void {
    this.attrs[name] = value;
  }
}

class FakeHead {
  readonly links: FakeLink[] = [];

  querySelector(selector: string): FakeLink | null {
    const rel = /\[rel="([^"]+)"\]/.exec(selector)?.[1];
    const hreflang = /\[hreflang="([^"]+)"\]/.exec(selector)?.[1];
    return (
      this.links.find(
        (l) =>
          l.attrs['rel'] === rel && (hreflang === undefined || l.attrs['hreflang'] === hreflang),
      ) ?? null
    );
  }

  appendChild(link: FakeLink): void {
    this.links.push(link);
  }
}

class Probe extends SiteShellComponent {
  get localeChoice(): boolean {
    return this.hasLocaleChoice;
  }
  get currentPath(): string {
    return this.path();
  }
}

function setup(options: { config?: SiteChromeConfig; path?: string; localeId?: string } = {}) {
  const head = new FakeHead();
  const location = new FakeLocation(options.path ?? '/pricing');
  const title = { setTitle: vi.fn() };
  const meta = { updateTag: vi.fn() };
  const harness = createHarness([
    ...siteProviders(options.config ?? chromeConfig(), location, options.localeId),
    { provide: Title, useValue: title },
    { provide: Meta, useValue: meta },
    {
      provide: DOCUMENT,
      useValue: { head, createElement: () => new FakeLink() },
    },
  ]);
  const shell = harness.create(() => new Probe());
  const tags = () => meta.updateTag.mock.calls.map(([tag]) => tag);
  const link = (rel: string, hreflang?: string) =>
    head.links.find((l) => l.attrs['rel'] === rel && l.attrs['hreflang'] === hreflang);
  return { shell, harness, head, location, title, meta, tags, link };
}

describe('SiteShellComponent', () => {
  describe('locale choice', () => {
    it('is offered with more than one enabled locale', () => {
      expect(setup().shell.localeChoice).toBe(true);
    });

    it('is not offered with a single locale', () => {
      expect(setup({ config: chromeConfig({ locales: ['en'] }) }).shell.localeChoice).toBe(false);
    });

    it('defaults to en and fr when locales are not configured', () => {
      expect(setup({ config: chromeConfig({ locales: undefined }) }).shell.localeChoice).toBe(true);
    });
  });

  describe('document head', () => {
    it('sets title and social title tags', () => {
      const { shell, harness, title, tags } = setup();
      setInput(shell.title, 'Pricing');
      harness.flush();
      expect(title.setTitle).toHaveBeenCalledWith('Pricing');
      expect(tags()).toContainEqual({ property: 'og:title', content: 'Pricing' });
      expect(tags()).toContainEqual({ name: 'twitter:title', content: 'Pricing' });
    });

    it('sets description tags', () => {
      const { shell, harness, tags } = setup();
      setInput(shell.description, 'About pricing');
      harness.flush();
      expect(tags()).toContainEqual({ name: 'description', content: 'About pricing' });
      expect(tags()).toContainEqual({ property: 'og:description', content: 'About pricing' });
      expect(tags()).toContainEqual({ name: 'twitter:description', content: 'About pricing' });
    });

    it('leaves title and description alone when empty', () => {
      const { harness, title, tags } = setup();
      harness.flush();
      expect(title.setTitle).not.toHaveBeenCalled();
      expect(tags().map((t) => t.property ?? t.name)).toEqual(['og:url']);
    });
  });

  describe('canonical url', () => {
    it('is the origin plus the localised path with a trailing slash', () => {
      const { harness, link, tags } = setup({ path: '/pricing' });
      harness.flush();
      expect(link('canonical')?.attrs['href']).toBe('https://site.test/pricing/');
      expect(tags()).toContainEqual({ property: 'og:url', content: 'https://site.test/pricing/' });
    });

    it('uses the locale prefix for non default locales', () => {
      const { harness, link } = setup({ path: '/fr/pricing', localeId: 'fr' });
      harness.flush();
      expect(link('canonical')?.attrs['href']).toBe('https://site.test/fr/pricing/');
    });

    it('ignores the query string and fragment', () => {
      const { harness, link } = setup({ path: '/pricing?ref=a#top' });
      harness.flush();
      expect(link('canonical')?.attrs['href']).toBe('https://site.test/pricing/');
    });

    it('is the bare origin for the root', () => {
      const { harness, link } = setup({ path: '' });
      harness.flush();
      expect(link('canonical')?.attrs['href']).toBe('https://site.test/');
    });

    it('prefers an explicit canonical input', () => {
      const { shell, harness, link, tags } = setup();
      setInput(shell.canonical, 'https://other.test/x');
      harness.flush();
      expect(link('canonical')?.attrs['href']).toBe('https://other.test/x');
      expect(tags()).toContainEqual({ property: 'og:url', content: 'https://other.test/x' });
    });

    it('updates the same link element when the path changes', () => {
      const { harness, head, location, link } = setup({ path: '/a' });
      harness.flush();
      location.navigate('/b');
      harness.flush();
      expect(head.links.filter((l) => l.attrs['rel'] === 'canonical')).toHaveLength(1);
      expect(link('canonical')?.attrs['href']).toBe('https://site.test/b/');
    });
  });

  describe('alternate links', () => {
    it('lists every locale plus x-default', () => {
      const { harness, link } = setup({ path: '/fr/pricing', localeId: 'fr' });
      harness.flush();
      expect(link('alternate', 'en')?.attrs['href']).toBe('https://site.test/pricing/');
      expect(link('alternate', 'fr')?.attrs['href']).toBe('https://site.test/fr/pricing/');
      expect(link('alternate', 'x-default')?.attrs['href']).toBe('https://site.test/pricing/');
    });

    it('is omitted with a single locale', () => {
      const { harness, head } = setup({ config: chromeConfig({ locales: ['en'] }) });
      harness.flush();
      expect(head.links.filter((l) => l.attrs['rel'] === 'alternate')).toHaveLength(0);
    });

    it('does not duplicate links across runs', () => {
      const { harness, head, location } = setup({ path: '/a' });
      harness.flush();
      location.navigate('/b');
      harness.flush();
      expect(head.links.filter((l) => l.attrs['rel'] === 'alternate')).toHaveLength(3);
    });
  });

  it('tracks the current path', () => {
    const { shell, location } = setup({ path: '/a' });
    expect(shell.currentPath).toBe('/a');
    location.navigate('/b');
    expect(shell.currentPath).toBe('/b');
  });
});
