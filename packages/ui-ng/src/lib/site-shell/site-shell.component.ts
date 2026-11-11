import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  LOCALE_ID,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { SiteNavbarComponent } from '../site-navbar/site-navbar.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { SiteLocaleBannerComponent } from '../site-locale-banner/site-locale-banner.component';
import {
  DEFAULT_LOCALE,
  SITE_CHROME,
  siteLocales,
  localeSwitchHref,
  resolveSiteLocale,
} from '../site-chrome/site-chrome.model';
import { injectSitePath } from '../site-chrome/site-path';

@Component({
  selector: 'flr-site-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteLocaleBannerComponent, SiteNavbarComponent, SiteFooterComponent],
  template: `
    <flr-site-navbar />
    <main><ng-content /></main>
    <flr-site-footer />
    @if (hasLocaleChoice) {
      <flr-site-locale-banner [path]="path()" />
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
    }
    main {
      flex: 1 0 auto;
    }
  `,
})
export class SiteShellComponent {
  readonly title = input('');
  readonly description = input('');
  readonly canonical = input<string | null>(null);

  private readonly chrome = inject(SITE_CHROME);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly locale = resolveSiteLocale(this.chrome, inject(LOCALE_ID));

  protected readonly hasLocaleChoice = siteLocales(this.chrome).length > 1;
  protected readonly path = injectSitePath();

  constructor() {
    effect(() => {
      const title = this.title();
      const description = this.description();
      const path = this.path().split(/[?#]/)[0] || '/';
      const canonical =
        this.canonical() ??
        `${this.chrome.origin}${localeSwitchHref(this.locale, path, siteLocales(this.chrome))}`;

      if (title) {
        this.titleService.setTitle(title);
        this.meta.updateTag({ property: 'og:title', content: title });
        this.meta.updateTag({ name: 'twitter:title', content: title });
      }
      if (description) {
        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({ property: 'og:description', content: description });
        this.meta.updateTag({ name: 'twitter:description', content: description });
      }
      this.setLink('canonical', canonical);
      this.meta.updateTag({ property: 'og:url', content: canonical });
      this.setAlternates(path);
    });
  }

  private setAlternates(barePath: string): void {
    const locales = siteLocales(this.chrome);
    if (locales.length < 2) {
      return;
    }

    for (const locale of locales) {
      const href = `${this.chrome.origin}${localeSwitchHref(locale, barePath, locales)}`;
      this.setLink('alternate', href, locale);
    }
    const def = `${this.chrome.origin}${localeSwitchHref(DEFAULT_LOCALE, barePath, locales)}`;
    this.setLink('alternate', def, 'x-default');
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const head = this.document.head;
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
    let link = head.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      if (hreflang) link.setAttribute('hreflang', hreflang);
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }
}
