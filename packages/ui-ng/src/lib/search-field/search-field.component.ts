import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SearchFieldSize = 'sm' | 'md' | 'lg';

interface SearchDim {
  readonly height: number;
  readonly padX: number;
  readonly fontSize: number;
  readonly iconSize: number;
  readonly iconInset: number;
}

const SIZE: Record<SearchFieldSize, SearchDim> = {
  sm: { height: 32, padX: 28, fontSize: 12, iconSize: 14, iconInset: 8 },
  md: { height: 40, padX: 36, fontSize: 14, iconSize: 16, iconInset: 12 },
  lg: { height: 48, padX: 44, fontSize: 16, iconSize: 20, iconInset: 14 },
};

/**
 * Search input with leading icon and clear button — Angular 22 port of
 * `@ferrlabs/ui-react`'s SearchField. Implements `ControlValueAccessor`; the
 * clear button empties the value and emits `cleared`. (Fixes the React
 * original's missing `--font-serif`, using the real `--font-sans` token.)
 */
@Component({
  selector: 'flr-search-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchFieldComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flr-search">
      <span
        class="flr-search__icon"
        aria-hidden="true"
        [style.left.px]="dim().iconInset"
        [style.width.px]="dim().iconSize"
        [style.height.px]="dim().iconSize"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          [attr.width]="dim().iconSize"
          [attr.height]="dim().iconSize"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </span>
      <input
        type="search"
        class="flr-search__input"
        [value]="value()"
        [disabled]="disabled()"
        [attr.id]="inputId()"
        [attr.placeholder]="placeholder()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-invalid]="invalid() || null"
        [style]="inputStyles()"
        (input)="handleInput($event)"
        (focus)="focused.set(true)"
        (blur)="handleBlur()"
      />
      @if (value() && !disabled()) {
        <button
          type="button"
          class="flr-search__clear"
          aria-label="Clear search"
          [style.right.px]="dim().iconInset"
          (click)="clear()"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            [attr.width]="dim().iconSize"
            [attr.height]="dim().iconSize"
          >
            <path
              d="m6 6 12 12M6 18 18 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-search {
      position: relative;
      display: inline-flex;
      width: 100%;
      align-items: center;
    }
    .flr-search__icon {
      position: absolute;
      pointer-events: none;
      color: var(--color-ink-3);
      display: inline-flex;
    }
    .flr-search__input {
      width: 100%;
      box-sizing: border-box;
      border-radius: 8px;
      font-family: var(--font-sans);
      font-weight: 400;
      line-height: 1.4;
      outline: none;
      transition:
        border-color 140ms,
        box-shadow 140ms;
    }
    .flr-search__clear {
      position: absolute;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      color: var(--color-ink-3);
      transition: color 140ms;
    }
    .flr-search__clear:hover {
      color: var(--color-ink);
    }
  `,
})
export class SearchFieldComponent implements ControlValueAccessor {
  readonly size = input<SearchFieldSize>('md');
  readonly invalid = input(false);
  readonly placeholder = input<string | null>(null);
  readonly inputId = input<string | null>(null, { alias: 'id' });
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  readonly cleared = output<void>();

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly focused = signal(false);
  protected readonly dim = computed(() => SIZE[this.size()]);

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly inputStyles = computed<Record<string, string>>(() => {
    const dim = this.dim();
    const border = this.invalid()
      ? '#dc2626'
      : this.focused()
        ? 'var(--color-accent, var(--color-fg, #1e293b))'
        : 'var(--color-rule-strong, rgba(30, 41, 59, 0.24))';
    const ring = this.invalid()
      ? '0 0 0 4px color-mix(in oklab, #dc2626 14%, transparent)'
      : '0 0 0 4px color-mix(in oklab, var(--color-accent, var(--color-fg, #1e293b)) 14%, transparent)';
    return {
      height: `${dim.height}px`,
      'padding-left': `${dim.padX}px`,
      'padding-right': `${dim.padX}px`,
      'font-size': `${dim.fontSize}px`,
      border: `1px solid ${border}`,
      background: this.disabled() ? 'var(--color-paper-2, #f4f4f2)' : 'var(--color-card, #ffffff)',
      color: this.disabled() ? 'var(--color-ink-3, #64748b)' : 'var(--color-ink, #1e293b)',
      'box-shadow': this.focused() ? ring : 'none',
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

  protected clear(): void {
    this.value.set('');
    this.onChange('');
    this.cleared.emit();
  }
}
