import { describe, expect, it } from 'vitest';
import { highlightCode } from './highlight';

const SNIPPET = 'const a = "<b>";';

describe('highlightCode', () => {
  it('wraps tokens of a known language in token spans', () => {
    const html = highlightCode('const a = 1;', 'typescript');
    expect(html).toContain('<span class="token keyword">const</span>');
    expect(html).toContain('<span class="token number">1</span>');
  });

  it('escapes markup inside highlighted strings', () => {
    const html = highlightCode(SNIPPET, 'typescript');
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;b>');
  });

  it.each([
    ['ts', 'typescript'],
    ['js', 'javascript'],
    ['sh', 'bash'],
    ['yml', 'yaml'],
    ['rs', 'rust'],
    ['py', 'python'],
    ['md', 'markdown'],
    ['html', 'markup'],
    ['golang', 'go'],
  ])('resolves the alias %s like %s', (alias, canonical) => {
    const code = alias === 'html' ? '<p class="x">hi</p>' : 'x = 1';
    expect(highlightCode(code, alias)).toBe(highlightCode(code, canonical));
  });

  it('matches the language case-insensitively and ignores surrounding whitespace', () => {
    expect(highlightCode('const a = 1;', '  TypeScript ')).toBe(
      highlightCode('const a = 1;', 'typescript'),
    );
  });

  it.each([
    ['undefined', undefined],
    ['empty', ''],
    ['blank', '   '],
    ['unknown', 'klingon'],
  ])('escapes the code verbatim for %s language', (_name, language) => {
    expect(highlightCode(SNIPPET, language)).toBe('const a = &quot;&lt;b&gt;&quot;;');
  });

  it.each(['constructor', 'toString', '__proto__', 'hasOwnProperty'])(
    'does not resolve the inherited member %s as a language',
    (name) => {
      expect(highlightCode('<x>', name)).toBe('&lt;x&gt;');
    },
  );

  it('does not treat the grammar helper functions on Prism.languages as languages', () => {
    expect(highlightCode('<x>', 'extend')).toBe('&lt;x&gt;');
    expect(highlightCode('<x>', 'insertBefore')).toBe('&lt;x&gt;');
  });

  it('keeps the original text when tokens are stripped', () => {
    const code = 'fn main() { println!("hi"); }';
    const text = highlightCode(code, 'rust').replace(/<[^>]+>/g, '');
    expect(text.replaceAll('&quot;', '"')).toBe(code);
  });
});
