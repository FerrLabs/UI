import { describe, expect, it } from 'vitest';
import { markColorOnDark } from './mark-color';

describe('markColorOnDark', () => {
  it.each(['#f59e0b', '#7c3aed', '#fff', '#FFFFFF'])('keeps bright accent %s', (accent) => {
    expect(markColorOnDark(accent)).toBe(accent);
  });

  it.each(['#1e293b', '#000', '#000000', '#111'])('switches dark accent %s to white', (accent) => {
    expect(markColorOnDark(accent)).toBe('#ffffff');
  });

  it('expands three digit hex before computing luminance', () => {
    expect(markColorOnDark('#0f0')).toBe('#0f0');
    expect(markColorOnDark('#00f')).toBe('#ffffff');
  });

  it('accepts hex without a leading hash and surrounding whitespace', () => {
    expect(markColorOnDark(' f59e0b ')).toBe(' f59e0b ');
    expect(markColorOnDark(' 1e293b ')).toBe('#ffffff');
  });

  it.each(['rgb(0,0,0)', '#12345', '#1234567', ''])(
    'returns unsupported value %j unchanged',
    (accent) => {
      expect(markColorOnDark(accent)).toBe(accent);
    },
  );
});
