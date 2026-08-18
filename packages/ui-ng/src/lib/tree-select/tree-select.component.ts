import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import type { MultiSelectOption } from '../multi-select/multi-select.component';

/**
 * A branch of the tree — an organisation, a team, a namespace.
 *
 * `id` only has to be unique among groups; it is never part of the form value,
 * which carries leaf ids alone. A group is a way to reach its leaves, not
 * something the consumer can select on its own.
 */
export interface TreeSelectGroup {
  readonly id: string;
  readonly label: string;
  /** Secondary line on the group row — a count, a plan, an account type. */
  readonly hint?: string;
  readonly options: readonly MultiSelectOption[];
}

/**
 * Two-level filterable multi-select with a checkbox per row.
 *
 * Exists because {@link MultiSelectComponent} flattens: with several GitHub
 * organisations and a few dozen repositories each, a flat list gives no way to
 * take "everything in this org" and no way to fold away the orgs you are not
 * working in. Here each group carries its own checkbox — checked, unchecked,
 * or indeterminate — and collapses independently.
 *
 * Like the flat one it is deliberately dumb about *where* groups come from:
 * the consumer loads them and passes them in, so this component never knows
 * about HTTP or pagination.
 *
 * Implements `ControlValueAccessor`; the value is a `string[]` of **leaf** ids.
 */
@Component({
  selector: 'flr-tree-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreeSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flr-ts" [class.flr-ts--invalid]="invalid()">
      @if (searchable()) {
        <input
          class="flr-ts__search"
          type="search"
          [attr.aria-label]="searchLabel()"
          [placeholder]="searchPlaceholder()"
          [value]="query()"
          (input)="onQuery($event)"
        />
      }

      <div class="flr-ts__tree" role="tree" [attr.aria-label]="label()">
        @for (g of visible(); track g.id) {
          <div class="flr-ts__group" role="treeitem">
            <div class="flr-ts__grouprow">
              <input
                type="checkbox"
                class="flr-ts__box"
                [attr.aria-label]="'Select all in ' + g.label"
                [checked]="groupState(g) === 'all'"
                [indeterminate]="groupState(g) === 'some'"
                [disabled]="disabled()"
                (change)="toggleGroup(g)"
              />
              <button
                type="button"
                class="flr-ts__toggle"
                [attr.aria-expanded]="isOpen(g.id)"
                (click)="toggleOpen(g.id)"
              >
                <span class="flr-ts__chev" [class.flr-ts__chev--open]="isOpen(g.id)">›</span>
                <span class="flr-ts__grouplabel">{{ g.label }}</span>
                <span class="flr-ts__groupmeta">
                  {{ selectedIn(g) }}/{{ g.options.length }}
                  @if (g.hint) {
                    · {{ g.hint }}
                  }
                </span>
              </button>
            </div>

            @if (isOpen(g.id)) {
              <div class="flr-ts__leaves" role="group">
                @for (o of g.options; track o.id) {
                  <label class="flr-ts__row" [class.flr-ts__row--on]="isSelected(o.id)">
                    <input
                      type="checkbox"
                      class="flr-ts__box"
                      [checked]="isSelected(o.id)"
                      [disabled]="disabled()"
                      (change)="toggle(o.id)"
                    />
                    <span class="flr-ts__text">
                      <span class="flr-ts__label">{{ o.label }}</span>
                      @if (o.hint) {
                        <span class="flr-ts__hint">{{ o.hint }}</span>
                      }
                    </span>
                  </label>
                }
              </div>
            }
          </div>
        }

        @if (visible().length === 0) {
          <p class="flr-ts__empty">
            {{ groups().length === 0 ? emptyText() : noMatchText() }}
          </p>
        }
      </div>

      <div class="flr-ts__foot">
        <span class="flr-ts__count">{{ selectedCount() }} selected</span>
        @if (selectedCount() > 0 && !disabled()) {
          <button type="button" class="flr-ts__clear" (click)="clear()">Clear</button>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-ts {
      border: 1px solid var(--flr-rule, #e2e8f0);
      border-radius: 8px;
      overflow: hidden;
      background: var(--flr-bg, #fff);
    }
    .flr-ts--invalid {
      border-color: var(--color-danger, #dc2626);
    }
    .flr-ts__search {
      width: 100%;
      box-sizing: border-box;
      border: 0;
      border-bottom: 1px solid var(--flr-rule, #e2e8f0);
      padding: 9px 12px;
      font: 400 13px/1.4 var(--flr-font-sans, system-ui);
      color: inherit;
      background: transparent;
    }
    .flr-ts__search:focus {
      outline: none;
      border-bottom-color: var(--flr-accent, #f59e0b);
    }
    .flr-ts__tree {
      max-height: 320px;
      overflow-y: auto;
    }
    .flr-ts__group + .flr-ts__group {
      border-top: 1px solid var(--flr-rule, #e2e8f0);
    }
    .flr-ts__grouprow {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 8px 12px;
    }
    .flr-ts__toggle {
      display: flex;
      align-items: baseline;
      gap: 8px;
      flex: 1;
      min-width: 0;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      padding: 0;
      text-align: left;
      font: 500 13px/1.4 var(--flr-font-sans, system-ui);
    }
    .flr-ts__chev {
      display: inline-block;
      transition: transform 0.12s ease;
      opacity: 0.55;
    }
    .flr-ts__chev--open {
      transform: rotate(90deg);
    }
    .flr-ts__grouplabel {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flr-ts__groupmeta {
      font-size: 11.5px;
      opacity: 0.6;
      white-space: nowrap;
    }
    .flr-ts__leaves {
      padding-bottom: 4px;
    }
    .flr-ts__row {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 6px 12px 6px 33px;
      cursor: pointer;
      font: 400 13px/1.4 var(--flr-font-sans, system-ui);
    }
    .flr-ts__row:hover {
      background: color-mix(in oklab, currentColor 5%, transparent);
    }
    .flr-ts__row--on {
      background: color-mix(in oklab, var(--flr-accent, #f59e0b) 8%, transparent);
    }
    .flr-ts__box {
      margin-top: 2px;
      flex-shrink: 0;
    }
    .flr-ts__text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .flr-ts__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flr-ts__hint {
      font-size: 11.5px;
      opacity: 0.65;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .flr-ts__empty {
      margin: 0;
      padding: 14px 12px;
      font: 400 12.5px/1.4 var(--flr-font-sans, system-ui);
      opacity: 0.6;
    }
    .flr-ts__foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 7px 12px;
      border-top: 1px solid var(--flr-rule, #e2e8f0);
      font: 400 11.5px/1 var(--flr-font-sans, system-ui);
      opacity: 0.75;
    }
    .flr-ts__clear {
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
export class TreeSelectComponent implements ControlValueAccessor {
  readonly groups = input.required<readonly TreeSelectGroup[]>();
  readonly label = input<string>('Options');
  readonly searchable = input<boolean>(true);
  readonly searchPlaceholder = input<string>('Filter…');
  readonly searchLabel = input<string>('Filter options');
  /**
   * Whether groups start open. Off is the better default past a handful of
   * groups: the point of the tree is to see the orgs before the repositories.
   */
  readonly startExpanded = input<boolean>(false);
  /** Shown when there is nothing at all — distinct from "no match". */
  readonly emptyText = input<string>('Nothing to choose from.');
  readonly noMatchText = input<string>('No match.');
  readonly invalid = input<boolean>(false);

  protected readonly query = signal('');
  protected readonly disabled = signal(false);
  private readonly selected = signal<ReadonlySet<string>>(new Set());
  /** Groups the user has explicitly toggled, against the `startExpanded` default. */
  private readonly flipped = signal<ReadonlySet<string>>(new Set());

  /**
   * Groups reduced to the leaves matching the filter, with empty groups
   * dropped. A group whose own label matches keeps all of its leaves — typing
   * an org name is how you ask for that whole org, and hiding its
   * repositories because they don't repeat the org name would be baffling.
   */
  protected readonly visible = computed<readonly TreeSelectGroup[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.groups();
    const hit = (text: string | undefined) => text?.toLowerCase().includes(q) ?? false;
    return this.groups()
      .map((g) => {
        if (hit(g.label) || hit(g.hint)) return g;
        return { ...g, options: g.options.filter((o) => hit(o.label) || hit(o.hint)) };
      })
      .filter((g) => g.options.length > 0);
  });

  protected readonly selectedCount = computed(() => this.selected().size);

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  protected isSelected(id: string): boolean {
    return this.selected().has(id);
  }

  /**
   * Open while filtering regardless of the fold state: a filter that matched
   * something inside a collapsed group would otherwise look like no match.
   */
  protected isOpen(groupId: string): boolean {
    if (this.query().trim()) return true;
    return this.flipped().has(groupId) !== this.startExpanded();
  }

  protected toggleOpen(groupId: string): void {
    this.flipped.update((set) => {
      const next = new Set(set);
      if (!next.delete(groupId)) next.add(groupId);
      return next;
    });
  }

  protected selectedIn(group: TreeSelectGroup): number {
    return group.options.reduce((n, o) => n + (this.selected().has(o.id) ? 1 : 0), 0);
  }

  protected groupState(group: TreeSelectGroup): 'none' | 'some' | 'all' {
    const n = this.selectedIn(group);
    if (n === 0) return 'none';
    return n === group.options.length ? 'all' : 'some';
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

  /**
   * Selects or clears the leaves **currently shown** for this group, not every
   * leaf it holds. Under an active filter the checkbox has to mean what the
   * user can see, or "select all" would quietly pull in rows they filtered out.
   */
  protected toggleGroup(group: TreeSelectGroup): void {
    if (this.disabled()) return;
    const turningOn = this.groupState(group) !== 'all';
    this.selected.update((set) => {
      const next = new Set(set);
      for (const o of group.options) {
        if (turningOn) next.add(o.id);
        else next.delete(o.id);
      }
      return next;
    });
    this.emit();
  }

  /**
   * Clears the selection, not the filter. Clearing both would hide which rows
   * were just deselected, and the filter is the user's place in the tree.
   */
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
