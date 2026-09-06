import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const ERROR = 'var(--color-danger, #dc2626)';

@Component({
  selector: 'flr-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextareaComponent), multi: true },
  ],
  template: `
    <textarea
      class="flr-textarea"
      [rows]="rows()"
      [value]="value()"
      [attr.placeholder]="placeholder()"
      [attr.name]="name()"
      [attr.id]="textareaId()"
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
    ></textarea>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-textarea {
      width: 100%;
      box-sizing: border-box;
      min-height: 96px;
      padding: 10px 12px;
      font-size: 14px;
      font-family: var(--font-sans, 'Fraunces', Georgia, ui-serif, serif);
      line-height: 1.5;
      color: var(--color-ink, #1e293b);
      border-radius: 8px;
      outline: none;
      resize: vertical;
      transition:
        border-color 140ms,
        box-shadow 140ms;
    }
  `,
})
export class TextareaComponent implements ControlValueAccessor {
  readonly invalid = input(false);
  readonly rows = input(4);
  readonly placeholder = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly textareaId = input<string | null>(null, { alias: 'id' });
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly describedBy = input<string | null>(null, { alias: 'aria-describedby' });

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly focused = signal(false);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly styles = computed<Record<string, string | null>>(() => {
    const border = this.invalid()
      ? ERROR
      : this.focused()
        ? 'var(--color-accent, var(--color-ink, #1e293b))'
        : 'var(--color-rule-strong, rgba(30, 41, 59, 0.28))';
    const ring = this.invalid()
      ? 'color-mix(in oklab, var(--color-danger, #dc2626) 25%, transparent)'
      : 'color-mix(in oklab, var(--color-accent, var(--color-ink, #1e293b)) 30%, transparent)';
    return {
      background: this.disabled() ? 'var(--color-paper-2, #f3efe7)' : 'var(--color-card, #ffffff)',
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
    const value = (event.target as HTMLTextAreaElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected handleBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }
}
