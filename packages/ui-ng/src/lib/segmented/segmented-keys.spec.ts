import { describe, expect, it } from 'vitest';
import { keyTargetIndex } from './segmented-keys';

describe('keyTargetIndex', () => {
  it.each([
    ['Home', 2, 0],
    ['Home', 0, 0],
    ['End', 0, 3],
    ['End', 3, 3],
  ])('%s from %i goes to %i', (key, index, expected) => {
    expect(keyTargetIndex(key, index, 4)).toBe(expected);
  });

  it.each([
    ['ArrowRight', 1, 2],
    ['ArrowDown', 1, 2],
    ['ArrowLeft', 1, 0],
    ['ArrowUp', 1, 0],
  ])('%s from %i steps to %i', (key, index, expected) => {
    expect(keyTargetIndex(key, index, 4)).toBe(expected);
  });

  it('wraps past either end', () => {
    expect(keyTargetIndex('ArrowRight', 3, 4)).toBe(0);
    expect(keyTargetIndex('ArrowLeft', 0, 4)).toBe(3);
  });

  it.each(['Enter', ' ', 'Tab', 'PageDown', 'a', 'toString'])('ignores %j', (key) => {
    expect(keyTargetIndex(key, 1, 4)).toBeNull();
  });

  it('has no target without options', () => {
    expect(keyTargetIndex('Home', 0, 0)).toBeNull();
    expect(keyTargetIndex('End', 0, 0)).toBeNull();
    expect(keyTargetIndex('ArrowRight', 0, 0)).toBeNull();
  });
});
