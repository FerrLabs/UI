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

function* strings(alphabet: string, maxLength: number): Generator<string> {
  yield '';
  let layer = [''];
  for (let n = 1; n <= maxLength; n++) {
    const next: string[] = [];
    for (const prefix of layer) for (const c of alphabet) next.push(prefix + c);
    yield* next;
    layer = next;
  }
}

function* states(alphabet: string, maxLength: number): Generator<EditState> {
  for (const value of strings(alphabet, maxLength)) {
    for (let start = 0; start <= value.length; start++) {
      for (let end = start; end <= value.length; end++) yield { value, start, end };
    }
  }
}

const MARKERS = ['**', '*', '~~', '`'];
const MARKER_CHARS = /[*~`]/g;

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

describe('exhaustive small-alphabet checks', () => {
  it('every action returns a selection inside the new value', () => {
    for (const s of states('a*`\n#', 5)) {
      for (const [name, action] of Object.entries(actions)) {
        const out = action(s);
        const ok = out.start >= 0 && out.start <= out.end && out.end <= out.value.length;
        if (!ok) expect.fail(`${name} ${JSON.stringify(s)} -> ${JSON.stringify(out)}`);
        const r = diffReplacement(s.value, out.value);
        const rebuilt = s.value.slice(0, r.from) + r.text + s.value.slice(r.to);
        if (rebuilt !== out.value) expect.fail(`diff ${name} ${JSON.stringify(s)}`);
      }
    }
  });

  it('wrapping with a non-empty selection is an involution that keeps a selection', () => {
    for (const s of states('a*`~', 6)) {
      if (s.end === s.start) continue;
      for (const marker of MARKERS) {
        const once = toggleWrap(s, marker);
        const twice = toggleWrap(once, marker);
        if (once.end <= once.start || twice.value !== s.value) {
          expect.fail(`${marker} ${JSON.stringify(s)} -> ${JSON.stringify(once)}`);
        }
      }
    }
  });

  it('wrapping from a caret never removes text other than marker characters', () => {
    for (const s of states('a*`~', 6)) {
      if (s.end !== s.start) continue;
      for (const marker of MARKERS) {
        const out = toggleWrap(s, marker);
        const expected = (s.value.slice(0, s.start) + 'text' + s.value.slice(s.end)).replace(
          MARKER_CHARS,
          '',
        );
        if (out.value.replace(MARKER_CHARS, '') !== expected) {
          expect.fail(`${marker} ${JSON.stringify(s)} -> ${JSON.stringify(out)}`);
        }
        if (out.value.slice(out.start, out.end) !== 'text') {
          expect.fail(`selection ${marker} ${JSON.stringify(s)}`);
        }
      }
    }
  });

  it('line prefixes toggled twice restore lines without markers', () => {
    for (const s of states('a \n', 6)) {
      if (!s.value.split('\n').some((l) => l.trim() !== '')) continue;
      for (const prefix of [BULLET, NUMBERED, TASK, QUOTE]) {
        const once = toggleLinePrefix(s, prefix);
        if (toggleLinePrefix(once, prefix).value !== s.value) {
          expect.fail(`${JSON.stringify(s)} -> ${JSON.stringify(once)}`);
        }
      }
    }
  });

  it('four heading cycles restore text that has no hash', () => {
    for (const s of states('a \n', 6)) {
      let state = s;
      for (let i = 0; i < 4; i++) state = cycleHeading(state);
      if (state.value !== s.value) expect.fail(`${JSON.stringify(s)} -> ${JSON.stringify(state)}`);
    }
  });

  it('line actions only edit the selected lines', () => {
    for (const s of states('a#-\n', 5)) {
      const lines = s.value.split('\n');
      const first = s.value.slice(0, s.start).split('\n').length - 1;
      const last = s.value.slice(0, Math.max(s.end, s.start)).split('\n').length - 1;
      for (const action of [
        cycleHeading,
        ...[BULLET, NUMBERED, TASK, QUOTE].map((p) => (x: EditState) => toggleLinePrefix(x, p)),
      ]) {
        const out = action(s).value.split('\n');
        if (out.length !== lines.length) expect.fail(`line count ${JSON.stringify(s)}`);
        for (let i = 0; i < lines.length; i++) {
          if ((i < first || i > last) && out[i] !== lines[i]) {
            expect.fail(`outside ${JSON.stringify(s)} -> ${JSON.stringify(out)}`);
          }
        }
      }
    }
  });

  it('links keep the whole selection as an unbroken label', () => {
    for (const s of states('a[]\\\n ', 4)) {
      const out = insertLink(s);
      const label = out.value.slice(s.start + 1, out.start - 2);
      const unescaped = label.replace(/\\(.)/g, '$1');
      const expected = s.value.slice(s.start, s.end).replace(/\n[^\S\n]*(?:\n[^\S\n]*)+/g, '\n');
      if (s.end > s.start && unescaped !== expected) expect.fail(JSON.stringify(s));
      if (/(^|[^\\])(\\\\)*[[\]]/.test(label.replace(/\\./g, ''))) {
        expect.fail(`unescaped bracket ${JSON.stringify(s)}`);
      }
      if (/\n\s*\n/.test(label)) expect.fail(`blank line ${JSON.stringify(s)}`);
    }
  });

  it('blocks are fenced longer than any backtick run they contain', () => {
    for (const s of states('a`\n', 6)) {
      const out = insertBlock(s, '```');
      const body = out.value.slice(out.start, out.end);
      const lines = out.value.slice(0, out.start).split('\n');
      const fence = lines[lines.length - 2];
      const longest = Math.max(0, ...(body.match(/`+/g) ?? []).map((r) => r.length));
      if (fence.replace(/^.*\n/, '').length <= longest || !/^`+$/.test(fence.trim())) {
        expect.fail(JSON.stringify(s));
      }
      if (body !== (s.value.slice(s.start, s.end) || 'code'))
        expect.fail(`body ${JSON.stringify(s)}`);
    }
  });
});
