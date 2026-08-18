import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Checkbox — Angular 22 port of `@ferrlabs/ui-react`'s Checkbox. Implements
 * `ControlValueAccessor` (boolean value) for reactive forms / `ngModel`.
 * Optional `label`/`hint`, `invalid` state, and `indeterminate` visual.
 */
@Component({
  selector: 'flr-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true },
  ],
  template: `
    <label class="flr-checkbox" [class.flr-checkbox--disabled]="disabled()">
      <span
        class="flr-checkbox__box"
        [class.flr-checkbox__box--on]="isOn()"
        [class.flr-checkbox__box--invalid]="invalid()"
        [class.flr-checkbox__box--focused]="focused()"
      >
        <input
          type="checkbox"
          class="flr-checkbox__input"
          [attr.id]="inputId()"
          [checked]="checked()"
          [indeterminate]="indeterminate()"
          [disabled]="disabled()"
          [attr.aria-invalid]="invalid() || null"
          (change)="toggle($event)"
          (focus)="focused.set(true)"
          (blur)="handleBlur()"
        />
        <span
          class="flr-checkbox__icon"
          [class.flr-checkbox__icon--on]="isOn()"
          [class.flr-checkbox__icon--indeterminate]="indeterminate()"
          aria-hidden="true"
        ></span>
      </span>
      @if (label() || hint()) {
        <span class="flr-checkbox__text">
          @if (label(); as l) {
            <span class="flr-checkbox__label">{{ l }}</span>
          }
          @if (hint(); as h) {
            <span class="flr-checkbox__hint">{{ h }}</span>
          }
        </span>
      }
    </label>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-checkbox {
      display: inline-flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }
    .flr-checkbox--disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .flr-checkbox__box {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      border-radius: 4px;
      background: var(--color-card, #ffffff);
      border: 1px solid var(--color-rule-strong, rgba(30, 41, 59, 0.28));
      transition:
        background 140ms,
        border-color 140ms,
        box-shadow 140ms;
    }
    .flr-checkbox__box--on {
      background: var(--color-accent, var(--color-ink, #1e293b));
      border-color: var(--color-accent, var(--color-ink, #1e293b));
    }
    .flr-checkbox__box--invalid {
      border-color: var(--color-danger, #dc2626);
    }
    .flr-checkbox__box--focused {
      box-shadow: 0 0 0 3px
        color-mix(in oklab, var(--color-accent, var(--color-ink, #1e293b)) 30%, transparent);
    }
    .flr-checkbox__box--invalid.flr-checkbox__box--focused {
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-danger, #dc2626) 30%, transparent);
    }
    .flr-checkbox--disabled .flr-checkbox__box {
      background: var(--color-paper-2, #f3efe7);
    }
    .flr-checkbox__input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }
    .flr-checkbox__icon {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-repeat: no-repeat;
      background-position: center;
      background-size: 12px 12px;
      opacity: 0;
      transition: opacity 120ms;
    }
    .flr-checkbox__icon--on {
      opacity: 1;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m4 8 3 3 5-6'/%3E%3C/svg%3E");
    }
    .flr-checkbox__icon--indeterminate {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath stroke='white' stroke-linecap='round' stroke-width='2' d='M4 8h8'/%3E%3C/svg%3E");
    }
    .flr-checkbox__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .flr-checkbox__label {
      font-size: 14px;
      color: var(--color-ink, #1e293b);
      line-height: 1.25;
    }
    .flr-checkbox__hint {
      font-size: 12px;
      color: var(--color-ink-3, #64748b);
      line-height: 1.25;
    }
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly invalid = input(false);
  readonly indeterminate = input(false);
  readonly inputId = input<string | null>(null, { alias: 'id' });

  protected readonly checked = signal(false);
  protected readonly disabled = signal(false);
  protected readonly focused = signal(false);
  protected readonly isOn = computed(() => this.checked() || this.indeterminate());

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected toggle(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange(value);
  }

  protected handleBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }
}
