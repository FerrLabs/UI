import fc from 'fast-check';
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

const text = (chars: string, max = 12) =>
  fc.array(fc.constantFrom(...chars.split('')), { maxLength: max }).map((a) => a.join(''));

const ALPHABET = 'ab *`~#-[]x>1. \n\t';

const editState = text(ALPHABET).chain((value) =>
  fc.tuple(fc.nat(value.length), fc.nat(value.length)).map(([a, b]): EditState => ({
    value,
    start: Math.min(a, b),
    end: Math.max(a, b),
  })),
);

const actions: Record<string, (s: EditState) => EditState> = {
  bold: (s) => toggleWrap(s, '**'),
  italic: (s) => toggleWrap(s, '*'),
  strike: (s) => toggleWrap(s, '~~'),
  code: (s) => toggleWrap(s, '`'),
  heading: cycleHeading,
  block: (s) => insertBlock(s, '```'),
  link: (s) => insertLink(s),
  bullet: (s) => toggleLinePrefix(s, BULLET),
  numbered: (s) => toggleLinePrefix(s, NUMBERED),
  task: (s) => toggleLinePrefix(s, TASK),
  quote: (s) => toggleLinePrefix(s, QUOTE),
};

describe('diffReplacement properties', () => {
  it('applies back to the target', () => {
    fc.assert(
      fc.property(text(ALPHABET), text(ALPHABET), (a, b) => {
        const r = diffReplacement(a, b);
        expect(r.from).toBeGreaterThanOrEqual(0);
        expect(r.from).toBeLessThanOrEqual(r.to);
        expect(r.to).toBeLessThanOrEqual(a.length);
        expect(a.slice(0, r.from) + r.text + a.slice(r.to)).toBe(b);
      }),
    );
  });
});

describe('toolbar action properties', () => {
  for (const [name, action] of Object.entries(actions)) {
    it(`${name} keeps the selection inside the new value`, () => {
      fc.assert(
        fc.property(editState, (s) => {
          const out = action(s);
          expect(out.start).toBeGreaterThanOrEqual(0);
          expect(out.start).toBeLessThanOrEqual(out.end);
          expect(out.end).toBeLessThanOrEqual(out.value.length);
        }),
      );
    });
  }
});

describe('toggleWrap properties', () => {
  const word = fc
    .tuple(fc.constantFrom('a', 'b', 'x'), text('ab x', 4), fc.constantFrom('a', 'b', 'x'))
    .map(([h, m, t]) => h + m + t);
  const around = fc.tuple(
    text('ab *`~ ', 4),
    fc.constantFrom('', '*', '**', '`', '``'),
    text('ab *`~ ', 4),
  );

  for (const [name, marker] of [
    ['bold', '**'],
    ['italic', '*'],
    ['strike', '~~'],
    ['code', '`'],
  ] as const) {
    it(`${name} toggled twice restores the text`, () => {
      fc.assert(
        fc.property(word, around, (core, [left, existing, right]) => {
          const value = left + existing + core + existing + right;
          const start = left.length + existing.length;
          const once = toggleWrap({ value, start, end: start + core.length }, marker);
          expect(once.value.slice(once.start, once.end)).toBe(core);
          expect(toggleWrap(once, marker).value).toBe(value);
        }),
      );
    });
  }
});

describe('toggleLinePrefix properties', () => {
  const lines = fc
    .array(text('ab x*`[]', 5), { minLength: 1, maxLength: 4 })
    .map((l) => l.join('\n'));

  for (const [name, prefix] of [
    ['bullet', BULLET],
    ['numbered', NUMBERED],
    ['task', TASK],
    ['quote', QUOTE],
  ] as const) {
    it(`${name} toggled twice restores plain lines`, () => {
      fc.assert(
        fc.property(lines, fc.nat(), fc.nat(), (value, a, b) => {
          fc.pre(value.split('\n').some((l) => l.trim() !== ''));
          const x = a % (value.length + 1);
          const y = b % (value.length + 1);
          const once = toggleLinePrefix(
            { value, start: Math.min(x, y), end: Math.max(x, y) },
            prefix,
          );
          expect(toggleLinePrefix(once, prefix).value).toBe(value);
        }),
      );
    });
  }
});

describe('cycleHeading properties', () => {
  it('four cycles restore lines that do not start with a hash', () => {
    fc.assert(
      fc.property(
        fc.array(text('ab x\t', 5), { minLength: 1, maxLength: 3 }),
        fc.nat(),
        (ls, a) => {
          const value = ls.join('\n');
          const caret = a % (value.length + 1);
          let s: EditState = { value, start: caret, end: caret };
          for (let i = 0; i < 4; i++) s = cycleHeading(s);
          expect(s.value).toBe(value);
        },
      ),
    );
  });
});

describe('insertLink and insertBlock properties', () => {
  it('preserve surrounding text and select the inserted part', () => {
    fc.assert(
      fc.property(editState, (s) => {
        const link = insertLink(s);
        expect(link.value.startsWith(s.value.slice(0, s.start))).toBe(true);
        expect(link.value.endsWith(s.value.slice(s.end))).toBe(true);
        expect(link.value.slice(link.start, link.end)).toBe('https://');
        const block = insertBlock(s, '```');
        expect(block.value.startsWith(s.value.slice(0, s.start))).toBe(true);
        expect(block.value.endsWith(s.value.slice(s.end))).toBe(true);
        expect(block.value.slice(block.start, block.end)).toBe(
          s.value.slice(s.start, s.end) || 'code',
        );
      }),
    );
  });
});
