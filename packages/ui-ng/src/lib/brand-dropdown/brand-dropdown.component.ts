import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { LogoMarkComponent, type ProductSlug } from '../logo-mark/logo-mark.component';

export type BrandDropdownAppId =
  | 'ferrflow'
  | 'ferrvault'
  | 'ferrtrack'
  | 'ferrgrowth'
  | 'ferrfleet'
  | 'ferrlens'
  | 'ferrlabs'
  | 'admin';

export interface BrandDropdownApp {
  readonly id: BrandDropdownAppId;
  readonly label: string;
  readonly href: string;
  readonly accent: string;
  /** Visual grouping — a divider + uppercase header renders between groups. */
  readonly section?: string;
}

export const DEFAULT_APPS: readonly BrandDropdownApp[] = [
  { id: 'ferrlabs', label: 'FerrLabs', href: 'https://app.ferrlabs.com', accent: '#1e293b' },
  { id: 'ferrgrowth', label: 'FerrGrowth', href: 'https://app.ferrgrowth.com', accent: '#7c3aed' },
  { id: 'ferrfleet', label: 'FerrFleet', href: 'https://app.ferrfleet.com', accent: '#f59e0b' },
  { id: 'ferrtrack', label: 'FerrTrack', href: 'https://app.ferrtrack.com', accent: '#6366f1' },
  { id: 'ferrvault', label: 'FerrVault', href: 'https://app.ferrvault.com', accent: '#10b981' },
  { id: 'ferrlens', label: 'FerrLens', href: 'https://ferrlens.com', accent: '#14b8a6' },
];

export const ADMIN_APP: BrandDropdownApp = {
  id: 'admin',
  label: 'Admin',
  href: 'https://admin.ferrlabs.com',
  accent: '#e11d48',
  section: 'Staff',
};

const SWITCH_OVERLAY_DELAY_MS = 200;

interface BrandRow {
  readonly app: BrandDropdownApp;
  readonly showHeader: boolean;
  readonly first: boolean;
}

@Component({
  selector: 'flr-brand-dropdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LogoMarkComponent],
  host: {
    '(document:mousedown)': 'onDocumentDown($event)',
    '(document:keydown.escape)': 'open.set(false)',
  },
  template: `
    <button
      type="button"
      class="flr-bd__trigger"
      [attr.aria-haspopup]="'menu'"
      [attr.aria-expanded]="open()"
      [title]="triggerTitle()"
      (click)="open.set(!open())"
    >
      <span class="flr-bd__brand"><ng-content /></span>
      <span class="flr-bd__chev" [class.flr-bd__chev--hidden]="collapsed()" aria-hidden="true"
        >▾</span
      >
    </button>

    @if (open()) {
      <div class="flr-bd__panel" role="menu">
        @if (!collapsed()) {
          <div class="mono flr-bd__eyebrow">Switch app</div>
        }
        @for (row of rows(); track row.app.id) {
          @if (row.showHeader) {
            <div class="mono flr-bd__section" [class.flr-bd__section--first]="row.first">
              {{ row.app.section }}
            </div>
          }
          <a
            class="flr-bd__app"
            [class.flr-bd__app--current]="row.app.id === current()"
            [class.flr-bd__app--collapsed]="collapsed()"
            [href]="row.app.href"
            role="menuitem"
            [attr.aria-current]="row.app.id === current() ? 'page' : null"
            [title]="collapsed() ? row.app.label : null"
            (click)="onSelect($event, row.app)"
          >
            @if (row.app.id === current() && !collapsed()) {
              <span
                class="flr-bd__bar"
                aria-hidden="true"
                [style.background]="row.app.accent"
              ></span>
            }
            <span class="flr-bd__mark">
              <flr-logo-mark [product]="$any(row.app.id)" [accent]="row.app.accent" [size]="36" />
            </span>
            @if (!collapsed()) {
              <span class="flr-bd__label">{{ row.app.label }}</span>
            }
          </a>
        }
      </div>
    }

    @if (switchVisible(); as app) {
      <div
        class="flr-bd__switch"
        aria-live="polite"
        [attr.aria-label]="'Switching to ' + app.label"
      >
        <div class="flr-bd__switch-inner">
          <span class="flr-bd__switch-mark"
            ><flr-logo-mark [product]="$any(app.id)" [accent]="app.accent" [size]="64"
          /></span>
          <span class="mono flr-bd__switch-label">Opening {{ app.label }}…</span>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      flex: 1;
      min-width: 0;
      align-self: stretch;
      height: 100%;
    }
    .flr-bd__trigger {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: flex-start;
      width: 100%;
      height: 100%;
      min-height: inherit;
      background: transparent;
      border: none;
      padding: 0 18px;
      margin: 0;
      cursor: pointer;
      color: inherit;
      font: inherit;
      text-align: left;
      box-sizing: border-box;
      overflow: hidden;
      transition: background 140ms ease;
    }
    .flr-bd__trigger:hover {
      background: var(--color-app-nav-hover, rgba(30, 41, 59, 0.03));
    }
    .flr-bd__brand {
      flex: 1;
      min-width: 0;
      display: inline-flex;
      align-items: center;
      gap: 12px;
    }
    .flr-bd__chev {
      color: var(--color-ink-3, #64748b);
      font-size: 12px;
      flex-shrink: 0;
      opacity: 0.7;
      max-width: 16px;
      overflow: hidden;
      transition:
        opacity 160ms ease,
        max-width 220ms ease;
    }
    .flr-bd__chev--hidden {
      opacity: 0;
      max-width: 0;
    }
    .flr-bd__panel {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      height: calc(100vh - 64px - 56px);
      background: var(--color-app-sidebar, #f7f7f5);
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.1));
      padding: 8px 8px 12px;
      z-index: 60;
      overflow-y: auto;
      animation: flr-bd-panel-in 200ms ease-out;
    }
    @keyframes flr-bd-panel-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: none;
      }
    }
    .flr-bd__eyebrow {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      padding: 4px 12px 6px;
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
    }
    .flr-bd__section {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      padding: 10px 12px 4px;
      margin-top: 4px;
      border-top: 1px solid var(--color-rule, rgba(30, 41, 59, 0.1));
      font-size: 10px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
    }
    .flr-bd__section--first {
      margin-top: 0;
      border-top: none;
    }
    .flr-bd__app {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: flex-start;
      padding: 6px 12px;
      margin: 1px 0;
      border-radius: 8px;
      text-decoration: none;
      color: var(--color-ink-2, #475569);
      background: transparent;
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-size: 13.5px;
      transition: background 120ms;
    }
    .flr-bd__app:hover {
      background: var(--color-app-nav-hover, rgba(30, 41, 59, 0.03));
    }
    .flr-bd__app--current {
      color: var(--color-ink, #1e293b);
      background: var(--color-app-nav-active, rgba(30, 41, 59, 0.06));
    }
    .flr-bd__app--collapsed {
      gap: 0;
      justify-content: center;
      padding: 6px 0;
    }
    .flr-bd__bar {
      position: absolute;
      left: 0;
      top: 8px;
      bottom: 8px;
      width: 2px;
      border-radius: 2px;
    }
    .flr-bd__mark {
      width: 36px;
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .flr-bd__label {
      flex: 1;
      min-width: 0;
      text-align: left;
      font-weight: 700;
    }
    .flr-bd__switch {
      position: fixed;
      inset: 0;
      background: var(--color-paper, #faf8f4);
      backdrop-filter: blur(10px) saturate(140%);
      -webkit-backdrop-filter: blur(10px) saturate(140%);
      z-index: 2147483600;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: flr-bd-switch-in 200ms ease-out;
    }
    @keyframes flr-bd-switch-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes flr-bd-switch-pulse {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.06);
      }
    }
    .flr-bd__switch-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      animation: flr-bd-switch-pulse 1200ms ease-in-out infinite;
    }
    .flr-bd__switch-mark {
      width: 64px;
      height: 64px;
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .flr-bd__switch-label {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
    }
  `,
})
export class BrandDropdownComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly current = input.required<BrandDropdownAppId>();
  readonly apps = input<readonly BrandDropdownApp[]>(DEFAULT_APPS);
  readonly collapsed = input(false);

  protected readonly open = signal(false);
  protected readonly switchVisible = signal<BrandDropdownApp | null>(null);

  protected readonly rows = computed<BrandRow[]>(() => {
    const apps = this.apps();
    const collapsed = this.collapsed();
    return apps.map((app, i) => {
      const prevSection = i > 0 ? apps[i - 1].section : undefined;
      return {
        app,
        first: i === 0,
        showHeader: !collapsed && app.section !== undefined && app.section !== prevSection,
      };
    });
  });

  protected readonly triggerTitle = computed(() => {
    const cur = this.apps().find((a) => a.id === this.current());
    return cur ? `${cur.label} · switch to another FerrLabs app` : 'Switch app';
  });

  protected onDocumentDown(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  protected onSelect(event: MouseEvent, app: BrandDropdownApp): void {
    event.preventDefault();
    this.open.set(false);
    if (app.id === this.current()) return;
    if (typeof window === 'undefined') return;
    window.setTimeout(() => this.switchVisible.set(app), SWITCH_OVERLAY_DELAY_MS);
    window.location.assign(app.href);
  }
}
