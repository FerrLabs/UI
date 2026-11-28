import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { MultiSelectComponent, type MultiSelectOption } from './multi-select.component';

interface Internals {
  query: WritableSignal<string>;
  open: WritableSignal<boolean>;
  active: WritableSignal<number>;
  panelTokens: Signal<Record<string, string>>;
  visible: Signal<readonly MultiSelectOption[]>;
  summary: Signal<string>;
  countText: Signal<string>;
  activeOptionId: Signal<string | null>;
  disabled: Signal<boolean>;
  isSelected(id: string): boolean;
  optionId(index: number): string;
  onQuery(event: Event): void;
  toggle(id: string): void;
  clear(): void;
  toggleOpen(): void;
  onTriggerKeydown(event: KeyboardEvent): void;
  onPanelKeydown(event: KeyboardEvent): void;
  onSearchKeydown(event: KeyboardEvent): void;
  onListKeydown(event: KeyboardEvent): void;
  onListClick(event: MouseEvent): void;
  onOutsideClick(event: MouseEvent): void;
  onFocusOut(event: FocusEvent): void;
  close(restoreFocus: boolean): void;
}

const OPTIONS: readonly MultiSelectOption[] = [
  { id: 'a', label: 'Alpha', hint: 'first' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma', hint: 'third' },
];

function keyEvent(key: string) {
  return { key, preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as KeyboardEvent & {
    preventDefault: ReturnType<typeof vi.fn>;
    stopPropagation: ReturnType<typeof vi.fn>;
  };
}

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(MultiSelectComponent, { options: OPTIONS, ...inputs });
  const change = vi.fn();
  const touched = vi.fn();
  component.registerOnChange(change);
  component.registerOnTouched(touched);
  return { component, internals: component as unknown as Internals, change, touched };
}

beforeEach(() => {
  vi.stubGlobal('getComputedStyle', () => ({
    color: 'rgb(1, 2, 3)',
    getPropertyValue: (name: string) => (name === '--flr-bg' ? ' #fff ' : ''),
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MultiSelectComponent value handling', () => {
  it('shows the placeholder when nothing is selected', () => {
    const { internals } = setup({ placeholder: 'Pick' });
    expect(internals.summary()).toBe('Pick');
  });

  it('shows the label for a single selection and falls back to the id when unknown', () => {
    const { component, internals } = setup();
    component.writeValue(['b']);
    expect(internals.summary()).toBe('Beta');
    component.writeValue(['ghost']);
    expect(internals.summary()).toBe('ghost');
  });

  it('shows the count text for several selections using the selectedText callback', () => {
    const { component, internals } = setup({ selectedText: (n: number) => `${n} items` });
    component.writeValue(['a', 'b']);
    expect(internals.summary()).toBe('2 items');
    expect(internals.countText()).toBe('2 items');
  });

  it('treats a null written value as empty', () => {
    const { component, internals } = setup();
    component.writeValue(['a']);
    component.writeValue(null);
    expect(internals.isSelected('a')).toBe(false);
  });

  it('toggles an id on and off and reports the new value and touched', () => {
    const { internals, change, touched } = setup();
    internals.toggle('a');
    internals.toggle('c');
    expect(change).toHaveBeenLastCalledWith(['a', 'c']);
    internals.toggle('a');
    expect(change).toHaveBeenLastCalledWith(['c']);
    expect(touched).toHaveBeenCalledTimes(3);
  });

  it('clear empties the selection', () => {
    const { component, internals, change } = setup();
    component.writeValue(['a', 'b']);
    internals.clear();
    expect(change).toHaveBeenLastCalledWith([]);
    expect(internals.isSelected('a')).toBe(false);
  });

  it('ignores toggle and clear while disabled', () => {
    const { component, internals, change } = setup();
    component.writeValue(['a']);
    component.setDisabledState(true);
    internals.toggle('b');
    internals.clear();
    expect(change).not.toHaveBeenCalled();
    expect(internals.isSelected('a')).toBe(true);
    expect(internals.isSelected('b')).toBe(false);
  });
});

describe('MultiSelectComponent filtering', () => {
  it('matches label and hint case-insensitively and ignores surrounding space', () => {
    const { internals } = setup();
    internals.query.set('  ALP ');
    expect(internals.visible().map((o) => o.id)).toEqual(['a']);
    internals.query.set('third');
    expect(internals.visible().map((o) => o.id)).toEqual(['c']);
    internals.query.set('nope');
    expect(internals.visible()).toEqual([]);
  });

  it('returns every option for a blank query', () => {
    const { internals } = setup();
    internals.query.set('   ');
    expect(internals.visible()).toBe(OPTIONS);
  });

  it('onQuery stores the typed value and resets the active row', () => {
    const { internals } = setup();
    internals.active.set(2);
    internals.onQuery({ target: { value: 'be' } } as unknown as Event);
    expect(internals.query()).toBe('be');
    expect(internals.active()).toBe(0);
  });
});

describe('MultiSelectComponent panel', () => {
  it('opens on toggleOpen, capturing inherited tokens, and closes on the next toggle', () => {
    const { internals, touched } = setup();
    internals.toggleOpen();
    expect(internals.open()).toBe(true);
    expect(internals.panelTokens()).toEqual({ color: 'rgb(1, 2, 3)', '--flr-bg': '#fff' });
    internals.toggleOpen();
    expect(internals.open()).toBe(false);
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('does not open when disabled', () => {
    const { component, internals } = setup();
    component.setDisabledState(true);
    internals.toggleOpen();
    expect(internals.open()).toBe(false);
  });

  it('starts on the first selected visible row when opening', () => {
    const { component, internals } = setup();
    component.writeValue(['c']);
    internals.toggleOpen();
    expect(internals.active()).toBe(2);
  });

  it('setDisabledState(true) closes an open panel without restoring focus', () => {
    const { component, internals } = setup();
    internals.toggleOpen();
    component.setDisabledState(true);
    expect(internals.open()).toBe(false);
    expect(internals.disabled()).toBe(true);
  });

  it('closing clears the query and a second close is a no-op', () => {
    const { internals, touched } = setup();
    internals.toggleOpen();
    internals.query.set('al');
    internals.close(false);
    expect(internals.query()).toBe('');
    internals.close(false);
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('exposes the active option id only while open with rows', () => {
    const { internals } = setup();
    expect(internals.activeOptionId()).toBeNull();
    internals.toggleOpen();
    expect(internals.activeOptionId()).toBe(internals.optionId(0));
    internals.query.set('zzz');
    expect(internals.activeOptionId()).toBeNull();
  });

  it('arrow keys on the trigger open the panel and prevent scrolling', () => {
    const { internals } = setup();
    const down = keyEvent('ArrowDown');
    internals.onTriggerKeydown(down);
    expect(internals.open()).toBe(true);
    expect(down.preventDefault).toHaveBeenCalled();
    internals.close(false);
    internals.onTriggerKeydown(keyEvent('ArrowUp'));
    expect(internals.open()).toBe(true);
  });

  it('other keys on the trigger are left alone', () => {
    const { internals } = setup();
    const event = keyEvent('a');
    internals.onTriggerKeydown(event);
    expect(internals.open()).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('Escape in the panel closes it and stops propagation', () => {
    const { internals } = setup();
    internals.toggleOpen();
    const escape = keyEvent('Escape');
    internals.onPanelKeydown(escape);
    expect(internals.open()).toBe(false);
    expect(escape.stopPropagation).toHaveBeenCalled();
    internals.toggleOpen();
    internals.onPanelKeydown(keyEvent('x'));
    expect(internals.open()).toBe(true);
  });

  it('ArrowDown in the search box only prevents default when there are rows', () => {
    const { internals } = setup();
    const withRows = keyEvent('ArrowDown');
    internals.onSearchKeydown(withRows);
    expect(withRows.preventDefault).toHaveBeenCalled();
    internals.query.set('zzz');
    const noRows = keyEvent('ArrowDown');
    internals.onSearchKeydown(noRows);
    expect(noRows.preventDefault).not.toHaveBeenCalled();
  });

  it('outside click closes unless it landed on the trigger', () => {
    const { internals } = setup();
    internals.toggleOpen();
    internals.onOutsideClick({ target: {} } as unknown as MouseEvent);
    expect(internals.open()).toBe(false);
  });

  it('focusout closes only when focus leaves host and panel for a real target', () => {
    const { internals } = setup();
    internals.toggleOpen();
    internals.onFocusOut({ relatedTarget: null } as unknown as FocusEvent);
    expect(internals.open()).toBe(true);
    internals.onFocusOut({ relatedTarget: {} } as unknown as FocusEvent);
    expect(internals.open()).toBe(false);
  });

  it('focusout does nothing while closed', () => {
    const { internals, touched } = setup();
    internals.onFocusOut({ relatedTarget: {} } as unknown as FocusEvent);
    expect(touched).not.toHaveBeenCalled();
  });

  it('focusout keeps the panel open when focus moves inside the host', () => {
    const { internals } = setup();
    const inner = createComponent(
      MultiSelectComponent,
      { options: OPTIONS },
      { host: { contains: () => true } },
    );
    const innerInternals = inner as unknown as Internals;
    innerInternals.toggleOpen();
    innerInternals.onFocusOut({ relatedTarget: {} } as unknown as FocusEvent);
    expect(innerInternals.open()).toBe(true);
    expect(internals.open()).toBe(false);
  });
});

describe('MultiSelectComponent list keyboard', () => {
  it('ArrowDown and ArrowUp move within bounds', () => {
    const { internals } = setup();
    internals.toggleOpen();
    internals.onListKeydown(keyEvent('ArrowDown'));
    internals.onListKeydown(keyEvent('ArrowDown'));
    internals.onListKeydown(keyEvent('ArrowDown'));
    expect(internals.active()).toBe(2);
    internals.onListKeydown(keyEvent('ArrowUp'));
    expect(internals.active()).toBe(1);
  });

  it('ArrowUp at the first row stays put when there is no search box to focus', () => {
    const { internals } = setup();
    internals.toggleOpen();
    internals.onListKeydown(keyEvent('ArrowUp'));
    expect(internals.active()).toBe(0);
  });

  it('Home and End jump to the ends', () => {
    const { internals } = setup();
    internals.toggleOpen();
    internals.onListKeydown(keyEvent('End'));
    expect(internals.active()).toBe(2);
    internals.onListKeydown(keyEvent('Home'));
    expect(internals.active()).toBe(0);
  });

  it('Space and Enter toggle the active option', () => {
    const { internals, change } = setup();
    internals.toggleOpen();
    internals.onListKeydown(keyEvent('ArrowDown'));
    internals.onListKeydown(keyEvent(' '));
    expect(change).toHaveBeenLastCalledWith(['b']);
    internals.onListKeydown(keyEvent('Enter'));
    expect(change).toHaveBeenLastCalledWith([]);
  });

  it('unhandled keys are not prevented', () => {
    const { internals } = setup();
    internals.toggleOpen();
    const event = keyEvent('Tab');
    internals.onListKeydown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does nothing with an empty list', () => {
    const { internals } = setup();
    internals.toggleOpen();
    internals.query.set('zzz');
    const event = keyEvent('Enter');
    internals.onListKeydown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('clicking a row activates and toggles it by data-index', () => {
    const { internals, change } = setup();
    internals.toggleOpen();
    const row = { dataset: { index: '2' } };
    const event = { target: { closest: () => row } } as unknown as MouseEvent;
    internals.onListClick(event);
    expect(internals.active()).toBe(2);
    expect(change).toHaveBeenLastCalledWith(['c']);
  });

  it('clicking outside any row or on an out of range index does nothing', () => {
    const { internals, change } = setup();
    internals.onListClick({ target: { closest: () => null } } as unknown as MouseEvent);
    internals.onListClick({
      target: { closest: () => ({ dataset: { index: '9' } }) },
    } as unknown as MouseEvent);
    expect(change).not.toHaveBeenCalled();
  });
});
