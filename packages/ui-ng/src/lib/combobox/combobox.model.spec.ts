import { describe, expect, it } from 'vitest';
import {
  clampIndex,
  type ComboboxOption,
  emptyState,
  filterOptions,
  intentFor,
  labelFor,
  stepActive,
} from './combobox.model';

const OPTIONS: readonly ComboboxOption[] = [
  { value: 'wf-1', label: 'Nightly build', hint: 'Workflow' },
  { value: 'wf-2', label: 'Release train' },
  { value: 'ag-1', label: 'Triage agent', hint: 'Agent' },
];

describe('filterOptions', () => {
  it('returns every option for an empty or blank query', () => {
    expect(filterOptions(OPTIONS, '')).toBe(OPTIONS);
    expect(filterOptions(OPTIONS, '   ')).toBe(OPTIONS);
  });

  it('matches labels case-insensitively', () => {
    expect(filterOptions(OPTIONS, 'RELEASE').map((o) => o.value)).toEqual(['wf-2']);
  });

  it('matches hints', () => {
    expect(filterOptions(OPTIONS, 'agent').map((o) => o.value)).toEqual(['ag-1']);
  });

  it('does not match on the value', () => {
    expect(filterOptions(OPTIONS, 'wf-1')).toEqual([]);
  });

  it('trims the query', () => {
    expect(filterOptions(OPTIONS, '  train ').map((o) => o.value)).toEqual(['wf-2']);
  });
});

describe('intentFor', () => {
  it.each([
    ['ArrowDown', 'next'],
    ['ArrowUp', 'previous'],
    ['Enter', 'select'],
    ['Escape', 'close'],
  ] as const)('%s maps to %s', (key, intent) => {
    expect(intentFor(key)).toBe(intent);
  });

  it.each(['a', ' ', 'Tab', 'Home'])('ignores %s', (key) => {
    expect(intentFor(key)).toBeNull();
  });
});

describe('stepActive', () => {
  it('moves down and up', () => {
    expect(stepActive(1, 4, 'next')).toBe(2);
    expect(stepActive(2, 4, 'previous')).toBe(1);
  });

  it('clamps at both ends instead of wrapping', () => {
    expect(stepActive(3, 4, 'next')).toBe(3);
    expect(stepActive(0, 4, 'previous')).toBe(0);
  });

  it('stays at zero with no options', () => {
    expect(stepActive(0, 0, 'next')).toBe(0);
    expect(stepActive(0, 0, 'previous')).toBe(0);
  });
});

describe('clampIndex', () => {
  it('pulls a stale cursor back into a shrunken list', () => {
    expect(clampIndex(7, 3)).toBe(2);
  });

  it('never goes negative', () => {
    expect(clampIndex(-1, 3)).toBe(0);
    expect(clampIndex(5, 0)).toBe(0);
  });
});

describe('emptyState', () => {
  it('is null while options are visible, even when loading', () => {
    expect(emptyState(false, 3, 2, 'x')).toBeNull();
    expect(emptyState(true, 3, 2, 'x')).toBeNull();
  });

  it('reports loading when nothing is visible', () => {
    expect(emptyState(true, 0, 0, '')).toBe('loading');
    expect(emptyState(true, 3, 0, 'zzz')).toBe('loading');
  });

  it('reports empty when there are no options and no query', () => {
    expect(emptyState(false, 0, 0, '')).toBe('empty');
    expect(emptyState(false, 0, 0, '   ')).toBe('empty');
  });

  it('reports no match when a query filtered everything out', () => {
    expect(emptyState(false, 3, 0, 'zzz')).toBe('no-match');
  });

  it('reports no match when a server search returned nothing', () => {
    expect(emptyState(false, 0, 0, 'zzz')).toBe('no-match');
  });
});

describe('labelFor', () => {
  it('is null without a value', () => {
    expect(labelFor(OPTIONS, null, null)).toBeNull();
  });

  it('uses the label of the matching option', () => {
    expect(labelFor(OPTIONS, 'wf-2', null)).toBe('Release train');
  });

  it('keeps the picked label when a server search drops the option', () => {
    const picked = OPTIONS[0];
    expect(labelFor([], 'wf-1', picked)).toBe('Nightly build');
  });

  it('prefers the live option over a stale picked one', () => {
    const renamed = [{ value: 'wf-1', label: 'Nightly build v2' }];
    expect(labelFor(renamed, 'wf-1', OPTIONS[0])).toBe('Nightly build v2');
  });

  it('falls back to the raw value for a value written before options load', () => {
    expect(labelFor([], 'wf-9', null)).toBe('wf-9');
  });

  it('ignores a picked option that no longer matches the value', () => {
    expect(labelFor([], 'wf-9', OPTIONS[0])).toBe('wf-9');
  });
});
