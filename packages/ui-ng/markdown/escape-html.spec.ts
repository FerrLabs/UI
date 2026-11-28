import { describe, expect, it } from 'vitest';
import { escapeHtml } from './escape-html';

describe('escapeHtml', () => {
  it.each([
    ['&', '&amp;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
    ['"', '&quot;'],
    ["'", '&#39;'],
  ])('escapes %s', (char, entity) => {
    expect(escapeHtml(char)).toBe(entity);
  });

  it('escapes every occurrence in a string', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });

  it('does not double escape ampersands introduced by earlier replacements', () => {
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });

  it('leaves safe text and the empty string untouched', () => {
    expect(escapeHtml('plain text 123 / é')).toBe('plain text 123 / é');
    expect(escapeHtml('')).toBe('');
  });
});
