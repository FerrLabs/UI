import { ChangeDetectionStrategy, Component, inject, LOCALE_ID } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { SITE_CHROME, resolveLocale, withLocaleBase } from '../site-chrome/site-chrome.model';

@Component({
  selector: 'flr-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <div class="footer__brand-row" translate="no">
              <span class="footer__logo" [innerHTML]="logo"></span>
              <!-- prettier-ignore -->
              <span class="footer__wordmark">{{ wordmark }}@if (wordmarkAccent) {<span class="footer__wordmark-accent">{{ wordmarkAccent }}</span>}</span>
            </div>
            <p class="footer__colophon">{{ footer.tagline }}</p>
            <a [href]="footer.backHref" class="mono footer__back">{{ footer.backLabel }}</a>
          </div>

          <div class="footer__cols">
            @for (col of columns; track col.title) {
              <div>
                <div class="mono footer__col-title">{{ col.title }}</div>
                <ul class="footer__col-list">
                  @for (link of col.links; track link.href) {
                    <li>
                      @if (link.external) {
                        <a
                          [href]="link.href"
                          class="footer__link"
                          target="_blank"
                          rel="noreferrer"
                          >{{ link.label }}</a
                        >
                      } @else {
                        <a [href]="link.href" class="footer__link">{{ link.label }}</a>
                      }
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>

        <div class="footer__bottom">
          <span class="mono footer__bottom-text">{{ footer.bottomLeft }}</span>
          <span class="mono footer__bottom-text">{{ footer.bottomRight }}</span>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      padding: 96px 0 48px;
      border-top: 1px solid var(--paper-rule);
      background: var(--paper);
      color: var(--paper-ink);
    }
    .footer__grid {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 2fr);
      gap: 64px;
    }
    .footer__brand-row {
      display: flex;
      align-items: center;
      gap: 14px;
      color: var(--accent);
    }
    .footer__logo ::ng-deep svg {
      display: block;
      width: 36px;
      height: 36px;
    }
    .footer__wordmark {
      font-family: var(--font-display);
      font-weight: 900;
      font-size: 36px;
      letter-spacing: -0.03em;
      color: var(--paper-ink);
    }
    .footer__wordmark-accent {
      color: var(--accent);
    }
    .footer__colophon {
      font-family: var(--font-display);
      font-style: italic;
      font-size: 18px;
      line-height: 1.5;
      color: var(--paper-ink-2);
      margin: 24px 0 0;
      max-width: 380px;
    }
    .footer__back {
      display: inline-block;
      margin-top: 24px;
      font-size: 12px;
      letter-spacing: 0.06em;
      color: var(--paper-ink-2);
      text-decoration: none;
      transition: color 160ms ease;
    }
    .footer__back:hover {
      color: var(--accent);
    }
    .footer__cols {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .footer__col-title {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--paper-ink-3);
      margin-bottom: 16px;
    }
    .footer__col-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .footer__link {
      font-size: 14px;
      color: var(--paper-ink-2);
      text-decoration: none;
      transition: color 160ms ease;
    }
    .footer__link:hover {
      color: var(--paper-ink);
    }
    .footer__bottom {
      margin-top: 80px;
      padding-top: 24px;
      border-top: 1px solid var(--paper-rule);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer__bottom-text {
      font-size: 11px;
      letter-spacing: 0.06em;
      color: var(--paper-ink-3);
    }
    @media (max-width: 880px) {
      .footer__grid {
        grid-template-columns: 1fr;
        gap: 48px;
      }
      .footer__cols {
        grid-template-columns: 1fr 1fr;
      }
    }
  `,
})
export class SiteFooterComponent {
  private readonly chrome = inject(SITE_CHROME);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly logo: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(this.chrome.logoSvg);
  protected readonly wordmark = this.chrome.wordmark;
  protected readonly wordmarkAccent = this.chrome.wordmarkAccent ?? '';

  private readonly locale = resolveLocale(inject(LOCALE_ID));

  protected readonly footer = this.chrome.footer;
  protected readonly columns = this.chrome.footer.columns.map((col) => ({
    title: col.title,
    links: col.links.map((link) => ({
      label: link.label,
      href: link.external ? link.href : withLocaleBase(this.locale, link.href),
      external: link.external ?? false,
    })),
  }));
}
