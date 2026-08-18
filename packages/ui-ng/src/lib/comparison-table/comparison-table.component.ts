import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** A single cell: `true` = has it, `false` = doesn't, `'partial'` = limited,
 * or a free string (e.g. `'Free'`, `'$$$'`, `'Add-on'`). */
export type ComparisonCell = boolean | 'partial' | string;

export interface ComparisonColumn {
  /** Product name shown in the header. */
  name: string;
  /** Marks the FerrLabs product column — highlighted with `accent`. */
  ours?: boolean;
  /** Accent color for the `ours` column (the product hue). */
  accent?: string;
}

export interface ComparisonRow {
  /** Feature name (row header). */
  feature: string;
  /** Optional one-line clarification under the feature name. */
  hint?: string;
  /** One cell per column, in the same order as `columns`. */
  cells: ComparisonCell[];
}

export interface ComparisonGroup {
  /** Optional section title; omit for an ungrouped block. */
  title?: string;
  rows: ComparisonRow[];
}

interface RenderCell {
  kind: 'yes' | 'no' | 'partial' | 'text';
  text: string;
  label: string;
}

/**
 * Feature-comparison section for "Why <product>" pages: an optional header
 * (eyebrow / heading / lead) above a table with features down the side, the
 * FerrLabs product plus competitors across the top, and a check / dash /
 * partial / text mark per cell. The `ours` column is highlighted with the
 * product accent. Owning the header here keeps the type scale identical across
 * every product site — pass content, not styles. Theme-aware, horizontally
 * scrollable on narrow viewports.
 */
@Component({
  selector: 'flr-comparison-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hasHeader()) {
      <header class="flr-cmp__header">
        @if (eyebrow()) {
          <p class="flr-cmp__eyebrow">{{ eyebrow() }}</p>
        }
        @if (heading()) {
          <h1 class="flr-cmp__heading" [style.--ours-accent]="accent()">
            @for (part of headingParts(); track $index) {
              @if (part.accent) {
                <em>{{ part.text }}</em>
              } @else {
                <span>{{ part.text }}</span>
              }
            }
          </h1>
        }
        @if (lead()) {
          <p class="flr-cmp__lead">{{ lead() }}</p>
        }
      </header>
    }
    <div class="flr-cmp">
      <table class="flr-cmp__table">
        @if (caption()) {
          <caption class="flr-cmp__caption">
            {{
              caption()
            }}
          </caption>
        }
        <thead>
          <tr>
            <th class="flr-cmp__corner" scope="col"></th>
            @for (col of columns(); track col.name) {
              <th
                class="flr-cmp__head"
                [class.flr-cmp__head--ours]="col.ours"
                [style.--ours-accent]="accent()"
                scope="col"
              >
                {{ col.name }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (group of groups(); track group.title || $index) {
            @if (group.title) {
              <tr class="flr-cmp__group">
                <th [attr.colspan]="columns().length + 1" scope="colgroup">{{ group.title }}</th>
              </tr>
            }
            @for (row of group.rows; track row.feature) {
              <tr class="flr-cmp__row">
                <th class="flr-cmp__feature" scope="row">
                  {{ row.feature }}
                  @if (row.hint) {
                    <span class="flr-cmp__hint">{{ row.hint }}</span>
                  }
                </th>
                @for (value of row.cells; track $index) {
                  @let c = cell(value);
                  <td
                    class="flr-cmp__cell"
                    [class.flr-cmp__cell--ours]="$index === oursIndex()"
                    [style.--ours-accent]="accent()"
                  >
                    <span
                      class="flr-cmp__mark flr-cmp__mark--{{ c.kind }}"
                      [class.flr-cmp__mark--ours]="$index === oursIndex() && c.kind === 'yes'"
                      [attr.aria-label]="c.label"
                      >{{ c.text }}</span
                    >
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-cmp__header {
      margin-bottom: 56px;
    }
    .flr-cmp__eyebrow {
      margin: 0 0 12px;
      font-family: var(--font-mono, 'DM Mono', ui-monospace, SFMono-Regular, Menlo, monospace);
      font-size: 11px;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
    }
    .flr-cmp__heading {
      margin: 0 0 20px;
      font-family: var(--font-display, 'Fraunces', Georgia, ui-serif, serif);
      font-size: clamp(40px, 5vw, 64px);
      font-weight: 700;
      line-height: 1.05;
      letter-spacing: -0.025em;
    }
    .flr-cmp__heading em {
      font-style: italic;
      font-weight: 600;
      color: var(--ours-accent, var(--color-ink, #1e293b));
    }
    .flr-cmp__lead {
      margin: 0;
      max-width: 680px;
      font-family: var(--font-sans, 'Fraunces', Georgia, ui-serif, serif);
      font-size: 18px;
      line-height: 1.55;
      color: var(--color-ink-2, #475569);
    }
    .flr-cmp {
      overflow-x: auto;
    }
    .flr-cmp__table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(
        --font-mono,
        'DM Mono',
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Consolas,
        monospace
      );
      font-size: 14px;
      color: var(--color-ink, #1e293b);
    }
    .flr-cmp__caption {
      caption-side: top;
      text-align: left;
      padding: 0 0 12px;
      font-size: 13px;
      color: var(--color-ink-3, #64748b);
    }
    .flr-cmp__head {
      padding: 12px 16px;
      text-align: center;
      font-weight: 600;
      white-space: nowrap;
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.14));
    }
    .flr-cmp__head--ours {
      color: var(--ours-accent, var(--color-ink, #1e293b));
      background: color-mix(in oklab, var(--ours-accent, #1e293b) 10%, transparent);
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    .flr-cmp__group th {
      text-align: left;
      padding: 18px 16px 6px;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
    }
    .flr-cmp__row {
      border-bottom: 1px solid var(--color-rule, rgba(30, 41, 59, 0.1));
    }
    .flr-cmp__feature {
      text-align: left;
      padding: 12px 16px;
      font-weight: 500;
    }
    .flr-cmp__hint {
      display: block;
      margin-top: 2px;
      font-size: 12px;
      font-weight: 400;
      color: var(--color-ink-3, #64748b);
    }
    .flr-cmp__cell {
      padding: 12px 16px;
      text-align: center;
    }
    .flr-cmp__cell--ours {
      background: color-mix(in oklab, var(--ours-accent, #1e293b) 6%, transparent);
    }
    .flr-cmp__mark {
      font-size: 15px;
      line-height: 1;
    }
    .flr-cmp__mark--yes {
      color: var(--color-success, #10b981);
    }
    .flr-cmp__mark--ours {
      color: var(--ours-accent, #10b981);
      font-weight: 700;
    }
    .flr-cmp__mark--no {
      color: var(--color-ink-3, #94a3b8);
    }
    .flr-cmp__mark--partial {
      color: var(--color-warning, #f59e0b);
    }
    .flr-cmp__mark--text {
      font-size: 13px;
      color: var(--color-ink, #1e293b);
    }
  `,
})
export class ComparisonTableComponent {
  readonly columns = input.required<ComparisonColumn[]>();
  readonly groups = input.required<ComparisonGroup[]>();
  readonly caption = input('');
  readonly yesLabel = input('Yes');
  readonly noLabel = input('No');
  readonly partialLabel = input('Partial');
  /** Small uppercase marker above the heading. Omit to hide the header block. */
  readonly eyebrow = input('');
  /** Page heading, e.g. `Why FerrFlow?`. */
  readonly heading = input('');
  /** Substring of `heading` to render in the product accent, e.g. `FerrFlow`. */
  readonly headingAccent = input('');
  /** Intro paragraph under the heading. */
  readonly lead = input('');

  protected readonly hasHeader = computed(
    () => !!(this.eyebrow() || this.heading() || this.lead()),
  );

  protected readonly headingParts = computed(() => {
    const heading = this.heading();
    const accent = this.headingAccent();
    const at = accent ? heading.indexOf(accent) : -1;
    if (at === -1) return [{ text: heading, accent: false }];
    return [
      { text: heading.slice(0, at), accent: false },
      { text: accent, accent: true },
      { text: heading.slice(at + accent.length), accent: false },
    ].filter((part) => part.text.length > 0);
  });

  protected readonly oursIndex = computed(() => this.columns().findIndex((c) => c.ours));
  protected readonly accent = computed(
    () => this.columns().find((c) => c.ours)?.accent ?? 'var(--color-ink, #1e293b)',
  );

  protected cell(value: ComparisonCell): RenderCell {
    if (value === true) return { kind: 'yes', text: '✓', label: this.yesLabel() };
    if (value === false) return { kind: 'no', text: '—', label: this.noLabel() };
    if (value === 'partial') return { kind: 'partial', text: '~', label: this.partialLabel() };
    return { kind: 'text', text: value, label: value };
  }
}
