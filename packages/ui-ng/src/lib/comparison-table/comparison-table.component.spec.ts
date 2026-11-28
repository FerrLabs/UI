import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import {
  ComparisonTableComponent,
  type ComparisonCell,
  type ComparisonColumn,
} from './comparison-table.component';

class ComparisonProbe extends ComparisonTableComponent {
  readonly header = () => this.hasHeader();
  readonly parts = () => this.headingParts();
  readonly ours = () => this.oursIndex();
  readonly accentColor = () => this.accent();
  render(value: ComparisonCell) {
    return this.cell(value);
  }
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createTable(columns: ComparisonColumn[] = []): ComparisonProbe {
  const table = runInInjectionContext(
    Injector.create({ providers: [] }),
    () => new ComparisonProbe(),
  );
  setInput(table.columns, columns);
  return table;
}

describe('ComparisonTableComponent cells', () => {
  it('renders true, false and partial as marks with the matching labels', () => {
    const table = createTable();
    expect(table.render(true)).toEqual({ kind: 'yes', text: '✓', label: 'Yes' });
    expect(table.render(false)).toEqual({ kind: 'no', text: '—', label: 'No' });
    expect(table.render('partial')).toEqual({ kind: 'partial', text: '~', label: 'Partial' });
  });

  it('uses translated labels', () => {
    const table = createTable();
    setInput(table.yesLabel, 'Oui');
    setInput(table.noLabel, 'Non');
    setInput(table.partialLabel, 'Partiel');
    expect(table.render(true).label).toBe('Oui');
    expect(table.render(false).label).toBe('Non');
    expect(table.render('partial').label).toBe('Partiel');
  });

  it('shows any other string as text and labels it with itself', () => {
    expect(createTable().render('Unlimited')).toEqual({
      kind: 'text',
      text: 'Unlimited',
      label: 'Unlimited',
    });
  });

  it('does not mistake a lookalike for the partial marker', () => {
    expect(createTable().render('Partial').kind).toBe('text');
  });
});

describe('ComparisonTableComponent ours column', () => {
  it('finds the highlighted column and its accent', () => {
    const table = createTable([{ name: 'Other' }, { name: 'Us', ours: true, accent: '#ff5500' }]);
    expect(table.ours()).toBe(1);
    expect(table.accentColor()).toBe('#ff5500');
  });

  it('falls back when no column is highlighted', () => {
    const table = createTable([{ name: 'A' }, { name: 'B' }]);
    expect(table.ours()).toBe(-1);
    expect(table.accentColor()).toBe('var(--color-ink, #1e293b)');
  });

  it('falls back when the highlighted column has no accent', () => {
    expect(createTable([{ name: 'Us', ours: true }]).accentColor()).toBe(
      'var(--color-ink, #1e293b)',
    );
  });
});

describe('ComparisonTableComponent header', () => {
  it.each(['eyebrow', 'heading', 'lead'] as const)('is shown when only %s is set', (key) => {
    const table = createTable();
    expect(table.header()).toBe(false);
    setInput(table[key], 'text');
    expect(table.header()).toBe(true);
  });
});

describe('ComparisonTableComponent heading parts', () => {
  function headingOf(heading: string, accent: string) {
    const table = createTable();
    setInput(table.heading, heading);
    setInput(table.headingAccent, accent);
    return table.parts();
  }

  it('splits the heading around the accented phrase', () => {
    expect(headingOf('Why pick us today', 'pick us')).toEqual([
      { text: 'Why ', accent: false },
      { text: 'pick us', accent: true },
      { text: ' today', accent: false },
    ]);
  });

  it('drops empty segments when the accent starts or ends the heading', () => {
    expect(headingOf('Why us', 'Why')).toEqual([
      { text: 'Why', accent: true },
      { text: ' us', accent: false },
    ]);
    expect(headingOf('Why us', 'us')).toEqual([
      { text: 'Why ', accent: false },
      { text: 'us', accent: true },
    ]);
  });

  it('returns the whole heading when the accent is missing from it', () => {
    expect(headingOf('Why us', 'them')).toEqual([{ text: 'Why us', accent: false }]);
  });

  it('returns the whole heading when no accent is set', () => {
    expect(headingOf('Why us', '')).toEqual([{ text: 'Why us', accent: false }]);
  });

  it('accents the whole heading when it equals the accent', () => {
    expect(headingOf('Why us', 'Why us')).toEqual([{ text: 'Why us', accent: true }]);
  });
});
