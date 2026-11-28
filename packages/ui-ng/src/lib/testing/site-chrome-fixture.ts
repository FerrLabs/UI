import { LOCALE_ID, type Provider } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { SITE_CHROME, type SiteChromeConfig } from '../site-chrome/site-chrome.model';

export const SVG_LOGO = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';

export function chromeConfig(over: Partial<SiteChromeConfig> = {}): SiteChromeConfig {
  return {
    origin: 'https://site.test',
    logoSvg: SVG_LOGO,
    wordmark: 'Ferr',
    wordmarkAccent: 'Labs',
    locales: ['en', 'fr'],
    navLinks: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Docs', href: 'https://docs.test/start' },
      { label: 'Home', href: '/' },
    ],
    cta: { label: 'Start', href: '/signup' },
    footer: {
      tagline: 'tag',
      backLabel: 'Back',
      backHref: '/',
      columns: [
        {
          title: 'Product',
          links: [
            { label: 'Changelog', href: '/changelog' },
            { label: 'Status', href: 'https://status.test', external: true },
            { label: 'Feed', href: '/feed.xml' },
          ],
        },
      ],
      bottomLeft: 'left',
    },
    labels: { menu: 'Menu', close: 'Close', openMenu: 'Open menu' },
    ...over,
  };
}

export const trustedHtml = (markup: string): SafeHtml =>
  ({ trusted: markup }) as unknown as SafeHtml;

export class FakeLocation {
  private listeners: (() => void)[] = [];

  constructor(public current = '') {}

  path(): string {
    return this.current;
  }

  onUrlChange(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  get listenerCount(): number {
    return this.listeners.length;
  }

  navigate(path: string): void {
    this.current = path;
    this.listeners.forEach((l) => l());
  }
}

export function siteProviders(
  config: SiteChromeConfig,
  location: FakeLocation,
  localeId = 'en',
): Provider[] {
  return [
    { provide: SITE_CHROME, useValue: config },
    { provide: LOCALE_ID, useValue: localeId },
    { provide: Location, useValue: location },
    { provide: DomSanitizer, useValue: { bypassSecurityTrustHtml: trustedHtml } },
  ];
}
