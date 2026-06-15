import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputSize = 'sm' | 'md' | 'lg';

const SIZE: Record<InputSize, { height: string; fontSize: string; padding: string }> = {
  sm: { height: '32px', fontSize: '12px', padding: '0 10px' },
  md: { height: '40px', fontSize: '14px', padding: '0 12px' },
  lg: { height: '48px', fontSize: '16px', padding: '0 14px' },
};

const ERROR = '#dc2626';

/**
 * Text input — Angular 22 port of `@ferrlabs/ui-react`'s Input. Implements
 * `ControlValueAccessor`, so it drops into reactive forms and `ngModel`
 * directly (`<flr-input formControlName="email" />`). Shows a focus ring and
 * an `invalid` error state. (Fixes the React original's missing
 * `--font-serif`, using the real `--font-sans` token.)
 */
@Component({
  selector: 'flr-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputComponent), multi: true },
  ],
  template: `
    <input
      class="flr-input"
      [type]="type()"
      [value]="value()"
      [attr.placeholder]="placeholder()"
      [attr.name]="name()"
      [attr.autocomplete]="autocomplete()"
      [attr.inputmode]="inputMode()"
      [attr.id]="inputId()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-describedby]="describedBy()"
      [attr.aria-invalid]="invalid() || null"
      [readOnly]="readonly()"
      [required]="required()"
      [disabled]="disabled()"
      [style]="styles()"
      (input)="handleInput($event)"
      (focus)="focused.set(true)"
      (blur)="handleBlur()"
    />
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-input {
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-sans);
      line-height: 1.4;
      color: var(--color-ink);
      border-radius: 8px;
      outline: none;
      transition:
        border-color 140ms,
        box-shadow 140ms;
    }
  `,
})
export class InputComponent implements ControlValueAccessor {
  readonly invalid = input(false);
  readonly size = input<InputSize>('md');
  readonly type = input('text');
  readonly placeholder = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly inputMode = input<string | null>(null, { alias: 'inputmode' });
  readonly readonly = input(false);
  readonly required = input(false);
  readonly inputId = input<string | null>(null, { alias: 'id' });
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly describedBy = input<string | null>(null, { alias: 'aria-describedby' });

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly focused = signal(false);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly styles = computed<Record<string, string | null>>(() => {
    const dim = SIZE[this.size()];
    const border = this.invalid()
      ? ERROR
      : this.focused()
        ? 'var(--color-accent, var(--color-ink))'
        : 'var(--color-rule-strong)';
    const ring = this.invalid()
      ? 'color-mix(in oklab, #dc2626 25%, transparent)'
      : 'color-mix(in oklab, var(--color-accent, var(--color-ink)) 30%, transparent)';
    return {
      height: dim.height,
      padding: dim.padding,
      'font-size': dim.fontSize,
      background: this.disabled() ? 'var(--color-paper-2)' : 'var(--color-card)',
      border: `1px solid ${border}`,
      'box-shadow': this.focused() ? `0 0 0 3px ${ring}` : null,
      cursor: this.disabled() ? 'not-allowed' : 'text',
      opacity: this.disabled() ? '0.65' : '1',
    };
  });

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected handleBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }
}
