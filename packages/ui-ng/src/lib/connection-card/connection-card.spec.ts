import { describe, expect, it } from 'vitest';
import { cardPhase, toneRole, visibleMeta } from './connection-card.model';

describe('cardPhase', () => {
  const cases: readonly [string, boolean, string | null, boolean, string][] = [
    ['ready by default', false, null, false, 'ready'],
    ['loading wins over everything', true, 'boom', true, 'loading'],
    ['failed when an error is set', false, 'boom', false, 'failed'],
    ['failed wins over confirming', false, 'boom', true, 'failed'],
    ['confirming replaces the actions', false, null, true, 'confirming'],
    ['empty error string is not a failure', false, '', false, 'ready'],
  ];

  it.each(cases)('%s', (_name, loading, error, confirming, expected) => {
    expect(cardPhase(loading, error, confirming)).toBe(expected);
  });
});

describe('toneRole', () => {
  it('announces alert tone assertively', () => {
    expect(toneRole('alert')).toBe('alert');
  });

  it.each(['ok', 'idle'] as const)('announces %s tone politely', (tone) => {
    expect(toneRole(tone)).toBe('status');
  });
});

describe('visibleMeta', () => {
  it('keeps order and the mono flag', () => {
    const items = [
      { label: 'Connected', value: 'Jan 4, 2026' },
      { label: 'Token', value: 'fft_ab12…', mono: true },
    ];
    expect(visibleMeta(items)).toEqual(items);
  });

  it('drops empty and whitespace-only values', () => {
    const items = [
      { label: 'Connected', value: '' },
      { label: 'Token', value: '   ' },
      { label: 'Permissions', value: 'read, write', mono: true },
    ];
    expect(visibleMeta(items)).toEqual([items[2]]);
  });

  it('returns nothing for no metadata', () => {
    expect(visibleMeta([])).toEqual([]);
  });
});
