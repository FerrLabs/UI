import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

export interface LocaleSuggestionStrings {
  readonly label: string;
  readonly message: string;
  readonly read: string;
  readonly stay: string;
}

export interface LocaleEntry {
  readonly code: string;
  readonly endonym: string;
  readonly language: string;
  readonly suggestion: LocaleSuggestionStrings;
}

export const LOCALE_CATALOG = [
  {
    code: 'en',
    endonym: 'English',
    language: 'Language',
    suggestion: {
      label: 'Language suggestion',
      message: 'This page is also available in English.',
      read: 'Read in English',
      stay: 'Stay in English',
    },
  },
  {
    code: 'fr',
    endonym: 'Français',
    language: 'Langue',
    suggestion: {
      label: 'Suggestion de langue',
      message: 'Cette page est aussi disponible en français.',
      read: 'Lire en français',
      stay: 'Rester en français',
    },
  },
  {
    code: 'de',
    endonym: 'Deutsch',
    language: 'Sprache',
    suggestion: {
      label: 'Sprachvorschlag',
      message: 'Diese Seite ist auch auf Deutsch verfügbar.',
      read: 'Auf Deutsch lesen',
      stay: 'Auf Deutsch bleiben',
    },
  },
  {
    code: 'es',
    endonym: 'Español',
    language: 'Idioma',
    suggestion: {
      label: 'Sugerencia de idioma',
      message: 'Esta página también está disponible en español.',
      read: 'Leer en español',
      stay: 'Seguir en español',
    },
  },
  {
    code: 'it',
    endonym: 'Italiano',
    language: 'Lingua',
    suggestion: {
      label: 'Suggerimento lingua',
      message: 'Questa pagina è disponibile anche in italiano.',
      read: 'Leggi in italiano',
      stay: 'Resta in italiano',
    },
  },
  {
    code: 'pt',
    endonym: 'Português',
    language: 'Idioma',
    suggestion: {
      label: 'Sugestão de idioma',
      message: 'Esta página também está disponível em português.',
      read: 'Ler em português',
      stay: 'Continuar em português',
    },
  },
  {
    code: 'nl',
    endonym: 'Nederlands',
    language: 'Taal',
    suggestion: {
      label: 'Taalsuggestie',
      message: 'Deze pagina is ook beschikbaar in het Nederlands.',
      read: 'Lees in het Nederlands',
      stay: 'Blijf in het Nederlands',
    },
  },
  {
    code: 'ja',
    endonym: '日本語',
    language: '言語',
    suggestion: {
      label: '言語の提案',
      message: 'このページは日本語でもご覧いただけます。',
      read: '日本語で読む',
      stay: '日本語のまま閲覧する',
    },
  },
] as const satisfies readonly LocaleEntry[];

export type SiteLocale = (typeof LOCALE_CATALOG)[number]['code'];

export const DEFAULT_LOCALE: SiteLocale = 'en';

export const ALL_SITE_LOCALES: readonly SiteLocale[] = LOCALE_CATALOG.map((entry) => entry.code);

export function isSiteLocale(code: string): code is SiteLocale {
  return (ALL_SITE_LOCALES as readonly string[]).includes(code);
}

export function localeEntry(locale: SiteLocale): LocaleEntry {
  return LOCALE_CATALOG.find((entry) => entry.code === locale) ?? LOCALE_CATALOG[0];
}

export function matchSiteLocale(languageTag: string | null | undefined): SiteLocale | null {
  const primary = languageTag?.toLowerCase().split(/[-_]/)[0] ?? '';
  return isSiteLocale(primary) ? primary : null;
}

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
  readonly language?: string;
}

export interface SiteChromeConfig {
  /**
   * @deprecated The active locale is read from Angular's `LOCALE_ID` at runtime;
   * this field is ignored. Kept optional for backward compatibility.
   */
  readonly locale?: SiteLocale;
  readonly origin: string;
  readonly logoSvg: string;
  readonly wordmark: string;
  readonly wordmarkAccent?: string;
  readonly locales?: readonly SiteLocale[];
  readonly navLinks: readonly SiteNavLink[];
  readonly cta?: SiteCta | null;
  readonly footer: SiteFooterConfig;
  readonly labels: SiteChromeLabels;
}

export const SITE_LOCALES: readonly SiteLocale[] = ['en', 'fr'];

export function siteLocales(config: SiteChromeConfig): readonly SiteLocale[] {
  const locales = config.locales;
  return locales && locales.length > 0 ? locales : SITE_LOCALES;
}

export const SITE_CHROME = new InjectionToken<SiteChromeConfig>('SITE_CHROME');

export function provideSiteChrome(
  config: SiteChromeConfig | (() => SiteChromeConfig),
): EnvironmentProviders {
  const factory = typeof config === 'function' ? config : () => config;
  return makeEnvironmentProviders([{ provide: SITE_CHROME, useFactory: factory }]);
}

export function localeBase(locale: SiteLocale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

function localePrefix(locales: readonly SiteLocale[]): RegExp | null {
  const codes = locales.filter((code) => code !== DEFAULT_LOCALE);
  return codes.length > 0 ? new RegExp(`^/(?:${codes.join('|')})(?=[/?#]|$)`) : null;
}

function isAbsolute(href: string): boolean {
  return /^[a-z]+:/i.test(href) || href.startsWith('//') || href.startsWith('#');
}

export function withTrailingSlash(href: string): string {
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const suffix = cut === -1 ? '' : href.slice(cut);
  const lastSegment = path.slice(path.lastIndexOf('/') + 1);
  if (isAbsolute(href) || path === '' || path.endsWith('/') || lastSegment.includes('.')) {
    return href;
  }
  return `${path}/${suffix}`;
}

export function withLocaleBase(locale: SiteLocale, href: string): string {
  if (isAbsolute(href)) return href;
  const base = localeBase(locale);
  if (href === '/') return base ? `${base}/` : '/';
  return `${base}${href}`;
}

function rooted(path: string): string {
  return path.replace(/^[/\\]*/, '/');
}

export function stripLocalePrefix(
  path: string,
  locales: readonly SiteLocale[] = SITE_LOCALES,
): string {
  const full = rooted(path);
  const match = localePrefix(locales)?.exec(full);
  return rooted(match ? full.slice(match[0].length) : full);
}

export function localeSwitchHref(
  target: SiteLocale,
  path: string,
  locales: readonly SiteLocale[] = SITE_LOCALES,
): string {
  const bare = stripLocalePrefix(path, locales);
  const base = localeBase(target);
  const cut = bare.search(/[?#]/);
  const pathname = cut === -1 ? bare : bare.slice(0, cut);
  if (pathname === '/') return `${base}${bare}`;
  return withTrailingSlash(`${base}${bare}`);
}

export function resolveLocale(localeId: string | null | undefined): SiteLocale {
  return matchSiteLocale(localeId) ?? DEFAULT_LOCALE;
}

export function resolveSiteLocale(
  config: SiteChromeConfig,
  localeId: string | null | undefined,
): SiteLocale {
  const enabled = siteLocales(config);
  const locale = resolveLocale(localeId);
  if (enabled.includes(locale)) return locale;
  return enabled.includes(DEFAULT_LOCALE) ? DEFAULT_LOCALE : enabled[0];
}
