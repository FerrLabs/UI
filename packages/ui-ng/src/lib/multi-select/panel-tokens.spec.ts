import { afterEach, describe, expect, it, vi } from 'vitest';
import { inheritedTokens, PANEL_POSITIONS } from './panel-tokens';

function stubStyle(values: Record<string, string>, color = 'red'): void {
  vi.stubGlobal('getComputedStyle', () => ({
    color,
    getPropertyValue: (name: string) => values[name] ?? '',
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('inheritedTokens', () => {
  it('always carries the text colour', () => {
    stubStyle({}, 'rgb(10, 20, 30)');
    expect(inheritedTokens({} as HTMLElement)).toEqual({ color: 'rgb(10, 20, 30)' });
  });

  it('copies set tokens trimmed and skips empty or blank ones', () => {
    stubStyle({ '--flr-bg': '  #101010  ', '--flr-rule': '', '--color-ink': '   ' });
    expect(inheritedTokens({} as HTMLElement)).toEqual({ color: 'red', '--flr-bg': '#101010' });
  });

  it('ignores custom properties outside the allowlist', () => {
    stubStyle({ '--something-else': '1', '--color-accent': 'blue' });
    expect(inheritedTokens({} as HTMLElement)).toEqual({ color: 'red', '--color-accent': 'blue' });
  });
});

describe('PANEL_POSITIONS', () => {
  it('prefers below the trigger and flips above with a mirrored offset', () => {
    const [below, above] = PANEL_POSITIONS;
    expect(below.originY).toBe('bottom');
    expect(below.overlayY).toBe('top');
    expect(above.originY).toBe('top');
    expect(above.overlayY).toBe('bottom');
    expect(above.offsetY).toBe(-(below.offsetY ?? 0));
  });

  it('offers end aligned fallbacks', () => {
    expect(PANEL_POSITIONS.filter((p) => p.originX === 'end' && p.overlayX === 'end')).toHaveLength(
      2,
    );
  });
});
