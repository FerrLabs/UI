import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

export type SiteLocale = 'en' | 'fr';

export interface SiteNavLink {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

export interface SiteFooterLink {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}

export interface SiteFooterColumn {
  readonly title: string;
  readonly links: readonly SiteFooterLink[];
}

export interface SiteCta {
  readonly label: string;
  readonly href: string;
}

export interface SiteFooterConfig {
  readonly tagline: string;
  readonly backLabel: string;
  readonly backHref: string;
  readonly columns: readonly SiteFooterColumn[];
  readonly bottomLeft: string;
  readonly bottomRight: string;
}

export interface SiteChromeLabels {
  readonly menu: string;
  readonly close: string;
  readonly openMenu: string;
}

export interface SiteChromeConfig {
  readonly locale: SiteLocale;
  readonly origin: string;
  readonly logoSvg: string;
  readonly wordmark: string;
  readonly wordmarkAccent?: string;
  readonly navLinks: readonly SiteNavLink[];
  readonly cta?: SiteCta | null;
  readonly footer: SiteFooterConfig;
  readonly labels: SiteChromeLabels;
}

export const SITE_LOCALES: readonly SiteLocale[] = ['en', 'fr'];

export const SITE_CHROME = new InjectionToken<SiteChromeConfig>('SITE_CHROME');

export function provideSiteChrome(config: SiteChromeConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: SITE_CHROME, useValue: config }]);
}

export function localeBase(locale: SiteLocale): string {
  return locale === 'fr' ? '/fr' : '';
}

function isAbsolute(href: string): boolean {
  return /^[a-z]+:/i.test(href) || href.startsWith('//') || href.startsWith('#');
}

export function withLocaleBase(locale: SiteLocale, href: string): string {
  if (isAbsolute(href)) return href;
  const base = localeBase(locale);
  if (href === '/') return base ? `${base}/` : '/';
  return `${base}${href}`;
}

export function localeSwitchHref(target: SiteLocale, barePath: string): string {
  const base = localeBase(target);
  const path = barePath && barePath !== '' ? barePath : '/';
  if (path === '/') return base ? `${base}/` : '/';
  return `${base}${path}`;
}
