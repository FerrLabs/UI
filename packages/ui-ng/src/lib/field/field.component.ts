import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';

let fieldCounter = 0;

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
            <span class="flr-field__optional">({{ optionalLabel() }})</span>
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
  readonly optionalLabel = input('optional');

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

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

  constructor() {
    afterRenderEffect(() => {
      const describedBy = this.describedBy();
      const control = this.host.nativeElement.querySelector<HTMLElement>('input, textarea, select');
      if (!control) {
        return;
      }
      if (!control.id) {
        control.id = this.fieldId;
      }
      const tokens = (control.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter((token) => token !== '' && token !== this.hintId && token !== this.errorId);
      if (describedBy) {
        tokens.push(describedBy);
      }
      if (tokens.length > 0) {
        control.setAttribute('aria-describedby', tokens.join(' '));
      } else {
        control.removeAttribute('aria-describedby');
      }
    });
  }
}
