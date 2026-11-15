export interface StoredSplitter {
  readonly ratios: readonly number[];
  readonly collapsed: readonly boolean[];
}

const KEY_PREFIX = 'flr-splitter:';

export function defaultStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function parseStored(raw: string | null, paneCount: number): StoredSplitter | null {
  if (raw === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;
  const { ratios, collapsed } = value as Record<string, unknown>;
  if (!Array.isArray(ratios) || !Array.isArray(collapsed)) return null;
  if (ratios.length !== paneCount || collapsed.length !== paneCount) return null;
  const validRatios = ratios.every((r) => typeof r === 'number' && Number.isFinite(r) && r >= 0);
  const validFlags = collapsed.every((c) => typeof c === 'boolean');
  if (!validRatios || !validFlags) return null;
  if ((ratios as number[]).every((r) => r === 0)) return null;
  return { ratios: ratios as number[], collapsed: collapsed as boolean[] };
}

export function readStored(
  storage: Storage | null,
  key: string,
  paneCount: number,
): StoredSplitter | null {
  if (!storage) return null;
  try {
    return parseStored(storage.getItem(KEY_PREFIX + key), paneCount);
  } catch {
    return null;
  }
}

export function writeStored(storage: Storage | null, key: string, value: StoredSplitter): void {
  if (!storage) return;
  try {
    storage.setItem(KEY_PREFIX + key, JSON.stringify(value));
  } catch {
    return;
  }
}
