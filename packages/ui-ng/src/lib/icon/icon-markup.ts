const ELEMENTS: ReadonlySet<string> = new Set([
  'svg',
  'g',
  'defs',
  'title',
  'desc',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
]);

const ATTRIBUTES: ReadonlySet<string> = new Set([
  'aria-hidden',
  'class',
  'clip-rule',
  'cx',
  'cy',
  'd',
  'fill',
  'fill-opacity',
  'fill-rule',
  'focusable',
  'height',
  'opacity',
  'points',
  'r',
  'role',
  'rx',
  'ry',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-opacity',
  'stroke-width',
  'transform',
  'viewBox',
  'width',
  'x',
  'x1',
  'x2',
  'xmlns',
  'y',
  'y1',
  'y2',
]);

const TAG = /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:\s[^<>]*)?)\/?>/g;
const ATTRIBUTE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"<>]*)"/g;

function attributesAreSafe(raw: string): boolean {
  let rest = raw;
  for (const [match, name] of raw.matchAll(ATTRIBUTE)) {
    if (!ATTRIBUTES.has(name)) return false;
    rest = rest.replace(match, ' ');
  }
  return rest.replace(/\//g, ' ').trim() === '';
}

export function isTrustedIconMarkup(markup: string): boolean {
  const value = markup.trim();
  if (!value.startsWith('<svg') || !value.endsWith('</svg>')) return false;
  if (value.includes('<!') || value.includes('<?')) return false;

  let cursor = 0;
  for (const match of value.matchAll(TAG)) {
    const [tag, name, attributes] = match;
    if (value.slice(cursor, match.index).includes('<')) return false;
    if (!ELEMENTS.has(name)) return false;
    if (!tag.startsWith('</') && !attributesAreSafe(attributes ?? '')) return false;
    cursor = match.index + tag.length;
  }

  return !value.slice(cursor).includes('<');
}
