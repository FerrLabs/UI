import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type SwitchSize = 'sm' | 'md';

const SIZE: Record<SwitchSize, { trackW: number; trackH: number; thumb: number; offset: number }> =
  {
    sm: { trackW: 28, trackH: 16, thumb: 12, offset: 2 },
    md: { trackW: 36, trackH: 20, thumb: 16, offset: 2 },
  };

@Component({
  selector: 'flr-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SwitchComponent), multi: true },
  ],
  template: `
    <!-- TODO(#122): a label cannot be associated with a button, so this wraps rather than
         labels. The switch needs aria-labelledby against the projected text instead. -->
    <!-- eslint-disable-next-line @angular-eslint/template/label-has-associated-control -->
    <label class="flr-switch" [class.flr-switch--disabled]="disabled()">
      <button
        type="button"
        class="flr-switch__track"
        role="switch"
        [attr.aria-checked]="checked()"
        [disabled]="disabled()"
        [style]="trackStyles()"
        (click)="toggle()"
        (focus)="focused.set(true)"
        (blur)="handleBlur()"
      >
        <span class="flr-switch__thumb" aria-hidden="true" [style]="thumbStyles()"></span>
      </button>
      @if (label() || hint()) {
        <span class="flr-switch__text">
          @if (label(); as l) {
            <span class="flr-switch__label">{{ l }}</span>
          }
          @if (hint(); as h) {
            <span class="flr-switch__hint">{{ h }}</span>
          }
        </span>
      }
    </label>
  `,
  styles: `
    :host {
      display: contents;
    }
    .flr-switch {
      display: inline-flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }
    .flr-switch--disabled {
      cursor: not-allowed;
      color: var(--color-ink-3, #5d6b80);
    }
    .flr-switch__track {
      position: relative;
      display: inline-flex;
      align-items: center;
      padding: 0;
      border-radius: 999px;
      border: 1px solid transparent;
      cursor: inherit;
      flex-shrink: 0;
      transition: background 160ms;
    }
    .flr-switch__thumb {
      display: inline-block;
      border-radius: 999px;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      transition: transform 160ms;
    }
    .flr-switch__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .flr-switch__label {
      font-size: 14px;
      color: var(--color-ink, #1e293b);
      line-height: 1.25;
    }
    .flr-switch__hint {
      font-size: 12px;
      color: var(--color-ink-3, #64748b);
      line-height: 1.25;
    }
  `,
})
export class SwitchComponent implements ControlValueAccessor {
  readonly label = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly size = input<SwitchSize>('md');

  protected readonly checked = signal(false);
  protected readonly disabled = signal(false);
  protected readonly focused = signal(false);
  protected readonly dim = computed(() => SIZE[this.size()]);

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly trackStyles = computed<Record<string, string | null>>(() => {
    const d = this.dim();
    return {
      width: `${d.trackW}px`,
      height: `${d.trackH}px`,
      background: this.checked()
        ? 'var(--color-accent, var(--color-ink, #1e293b))'
        : 'var(--color-rule-strong, rgba(30, 41, 59, 0.28))',
      'box-shadow': this.focused()
        ? '0 0 0 3px color-mix(in oklab, var(--color-accent, var(--color-ink, #1e293b)) 30%, transparent)'
        : null,
    };
  });

  protected readonly thumbStyles = computed<Record<string, string>>(() => {
    const d = this.dim();
    const x = this.checked() ? d.trackW - d.thumb - d.offset - 2 : d.offset;
    return {
      width: `${d.thumb}px`,
      height: `${d.thumb}px`,
      transform: `translateX(${x}px)`,
    };
  });

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

  protected toggle(): void {
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
  }

  protected handleBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }
}
