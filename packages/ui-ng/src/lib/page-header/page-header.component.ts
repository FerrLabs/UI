import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface BreadcrumbCrumb {
  readonly label: string;
  readonly href?: string;
}

@Component({
  selector: 'flr-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-ph">
      <div class="flr-ph__main">
        @if (breadcrumbs().length) {
          <nav
            class="mono flr-ph__crumbs"
            [class.flr-ph__crumbs--tight]="!!eyebrow()"
            aria-label="Breadcrumb"
          >
            @for (crumb of breadcrumbs(); track $index; let i = $index; let last = $last) {
              @if (i > 0) {
                <span class="flr-ph__crumb-sep" aria-hidden="true">/</span>
              }
              @if (crumb.href) {
                <a class="flr-ph__crumb-link" [href]="crumb.href">{{ crumb.label }}</a>
              } @else {
                <span class="flr-ph__crumb-current" aria-current="page">{{ crumb.label }}</span>
              }
            }
          </nav>
        }
        @if (eyebrow()) {
          <div class="mono flr-ph__eyebrow">{{ eyebrow() }}</div>
        }
        <div class="flr-ph__title-row">
          <h1 class="flr-ph__title">
            <span>{{ title() }}</span>
            @if (count() != null) {
              <span class="mono flr-ph__count">{{ count() }}</span>
            }
          </h1>
          <ng-content select="[page-header-badge]" />
        </div>
        @if (sub()) {
          <p class="flr-ph__sub">{{ sub() }}</p>
        }
      </div>
      <div class="flr-ph__actions"><ng-content select="[page-header-actions]" /></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-ph {
      display: flex;
      align-items: flex-end;
      gap: 24px;
      padding: 32px 32px 24px;
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
      flex-wrap: wrap;
    }
    .flr-ph__main {
      flex: 1;
      min-width: 240px;
    }
    .flr-ph__crumbs {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 11px;
      letter-spacing: 0.06em;
      color: var(--color-ink-3, #64748b);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .flr-ph__crumbs--tight {
      margin-bottom: 8px;
    }
    .flr-ph__crumb-sep {
      opacity: 0.5;
    }
    .flr-ph__crumb-link {
      color: inherit;
      text-decoration: none;
    }
    .flr-ph__crumb-link:hover {
      color: var(--color-ink, #1e293b);
    }
    .flr-ph__crumb-current {
      color: var(--color-ink-2, #475569);
    }
    .flr-ph__eyebrow {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
      margin-bottom: 12px;
    }
    .flr-ph__title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .flr-ph__title {
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-weight: 900;
      font-size: clamp(28px, 3vw, 40px);
      line-height: 1.05;
      letter-spacing: -0.025em;
      margin: 0;
      display: flex;
      align-items: baseline;
      gap: 14px;
      flex-wrap: wrap;
    }
    .flr-ph__count {
      font-family: var(--font-mono, 'DM Mono', ui-monospace, monospace);
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.04em;
      color: var(--color-ink-3, #64748b);
    }
    .flr-ph__sub {
      font-size: 15px;
      color: var(--color-ink-2, #475569);
      margin-top: 8px;
      margin-bottom: 0;
      max-width: 600px;
    }
    .flr-ph__actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .flr-ph__actions:empty {
      display: none;
    }
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input<string | null>(null);
  readonly count = input<string | number | null>(null);
  readonly sub = input<string | null>(null);
  readonly breadcrumbs = input<readonly BreadcrumbCrumb[]>([]);
}
