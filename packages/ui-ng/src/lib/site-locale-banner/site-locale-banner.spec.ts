import { describe, expect, it } from 'vitest';
import type { SiteLocale } from '../site-chrome/site-chrome.model';
import { suggestedLocale } from './site-locale-banner.component';

describe('suggestedLocale', () => {
  const all: readonly SiteLocale[] = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'ja'];

  const cases: readonly [
    string,
    readonly string[],
    readonly SiteLocale[],
    SiteLocale,
    SiteLocale | null,
  ][] = [
    ['first supported language wins', ['de-CH', 'fr'], all, 'en', 'de'],
    ['skips unknown tags', ['xx', 'ja_JP'], all, 'en', 'ja'],
    ['skips disabled locales', ['de', 'fr'], ['en', 'fr'], 'en', 'fr'],
    ['current locale stops the search', ['fr', 'de'], all, 'fr', null],
    ['current locale as regional variant', ['fr-CA', 'de'], all, 'fr', null],
    ['nothing supported', ['zh-CN', 'ko'], all, 'en', null],
    ['only disabled locales', ['de', 'ja'], ['en', 'fr'], 'en', null],
    ['no languages', [], all, 'en', null],
  ];

  it.each(cases)('%s', (_name, languages, enabled, current, expected) => {
    expect(suggestedLocale(languages, enabled, current)).toBe(expected);
  });
});
