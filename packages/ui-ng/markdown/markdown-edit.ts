export interface EditState {
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

export interface LinePrefix {
  readonly make: (index: number) => string;
  readonly match: RegExp;
  readonly replaces: RegExp;
}

const LIST_MARKER = /^(?:- \[[ xX]\] |- |\d+\. )/;
const NO_MARKER = /^(?!)/;

export const BULLET: LinePrefix = { make: () => '- ', match: /^- /, replaces: LIST_MARKER };
export const NUMBERED: LinePrefix = {
  make: (i) => `${i + 1}. `,
  match: /^\d+\. /,
  replaces: LIST_MARKER,
};
export const TASK: LinePrefix = {
  make: () => '- [ ] ',
  match: /^- \[[ xX]\] /,
  replaces: LIST_MARKER,
};
export const QUOTE: LinePrefix = { make: () => '> ', match: /^> ?/, replaces: NO_MARKER };

const HEADING = /^(#{1,6}) /;
const MAX_HEADING_LEVEL = 3;

function runLength(text: string, char: string, from: number, step: 1 | -1): number {
  let count = 0;
  for (let i = from; i >= 0 && i < text.length && text[i] === char; i += step) count++;
  return count;
}

function isRepeated(marker: string): boolean {
  return marker.length > 0 && [...marker].every((c) => c === marker[0]);
}

function hasOddRuns(left: number, right: number, size: number): boolean {
  return Math.floor(Math.min(left, right) / size) % 2 === 1;
}

function isWrapped(value: string, start: number, end: number, before: string, after: string) {
  if (start < before.length || end + after.length > value.length) return false;
  if (value.slice(start - before.length, start) !== before) return false;
  if (value.slice(end, end + after.length) !== after) return false;
  if (before === after && isRepeated(before)) {
    const left = runLength(value, before[0], start - 1, -1);
    const right = runLength(value, before[0], end, 1);
    return hasOddRuns(left, right, before.length);
  }
  return true;
}

function isSelfWrapped(selected: string, before: string, after: string): boolean {
  if (selected.length < before.length + after.length) return false;
  if (!selected.startsWith(before) || !selected.endsWith(after)) return false;
  if (before === after && isRepeated(before)) {
    const left = runLength(selected, before[0], 0, 1);
    const right = runLength(selected, before[0], selected.length - 1, -1);
    return hasOddRuns(left, right, before.length);
  }
  return true;
}

export function toggleWrap(
  { value, start, end }: EditState,
  before: string,
  after: string = before,
  placeholder = 'text',
): EditState {
  const selected = value.slice(start, end);

  if (isWrapped(value, start, end, before, after)) {
    return {
      value: value.slice(0, start - before.length) + selected + value.slice(end + after.length),
      start: start - before.length,
      end: end - before.length,
    };
  }

  if (isSelfWrapped(selected, before, after)) {
    const inner = selected.slice(before.length, selected.length - after.length);
    return {
      value: value.slice(0, start) + inner + value.slice(end),
      start,
      end: start + inner.length,
    };
  }

  const text = selected || placeholder;
  return {
    value: value.slice(0, start) + before + text + after + value.slice(end),
    start: start + before.length,
    end: start + before.length + text.length,
  };
}

interface LineRange {
  readonly from: number;
  readonly to: number;
  readonly lines: string[];
}

function lineRange({ value, start, end }: EditState): LineRange {
  const from = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
  const stop = end > start && value[end - 1] === '\n' ? end - 1 : end;
  const next = value.indexOf('\n', stop);
  const to = next === -1 ? value.length : next;
  return { from, to, lines: value.slice(from, to).split('\n') };
}

function replaceLines(state: EditState, range: LineRange, lines: string[]): EditState {
  const joined = lines.join('\n');
  return {
    value: state.value.slice(0, range.from) + joined + state.value.slice(range.to),
    start: range.from,
    end: range.from + joined.length,
  };
}

export function toggleLinePrefix(state: EditState, prefix: LinePrefix): EditState {
  const range = lineRange(state);
  const content = range.lines.filter((line) => line.trim() !== '');
  const allPrefixed = content.length > 0 && content.every((line) => prefix.match.test(line));
  let index = 0;
  const lines = range.lines.map((line) => {
    if (line.trim() === '' && range.lines.length > 1) return line;
    if (allPrefixed) return line.replace(prefix.match, '');
    return prefix.make(index++) + line.replace(prefix.replaces, '');
  });
  return replaceLines(state, range, lines);
}

export function cycleHeading(state: EditState): EditState {
  const range = lineRange(state);
  const current = HEADING.exec(range.lines[0])?.[1].length ?? 0;
  const next = current === MAX_HEADING_LEVEL ? 0 : current > MAX_HEADING_LEVEL ? 1 : current + 1;
  const marker = next === 0 ? '' : `${'#'.repeat(next)} `;
  const multiline = range.lines.length > 1;
  return replaceLines(
    state,
    range,
    range.lines.map((line) =>
      multiline && line.trim() === '' ? line : marker + line.replace(HEADING, ''),
    ),
  );
}

export function insertBlock(
  { value, start, end }: EditState,
  fence: string,
  placeholder = 'code',
): EditState {
  const selected = value.slice(start, end) || placeholder;
  const lead = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
  const trail = end < value.length && value[end] !== '\n' ? '\n' : '';
  const open = `${lead}${fence}\n`;
  const block = `${open}${selected}\n${fence}${trail}`;
  return {
    value: value.slice(0, start) + block + value.slice(end),
    start: start + open.length,
    end: start + open.length + selected.length,
  };
}

export function insertLink({ value, start, end }: EditState, url = 'https://'): EditState {
  const label = value.slice(start, end) || 'text';
  const link = `[${label}](${url})`;
  const urlStart = start + label.length + 3;
  return {
    value: value.slice(0, start) + link + value.slice(end),
    start: urlStart,
    end: urlStart + url.length,
  };
}

export interface Replacement {
  readonly from: number;
  readonly to: number;
  readonly text: string;
}

export function diffReplacement(before: string, after: string): Replacement {
  const limit = Math.min(before.length, after.length);
  let prefix = 0;
  while (prefix < limit && before[prefix] === after[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < limit - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) {
    suffix++;
  }
  return {
    from: prefix,
    to: before.length - suffix,
    text: after.slice(prefix, after.length - suffix),
  };
}
