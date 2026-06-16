import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

let radioGroupCounter = 0;

/**
 * Radio group — Angular 22 port of `@ferrlabs/ui-react`'s RadioGroup.
 * Implements `ControlValueAccessor`; child `<flr-radio>`s resolve it through
 * DI and report their selection back. Use `<flr-radio-group formControlName>`.
 */
@Component({
  selector: 'flr-radio-group',
  exportAs: 'flrRadioGroup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioGroupComponent), multi: true },
  ],
  template: `
    <div
      class="flr-radio-group"
      role="radiogroup"
      [attr.aria-label]="ariaLabel()"
      [class.flr-radio-group--horizontal]="orientation() === 'horizontal'"
    >
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-radio-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .flr-radio-group--horizontal {
      flex-direction: row;
      gap: 16px;
    }
  `,
})
export class RadioGroupComponent implements ControlValueAccessor {
  readonly orientation = input<RadioGroupOrientation>('vertical');
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly name = input<string>(`flr-radio-${++radioGroupCounter}`);

  readonly value = signal<string | number | null>(null);
  readonly disabled = signal(false);

  private onChange: (value: string | number) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string | number | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  select(value: string | number): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }
}

/**
 * Radio option — Angular 22 port of `@ferrlabs/ui-react`'s Radio. Must be
 * nested inside a `<flr-radio-group>`; checked state and the shared `name`
 * come from the enclosing group.
 */
@Component({
  selector: 'flr-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flr-radio" [class.flr-radio--disabled]="isDisabled()">
      <span
        class="flr-radio__box"
        [class.flr-radio__box--invalid]="invalid()"
        [class.flr-radio__box--focused]="focused()"
      >
        <input
          type="radio"
          class="flr-radio__input"
          [attr.id]="inputId()"
          [attr.name]="groupName()"
          [value]="value()"
          [checked]="checked()"
          [disabled]="isDisabled()"
          [attr.aria-invalid]="invalid() || null"
          (change)="select()"
          (focus)="focused.set(true)"
          (blur)="handleBlur()"
        />
        <span
          class="flr-radio__dot"
          [class.flr-radio__dot--on]="checked()"
          aria-hidden="true"
        ></span>
      </span>
      @if (label() || hint()) {
        <span class="flr-radio__text">
          @if (label(); as l) {
            <span class="flr-radio__label">{{ l }}</span>
          }
          @if (hint(); as h) {
            <span class="flr-radio__hint">{{ h }}</span>
          }
        </span>
      }
    </label>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-radio {
      display: inline-flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }
    .flr-radio--disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .flr-radio__box {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      border-radius: 999px;
      background: var(--color-card);
      border: 1px solid var(--color-rule-strong);
      transition:
        border-color 140ms,
        box-shadow 140ms;
    }
    .flr-radio__box--invalid {
      border-color: #dc2626;
    }
    .flr-radio__box--focused {
      box-shadow: 0 0 0 3px
        color-mix(in oklab, var(--color-accent, var(--color-ink)) 30%, transparent);
    }
    .flr-radio__box--invalid.flr-radio__box--focused {
      box-shadow: 0 0 0 3px color-mix(in oklab, #dc2626 30%, transparent);
    }
    .flr-radio--disabled .flr-radio__box {
      background: var(--color-paper-2);
    }
    .flr-radio__input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }
    .flr-radio__dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--color-accent, var(--color-ink));
      opacity: 0;
      transition: opacity 120ms;
      pointer-events: none;
    }
    .flr-radio__dot--on {
      opacity: 1;
    }
    .flr-radio__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .flr-radio__label {
      font-size: 14px;
      color: var(--color-ink);
      line-height: 1.25;
    }
    .flr-radio__hint {
      font-size: 12px;
      color: var(--color-ink-3);
      line-height: 1.25;
    }
  `,
})
export class RadioComponent {
  private readonly group = inject(RadioGroupComponent, { optional: true });

  readonly value = input.required<string | number>();
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly inputId = input<string | null>(null, { alias: 'id' });

  protected readonly focused = signal(false);

  protected readonly checked = computed(() => {
    const groupValue = this.group?.value();
    return groupValue != null && String(groupValue) === String(this.value());
  });

  protected readonly isDisabled = computed(
    () => this.disabled() || (this.group?.disabled() ?? false),
  );
  protected readonly groupName = computed(() => this.group?.name() ?? null);

  protected select(): void {
    this.group?.select(this.value());
  }

  protected handleBlur(): void {
    this.focused.set(false);
    this.group?.onTouched();
  }
}
