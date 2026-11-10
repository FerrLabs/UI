import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  signal,
} from '@angular/core';
import {
  localeEntry,
  localeSwitchHref,
  matchSiteLocale,
  resolveLocale,
  SITE_CHROME,
  siteLocales,
  type SiteLocale,
} from '../site-chrome/site-chrome.model';

const DISMISSED_KEY = 'flr:locale-banner-dismissed';

export function suggestedLocale(
  languages: readonly string[],
  enabled: readonly SiteLocale[],
  current: SiteLocale,
): SiteLocale | null {
  for (const language of languages) {
    const match = matchSiteLocale(language);
    if (match && enabled.includes(match)) {
      return match === current ? null : match;
    }
  }
  return null;
}

function readDismissed(): string | null {
  try {
    return localStorage.getItem(DISMISSED_KEY);
  } catch {
    return null;
  }
}

function writeDismissed(locale: SiteLocale): void {
  try {
    localStorage.setItem(DISMISSED_KEY, locale);
  } catch {
    return;
  }
}

@Component({
  selector: 'flr-site-locale-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (view(); as v) {
      <div class="banner" role="region" [attr.aria-label]="v.target.label" [attr.lang]="v.code">
        <p class="banner__text">{{ v.target.message }}</p>
        <a class="banner__action" [href]="v.href" [attr.hreflang]="v.code">{{ v.target.read }}</a>
        <button
          type="button"
          class="banner__dismiss"
          [attr.lang]="current"
          (click)="dismiss(v.code)"
        >
          {{ stayLabel }}
        </button>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    .banner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 6px 16px;
      padding: 8px 20px;
      background: var(--color-paper-2, rgba(30, 41, 59, 0.04));
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      color: var(--color-ink-2, #475569);
      font-size: 13px;
    }
    .banner__text {
      margin: 0;
    }
    .banner__action {
      color: var(--accent, #1e293b);
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .banner__dismiss {
      border: 0;
      background: transparent;
      padding: 0;
      color: var(--color-ink-3, #64748b);
      font: inherit;
      cursor: pointer;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .banner__action:hover,
    .banner__dismiss:hover {
      color: var(--color-ink, #1e293b);
    }
    .banner__action:focus-visible,
    .banner__dismiss:focus-visible {
      outline: 2px solid var(--accent, #1e293b);
      outline-offset: 2px;
    }
  `,
})
export class SiteLocaleBannerComponent {
  readonly path = input.required<string>();

  private readonly enabled = siteLocales(inject(SITE_CHROME));

  protected readonly current = resolveLocale(inject(LOCALE_ID));
  protected readonly stayLabel = localeEntry(this.current).suggestion.stay;

  private readonly suggestion = signal<SiteLocale | null>(null);

  protected readonly view = computed(() => {
    const code = this.suggestion();
    if (!code) return null;
    return {
      code,
      target: localeEntry(code).suggestion,
      href: localeSwitchHref(code, this.path()),
    };
  });

  constructor() {
    afterNextRender(() => {
      const target = suggestedLocale(navigator.languages, this.enabled, this.current);
      if (target && readDismissed() !== target) {
        this.suggestion.set(target);
      }
    });
  }

  protected dismiss(code: SiteLocale): void {
    writeDismissed(code);
    this.suggestion.set(null);
  }
}
