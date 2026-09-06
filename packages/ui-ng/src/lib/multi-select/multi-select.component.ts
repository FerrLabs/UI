import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface MultiSelectOption {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
}

@Component({
  selector: 'flr-multi-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flr-ms" [class.flr-ms--invalid]="invalid()">
      @if (searchable()) {
        <input
          class="flr-ms__search"
          type="search"
          [attr.aria-label]="searchLabel()"
          [placeholder]="searchPlaceholder()"
          [value]="query()"
          (input)="onQuery($event)"
        />
      }

      <div class="flr-ms__list" role="group" [attr.aria-label]="label()">
        @for (o of visible(); track o.id) {
          <label class="flr-ms__row" [class.flr-ms__row--on]="isSelected(o.id)">
            <input
              type="checkbox"
              class="flr-ms__box"
              [checked]="isSelected(o.id)"
              [disabled]="disabled()"
              (change)="toggle(o.id)"
            />
            <span class="flr-ms__text">
              <span class="flr-ms__label">{{ o.label }}</span>
              @if (o.hint) {
                <span class="flr-ms__hint">{{ o.hint }}</span>
              }
            </span>
          </label>
        }

        @if (visible().length === 0) {
          <p class="flr-ms__empty">
            @if (loading()) {
              {{ loadingText() }}
            } @else {
              {{ options().length === 0 ? emptyText() : noMatchText() }}
            }
          </p>
        }
      </div>

      <div class="flr-ms__foot">
        <span class="flr-ms__count">{{ selectedCount() }} selected</span>
        @if (selectedCount() > 0 && !disabled()) {
          <button type="button" class="flr-ms__clear" (click)="clear()">Clear</button>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-ms {
      border: 1px solid var(--flr-rule, #e2e8f0);
      border-radius: 8px;
      overflow: hidden;
      background: var(--flr-bg, #fff);
    }
    .flr-ms--invalid {
      border-color: var(--color-danger, #dc2626);
    }
    .flr-ms__search {
      width: 100%;
      box-sizing: border-box;
      border: 0;
      border-bottom: 1px solid var(--flr-rule, #e2e8f0);
      padding: 9px 12px;
      font: 400 13px/1.4 var(--flr-font-sans, system-ui);
      color: inherit;
      background: transparent;
    }
    .flr-ms__search:focus {
      outline: none;
      border-bottom-color: var(--flr-accent, #f59e0b);
    }
    .flr-ms__list {
      max-height: 260px;
      overflow-y: auto;
    }
    .flr-ms__row {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 8px 12px;
      cursor: pointer;
      font: 400 13px/1.4 var(--flr-font-sans, system-ui);
    }
    .flr-ms__row:hover {
      background: color-mix(in oklab, currentColor 5%, transparent);
    }
    .flr-ms__row--on {
      background: color-mix(in oklab, var(--flr-accent, #f59e0b) 8%, transparent);
    }
    .flr-ms__box {
      margin-top: 2px;
      flex-shrink: 0;
    }
    .flr-ms__text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .flr-ms__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flr-ms__hint {
      font-size: 11.5px;
      opacity: 0.65;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flr-ms__empty {
      margin: 0;
      padding: 14px 12px;
      font: 400 12.5px/1.4 var(--flr-font-sans, system-ui);
      color: var(--color-ink-3, #5d6b80);
    }
    .flr-ms__foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 7px 12px;
      border-top: 1px solid var(--flr-rule, #e2e8f0);
      font: 400 11.5px/1 var(--flr-font-sans, system-ui);
      opacity: 0.75;
    }
    .flr-ms__clear {
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
      text-decoration: underline;
      padding: 0;
    }
  `,
})
export class MultiSelectComponent implements ControlValueAccessor {
  readonly options = input.required<readonly MultiSelectOption[]>();
  readonly label = input<string>('Options');
  readonly searchable = input<boolean>(true);
  readonly searchPlaceholder = input<string>('Filter…');
  readonly searchLabel = input<string>('Filter options');
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>('Loading…');
  readonly emptyText = input<string>('Nothing to choose from.');
  readonly noMatchText = input<string>('No match.');
  readonly invalid = input<boolean>(false);

  protected readonly query = signal('');
  protected readonly disabled = signal(false);
  private readonly selected = signal<ReadonlySet<string>>(new Set());

  protected readonly visible = computed<readonly MultiSelectOption[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.options();
    return this.options().filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint?.toLowerCase().includes(q) ?? false),
    );
  });

  protected readonly selectedCount = computed(() => this.selected().size);

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected toggle(id: string): void {
    if (this.disabled()) return;
    this.selected.update((set) => {
      const next = new Set(set);
      if (!next.delete(id)) next.add(id);
      return next;
    });
    this.emit();
  }

  protected clear(): void {
    if (this.disabled()) return;
    this.selected.set(new Set());
    this.emit();
  }

  private emit(): void {
    this.onChange([...this.selected()]);
    this.onTouched();
  }

  writeValue(value: readonly string[] | null): void {
    this.selected.set(new Set(value ?? []));
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
