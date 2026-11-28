import { describe, expect, it } from 'vitest';
import {
  ACCESS_PICKER_LABELS_EN,
  ACCESS_PICKER_LABELS_FR,
  buildAccessSelection,
  initialScopeSet,
  matchingPreset,
  toggled,
  type AccessOrg,
  type AccessPreset,
  type AccessProduct,
} from './access-picker.model';

const ORGS: readonly AccessOrg[] = [
  { id: 'o2', name: 'Two', slug: 'two' },
  { id: 'o1', name: 'One', slug: 'one' },
];

const CATALOGUE: readonly AccessProduct[] = [
  {
    product: 'vault',
    label: 'Vault',
    scopes: [
      { scope: 'vault:read', access: 'read' },
      { scope: 'vault:write', access: 'write' },
    ],
  },
  { product: 'track', label: 'Track', scopes: [{ scope: 'track:read', access: 'read' }] },
];

const PRESETS: readonly AccessPreset[] = [
  { id: 'read_only', scopes: ['vault:read', 'track:read'] },
  { id: 'read_write', scopes: ['vault:read', 'vault:write', 'track:read'] },
];

describe('buildAccessSelection', () => {
  it('uses null org ids for all organizations and sorts scopes', () => {
    expect(buildAccessSelection(true, new Set(), new Set(['b', 'a']), ORGS)).toEqual({
      orgIds: null,
      scopes: ['a', 'b'],
    });
  });

  it('ignores picked orgs when all organizations is on', () => {
    const selection = buildAccessSelection(true, new Set(['o1']), new Set(['a']), ORGS);
    expect(selection?.orgIds).toBeNull();
  });

  it('keeps only listed orgs, sorted', () => {
    const selection = buildAccessSelection(
      false,
      new Set(['o2', 'o1', 'gone']),
      new Set(['a']),
      ORGS,
    );
    expect(selection?.orgIds).toEqual(['o1', 'o2']);
  });

  it('is null when no scope is picked', () => {
    expect(buildAccessSelection(true, new Set(), new Set(), ORGS)).toBeNull();
  });

  it('is null when specific orgs are required but none picked', () => {
    expect(buildAccessSelection(false, new Set(), new Set(['a']), ORGS)).toBeNull();
  });

  it('is null when every picked org has been removed from the list', () => {
    expect(buildAccessSelection(false, new Set(['gone']), new Set(['a']), ORGS)).toBeNull();
  });
});

describe('matchingPreset', () => {
  it('matches a preset by exact scope set regardless of order', () => {
    expect(matchingPreset(PRESETS, new Set(['track:read', 'vault:read']))).toBe('read_only');
  });

  it('does not match a subset or a superset', () => {
    expect(matchingPreset(PRESETS, new Set(['vault:read']))).toBeNull();
    expect(matchingPreset(PRESETS, new Set(['vault:read', 'track:read', 'extra']))).toBeNull();
  });

  it('is null for an empty pick', () => {
    expect(matchingPreset(PRESETS, new Set())).toBeNull();
  });

  it('returns the first of several matching presets', () => {
    const twins: readonly AccessPreset[] = [
      { id: 'full', scopes: ['a'] },
      { id: 'read_only', scopes: ['a'] },
    ];
    expect(matchingPreset(twins, new Set(['a']))).toBe('full');
  });
});

describe('initialScopeSet', () => {
  it('keeps the requested scopes that exist in the catalogue', () => {
    const set = initialScopeSet(['vault:write', 'unknown'], CATALOGUE, PRESETS);
    expect([...set]).toEqual(['vault:write']);
  });

  it('falls back to the read only preset when nothing valid is requested', () => {
    expect([...initialScopeSet([], CATALOGUE, PRESETS)]).toEqual(['vault:read', 'track:read']);
    expect([...initialScopeSet(['unknown'], CATALOGUE, PRESETS)]).toEqual([
      'vault:read',
      'track:read',
    ]);
  });

  it('is empty when there is no read only preset to fall back on', () => {
    expect(initialScopeSet([], CATALOGUE, [{ id: 'full', scopes: ['x'] }]).size).toBe(0);
  });
});

describe('toggled', () => {
  it('adds a missing value and removes a present one without mutating the input', () => {
    const base: ReadonlySet<string> = new Set(['a']);
    const added = toggled(base, 'b');
    expect([...added]).toEqual(['a', 'b']);
    expect([...toggled(added, 'a')]).toEqual(['b']);
    expect([...base]).toEqual(['a']);
  });
});

describe('labels', () => {
  it('French labels cover exactly the same keys as English', () => {
    expect(Object.keys(ACCESS_PICKER_LABELS_FR).sort()).toEqual(
      Object.keys(ACCESS_PICKER_LABELS_EN).sort(),
    );
  });

  it('no label is blank', () => {
    for (const labels of [ACCESS_PICKER_LABELS_EN, ACCESS_PICKER_LABELS_FR]) {
      expect(Object.values(labels).every((v) => v.trim() !== '')).toBe(true);
    }
  });
});
