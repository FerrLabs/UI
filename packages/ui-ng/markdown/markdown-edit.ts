export interface EditState {
  readonly value: string;
  readonly start: number;
  readonly end: number;
}

export interface LinePrefix {
  readonly make: (index: number) => string;
  readonly match: RegExp;
}

export const BULLET: LinePrefix = { make: () => '- ', match: /^- (?!\[[ xX]\] )/ };
export const NUMBERED: LinePrefix = { make: (i) => `${i + 1}. `, match: /^\d+\. / };
export const TASK: LinePrefix = { make: () => '- [ ] ', match: /^- \[[ xX]\] / };
export const QUOTE: LinePrefix = { make: () => '> ', match: /^> ?/ };

const ANY_LIST_PREFIX = /^(?:- \[[ xX]\] |- |\d+\. |> ?)/;
const HEADING = /^(#{1,6})\s+/;
const MAX_HEADING_LEVEL = 3;

function isWrapped(value: string, start: number, end: number, before: string, after: string) {
  if (start < before.length || end + after.length > value.length) return false;
  if (value.slice(start - before.length, start) !== before) return false;
  if (value.slice(end, end + after.length) !== after) return false;
  if (before === after && before.length === 1) {
    return value[start - 2] !== before && value[end + 1] !== after;
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

  if (
    selected.length >= before.length + after.length &&
    selected.startsWith(before) &&
    selected.endsWith(after) &&
    !(before === after && before.length === 1 && selected.startsWith(before + before))
  ) {
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
  const from = value.lastIndexOf('\n', start - 1) + 1;
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
  const allPrefixed = range.lines.every((line) => prefix.match.test(line));
  const lines = allPrefixed
    ? range.lines.map((line) => line.replace(prefix.match, ''))
    : range.lines.map((line, i) => prefix.make(i) + line.replace(ANY_LIST_PREFIX, ''));
  return replaceLines(state, range, lines);
}

export function cycleHeading(state: EditState): EditState {
  const range = lineRange(state);
  const current = HEADING.exec(range.lines[0])?.[1].length ?? 0;
  const next = current === MAX_HEADING_LEVEL ? 0 : current > MAX_HEADING_LEVEL ? 1 : current + 1;
  const marker = next === 0 ? '' : `${'#'.repeat(next)} `;
  return replaceLines(
    state,
    range,
    range.lines.map((line) => marker + line.replace(HEADING, '')),
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
