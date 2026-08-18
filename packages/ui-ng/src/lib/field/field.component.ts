import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

let fieldCounter = 0;

/**
 * Form-field wrapper — Angular 22 port of `@ferrlabs/ui-react`'s Field.
 * Renders the mono label, optional hint, and error message, and exposes the
 * wiring ids the control needs. Project the control as default content and
 * read the ids via the `flrField` template reference:
 *
 * ```html
 * <flr-field label="Email" [error]="err" #f="flrField">
 *   <flr-input
 *     [id]="f.fieldId"
 *     [aria-describedby]="f.describedBy()"
 *     [invalid]="f.invalid()"
 *   />
 * </flr-field>
 * ```
 */
@Component({
  selector: 'flr-field',
  exportAs: 'flrField',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flr-field">
      <div class="flr-field__head">
        <label class="flr-field__label mono" [attr.for]="fieldId">
          {{ label() }}
          @if (required()) {
            <span class="flr-field__required" aria-hidden="true">*</span>
          }
          @if (optional() && !required()) {
            <span class="flr-field__optional">(optional)</span>
          }
        </label>
        <div class="flr-field__trailing"><ng-content select="[field-trailing]" /></div>
      </div>
      <ng-content />
      @if (error(); as e) {
        <p class="flr-field__error" [id]="errorId">{{ e }}</p>
      } @else if (hint(); as h) {
        <p class="flr-field__hint" [id]="hintId">{{ h }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .flr-field__head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
    }
    .flr-field__label {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--color-ink-3, #64748b);
    }
    .flr-field__required {
      margin-left: 4px;
      color: var(--color-danger, #dc2626);
    }
    .flr-field__optional {
      margin-left: 6px;
      color: var(--color-ink-3, #64748b);
      font-weight: 400;
    }
    .flr-field__trailing {
      font-size: 12px;
    }
    .flr-field__error {
      margin: 0;
      font-size: 12px;
      color: var(--color-danger, #dc2626);
    }
    .flr-field__hint {
      margin: 0;
      font-size: 12px;
      color: var(--color-ink-3, #64748b);
    }
  `,
})
export class FieldComponent {
  readonly label = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly required = input(false);
  readonly optional = input(false);

  readonly fieldId = `flr-field-${++fieldCounter}`;
  readonly hintId = `${this.fieldId}-hint`;
  readonly errorId = `${this.fieldId}-error`;

  readonly describedBy = computed(() => {
    if (this.error()) return this.errorId;
    if (this.hint()) return this.hintId;
    return null;
  });

  readonly invalid = computed(() => {
    const error = this.error();
    return error != null && error !== '';
  });
}
