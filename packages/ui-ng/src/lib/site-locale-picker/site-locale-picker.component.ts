import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
  viewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import type { SiteLocale } from '../site-chrome/site-chrome.model';
import { SiteLocaleLinkDirective } from './site-locale-link.directive';
import type { SiteLocaleOption } from './site-locale-option';

const POSITIONS: ConnectedPosition[] = [
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
];

let nextPanelId = 0;

@Component({
  selector: 'flr-site-locale-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../overlay/cdk-overlay.css'],
  imports: [OverlayModule, SiteLocaleLinkDirective],
  template: `
    <button
      #trigger
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      type="button"
      class="flr-locale-picker__trigger"
      translate="no"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="open() ? panelId : null"
      (click)="open.set(!open())"
    >
      <svg
        class="flr-locale-picker__icon"
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.25" />
        <path
          d="M1.75 8h12.5M8 1.75c1.8 1.7 2.7 3.8 2.7 6.25S9.8 12.55 8 14.25C6.2 12.55 5.3 10.45 5.3 8S6.2 3.45 8 1.75Z"
        />
      </svg>
      <span class="flr-locale-picker__sr">{{ label() }}: </span><span>{{ current() }}</span>
      <svg
        class="flr-locale-picker__chevron"
        viewBox="0 0 10 10"
        width="10"
        height="10"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m2 3.75 3 3 3-3" />
      </svg>
    </button>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="open.set(false)"
      (attach)="focusCurrent()"
      (detach)="onDetach()"
      (overlayKeydown)="onKeydown($event)"
    >
      <ul class="flr-locale-picker__panel" role="list" translate="no" [id]="panelId">
        @for (option of options(); track option.code) {
          <li>
            <a
              [flrSiteLocaleLink]="option.endonym"
              class="flr-locale-picker__option"
              [class.is-current]="option.code === current()"
              [href]="option.href"
              [attr.hreflang]="option.code"
              [attr.lang]="option.code"
              [attr.aria-current]="option.code === current() ? 'true' : null"
            >
              <span class="flr-locale-picker__endonym" [attr.lang]="option.code">{{
                option.endonym
              }}</span>
              <span class="flr-locale-picker__code">{{ option.code }}</span>
              <svg
                class="flr-locale-picker__check"
                viewBox="0 0 12 12"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m2.5 6.25 2.4 2.4 4.6-5" />
              </svg>
            </a>
          </li>
        }
      </ul>
    </ng-template>
  `,
  styles: `
    flr-site-locale-picker {
      display: inline-flex;
    }
    .flr-locale-picker__sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    .flr-locale-picker__trigger {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 10px 6px 12px;
      border: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      border-radius: var(--radius-full, 999px);
      background: transparent;
      color: var(--color-ink-2, #475569);
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
      cursor: pointer;
      transition:
        background 180ms,
        color 180ms;
    }
    .flr-locale-picker__trigger:hover,
    .flr-locale-picker__trigger[aria-expanded='true'] {
      background: var(--color-paper-2, rgba(30, 41, 59, 0.04));
      color: var(--color-ink, #1e293b);
    }
    .flr-locale-picker__trigger:focus-visible,
    .flr-locale-picker__option:focus-visible {
      outline: 2px solid var(--accent, #1e293b);
      outline-offset: 2px;
    }
    .flr-locale-picker__chevron {
      transition: transform 180ms;
    }
    .flr-locale-picker__trigger[aria-expanded='true'] .flr-locale-picker__chevron {
      transform: rotate(180deg);
    }
    .flr-locale-picker__panel {
      list-style: none;
      margin: 0;
      min-width: 200px;
      padding: 6px;
      background: var(--color-card, #ffffff);
      border: 1px solid var(--color-card-rule, rgba(30, 41, 59, 0.1));
      border-radius: var(--radius-card, 8px);
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
    }
    .flr-locale-picker__option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border-radius: var(--radius-control, 4px);
      color: var(--color-ink-2, #475569);
      font-size: 14px;
      text-decoration: none;
      transition:
        background 140ms,
        color 140ms;
    }
    .flr-locale-picker__option:hover,
    .flr-locale-picker__option:focus-visible {
      background: var(--color-paper-2, rgba(30, 41, 59, 0.04));
      color: var(--color-ink, #1e293b);
    }
    .flr-locale-picker__option.is-current {
      color: var(--color-ink, #1e293b);
    }
    .flr-locale-picker__endonym {
      flex: 1;
    }
    .flr-locale-picker__code {
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
      color: var(--color-ink-3, #64748b);
    }
    .flr-locale-picker__check {
      width: 12px;
      flex-shrink: 0;
      visibility: hidden;
    }
    .flr-locale-picker__option.is-current .flr-locale-picker__check {
      visibility: visible;
    }
  `,
})
export class SiteLocalePickerComponent {
  readonly options = input.required<readonly SiteLocaleOption[]>();
  readonly current = input.required<SiteLocale>();
  readonly label = input.required<string>();

  protected readonly open = signal(false);
  protected readonly positions = POSITIONS;
  protected readonly panelId = `flr-locale-picker-panel-${nextPanelId++}`;

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly links = viewChildren(SiteLocaleLinkDirective);
  private readonly currentIndex = computed(() =>
    Math.max(
      0,
      this.options().findIndex((option) => option.code === this.current()),
    ),
  );

  private readonly keyManager = new FocusKeyManager(this.links, this.injector)
    .withWrap()
    .withHomeAndEnd()
    .withTypeAhead();

  protected focusCurrent(): void {
    afterNextRender(() => this.keyManager.setActiveItem(this.currentIndex()), {
      injector: this.injector,
    });
  }

  protected onDetach(): void {
    this.open.set(false);
    const active = this.document.activeElement;
    if (!active || active === this.document.body) {
      this.trigger().nativeElement.focus();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.open.set(false);
      return;
    }
    this.keyManager.onKeydown(event);
  }
}
