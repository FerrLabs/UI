import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  LOCALE_ID,
} from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { SiteNavbarComponent } from '../site-navbar/site-navbar.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import {
  SITE_CHROME,
  siteLocales,
  localeSwitchHref,
  resolveLocale,
} from '../site-chrome/site-chrome.model';

@Component({
  selector: 'flr-site-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SiteNavbarComponent, SiteFooterComponent],
  template: `
    <flr-site-navbar />
    <main><ng-content /></main>
    <flr-site-footer />
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
  private readonly location = inject(Location);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly locale = resolveLocale(inject(LOCALE_ID));

  constructor() {
    effect(() => {
      const title = this.title();
      const description = this.description();
      const path = this.location.path() || '/';
      const canonical =
        this.canonical() ?? `${this.chrome.origin}${localeSwitchHref(this.locale, path)}`;

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

  // A site that ships one locale gets no alternates at all: `hreflang` pointing
  // at a translation nobody built is a worse promise than the visible switcher,
  // because a crawler follows it.
  private setAlternates(barePath: string): void {
    const locales = siteLocales(this.chrome);
    if (locales.length < 2) {
      return;
    }

    for (const locale of locales) {
      const href = `${this.chrome.origin}${localeSwitchHref(locale, barePath)}`;
      this.setLink('alternate', href, locale);
    }
    const def = `${this.chrome.origin}${localeSwitchHref('en', barePath)}`;
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
