import { BreakpointObserver } from '@angular/cdk/layout';
import { OverlayContainer, ScrollStrategyOptions } from '@angular/cdk/overlay';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  type ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  SidebarComponent,
  SidebarItemComponent,
  SidebarSectionComponent,
} from '../sidebar/sidebar.component';
import { isTrustedIconMarkup } from '../icon/icon-markup';
import { RailToggleComponent } from '../rail-toggle/rail-toggle.component';
import { activeNavItemId } from './active-nav-item';
import { SHELL_CONTEXT, type ShellContext } from './shell-context';
import { isPlainLeftClick, resolveCrumbs, type ShellCrumb } from './shell-crumbs';

export type { ShellCrumb };

export interface ShellNavItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly href?: string;
  readonly badge?: string | number | null;
  readonly danger?: boolean;
  readonly disabled?: boolean;
}

export interface ShellNavGroup {
  readonly title?: string;
  readonly items: readonly ShellNavItem[];
}

const NARROW_VIEWPORT = '(max-width: 880px)';

@Component({
  selector: 'flr-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidebarComponent, SidebarSectionComponent, SidebarItemComponent, RailToggleComponent],
  providers: [
    {
      provide: SHELL_CONTEXT,
      useFactory: (): ShellContext => ({
        collapsed: inject(forwardRef(() => ShellComponent)).railCollapsed,
      }),
    },
  ],
  host: {
    '(window:keydown)': 'onKeydown($event)',
  },
  template: `
    <div class="flr-shell">
      <div class="flr-shell__rail" [attr.inert]="navOpen() ? '' : null">
        <ng-content select="[shell-rail]" />
      </div>
      <div class="flr-shell__surface">
        <flr-sidebar
          [collapsed]="railCollapsed()"
          [(drawerOpen)]="navOpen"
          [drawerLabel]="navLabel()"
          [drawerCloseLabel]="navCloseLabel()"
        >
          <div sidebar-switcher class="flr-shell__switcher">
            <ng-content select="[shell-switcher]" />
          </div>
          <div sidebar-brand class="flr-shell__brand"><ng-content select="[shell-brand]" /></div>
          <div sidebar-project><ng-content select="[shell-project]" /></div>
          @for (group of sections(); track group.title ?? $index) {
            <flr-sidebar-section [title]="group.title ?? null" [collapsed]="railCollapsed()">
              @for (item of group.items; track item.id) {
                <flr-sidebar-item
                  [label]="item.label"
                  [href]="item.href ?? null"
                  [active]="isActive(item)"
                  [collapsed]="railCollapsed()"
                  [accent]="accent()"
                  [badge]="item.badge ?? null"
                  [danger]="item.danger ?? false"
                  [disabled]="item.disabled ?? false"
                  (selected)="onSelect(item)"
                >
                  @if (item.icon) {
                    <span item-icon>
                      @let icon = trustedIcon(item.icon);
                      @if (icon) {
                        <span [innerHTML]="icon"></span>
                      } @else {
                        {{ item.icon }}
                      }
                    </span>
                  }
                </flr-sidebar-item>
              }
            </flr-sidebar-section>
          }
          <div sidebar-footer class="flr-shell__nav-footer">
            <ng-content select="[shell-nav-footer]" />
          </div>
          <div sidebar-footer class="flr-shell__user"><ng-content select="[shell-user]" /></div>
        </flr-sidebar>

        <div class="flr-shell__body" [attr.inert]="navOpen() ? '' : null">
          <header class="flr-shell__topbar">
            <button
              #navToggle
              type="button"
              class="flr-shell__nav-toggle"
              aria-haspopup="dialog"
              [attr.aria-controls]="sidebar().panelId"
              [attr.aria-expanded]="navOpen()"
              [attr.aria-label]="navOpenLabel()"
              (click)="navOpen.set(true)"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
            <flr-rail-toggle class="flr-shell__rail-toggle" [(collapsed)]="collapsed" />
            <div class="flr-shell__slot flr-shell__slot--crumb-lead">
              <ng-content select="[shell-breadcrumb-lead]" />
            </div>
            @if (breadcrumb().length) {
              <nav class="mono flr-shell__crumbs" aria-label="Breadcrumb">
                @for (crumb of crumbs(); track $index) {
                  @if (crumb.href) {
                    <a
                      class="flr-shell__crumb flr-shell__crumb--link"
                      [href]="crumb.href"
                      (click)="onCrumbClick($event, crumb.href)"
                      >{{ crumb.label }}</a
                    >
                  } @else {
                    <span
                      class="flr-shell__crumb"
                      [class.flr-shell__crumb--last]="crumb.last"
                      [attr.aria-current]="crumb.last ? 'page' : null"
                      >{{ crumb.label }}</span
                    >
                  }
                  @if (!crumb.last) {
                    <span class="flr-shell__crumb-sep" aria-hidden="true">/</span>
                  }
                }
              </nav>
            }
            <div class="flr-shell__slot flr-shell__slot--crumb">
              <ng-content select="[shell-breadcrumb-actions]" />
            </div>
            <div class="flr-shell__spacer"></div>
            @if (searchEnabled()) {
              <button
                type="button"
                class="flr-shell__search mono"
                aria-keyshortcuts="Meta+K Control+K"
                (click)="search.emit()"
              >
                <span>Search</span>
                <kbd class="flr-shell__kbd" aria-hidden="true">⌘K</kbd>
              </button>
            }
            <div class="flr-shell__slot"><ng-content select="[shell-actions]" /></div>
            <div class="flr-shell__slot"><ng-content select="[shell-topbar-right]" /></div>
          </header>
          <main class="flr-shell__main" tabindex="0"><ng-content /></main>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-shell {
      display: flex;
      height: 100dvh;
      background: var(--color-app-rail, #101012);
    }
    .flr-shell__surface {
      display: flex;
      flex: 1;
      min-width: 0;
      background: var(--color-app-bg, #f8fafc);
    }
    .flr-shell:has(.flr-shell__rail:not(:empty)) .flr-shell__surface {
      --flr-sidebar-height: calc(100dvh - var(--flr-shell-inset, 10px));
      margin-top: var(--flr-shell-inset, 10px);
      border-top-left-radius: var(--flr-shell-radius, var(--radius-modal, 24px));
      corner-shape: var(--corner-shape, round);
      overflow: clip;
    }
    .flr-shell:not(:has(.flr-shell__rail:not(:empty))):not(:has(.flr-shell__switcher:not(:empty))) {
      background: var(--color-app-bg, #f8fafc);
    }
    .flr-shell:has(.flr-shell__switcher:not(:empty)) flr-sidebar {
      --color-app-sidebar: var(--color-app-rail, #101012);
      --color-ink: #ffffff;
      --color-ink-2: rgba(255, 255, 255, 0.62);
      --color-ink-3: rgba(255, 255, 255, 0.56);
      --color-rule: rgba(255, 255, 255, 0.1);
      --color-app-nav-hover: rgba(255, 255, 255, 0.06);
      --color-app-nav-active: rgba(255, 255, 255, 0.1);
      --color-danger: #f87171;
      --color-danger-fg: #fca5a5;
      --color-avatar-bg: rgba(255, 255, 255, 0.16);
      --color-card: var(--color-app-rail-tip, #1a1b20);
      --color-app-bg-2: rgba(255, 255, 255, 0.06);
      --flr-sidebar-border: transparent;
    }
    .flr-shell:has(.flr-shell__switcher:not(:empty)) flr-sidebar-item {
      --flr-sb-active-icon: var(--flr-sb-accent-on-dark);
    }
    .flr-shell:has(.flr-shell__switcher:not(:empty)) .flr-shell__surface {
      background: var(--color-app-rail, #101012);
    }
    .flr-shell:has(.flr-shell__switcher:not(:empty)) .flr-shell__body {
      margin-top: var(--flr-shell-inset, 10px);
      border-top-left-radius: var(--flr-shell-radius, var(--radius-modal, 24px));
      corner-shape: var(--corner-shape, round);
      overflow: clip;
      background: var(--color-app-bg, #f8fafc);
    }
    .flr-shell__rail {
      display: flex;
      align-self: stretch;
    }
    .flr-shell__rail:empty {
      display: none;
    }
    .flr-shell__brand {
      display: flex;
      align-items: stretch;
      width: 100%;
    }
    .flr-shell__body {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      min-height: 0;
    }
    .flr-shell__topbar {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 28px;
      gap: 16px;
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      background: var(--color-app-bg, #f8fafc);
      position: sticky;
      top: 0;
      z-index: 5;
    }
    .flr-shell__rail-toggle {
      margin-left: -8px;
    }
    .flr-shell__nav-toggle {
      display: none;
      width: 44px;
      height: 44px;
      margin-left: -12px;
      padding: 0;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: var(--radius-control, 8px);
      corner-shape: var(--corner-shape, round);
      background: transparent;
      color: var(--color-ink-2, #475569);
      cursor: pointer;
    }
    .flr-shell__nav-toggle:hover {
      background: var(--color-app-nav-hover, rgba(30, 41, 59, 0.06));
      color: var(--color-ink, #1e293b);
    }
    .flr-shell__nav-toggle:focus-visible {
      outline: 2px solid var(--color-accent, var(--color-ink, #1e293b));
      outline-offset: 2px;
    }
    .flr-shell__nav-toggle svg {
      width: 20px;
      height: 20px;
    }
    @media (max-width: 880px) {
      .flr-shell__topbar {
        padding: 0 16px;
        gap: 12px;
      }
      .flr-shell__rail-toggle {
        display: none;
      }
      .flr-shell__nav-toggle {
        display: inline-flex;
      }
    }
    .flr-shell__crumbs {
      font-size: 12px;
      color: var(--color-ink-3, #64748b);
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .flr-shell__crumb--last {
      color: var(--color-ink, #1e293b);
    }
    .flr-shell__crumb--link {
      color: inherit;
      text-decoration: none;
      border-radius: var(--radius-control, 8px);
      corner-shape: var(--corner-shape, round);
    }
    .flr-shell__crumb--link:hover {
      color: var(--color-ink, #1e293b);
      text-decoration: underline;
    }
    .flr-shell__crumb--link:focus-visible {
      outline: 2px solid var(--color-ink, #1e293b);
      outline-offset: 2px;
    }
    .flr-shell__crumb-sep {
      opacity: 0.5;
    }
    .flr-shell__spacer {
      flex: 1;
    }
    .flr-shell__search {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px 6px 12px;
      border-radius: var(--radius-control, 8px);
      corner-shape: var(--corner-shape, round);
      border: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      background: var(--color-app-bg-2, #f1f5f9);
      color: var(--color-ink-3, #64748b);
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 12px;
      cursor: pointer;
      transition:
        background 120ms,
        border-color 120ms;
    }
    .flr-shell__search:hover {
      background: var(--color-card, #fff);
      border-color: var(--color-rule-strong, rgba(30, 41, 59, 0.24));
    }
    .flr-shell__kbd {
      display: inline-flex;
      align-items: center;
      padding: 1px 5px;
      border-radius: var(--radius-control, 8px);
      corner-shape: var(--corner-shape, round);
      border: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      background: var(--color-card, #fff);
      font-family: inherit;
      font-size: 10.5px;
      letter-spacing: 0.04em;
    }
    .flr-shell__slot {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .flr-shell__slot:empty {
      display: none;
    }
    .flr-shell__slot--crumb {
      margin-left: 4px;
    }
    .flr-shell__slot--crumb-lead:not(:empty) + .flr-shell__crumbs::before {
      content: '/';
      margin-right: 6px;
      color: var(--color-ink-3, #64748b);
      opacity: 0.5;
    }
    .flr-shell__main {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding-bottom: var(--flr-shell-main-pad-bottom, 40px);
      background: var(--color-app-bg, #f8fafc);
    }
  `,
})
export class ShellComponent implements ShellContext {
  readonly productName = input('');
  readonly marketingHref = input<string | null>(null);
  readonly accent = input<string | null>(null);
  readonly sections = input<readonly ShellNavGroup[]>([]);
  readonly currentPath = input('/');
  readonly breadcrumb = input<readonly ShellCrumb[]>([]);
  readonly searchEnabled = input(false);
  readonly navLabel = input('Navigation');
  readonly navOpenLabel = input('Open navigation');
  readonly navCloseLabel = input('Close navigation');

  readonly collapsed = model(false);

  private readonly viewport = toSignal(inject(BreakpointObserver).observe(NARROW_VIEWPORT));
  private readonly narrow = computed(() => this.viewport()?.matches ?? false);
  readonly railCollapsed = computed(() => this.collapsed() && !this.narrow());
  protected readonly navOpen = signal(false);
  private readonly navToggle = viewChild.required<ElementRef<HTMLButtonElement>>('navToggle');
  protected readonly sidebar = viewChild.required(SidebarComponent);
  private readonly overlayContainer = inject(OverlayContainer);
  private readonly scrollBlock = inject(ScrollStrategyOptions).block();

  protected readonly crumbs = computed(() => resolveCrumbs(this.breadcrumb()));

  readonly navigate = output<string>();
  readonly search = output<void>();

  private readonly sanitizer = inject(DomSanitizer);

  private readonly activeItemId = computed(() =>
    activeNavItemId(this.sections(), this.currentPath()),
  );

  constructor() {
    effect(() => {
      this.currentPath();
      this.narrow();
      this.navOpen.set(false);
    });
    effect((onCleanup) => {
      if (!this.navOpen()) return;
      this.loadScrollBlockStyles();
      this.scrollBlock.enable();
      onCleanup(() => this.scrollBlock.disable());
    });
    let wasOpen = false;
    afterRenderEffect(() => {
      const open = this.navOpen();
      if (wasOpen && !open && this.narrow()) this.navToggle().nativeElement.focus();
      wasOpen = open;
    });
  }

  private loadScrollBlockStyles(): void {
    this.overlayContainer.getContainerElement();
  }

  protected isActive(item: ShellNavItem): boolean {
    return item.href !== undefined && item.id === this.activeItemId();
  }

  protected onSelect(item: ShellNavItem): void {
    this.navOpen.set(false);
    if (item.href) this.navigate.emit(item.href);
  }

  protected onCrumbClick(event: MouseEvent, href: string): void {
    if (!isPlainLeftClick(event)) return;
    event.preventDefault();
    this.navigate.emit(href);
  }

  protected trustedIcon(markup: string): SafeHtml | null {
    return isTrustedIconMarkup(markup) ? this.sanitizer.bypassSecurityTrustHtml(markup) : null;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.searchEnabled()) return;
    const isK = event.key === 'k' || event.key === 'K';
    if (isK && (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey) {
      event.preventDefault();
      this.search.emit();
    }
  }
}
