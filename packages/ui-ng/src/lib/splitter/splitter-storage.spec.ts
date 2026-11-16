import { describe, expect, it } from 'vitest';
import {
  defaultStorage,
  needsRestore,
  parseStored,
  readStored,
  writeStored,
} from './splitter-storage';

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem'> {
  readonly items = new Map<string, string>();
  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

const asStorage = (storage: object): Storage => storage as Storage;

describe('splitter storage', () => {
  it('round-trips ratios and collapsed flags', () => {
    const storage = new MemoryStorage();
    const value = { ratios: [0.25, 0.75], collapsed: [false, true] };
    writeStored(asStorage(storage), 'editor', value);
    expect(readStored(asStorage(storage), 'editor', 2)).toEqual(value);
  });

  it('namespaces keys so they do not collide with app keys', () => {
    const storage = new MemoryStorage();
    writeStored(asStorage(storage), 'editor', { ratios: [1], collapsed: [false] });
    expect([...storage.items.keys()]).toEqual(['flr-splitter:editor']);
  });

  it('ignores a value stored for a different pane count', () => {
    const storage = new MemoryStorage();
    writeStored(asStorage(storage), 'k', { ratios: [0.5, 0.5], collapsed: [false, false] });
    expect(readStored(asStorage(storage), 'k', 3)).toBeNull();
  });

  it.each([
    ['not json', '{oops'],
    ['null', 'null'],
    ['a number', '42'],
    ['an array', '[0.5,0.5]'],
    ['missing collapsed', '{"ratios":[0.5,0.5]}'],
    ['string ratios', '{"ratios":["a","b"],"collapsed":[false,false]}'],
    ['negative ratio', '{"ratios":[-1,2],"collapsed":[false,false]}'],
    ['non boolean flags', '{"ratios":[0.5,0.5],"collapsed":[0,1]}'],
    ['all zero ratios', '{"ratios":[0,0],"collapsed":[false,false]}'],
    ['null ratio', '{"ratios":[null,1],"collapsed":[false,false]}'],
  ])('rejects corrupted data: %s', (_name, raw) => {
    expect(parseStored(raw, 2)).toBeNull();
  });

  it('returns null when nothing is stored or storage is missing', () => {
    expect(parseStored(null, 2)).toBeNull();
    expect(readStored(null, 'k', 2)).toBeNull();
    expect(readStored(asStorage(new MemoryStorage()), 'k', 2)).toBeNull();
  });

  it('survives a storage that throws on read and write', () => {
    const hostile = {
      getItem: () => {
        throw new DOMException('denied', 'SecurityError');
      },
      setItem: () => {
        throw new DOMException('quota', 'QuotaExceededError');
      },
    };
    expect(readStored(asStorage(hostile), 'k', 2)).toBeNull();
    expect(() =>
      writeStored(asStorage(hostile), 'k', { ratios: [1, 1], collapsed: [false, false] }),
    ).not.toThrow();
  });

  it('returns null when reading localStorage itself throws', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('blocked', 'SecurityError');
      },
    });
    try {
      expect(defaultStorage()).toBeNull();
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original);
      else Reflect.deleteProperty(globalThis, 'localStorage');
    }
  });
});

describe('needsRestore', () => {
  it('restores the first time and when the key changes, not when only the pane count changed', () => {
    expect(needsRestore(null, 'editor')).toBe(true);
    expect(needsRestore('editor', 'editor')).toBe(false);
    expect(needsRestore('editor', 'other')).toBe(true);
  });
});
