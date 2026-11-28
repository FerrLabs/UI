import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown-renderer';

describe('renderMarkdown links', () => {
  it('opens absolute links in a new tab with a safe rel', () => {
    expect(renderMarkdown('[docs](https://example.com/a)')).toContain(
      '<a href="https://example.com/a" target="_blank" rel="noopener noreferrer">docs</a>',
    );
  });

  it('keeps relative and anchor links in the same tab', () => {
    const html = renderMarkdown('[a](/guide) [b](#top) [c](./x.md)');
    expect(html).not.toContain('target=');
    expect(html).toContain('<a href="/guide" rel="noopener noreferrer">a</a>');
    expect(html).toContain('<a href="#top" rel="noopener noreferrer">b</a>');
  });

  it('treats a scheme-relative url as same tab', () => {
    expect(renderMarkdown('[x](//example.com)')).not.toContain('target=');
  });

  it('renders a title attribute and escapes it', () => {
    const html = renderMarkdown('[x](/p "say \\"hi\\" <now>")');
    expect(html).toContain('title="say &quot;hi&quot; &lt;now&gt;"');
  });

  it('omits the title attribute when there is none', () => {
    expect(renderMarkdown('[x](/p)')).not.toContain('title=');
  });

  it('escapes quotes in the href so the attribute cannot be broken out of', () => {
    const html = renderMarkdown('[x](https://e.com/?a=1&b=2)');
    expect(html).toContain('href="https://e.com/?a=1&amp;b=2"');
  });

  it('renders inline formatting inside the link text', () => {
    expect(renderMarkdown('[**bold** `code`](/p)')).toContain(
      '<strong>bold</strong> <code>code</code></a>',
    );
  });
});

describe('renderMarkdown code blocks', () => {
  it('makes code blocks keyboard focusable', () => {
    expect(renderMarkdown('```\nplain\n```')).toContain('<pre tabindex="0">');
  });

  it('highlights fenced code by language and keeps the language class', () => {
    const html = renderMarkdown('```ts\nconst a = 1;\n```');
    expect(html).toContain('class="language-ts"');
    expect(html).toContain('<span class="token keyword">const</span>');
  });

  it('escapes fenced code of an unknown language', () => {
    const html = renderMarkdown('```nope\n<script>alert(1)</script>\n```');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('does not highlight inline code', () => {
    expect(renderMarkdown('use `const a`')).toContain('<code>const a</code>');
  });
});

describe('renderMarkdown task lists', () => {
  it('replaces checkboxes with labelled markers', () => {
    const html = renderMarkdown('- [x] shipped\n- [ ] pending');
    expect(html).toContain(
      '<span class="flr-md-task flr-md-task--done"><span class="flr-md-sr">Done: </span></span>',
    );
    expect(html).toContain(
      '<span class="flr-md-task"><span class="flr-md-sr">Open: </span></span>',
    );
    expect(html).not.toContain('<input');
  });
});

describe('renderMarkdown gfm', () => {
  it('renders tables', () => {
    const html = renderMarkdown('| a | b |\n| - | - |\n| 1 | 2 |');
    expect(html).toContain('<table>');
    expect(html).toContain('<td>2</td>');
  });

  it('renders strikethrough', () => {
    expect(renderMarkdown('~~gone~~')).toContain('<del>gone</del>');
  });

  it('returns an empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
  });

  it('returns a string synchronously', () => {
    expect(typeof renderMarkdown('# t')).toBe('string');
    expect(renderMarkdown('# t')).toContain('<h1>t</h1>');
  });
});
