import { localeEntry, localeSwitchHref, type SiteLocale } from '../site-chrome/site-chrome.model';

export interface SiteLocaleOption {
  readonly code: SiteLocale;
  readonly endonym: string;
  readonly href: string;
}

export function toLocaleOptions(
  locales: readonly SiteLocale[],
  path: string,
): readonly SiteLocaleOption[] {
  return locales.map((code) => ({
    code,
    endonym: localeEntry(code).endonym,
    href: localeSwitchHref(code, path),
  }));
}
