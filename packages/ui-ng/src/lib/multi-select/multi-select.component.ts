import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { type ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { inheritedTokens } from './panel-tokens';

export interface MultiSelectOption {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
}

export type MultiSelectMode = 'list' | 'dropdown';

let nextId = 0;

const PANEL_POSITIONS: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
  { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6 },
  { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6 },
];

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
  encapsulation: ViewEncapsulation.None,
  imports: [OverlayModule],
  host: {
    '(focusout)': 'onFocusOut($event)',
  },
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.css', '../overlay/cdk-overlay.css'],
})
export class MultiSelectComponent implements ControlValueAccessor {
  readonly options = input.required<readonly MultiSelectOption[]>();
  readonly mode = input<MultiSelectMode>('list');
  readonly label = input<string>('Options');
  readonly triggerId = input<string | null>(null, { alias: 'id' });
  readonly placeholder = input<string>('Select…');
  readonly selectedText = input<(count: number) => string>((count) => `${count} selected`);
  readonly clearText = input<string>('Clear');
  readonly searchable = input<boolean>(true);
  readonly searchPlaceholder = input<string>('Filter…');
  readonly searchLabel = input<string>('Filter options');
  readonly loading = input<boolean>(false);
  readonly loadingText = input<string>('Loading…');
  readonly emptyText = input<string>('Nothing to choose from.');
  readonly noMatchText = input<string>('No match.');
  readonly invalid = input<boolean>(false);

  protected readonly uid = `flr-ms-${nextId++}`;
  protected readonly query = signal('');
  protected readonly disabled = signal(false);
  protected readonly open = signal(false);
  protected readonly active = signal(0);
  protected readonly panelTokens = signal<Record<string, string>>({});
  protected readonly panelMinWidth = signal(0);
  protected readonly positions = PANEL_POSITIONS;
  private readonly selected = signal<ReadonlySet<string>>(new Set());

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly search = viewChild<ElementRef<HTMLInputElement>>('search');
  private readonly listbox = viewChild<ElementRef<HTMLElement>>('listbox');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly visible = computed<readonly MultiSelectOption[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.options();
    return this.options().filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint?.toLowerCase().includes(q) ?? false),
    );
  });

  protected readonly selectedCount = computed(() => this.selected().size);

  protected readonly countText = computed(() => this.selectedText()(this.selectedCount()));

  protected readonly summary = computed(() => {
    const picked = this.selected();
    if (picked.size === 0) return this.placeholder();
    if (picked.size === 1) {
      const [id] = picked;
      return this.options().find((o) => o.id === id)?.label ?? id;
    }
    return this.countText();
  });

  protected readonly activeOptionId = computed(() =>
    this.open() && this.visible().length > 0 ? this.optionId(this.active()) : null,
  );

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  protected optionId(index: number): string {
    return `${this.uid}-opt-${index}`;
  }

  protected onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(0);
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

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    }
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && this.visible().length > 0) {
      event.preventDefault();
      this.listbox()?.nativeElement.focus();
    }
  }

  protected onListKeydown(event: KeyboardEvent): void {
    const count = this.visible().length;
    if (count === 0) return;
    switch (event.key) {
      case 'ArrowDown':
        this.moveActive(Math.min(this.active() + 1, count - 1));
        break;
      case 'ArrowUp':
        if (this.active() === 0 && this.search()) {
          this.search()?.nativeElement.focus();
        } else {
          this.moveActive(Math.max(this.active() - 1, 0));
        }
        break;
      case 'Home':
        this.moveActive(0);
        break;
      case 'End':
        this.moveActive(count - 1);
        break;
      case ' ':
      case 'Enter': {
        const option = this.visible()[this.active()];
        if (option) this.toggle(option.id);
        break;
      }
      default:
        return;
    }
    event.preventDefault();
  }

  protected onListClick(event: MouseEvent): void {
    const row = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
    const index = Number(row?.dataset['index']);
    const option = this.visible()[index];
    if (!option) return;
    this.active.set(index);
    this.toggle(option.id);
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

  private openPanel(): void {
    if (this.disabled() || this.open()) return;
    const firstSelected = this.visible().findIndex((o) => this.isSelected(o.id));
    this.active.set(Math.max(firstSelected, 0));
    this.panelTokens.set(inheritedTokens(this.host.nativeElement));
    this.panelMinWidth.set(this.trigger()?.nativeElement.offsetWidth ?? 0);
    this.open.set(true);
    afterNextRender(() => (this.search() ?? this.listbox())?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  protected close(restoreFocus: boolean): void {
    if (!this.open()) return;
    this.open.set(false);
    this.query.set('');
    this.onTouched();
    if (restoreFocus) this.trigger()?.nativeElement.focus();
  }

  private moveActive(index: number): void {
    this.active.set(index);
    this.listbox()
      ?.nativeElement.querySelector(`#${this.optionId(index)}`)
      ?.scrollIntoView({ block: 'nearest' });
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
    if (isDisabled && this.open()) this.close(false);
  }
}
