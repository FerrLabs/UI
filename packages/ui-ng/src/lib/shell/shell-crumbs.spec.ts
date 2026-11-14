import { describe, expect, it } from 'vitest';
import { isPlainLeftClick, resolveCrumbs, type ClickModifiers } from './shell-crumbs';

describe('resolveCrumbs', () => {
  it('keeps plain strings as unlinked crumbs', () => {
    expect(resolveCrumbs(['Agents', 'vault'])).toEqual([
      { label: 'Agents', href: null, last: false },
      { label: 'vault', href: null, last: true },
    ]);
  });

  it('links object crumbs that carry an href', () => {
    expect(resolveCrumbs([{ label: 'Agents', href: '/agents' }, 'vault'])).toEqual([
      { label: 'Agents', href: '/agents', last: false },
      { label: 'vault', href: null, last: true },
    ]);
  });

  it('leaves object crumbs without an href unlinked', () => {
    expect(resolveCrumbs([{ label: 'Agents' }, 'vault'])[0].href).toBeNull();
  });

  it('never links the last crumb even with an href', () => {
    const crumbs = resolveCrumbs([
      { label: 'Agents', href: '/agents' },
      { label: 'vault', href: '/agents/vault' },
    ]);
    expect(crumbs[1]).toEqual({ label: 'vault', href: null, last: true });
  });

  it('treats a single crumb as last and unlinked', () => {
    expect(resolveCrumbs([{ label: 'Home', href: '/' }])).toEqual([
      { label: 'Home', href: null, last: true },
    ]);
  });

  it('returns nothing for no crumbs', () => {
    expect(resolveCrumbs([])).toEqual([]);
  });
});

describe('isPlainLeftClick', () => {
  const plain: ClickModifiers = {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
  };

  it('accepts a plain primary click', () => {
    expect(isPlainLeftClick(plain)).toBe(true);
  });

  it.each([
    ['meta', { metaKey: true }],
    ['ctrl', { ctrlKey: true }],
    ['shift', { shiftKey: true }],
    ['alt', { altKey: true }],
    ['middle button', { button: 1 }],
    ['right button', { button: 2 }],
  ] as const)('rejects %s', (_name, override) => {
    expect(isPlainLeftClick({ ...plain, ...override })).toBe(false);
  });
});
