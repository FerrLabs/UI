import { describe, expect, it } from 'vitest';
import { fieldIds, labelForTarget, mergeDescribedBy } from './field-aria';

describe('fieldIds', () => {
  it('derives four distinct ids so label, hint and error never collide with the control', () => {
    const ids = fieldIds(3);
    expect(new Set(Object.values(ids)).size).toBe(4);
    expect(ids.fieldId).toBe('flr-field-3');
  });

  it('gives two fields disjoint ids', () => {
    const a = Object.values(fieldIds(1));
    const b = Object.values(fieldIds(2));
    expect(a.filter((id) => b.includes(id))).toEqual([]);
  });
});

describe('labelForTarget', () => {
  it('points a single-control label at the control id', () => {
    const ids = fieldIds(1);
    expect(labelForTarget(false, ids)).toBe(ids.fieldId);
  });

  it('emits no for in group mode, so it can never dangle', () => {
    expect(labelForTarget(true, fieldIds(1))).toBeNull();
  });
});

const owned = ['f-hint', 'f-error'];

describe('mergeDescribedBy', () => {
  it('adds the active id to an empty attribute', () => {
    expect(mergeDescribedBy(null, owned, 'f-error')).toBe('f-error');
  });

  it('keeps ids owned by the consumer', () => {
    expect(mergeDescribedBy('custom', owned, 'f-error')).toBe('custom f-error');
  });

  it('swaps the hint for the error without leaving the stale one', () => {
    expect(mergeDescribedBy('custom f-hint', owned, 'f-error')).toBe('custom f-error');
  });

  it('removes owned ids when nothing is active', () => {
    expect(mergeDescribedBy('custom f-error', owned, null)).toBe('custom');
  });

  it('returns null when nothing remains so the attribute can be dropped', () => {
    expect(mergeDescribedBy('f-hint', owned, null)).toBeNull();
    expect(mergeDescribedBy('  ', owned, null)).toBeNull();
  });

  it('does not duplicate the active id', () => {
    expect(mergeDescribedBy('f-error', owned, 'f-error')).toBe('f-error');
  });
});
