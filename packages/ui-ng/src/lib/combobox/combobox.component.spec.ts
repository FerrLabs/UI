import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { ComboboxComponent } from './combobox.component';
import type { ComboboxOption } from './combobox.model';

interface Internals {
  query: WritableSignal<string>;
  open: Signal<boolean>;
  disabled: Signal<boolean>;
  visible: Signal<readonly ComboboxOption[]>;
  active: Signal<number>;
  summary: Signal<string>;
  selectedLabel: Signal<string | null>;
  triggerLabel: Signal<string | null>;
  activeOptionId: Signal<string | null>;
  empty: Signal<string | null>;
  emptyMessage: Signal<string | null>;
  isSelected(option: ComboboxOption): boolean;
  optionId(index: number): string;
  onQuery(event: Event): void;
  toggleOpen(): void;
  onTriggerKeydown(event: KeyboardEvent): void;
  onSearchKeydown(event: KeyboardEvent): void;
  onListClick(event: MouseEvent): void;
  onOutsideClick(event: MouseEvent): void;
  onFocusOut(event: FocusEvent): void;
  close(restoreFocus: boolean): void;
}

const OPTIONS: readonly ComboboxOption[] = [
  { value: 'wf-1', label: 'Nightly build', hint: 'Workflow' },
  { value: 'wf-2', label: 'Release train' },
  { value: 'ag-1', label: 'Triage agent', hint: 'Agent' },
];

function keyEvent(key: string) {
  return { key, preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as KeyboardEvent & {
    preventDefault: ReturnType<typeof vi.fn>;
    stopPropagation: ReturnType<typeof vi.fn>;
  };
}

function typed(value: string): Event {
  return { target: { value } } as unknown as Event;
}

function rowClick(index: number): MouseEvent {
  return {
    target: { closest: () => ({ dataset: { index: String(index) } }) },
  } as unknown as MouseEvent;
}

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(ComboboxComponent, { options: OPTIONS, ...inputs });
  const change = vi.fn();
  const touched = vi.fn();
  const search = vi.fn();
  component.registerOnChange(change);
  component.registerOnTouched(touched);
  component.searchChange.subscribe(search);
  return { component, internals: component as unknown as Internals, change, touched, search };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('getComputedStyle', () => ({ color: 'red', getPropertyValue: () => '' }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ComboboxComponent selection', () => {
  it('shows the placeholder until a value is written', () => {
    const { component, internals } = setup({ placeholder: 'Choose' });
    expect(internals.summary()).toBe('Choose');
    component.writeValue('wf-2');
    expect(internals.summary()).toBe('Release train');
    component.writeValue(null);
    expect(internals.summary()).toBe('Choose');
  });

  it('falls back to the raw value when the option is unknown', () => {
    const { component, internals } = setup();
    component.writeValue('missing');
    expect(internals.selectedLabel()).toBe('missing');
  });

  it('builds the trigger aria label only when an aria-label is set', () => {
    expect(setup().internals.triggerLabel()).toBeNull();
    const labelled = setup({ ariaLabel: 'Workflow' });
    labelled.component.writeValue('wf-1');
    expect(labelled.internals.triggerLabel()).toBe('Workflow: Nightly build');
  });

  it('keeps the picked label when the option list no longer contains the value', () => {
    const { internals, component } = setup();
    internals.toggleOpen();
    internals.onListClick(rowClick(2));
    const options = (component as unknown as { options: WritableSignal<readonly ComboboxOption[]> })
      .options;
    options.set([]);
    expect(internals.selectedLabel()).toBe('Triage agent');
  });

  it('clicking a row selects it, reports the value, marks touched and closes', () => {
    const { internals, change, touched } = setup();
    internals.toggleOpen();
    internals.onListClick(rowClick(1));
    expect(change).toHaveBeenCalledWith('wf-2');
    expect(touched).toHaveBeenCalledTimes(1);
    expect(internals.open()).toBe(false);
    expect(internals.isSelected(OPTIONS[1])).toBe(true);
    expect(internals.isSelected(OPTIONS[0])).toBe(false);
  });

  it('ignores clicks that miss a row or point past the list', () => {
    const { internals, change } = setup();
    internals.onListClick({ target: { closest: () => null } } as unknown as MouseEvent);
    internals.onListClick(rowClick(7));
    expect(change).not.toHaveBeenCalled();
  });

  it('does not select while disabled', () => {
    const { component, internals, change } = setup();
    component.setDisabledState(true);
    internals.onListClick(rowClick(0));
    expect(change).not.toHaveBeenCalled();
    expect(internals.disabled()).toBe(true);
  });
});

describe('ComboboxComponent filtering and search', () => {
  it('filters locally by label and hint', () => {
    const { internals } = setup();
    internals.query.set('agent');
    expect(internals.visible().map((o) => o.value)).toEqual(['ag-1']);
    internals.query.set('workflow');
    expect(internals.visible().map((o) => o.value)).toEqual(['wf-1']);
  });

  it('leaves options untouched when localFilter is off', () => {
    const { internals } = setup({ localFilter: false });
    internals.query.set('zzz');
    expect(internals.visible()).toBe(OPTIONS);
  });

  it('debounces searchChange and only emits the latest query', () => {
    const { internals, search } = setup();
    internals.onQuery(typed('r'));
    vi.advanceTimersByTime(200);
    internals.onQuery(typed('re'));
    vi.advanceTimersByTime(249);
    expect(search).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('re');
  });

  it('closing with a pending query emits an empty search immediately and drops the timer', () => {
    const { internals, search } = setup();
    internals.toggleOpen();
    internals.onQuery(typed('re'));
    internals.close(false);
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('');
    vi.advanceTimersByTime(1000);
    expect(search).toHaveBeenCalledTimes(1);
    expect(internals.query()).toBe('');
  });

  it('closing with no query does not emit a search', () => {
    const { internals, search } = setup();
    internals.toggleOpen();
    internals.toggleOpen();
    expect(search).not.toHaveBeenCalled();
  });

  it('reports the empty state and its message', () => {
    const { internals } = setup({
      options: [],
      loadingText: 'Wait',
      emptyText: 'None',
      noMatchText: 'No hit',
    });
    expect(internals.empty()).toBe('empty');
    expect(internals.emptyMessage()).toBe('None');
    internals.query.set('x');
    expect(internals.empty()).toBe('no-match');
    expect(internals.emptyMessage()).toBe('No hit');
    const loading = setup({ options: [], loading: true, loadingText: 'Wait' });
    expect(loading.internals.emptyMessage()).toBe('Wait');
    expect(setup().internals.emptyMessage()).toBeNull();
  });
});

describe('ComboboxComponent keyboard', () => {
  it('arrows on the trigger open the panel; other keys do not', () => {
    const { internals } = setup();
    const other = keyEvent('x');
    internals.onTriggerKeydown(other);
    expect(internals.open()).toBe(false);
    expect(other.preventDefault).not.toHaveBeenCalled();
    const down = keyEvent('ArrowDown');
    internals.onTriggerKeydown(down);
    expect(internals.open()).toBe(true);
    expect(down.preventDefault).toHaveBeenCalled();
  });

  it('opens on the selected row', () => {
    const { component, internals } = setup();
    component.writeValue('ag-1');
    internals.toggleOpen();
    expect(internals.active()).toBe(2);
    expect(internals.activeOptionId()).toBe(internals.optionId(2));
  });

  it('navigates with arrows clamped to the list and selects with Enter', () => {
    const { internals, change } = setup();
    internals.toggleOpen();
    internals.onSearchKeydown(keyEvent('ArrowUp'));
    expect(internals.active()).toBe(0);
    internals.onSearchKeydown(keyEvent('ArrowDown'));
    internals.onSearchKeydown(keyEvent('ArrowDown'));
    internals.onSearchKeydown(keyEvent('ArrowDown'));
    expect(internals.active()).toBe(2);
    internals.onSearchKeydown(keyEvent('Enter'));
    expect(change).toHaveBeenCalledWith('ag-1');
  });

  it('Enter with no rows selects nothing', () => {
    const { internals, change } = setup();
    internals.toggleOpen();
    internals.query.set('zzz');
    internals.onSearchKeydown(keyEvent('Enter'));
    expect(change).not.toHaveBeenCalled();
    expect(internals.open()).toBe(true);
  });

  it('Escape closes and stops propagation; unrelated keys pass through', () => {
    const { internals } = setup();
    internals.toggleOpen();
    const plain = keyEvent('a');
    internals.onSearchKeydown(plain);
    expect(plain.preventDefault).not.toHaveBeenCalled();
    const escape = keyEvent('Escape');
    internals.onSearchKeydown(escape);
    expect(escape.stopPropagation).toHaveBeenCalled();
    expect(internals.open()).toBe(false);
  });

  it('typing resets the cursor to the first match', () => {
    const { internals } = setup();
    internals.toggleOpen();
    internals.onSearchKeydown(keyEvent('ArrowDown'));
    internals.onQuery(typed('a'));
    expect(internals.active()).toBe(0);
  });
});

describe('ComboboxComponent panel lifecycle', () => {
  it('does not open while disabled and disabling closes an open panel', () => {
    const { component, internals } = setup();
    component.setDisabledState(true);
    internals.toggleOpen();
    expect(internals.open()).toBe(false);
    component.setDisabledState(false);
    internals.toggleOpen();
    expect(internals.open()).toBe(true);
    component.setDisabledState(true);
    expect(internals.open()).toBe(false);
  });

  it('outside click and focus leaving both close; focus staying put does not', () => {
    const { internals } = setup();
    internals.toggleOpen();
    internals.onFocusOut({ relatedTarget: null } as unknown as FocusEvent);
    expect(internals.open()).toBe(true);
    internals.onOutsideClick({ target: {} } as unknown as MouseEvent);
    expect(internals.open()).toBe(false);
    internals.toggleOpen();
    internals.onFocusOut({ relatedTarget: {} } as unknown as FocusEvent);
    expect(internals.open()).toBe(false);
  });

  it('close marks touched once and only while open', () => {
    const { internals, touched } = setup();
    internals.close(false);
    expect(touched).not.toHaveBeenCalled();
    internals.toggleOpen();
    internals.close(false);
    internals.close(false);
    expect(touched).toHaveBeenCalledTimes(1);
  });
});
