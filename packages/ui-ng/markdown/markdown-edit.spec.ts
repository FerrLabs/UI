import { describe, expect, it } from 'vitest';
import {
  BULLET,
  NUMBERED,
  QUOTE,
  TASK,
  cycleHeading,
  diffReplacement,
  insertBlock,
  insertLink,
  toggleLinePrefix,
  toggleWrap,
  type EditState,
} from './markdown-edit';

const at = (value: string, start: number, end = start): EditState => ({ value, start, end });
const selection = (s: EditState) => s.value.slice(s.start, s.end);

describe('toggleWrap', () => {
  it('wraps the selection and keeps it selected', () => {
    const out = toggleWrap(at('say hello now', 4, 9), '**');
    expect(out.value).toBe('say **hello** now');
    expect(selection(out)).toBe('hello');
  });

  it('inserts a selected placeholder on an empty selection', () => {
    const out = toggleWrap(at('ab', 1), '**');
    expect(out.value).toBe('a**text**b');
    expect(selection(out)).toBe('text');
  });

  it('unwraps when the markers surround the selection', () => {
    const out = toggleWrap(at('say **hello** now', 6, 11), '**');
    expect(out.value).toBe('say hello now');
    expect(selection(out)).toBe('hello');
  });

  it('unwraps when the selection includes the markers', () => {
    const out = toggleWrap(at('say **hello** now', 4, 13), '**');
    expect(out.value).toBe('say hello now');
    expect(selection(out)).toBe('hello');
  });

  it('does not mistake bold markers for italic ones', () => {
    const out = toggleWrap(at('**hello**', 2, 7), '*');
    expect(out.value).toBe('***hello***');
    expect(selection(out)).toBe('hello');
  });

  it('supports asymmetric markers', () => {
    const out = toggleWrap(at('x', 0, 1), '<u>', '</u>');
    expect(out.value).toBe('<u>x</u>');
  });

  it('restores when italic is toggled twice next to a stray marker', () => {
    const once = toggleWrap(at('a* b', 0, 1), '*');
    expect(once.value).toBe('*a** b');
    expect(toggleWrap(once, '*').value).toBe('a* b');
  });

  it('restores inline code next to a stray backtick', () => {
    const once = toggleWrap(at('`x', 1, 2), '`');
    expect(once.value).toBe('``x`');
    expect(toggleWrap(once, '`').value).toBe('`x');
  });

  it('toggles italic twice inside bold without stacking markers', () => {
    const once = toggleWrap(at('**hello**', 2, 7), '*');
    expect(once.value).toBe('***hello***');
    expect(toggleWrap(once, '*').value).toBe('**hello**');
  });

  it('toggles bold inside bold-italic', () => {
    expect(toggleWrap(at('***hello***', 3, 8), '**').value).toBe('*hello*');
  });

  it('restores inline code surrounded by doubled backticks', () => {
    const once = toggleWrap(at('a``x``a', 3, 4), '`');
    expect(once.value).toBe('a```x```a');
    expect(toggleWrap(once, '`').value).toBe('a``x``a');
  });

  it('round-trips', () => {
    const wrapped = toggleWrap(at('word', 0, 4), '~~');
    expect(toggleWrap(wrapped, '~~').value).toBe('word');
  });
});

describe('toggleLinePrefix', () => {
  it('prefixes the line containing the caret', () => {
    const out = toggleLinePrefix(at('one\ntwo', 5), BULLET);
    expect(out.value).toBe('one\n- two');
  });

  it('prefixes every selected line', () => {
    const out = toggleLinePrefix(at('a\nb\nc', 0, 3), QUOTE);
    expect(out.value).toBe('> a\n> b\nc');
    expect(selection(out)).toBe('> a\n> b');
  });

  it('removes the prefix when every line has it', () => {
    const out = toggleLinePrefix(at('- a\n- b', 0, 7), BULLET);
    expect(out.value).toBe('a\nb');
  });

  it('numbers lines sequentially', () => {
    const out = toggleLinePrefix(at('a\nb\nc', 0, 5), NUMBERED);
    expect(out.value).toBe('1. a\n2. b\n3. c');
  });

  it('removes numbering regardless of the number', () => {
    const out = toggleLinePrefix(at('1. a\n2. b', 0, 9), NUMBERED);
    expect(out.value).toBe('a\nb');
  });

  it('switches list kind instead of stacking prefixes', () => {
    const out = toggleLinePrefix(at('- a', 0), NUMBERED);
    expect(out.value).toBe('1. a');
  });

  it('restores bracket text after a bullet is added and removed', () => {
    const once = toggleLinePrefix(at('[x] bb', 0), BULLET);
    expect(once.value).toBe('- [x] bb');
    expect(toggleLinePrefix(once, BULLET).value).toBe('[x] bb');
  });

  it('converts a bullet to a task and back to plain text', () => {
    const task = toggleLinePrefix(at('- a', 0), TASK);
    expect(task.value).toBe('- [ ] a');
    expect(toggleLinePrefix(task, TASK).value).toBe('a');
  });

  it('keeps list markers when quoting', () => {
    const out = toggleLinePrefix(at('- a\n- b', 0, 7), QUOTE);
    expect(out.value).toBe('> - a\n> - b');
    expect(toggleLinePrefix(out, QUOTE).value).toBe('- a\n- b');
  });

  it('toggles task items and removes checked ones', () => {
    expect(toggleLinePrefix(at('a', 0), TASK).value).toBe('- [ ] a');
    expect(toggleLinePrefix(at('- [x] a', 0), TASK).value).toBe('a');
  });

  it('ignores a trailing newline in the selection', () => {
    const out = toggleLinePrefix(at('a\nb', 0, 2), BULLET);
    expect(out.value).toBe('- a\nb');
  });

  it('prefixes an empty first line when the caret is at the start', () => {
    expect(toggleLinePrefix(at('\nabc', 0), BULLET).value).toBe('- \nabc');
  });

  it('skips blank lines and numbers only content lines', () => {
    const out = toggleLinePrefix(at('a\n\nb', 0, 4), NUMBERED);
    expect(out.value).toBe('1. a\n\n2. b');
    expect(toggleLinePrefix(out, NUMBERED).value).toBe('a\n\nb');
  });

  it('leaves a blank-only multi-line selection untouched and selected', () => {
    const state = at('\n\na', 0, 2);
    const once = toggleLinePrefix(state, TASK);
    expect(once).toEqual(state);
    expect(toggleLinePrefix(once, TASK).value).toBe('\n\na');
  });

  it('works on an empty document', () => {
    expect(toggleLinePrefix(at('', 0), BULLET).value).toBe('- ');
  });
});

describe('cycleHeading', () => {
  it('cycles through H1, H2, H3 and back to plain', () => {
    let state = at('title', 0);
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      state = cycleHeading(state);
      seen.push(state.value);
    }
    expect(seen).toEqual(['# title', '## title', '### title', 'title']);
  });

  it('normalises deeper headings to H1', () => {
    expect(cycleHeading(at('#### deep', 0)).value).toBe('# deep');
  });

  it('keeps leading whitespace through a full cycle', () => {
    let state = at(' x', 0);
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      state = cycleHeading(state);
      seen.push(state.value);
    }
    expect(seen).toEqual(['#  x', '##  x', '###  x', ' x']);
  });

  it('reads the level from the first non-blank line', () => {
    let state = at('\ntitle', 0, 6);
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      state = cycleHeading(state);
      seen.push(state.value);
    }
    expect(seen).toEqual(['\n# title', '\n## title', '\n### title', '\ntitle']);
  });

  it('keeps cycling after a heading collapses to a blank first line', () => {
    let state = at('# \n ', 0, 4);
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      state = cycleHeading(state);
      seen.push(state.value);
    }
    expect(seen).toEqual(['## \n ', '### \n ', '\n ', '# \n#  ']);
  });

  it('leaves blank lines alone in a multi-line selection', () => {
    expect(cycleHeading(at('a\n\nb', 0, 4)).value).toBe('# a\n\n# b');
  });

  it('heads an empty first line when the caret is at the start', () => {
    expect(cycleHeading(at('\nabc', 0)).value).toBe('# \nabc');
  });

  it('only touches the lines of the selection', () => {
    expect(cycleHeading(at('a\nb\nc', 2)).value).toBe('a\n# b\nc');
  });
});

describe('insertBlock', () => {
  it('fences the selection', () => {
    const out = insertBlock(at('const x = 1', 0, 11), '```');
    expect(out.value).toBe('```\nconst x = 1\n```');
    expect(selection(out)).toBe('const x = 1');
  });

  it('inserts a placeholder block', () => {
    const out = insertBlock(at('', 0), '```');
    expect(out.value).toBe('```\ncode\n```');
    expect(selection(out)).toBe('code');
  });

  it('breaks out of surrounding text onto its own lines', () => {
    const out = insertBlock(at('ab', 1), '```');
    expect(out.value).toBe('a\n```\ncode\n```\nb');
    expect(selection(out)).toBe('code');
  });
});

describe('insertLink', () => {
  it('links the selection and selects the url', () => {
    const out = insertLink(at('see docs now', 4, 8));
    expect(out.value).toBe('see [docs](https://) now');
    expect(selection(out)).toBe('https://');
  });

  it('uses a placeholder label when nothing is selected', () => {
    const out = insertLink(at('', 0));
    expect(out.value).toBe('[text](https://)');
    expect(selection(out)).toBe('https://');
  });
});

describe('diffReplacement', () => {
  const apply = (before: string, r: { from: number; to: number; text: string }) =>
    before.slice(0, r.from) + r.text + before.slice(r.to);

  it('reports the minimal changed range', () => {
    expect(diffReplacement('say hello now', 'say **hello** now')).toEqual({
      from: 4,
      to: 9,
      text: '**hello**',
    });
  });

  it('reports an empty replacement for identical strings', () => {
    expect(diffReplacement('abc', 'abc')).toEqual({ from: 3, to: 3, text: '' });
  });

  it('does not let prefix and suffix overlap on repeated characters', () => {
    const r = diffReplacement('aa', 'aaa');
    expect(apply('aa', r)).toBe('aaa');
  });

  it('applies back to the target for deletions and rewrites', () => {
    for (const [a, b] of [
      ['**hi**', 'hi'],
      ['a\nb', '- a\n- b'],
      ['', 'x'],
      ['x', ''],
    ]) {
      expect(apply(a, diffReplacement(a, b))).toBe(b);
    }
  });
});
