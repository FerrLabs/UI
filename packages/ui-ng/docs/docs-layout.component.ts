import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DocSection, DocVersion, DocsLang } from './docs-types';

interface TocEntry {
  readonly id: string;
  readonly text: string;
  readonly level: number;
}

interface SiblingLink {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'flr-docs-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs">
      <button
        class="docs__sidebar-toggle mono"
        type="button"
        (click)="sidebarOpen.set(!sidebarOpen())"
      >
        {{ sidebarLabel() }}
      </button>

      <aside class="docs__sidebar" [class.is-open]="sidebarOpen()">
        @if (versions().length) {
          <div class="docs__versions mono" translate="no">
            <label class="docs__versions-label" for="flr-docs-version">{{ versionLabel() }}</label>
            <select
              id="flr-docs-version"
              class="docs__version-select"
              (change)="onVersionChange($event)"
            >
              @for (v of versions(); track v.slug) {
                <option [value]="versionHref(v.slug)" [selected]="v.slug === version()">
                  {{ v.label }}
                </option>
              }
            </select>
          </div>
        }

        <nav class="docs__nav" [attr.aria-label]="navLabel">
          @for (section of nav(); track section.label) {
            <details class="docs__section" [open]="sectionIsOpen(section)">
              <summary class="mono docs__section-label">{{ section.label }}</summary>
              <ul class="docs__section-list">
                @for (item of section.items; track item.slug) {
                  <li>
                    <a
                      [href]="docHref(item.slug)"
                      class="docs__link"
                      [class.is-active]="item.slug === slug()"
                      (click)="sidebarOpen.set(false)"
                      >{{ item.label }}</a
                    >
                  </li>
                }
              </ul>
            </details>
          }
        </nav>
      </aside>

      <main class="docs__main">
        <article #content class="ferr-prose docs__prose">
          <ng-content />
        </article>

        <nav class="docs__pager" [attr.aria-label]="pagerLabel">
          @if (prev(); as p) {
            <a [href]="p.href" class="docs__pager-link docs__pager-link--prev">
              <span class="mono docs__pager-dir">{{ prevLabel() }}</span>
              <span class="docs__pager-title">{{ p.label }}</span>
            </a>
          } @else {
            <span></span>
          }
          @if (next(); as n) {
            <a [href]="n.href" class="docs__pager-link docs__pager-link--next">
              <span class="mono docs__pager-dir">{{ nextLabel() }}</span>
              <span class="docs__pager-title">{{ n.label }}</span>
            </a>
          }
        </nav>
      </main>

      <aside class="docs__toc">
        @if (toc().length) {
          <div class="mono docs__toc-label">{{ tocLabel() }}</div>
          <ul class="docs__toc-list">
            @for (entry of toc(); track entry.id) {
              <li [class.docs__toc-item--sub]="entry.level === 3">
                <a [href]="pagePath() + '#' + entry.id" class="docs__toc-link">{{ entry.text }}</a>
              </li>
            }
          </ul>
        }
      </aside>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .docs {
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr) 220px;
      gap: 48px;
      max-width: 1440px;
      margin: 0 auto;
      padding: 48px 40px 96px;
      align-items: start;
    }
    .docs__sidebar-toggle {
      display: none;
      grid-column: 1 / -1;
      justify-self: start;
      border: 1px solid var(--paper-rule);
      border-radius: 999px;
      background: transparent;
      color: var(--paper-ink);
      padding: 8px 16px;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .docs__sidebar {
      position: sticky;
      top: 96px;
      align-self: start;
      max-height: calc(100dvh - 120px);
      overflow-y: auto;
      padding-right: 8px;
    }
    .docs__versions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
    }
    .docs__versions-label {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--paper-ink-3);
    }
    .docs__version-select {
      flex: 1;
      appearance: none;
      -webkit-appearance: none;
      font: inherit;
      font-size: 12px;
      letter-spacing: 0.04em;
      color: var(--paper-ink);
      background-color: transparent;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
      background-repeat: no-repeat;
      background-position: right 10px center;
      border: 1px solid var(--paper-rule);
      border-radius: 8px;
      padding: 7px 30px 7px 12px;
      cursor: pointer;
      transition:
        border-color 160ms ease,
        color 160ms ease;
    }
    .docs__version-select:hover,
    .docs__version-select:focus-visible {
      border-color: var(--accent);
      color: var(--accent);
      outline: none;
    }
    .docs__section {
      margin-bottom: 4px;
    }
    .docs__section[open] {
      margin-bottom: 20px;
    }
    .docs__section-label {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--paper-ink-3);
      cursor: pointer;
      list-style: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 4px 0;
      user-select: none;
    }
    .docs__section[open] > .docs__section-label {
      margin-bottom: 12px;
    }
    .docs__section-label::-webkit-details-marker {
      display: none;
    }
    .docs__section-label::after {
      content: '';
      width: 6px;
      height: 6px;
      border-right: 1.5px solid currentColor;
      border-bottom: 1.5px solid currentColor;
      transform: rotate(45deg) translate(-2px, -2px);
      transition: transform 120ms ease;
      flex: none;
      opacity: 0.7;
    }
    .docs__section[open] > .docs__section-label::after {
      transform: rotate(-135deg) translate(-2px, -2px);
    }
    .docs__section-label:hover {
      color: var(--paper-ink-2);
    }
    .docs__section-label:focus-visible {
      outline: 2px solid var(--paper-accent, currentColor);
      outline-offset: 2px;
      border-radius: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .docs__section-label::after {
        transition: none;
      }
    }
    .docs__section-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .docs__link {
      display: block;
      font-size: 14px;
      line-height: 1.4;
      padding: 5px 12px;
      border-left: 2px solid transparent;
      color: var(--paper-ink-2);
      text-decoration: none;
      transition:
        color 160ms ease,
        border-color 160ms ease,
        background 160ms ease;
    }
    .docs__link:hover {
      color: var(--paper-ink);
    }
    .docs__link.is-active {
      color: var(--accent);
      border-left-color: var(--accent);
      background: var(--accent-soft);
      font-weight: 500;
    }
    .docs__main {
      min-width: 0;
    }
    .docs__prose {
      max-width: 760px;
    }
    .docs__pager {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 72px;
      padding-top: 32px;
      border-top: 1px solid var(--paper-rule);
    }
    .docs__pager-link {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 16px 20px;
      border: 1px solid var(--paper-rule);
      border-radius: 12px;
      text-decoration: none;
      transition:
        border-color 160ms ease,
        transform 160ms ease;
      max-width: 48%;
    }
    .docs__pager-link:hover {
      border-color: var(--accent);
      transform: translateY(-1px);
    }
    .docs__pager-link--next {
      text-align: right;
      align-items: flex-end;
    }
    .docs__pager-dir {
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--paper-ink-3);
    }
    .docs__pager-title {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 16px;
      color: var(--paper-ink);
    }
    .docs__toc {
      position: sticky;
      top: 96px;
      align-self: start;
      max-height: calc(100dvh - 120px);
      overflow-y: auto;
    }
    .docs__toc-label {
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--paper-ink-3);
      margin-bottom: 14px;
    }
    .docs__toc-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-left: 1px solid var(--paper-rule);
    }
    .docs__toc-item--sub {
      padding-left: 14px;
    }
    .docs__toc-link {
      display: block;
      font-size: 13px;
      line-height: 1.4;
      padding-left: 14px;
      margin-left: -1px;
      border-left: 1px solid transparent;
      color: var(--paper-ink-3);
      text-decoration: none;
      transition:
        color 160ms ease,
        border-color 160ms ease;
    }
    .docs__toc-link:hover {
      color: var(--accent);
      border-left-color: var(--accent);
    }
    @media (max-width: 1180px) {
      .docs {
        grid-template-columns: 240px minmax(0, 1fr);
      }
      .docs__toc {
        display: none;
      }
    }
    @media (max-width: 880px) {
      .docs {
        grid-template-columns: 1fr;
        gap: 24px;
        padding: 24px 20px 80px;
      }
      .docs__sidebar-toggle {
        display: inline-flex;
      }
      .docs__sidebar {
        position: static;
        max-height: none;
        overflow: visible;
        display: none;
        padding: 0;
      }
      .docs__sidebar.is-open {
        display: block;
      }
      .docs__pager-link {
        max-width: none;
        flex: 1;
      }
    }
  `,
})
export class DocsLayoutComponent {
  readonly slug = input.required<string>();
  readonly nav = input.required<readonly DocSection[]>();
  readonly versions = input<readonly DocVersion[]>([]);
  readonly lang = input<DocsLang>('en');
  readonly version = input('current');
  readonly docsSegment = input('docs');

  protected readonly sidebarOpen = signal(false);
  protected readonly toc = signal<readonly TocEntry[]>([]);
  protected readonly pagePath = signal('');

  private readonly platformId = inject(PLATFORM_ID);
  private readonly contentHost = viewChild<ElementRef<HTMLElement>>('content');

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }
      const host = this.contentHost()?.nativeElement;
      if (!host) {
        return;
      }
      this.pagePath.set(window.location.pathname);
      const headings = Array.from(host.querySelectorAll<HTMLElement>('h2, h3'));
      this.toc.set(
        headings
          .filter((h) => h.id)
          .map((h) => ({
            id: h.id,
            text: h.textContent?.trim() ?? '',
            level: h.tagName === 'H3' ? 3 : 2,
          })),
      );
    });
  }

  private readonly isFr = computed(() => this.lang() === 'fr');

  private readonly versionPath = computed(() =>
    this.version() === 'current' ? '' : `/${this.version()}`,
  );

  private readonly base = computed(
    () => `${this.isFr() ? '/fr' : ''}${this.versionPath()}/${this.docsSegment()}`,
  );

  private readonly order = computed(() => this.nav().flatMap((s) => s.items));

  private readonly currentIndex = computed(() =>
    this.order().findIndex((item) => item.slug === this.slug()),
  );

  protected readonly prev = computed<SiblingLink | null>(() => {
    const i = this.currentIndex();
    if (i <= 0) {
      return null;
    }
    const item = this.order()[i - 1];
    return { label: item.label, href: this.docHref(item.slug) };
  });

  protected readonly next = computed<SiblingLink | null>(() => {
    const order = this.order();
    const i = this.currentIndex();
    if (i < 0 || i >= order.length - 1) {
      return null;
    }
    const item = order[i + 1];
    return { label: item.label, href: this.docHref(item.slug) };
  });

  protected readonly sidebarLabel = computed(() =>
    this.sidebarOpen() ? (this.isFr() ? 'Fermer' : 'Close') : this.isFr() ? 'Sommaire' : 'Menu',
  );
  protected readonly navLabel = 'Documentation';
  protected readonly tocLabel = computed(() => (this.isFr() ? 'Sur cette page' : 'On this page'));
  protected readonly pagerLabel = 'Pagination';
  protected readonly prevLabel = computed(() => (this.isFr() ? 'Précédent' : 'Previous'));
  protected readonly nextLabel = computed(() => (this.isFr() ? 'Suivant' : 'Next'));
  protected readonly versionLabel = computed(() => (this.isFr() ? 'Version' : 'Version'));

  protected onVersionChange(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      window.location.assign(target.value);
    }
  }

  protected sectionIsOpen(section: DocSection): boolean {
    return section.items.some((item) => item.slug === this.slug());
  }

  protected docHref(slug: string): string {
    return `${this.base()}/${slug}`;
  }

  protected versionHref(version: string): string {
    const prefix = this.isFr() ? '/fr' : '';
    const versionPath = version === 'current' ? '' : `/${version}`;
    return `${prefix}${versionPath}/${this.docsSegment()}/${this.slug()}`;
  }
}
