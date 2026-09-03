import { ChangeDetectionStrategy, Component, inject, input, model, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  SidebarComponent,
  SidebarItemComponent,
  SidebarSectionComponent,
} from '../sidebar/sidebar.component';
import { isTrustedIconMarkup } from '../icon/icon-markup';

export interface ShellNavItem {
  readonly id: string;
  readonly label: string;
  /**
   * Text/emoji glyph, or SVG markup restricted to the elements and attributes
   * `isTrustedIconMarkup` allows. Anything else renders as text, so a value
   * that reaches this field from user input cannot inject markup.
   */
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

/**
 * Authenticated app chrome — Angular 22 port of `@ferrlabs/ui-react`'s Shell.
 * Composes `<flr-sidebar>` (data-driven nav from `sections`) + a sticky topbar
 * (breadcrumb, ⌘K search, action/user slots) + a scrollable main outlet.
 * Brand, topbar actions, and the user menu are projection slots
 * (`[shell-rail]`, `[shell-brand]`, `[shell-breadcrumb-lead]`, `[shell-breadcrumb-actions]`,
 * `[shell-actions]`, `[shell-topbar-right]`, `[shell-user]`) so the consumer
 * drops in `LogoMark` / a site switcher leading or trailing the breadcrumb /
 * dropdowns. `[shell-breadcrumb-lead]` renders before the crumb trail (a `/`
 * separates it from the first crumb). Page content is the
 * default slot. Reads `--color-app-*` / `--color-rule` / `--font-mono` tokens.
 */
@Component({
  selector: 'flr-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidebarComponent, SidebarSectionComponent, SidebarItemComponent],
  host: {
    '(window:keydown)': 'onKeydown($event)',
  },
  template: `
    <div class="flr-shell">
      <div class="flr-shell__rail"><ng-content select="[shell-rail]" /></div>
      <div class="flr-shell__surface">
        <flr-sidebar [(collapsed)]="collapsed">
          <div sidebar-brand class="flr-shell__brand"><ng-content select="[shell-brand]" /></div>
          <div sidebar-project><ng-content select="[shell-project]" /></div>
          @for (group of sections(); track group.title ?? $index) {
            <flr-sidebar-section [title]="group.title ?? null" [collapsed]="collapsed()">
              @for (item of group.items; track item.id) {
                <flr-sidebar-item
                  [label]="item.label"
                  [href]="item.href ?? null"
                  [active]="isActive(item)"
                  [collapsed]="collapsed()"
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
        </flr-sidebar>

        <div class="flr-shell__body">
          <header class="flr-shell__topbar">
            <div class="flr-shell__slot flr-shell__slot--crumb-lead">
              <ng-content select="[shell-breadcrumb-lead]" />
            </div>
            @if (breadcrumb().length) {
              <div class="mono flr-shell__crumbs">
                @for (crumb of breadcrumb(); track $index; let last = $last) {
                  <span class="flr-shell__crumb" [class.flr-shell__crumb--last]="last">{{
                    crumb
                  }}</span>
                  @if (!last) {
                    <span class="flr-shell__crumb-sep">/</span>
                  }
                }
              </div>
            }
            <div class="flr-shell__slot flr-shell__slot--crumb">
              <ng-content select="[shell-breadcrumb-actions]" />
            </div>
            <div class="flr-shell__spacer"></div>
            @if (searchEnabled()) {
              <button
                type="button"
                class="flr-shell__search mono"
                aria-label="Open search (Cmd+K)"
                (click)="search.emit()"
              >
                <span>Search</span>
                <kbd class="flr-shell__kbd">⌘K</kbd>
              </button>
            }
            <div class="flr-shell__slot"><ng-content select="[shell-actions]" /></div>
            <div class="flr-shell__slot"><ng-content select="[shell-topbar-right]" /></div>
            <div class="flr-shell__slot"><ng-content select="[shell-user]" /></div>
          </header>
          <main class="flr-shell__main"><ng-content /></main>
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
      min-height: 100vh;
      background: var(--color-app-rail, #101012);
    }
    .flr-shell__surface {
      display: flex;
      flex: 1;
      min-width: 0;
      background: var(--color-app-bg, #fafaf9);
    }
    .flr-shell:has(.flr-shell__rail:not(:empty)) .flr-shell__surface {
      --flr-sidebar-height: calc(100vh - var(--flr-shell-inset, 10px));
      margin-top: var(--flr-shell-inset, 10px);
      border-top-left-radius: var(--flr-shell-radius, 14px);
      overflow: clip;
    }
    .flr-shell:not(:has(.flr-shell__rail:not(:empty))) {
      background: var(--color-app-bg, #fafaf9);
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
    }
    .flr-shell__topbar {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 28px;
      gap: 16px;
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      background: var(--color-app-bg, #fafaf9);
      position: sticky;
      top: 0;
      z-index: 5;
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
      border-radius: 8px;
      border: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      background: var(--color-app-bg-2, #f4f4f2);
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
      border-radius: 4px;
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
      overflow-y: auto;
      background: var(--color-app-bg, #fafaf9);
    }
  `,
})
export class ShellComponent {
  readonly productName = input('');
  readonly marketingHref = input<string | null>(null);
  readonly accent = input<string | null>(null);
  readonly sections = input<readonly ShellNavGroup[]>([]);
  readonly currentPath = input('/');
  readonly breadcrumb = input<readonly string[]>([]);
  readonly searchEnabled = input(false);

  readonly collapsed = model(false);

  readonly navigate = output<string>();
  readonly search = output<void>();

  private readonly sanitizer = inject(DomSanitizer);

  protected isActive(item: ShellNavItem): boolean {
    const href = item.href;
    if (!href) return false;
    const path = this.currentPath();
    if (href === '/') return path === '/';
    return path === href || path.startsWith(`${href}/`);
  }

  protected onSelect(item: ShellNavItem): void {
    if (item.href) this.navigate.emit(item.href);
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
