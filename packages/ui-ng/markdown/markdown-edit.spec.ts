import { describe, expect, it } from 'vitest';
import {
  BULLET,
  NUMBERED,
  QUOTE,
  TASK,
  cycleHeading,
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

  it('does not treat task items as bullets', () => {
    const out = toggleLinePrefix(at('- [ ] a', 0), BULLET);
    expect(out.value).toBe('- a');
  });

  it('toggles task items and removes checked ones', () => {
    expect(toggleLinePrefix(at('a', 0), TASK).value).toBe('- [ ] a');
    expect(toggleLinePrefix(at('- [x] a', 0), TASK).value).toBe('a');
  });

  it('ignores a trailing newline in the selection', () => {
    const out = toggleLinePrefix(at('a\nb', 0, 2), BULLET);
    expect(out.value).toBe('- a\nb');
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
