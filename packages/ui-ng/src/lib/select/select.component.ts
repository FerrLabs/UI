import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SelectSize = 'sm' | 'md' | 'lg';

interface SelectDim {
  readonly height: number;
  readonly fontSize: number;
  readonly paddingLeft: number;
  readonly paddingRight: number;
  readonly chevronSize: number;
  readonly chevronOffset: number;
}

const SIZE: Record<SelectSize, SelectDim> = {
  sm: {
    height: 32,
    fontSize: 12,
    paddingLeft: 10,
    paddingRight: 28,
    chevronSize: 14,
    chevronOffset: 8,
  },
  md: {
    height: 40,
    fontSize: 14,
    paddingLeft: 12,
    paddingRight: 32,
    chevronSize: 16,
    chevronOffset: 10,
  },
  lg: {
    height: 48,
    fontSize: 16,
    paddingLeft: 14,
    paddingRight: 36,
    chevronSize: 18,
    chevronOffset: 12,
  },
};

const ERROR = 'var(--color-danger, #dc2626)';

/**
 * Native select with editorial chrome — Angular 22 port of
 * `@ferrlabs/ui-react`'s Select. Implements `ControlValueAccessor`; project
 * the `<option>`s as content. (Fixes the React original's missing
 * `--font-serif`, using the real `--font-sans` token.)
 */
@Component({
  selector: 'flr-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true },
  ],
  template: `
    <select
      class="flr-select"
      [value]="value()"
      [disabled]="disabled()"
      [attr.id]="selectId()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-invalid]="invalid() || null"
      [style]="styles()"
      (change)="handleChange($event)"
      (focus)="focused.set(true)"
      (blur)="handleBlur()"
    >
      <ng-content />
    </select>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-select {
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-sans, 'Fraunces', Georgia, ui-serif, serif);
      line-height: 1.4;
      color: var(--color-ink, #1e293b);
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      border-radius: 8px;
      outline: none;
      background-repeat: no-repeat;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' d='m4 6 4 4 4-4'/%3E%3C/svg%3E");
      transition:
        border-color 140ms,
        box-shadow 140ms;
    }
  `,
})
export class SelectComponent implements ControlValueAccessor {
  readonly invalid = input(false);
  readonly size = input<SelectSize>('md');
  readonly selectId = input<string | null>(null, { alias: 'id' });
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

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
        ? 'var(--color-accent, var(--color-ink, #1e293b))'
        : 'var(--color-rule-strong, rgba(30, 41, 59, 0.28))';
    const ring = this.invalid()
      ? 'color-mix(in oklab, var(--color-danger, #dc2626) 25%, transparent)'
      : 'color-mix(in oklab, var(--color-accent, var(--color-ink, #1e293b)) 30%, transparent)';
    return {
      height: `${dim.height}px`,
      'padding-left': `${dim.paddingLeft}px`,
      'padding-right': `${dim.paddingRight}px`,
      'font-size': `${dim.fontSize}px`,
      'background-color': this.disabled()
        ? 'var(--color-paper-2, #f3efe7)'
        : 'var(--color-card, #ffffff)',
      'background-position': `right ${dim.chevronOffset}px center`,
      'background-size': `${dim.chevronSize}px ${dim.chevronSize}px`,
      border: `1px solid ${border}`,
      'box-shadow': this.focused() ? `0 0 0 3px ${ring}` : null,
      cursor: this.disabled() ? 'not-allowed' : 'pointer',
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

  protected handleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  protected handleBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }
}
