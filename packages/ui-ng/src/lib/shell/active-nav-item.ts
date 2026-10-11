import type { ShellNavGroup } from './shell.component';

interface ParsedUrl {
  readonly path: string;
  readonly query: URLSearchParams;
}

function parse(url: string): ParsedUrl {
  const [path, query = ''] = url.split('#')[0].split('?');
  return { path, query: new URLSearchParams(query) };
}

function containsPath(current: string, target: string): boolean {
  if (target === '/') return current === '/';
  return current === target || current.startsWith(`${target}/`);
}

function containsQuery(current: URLSearchParams, target: URLSearchParams): boolean {
  for (const [key, value] of target) {
    if (current.get(key) !== value) return false;
  }
  return true;
}

export function activeNavItemId(
  groups: readonly ShellNavGroup[],
  currentUrl: string,
): string | null {
  const current = parse(currentUrl);
  let bestId: string | null = null;
  let bestPathLength = -1;
  let bestQuerySize = -1;
  for (const group of groups) {
    for (const item of group.items) {
      if (!item.href) continue;
      const target = parse(item.href);
      if (!containsPath(current.path, target.path)) continue;
      if (!containsQuery(current.query, target.query)) continue;
      const querySize = [...target.query].length;
      const longer = target.path.length > bestPathLength;
      const moreSpecific = target.path.length === bestPathLength && querySize > bestQuerySize;
      if (longer || moreSpecific) {
        bestId = item.id;
        bestPathLength = target.path.length;
        bestQuerySize = querySize;
      }
    }
  }
  return bestId;
}
