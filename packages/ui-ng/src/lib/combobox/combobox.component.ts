import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { inheritedTokens, PANEL_POSITIONS } from '../multi-select/panel-tokens';
import {
  clampIndex,
  type ComboboxOption,
  emptyState,
  filterOptions,
  intentFor,
  labelFor,
  stepActive,
} from './combobox.model';

const SEARCH_DEBOUNCE_MS = 250;

let nextId = 0;

@Component({
  selector: 'flr-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.None,
  imports: [OverlayModule],
  host: {
    '[attr.id]': 'null',
    '[attr.aria-label]': 'null',
    '(focusout)': 'onFocusOut($event)',
  },
  templateUrl: './combobox.component.html',
  styleUrls: [
    '../multi-select/multi-select.component.css',
    './combobox.component.css',
    '../overlay/cdk-overlay.css',
  ],
})
export class ComboboxComponent implements ControlValueAccessor {
  readonly options = input<readonly ComboboxOption[]>([]);
  readonly placeholder = input<string>('Select…');
  readonly searchPlaceholder = input<string>('Search…');
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>('Loading…');
  readonly emptyText = input<string>('Nothing to choose from.');
  readonly noMatchText = input<string>('No match.');
  readonly invalid = input<boolean>(false);
  readonly localFilter = input<boolean>(true);
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly triggerId = input<string | null>(null, { alias: 'id' });

  readonly searchChange = output<string>();

  protected readonly uid = `flr-cb-${nextId++}`;
  protected readonly query = signal('');
  protected readonly disabled = signal(false);
  protected readonly open = signal(false);
  protected readonly panelTokens = signal<Record<string, string>>({});
  protected readonly panelMinWidth = signal(0);
  protected readonly positions = PANEL_POSITIONS;
  private readonly value = signal<string | null>(null);
  private readonly picked = signal<ComboboxOption | null>(null);
  private readonly cursor = signal(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');
  private readonly listbox = viewChild<ElementRef<HTMLElement>>('listbox');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly visible = computed<readonly ComboboxOption[]>(() =>
    this.localFilter() ? filterOptions(this.options(), this.query()) : this.options(),
  );

  protected readonly active = computed(() => clampIndex(this.cursor(), this.visible().length));

  protected readonly selectedLabel = computed(() =>
    labelFor(this.options(), this.value(), this.picked()),
  );

  protected readonly summary = computed(() => this.selectedLabel() ?? this.placeholder());

  protected readonly triggerLabel = computed(() => {
    const label = this.ariaLabel();
    return label ? `${label}: ${this.summary()}` : null;
  });

  protected readonly activeOptionId = computed(() =>
    this.open() && this.visible().length > 0 ? this.optionId(this.active()) : null,
  );

  protected readonly empty = computed(() =>
    emptyState(this.loading(), this.options().length, this.visible().length, this.query()),
  );

  protected readonly emptyMessage = computed(() => {
    switch (this.empty()) {
      case 'loading':
        return this.loadingText();
      case 'empty':
        return this.emptyText();
      case 'no-match':
        return this.noMatchText();
      default:
        return null;
    }
  });

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelSearchTimer());
  }

  protected isSelected(option: ComboboxOption): boolean {
    return option.value === this.value();
  }

  protected optionId(index: number): string {
    return `${this.uid}-opt-${index}`;
  }

  protected onQuery(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.query.set(query);
    this.cursor.set(0);
    this.cancelSearchTimer();
    this.searchTimer = setTimeout(() => this.searchChange.emit(query), SEARCH_DEBOUNCE_MS);
  }

  protected toggleOpen(): void {
    if (this.open()) this.close(true);
    else this.openPanel();
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    const intent = intentFor(event.key);
    if (!intent) return;
    event.preventDefault();
    switch (intent) {
      case 'next':
      case 'previous':
        this.moveActive(stepActive(this.active(), this.visible().length, intent));
        break;
      case 'select': {
        const option = this.visible()[this.active()];
        if (option) this.select(option);
        break;
      }
      case 'close':
        event.stopPropagation();
        this.close(true);
        break;
    }
  }

  protected onListClick(event: MouseEvent): void {
    const row = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    const option = this.visible()[Number(row?.dataset['index'])];
    if (option) this.select(option);
  }

  protected onOutsideClick(event: MouseEvent): void {
    if (this.trigger()?.nativeElement.contains(event.target as Node)) return;
    this.close(false);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!this.open() || !next) return;
    if (this.host.nativeElement.contains(next)) return;
    if (this.panel()?.nativeElement.contains(next)) return;
    this.close(false);
  }

  protected close(restoreFocus: boolean): void {
    if (!this.open()) return;
    this.open.set(false);
    this.resetQuery();
    this.onTouched();
    if (restoreFocus) this.trigger()?.nativeElement.focus();
  }

  private select(option: ComboboxOption): void {
    if (this.disabled()) return;
    this.picked.set(option);
    this.value.set(option.value);
    this.onChange(option.value);
    this.close(true);
  }

  private openPanel(): void {
    if (this.disabled() || this.open()) return;
    this.cursor.set(
      Math.max(
        this.visible().findIndex((o) => this.isSelected(o)),
        0,
      ),
    );
    this.panelTokens.set(inheritedTokens(this.host.nativeElement));
    this.panelMinWidth.set(this.trigger()?.nativeElement.offsetWidth ?? 0);
    this.open.set(true);
    afterNextRender(() => this.search()?.nativeElement.focus(), { injector: this.injector });
  }

  private moveActive(index: number): void {
    this.cursor.set(index);
    this.listbox()
      ?.nativeElement.querySelector(`#${this.optionId(index)}`)
      ?.scrollIntoView({ block: 'nearest' });
  }

  private resetQuery(): void {
    this.cancelSearchTimer();
    if (this.query() === '') return;
    this.query.set('');
    this.searchChange.emit('');
  }

  private cancelSearchTimer(): void {
    if (this.searchTimer === null) return;
    clearTimeout(this.searchTimer);
    this.searchTimer = null;
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled && this.open()) this.close(false);
  }
}
