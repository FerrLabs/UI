import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, signal } from '@angular/core';
import { Location } from '@angular/common';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import {
  SITE_CHROME,
  type SiteLocale,
  localeSwitchHref,
  siteLocales,
  resolveLocale,
  withLocaleBase,
} from '../site-chrome/site-chrome.model';

@Component({
  selector: 'flr-site-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:scroll)': 'onScroll()',
  },
  template: `
    <header class="nav" [class.nav--scrolled]="scrolled()">
      <div class="nav__container">
        <a [href]="homeHref" class="nav__brand" translate="no">
          <span class="nav__logo" [innerHTML]="logo"></span>
          <!-- prettier-ignore -->
          <span class="nav__wordmark">{{ wordmark }}@if (wordmarkAccent) {<span class="nav__wordmark-accent">{{ wordmarkAccent }}</span>}</span>
        </a>

        <nav class="nav__desktop">
          @for (link of links; track link.href) {
            @if (link.external) {
              <a [href]="link.href" target="_blank" rel="noreferrer" class="nav__link mono">{{
                link.label
              }}</a>
            } @else {
              <a [href]="link.href" class="nav__link mono">{{ link.label }}</a>
            }
          }

          @if (locales.length > 1) {
            <div class="nav__lang mono" translate="no">
              @for (option of locales; track option) {
                <a
                  [href]="langHref(option)"
                  class="nav__lang-opt"
                  [class.is-active]="locale === option"
                  >{{ option.toUpperCase() }}</a
                >
              }
            </div>
          }

          @if (cta) {
            <a [href]="cta.href" class="nav__cta mono"
              >{{ cta.label }}<span aria-hidden="true">→</span></a
            >
          }
        </nav>

        <button
          class="nav__toggle mono"
          type="button"
          [attr.aria-label]="labels.openMenu"
          (click)="mobileOpen.set(true)"
        >
          {{ labels.menu }}
        </button>
      </div>

      @if (mobileOpen()) {
        <div class="nav__mobile">
          <div class="nav__container nav__mobile-bar">
            <a [href]="homeHref" class="nav__brand" translate="no">
              <span class="nav__logo" [innerHTML]="logo"></span>
              <!-- prettier-ignore -->
              <span class="nav__wordmark">{{ wordmark }}@if (wordmarkAccent) {<span class="nav__wordmark-accent">{{ wordmarkAccent }}</span>}</span>
            </a>
            <button class="nav__toggle mono" type="button" (click)="mobileOpen.set(false)">
              {{ labels.close }}
            </button>
          </div>
          <div class="nav__container nav__mobile-list">
            @for (link of links; track link.href; let i = $index) {
              <a [href]="link.href" class="nav__mobile-link" (click)="mobileOpen.set(false)">
                <span class="mono">{{ pad(i + 1) }}</span
                >{{ link.label }}
              </a>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .nav {
      background: rgba(250, 248, 244, 0.65);
      -webkit-backdrop-filter: saturate(140%) blur(14px);
      backdrop-filter: saturate(140%) blur(14px);
      border-bottom: 1px solid transparent;
      transition:
        background 200ms ease,
        border-color 200ms ease;
    }
    .nav--scrolled {
      background: rgba(250, 248, 244, 0.85);
      border-bottom-color: var(--color-rule, rgba(30, 41, 59, 0.14));
    }
    .nav__container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 40px;
      display: flex;
      align-items: center;
      height: 72px;
      gap: 24px;
    }
    @media (max-width: 768px) {
      .nav__container {
        padding: 0 20px;
      }
    }
    .nav__brand {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--accent, #1e293b);
      letter-spacing: -0.01em;
      text-decoration: none;
    }
    .nav__logo {
      display: inline-flex;
      line-height: 0;
    }
    .nav__logo ::ng-deep svg {
      display: block;
      width: 28px;
      height: 28px;
    }
    .nav__wordmark {
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-weight: 900;
      font-size: 22px;
      letter-spacing: -0.02em;
      color: var(--color-ink, #1e293b);
    }
    .nav__wordmark-accent {
      color: var(--accent, #1e293b);
    }
    .nav__desktop {
      display: flex;
      align-items: center;
      gap: 28px;
      margin-left: auto;
    }
    .nav__link {
      font-size: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--color-ink-2, #475569);
      position: relative;
      padding: 6px 0;
      text-decoration: none;
    }
    .nav__link::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: -2px;
      height: 1px;
      background: var(--accent, #1e293b);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 220ms ease;
    }
    .nav__link:hover::after {
      transform: scaleX(1);
    }
    .nav__lang {
      display: flex;
      align-items: center;
      border: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      border-radius: 999px;
      overflow: hidden;
    }
    .nav__lang-opt {
      font-family: var(
        --font-mono,
        'DM Mono',
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Consolas,
        monospace
      );
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 12px;
      color: var(--color-ink-2, #475569);
      text-decoration: none;
      transition:
        background 180ms,
        color 180ms;
    }
    .nav__lang-opt.is-active {
      background: var(--color-ink, #1e293b);
      color: var(--color-paper, #faf8f4);
    }
    .nav__cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 10px 16px;
      border-radius: 999px;
      background: var(--accent, #1e293b);
      color: #fff;
      text-decoration: none;
      transition:
        transform 180ms,
        opacity 180ms;
    }
    .nav__cta:hover {
      transform: translateY(-1px);
      opacity: 0.92;
    }
    .nav__toggle {
      display: none;
      margin-left: auto;
      border: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      border-radius: 999px;
      background: transparent;
      color: var(--color-ink, #1e293b);
      padding: 8px 14px;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
    }
    @media (max-width: 880px) {
      .nav__desktop {
        display: none;
      }
      .nav__toggle {
        display: inline-flex;
      }
    }
    .nav__mobile {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: var(--color-paper, #faf8f4);
    }
    .nav__mobile-bar {
      justify-content: space-between;
    }
    .nav__mobile-list {
      flex-direction: column;
      align-items: stretch;
      height: auto;
      padding-top: 40px;
      padding-bottom: 40px;
      gap: 0;
    }
    .nav__mobile-link {
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-weight: 700;
      font-size: clamp(40px, 9vw, 72px);
      letter-spacing: -0.03em;
      line-height: 1.04;
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      padding: 20px 0;
      color: var(--color-ink, #1e293b);
      display: flex;
      align-items: baseline;
      gap: 16px;
      text-decoration: none;
    }
    .nav__mobile-link .mono {
      font-size: 12px;
      color: var(--color-ink-3, #64748b);
      letter-spacing: 0.1em;
      font-weight: 400;
    }
  `,
})
export class SiteNavbarComponent {
  private readonly chrome = inject(SITE_CHROME);
  private readonly location = inject(Location);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly logo: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(this.chrome.logoSvg);
  protected readonly locale: SiteLocale = resolveLocale(inject(LOCALE_ID));
  protected readonly wordmark = this.chrome.wordmark;
  protected readonly wordmarkAccent = this.chrome.wordmarkAccent ?? '';
  protected readonly labels = this.chrome.labels;

  protected readonly homeHref = withLocaleBase(this.locale, '/');
  protected readonly links = this.chrome.navLinks.map((link) => ({
    label: link.label,
    href: withLocaleBase(this.locale, link.href),
    external: link.external ?? false,
  }));
  protected readonly cta = this.chrome.cta
    ? { label: this.chrome.cta.label, href: withLocaleBase(this.locale, this.chrome.cta.href) }
    : null;

  protected readonly scrolled = signal(false);
  protected readonly mobileOpen = signal(false);

  protected readonly locales = siteLocales(this.chrome);

  protected langHref(target: SiteLocale): string {
    return localeSwitchHref(target, this.location.path() || '/');
  }

  protected onScroll(): void {
    this.scrolled.set(typeof window !== 'undefined' && window.scrollY > 8);
  }

  protected pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
