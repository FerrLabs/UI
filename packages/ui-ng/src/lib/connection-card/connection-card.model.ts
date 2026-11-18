export type ConnectionTone = 'ok' | 'alert' | 'idle';

export interface ConnectionMeta {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}

export type ConnectionCardPhase = 'loading' | 'failed' | 'confirming' | 'ready';

export function cardPhase(
  loading: boolean,
  error: string | null,
  confirming: boolean,
): ConnectionCardPhase {
  if (loading) return 'loading';
  if (error) return 'failed';
  return confirming ? 'confirming' : 'ready';
}

export function toneRole(tone: ConnectionTone): 'alert' | 'status' {
  return tone === 'alert' ? 'alert' : 'status';
}

export function visibleMeta(items: readonly ConnectionMeta[]): readonly ConnectionMeta[] {
  return items.filter((item) => item.value.trim() !== '');
}
