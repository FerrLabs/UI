import type { TransportItem } from '@grafana/faro-web-sdk';
import { MASK, redactText, SENSITIVE_FIELD } from './redact-text.js';

export type CapabilityPath = readonly [pattern: RegExp, replacement: string];

function isPlainContainer(node: object): boolean {
  if (Array.isArray(node)) return true;
  const prototype = Object.getPrototypeOf(node);
  return prototype === null || prototype === Object.prototype;
}

function redactString(value: string, capabilityPaths: readonly CapabilityPath[]): string {
  return redactText(
    capabilityPaths.reduce(
      (text, [pattern, replacement]) => text.replace(pattern, replacement),
      value,
    ),
  );
}

function redactDeep(
  node: unknown,
  visited: WeakSet<object>,
  capabilityPaths: readonly CapabilityPath[],
): void {
  if (typeof node !== 'object' || node === null || visited.has(node)) return;
  visited.add(node);
  const container = node as Record<string, unknown>;
  for (const key of Object.keys(container)) {
    const value = container[key];
    if (value instanceof Date) continue;
    if (typeof value === 'string') {
      container[key] = SENSITIVE_FIELD.test(key) ? MASK : redactString(value, capabilityPaths);
    } else if (typeof value === 'object' && value !== null && SENSITIVE_FIELD.test(key)) {
      container[key] = MASK;
    } else if (typeof value === 'object' && value !== null && !isPlainContainer(value)) {
      container[key] = redactString(String(value), capabilityPaths);
    } else redactDeep(value, visited, capabilityPaths);
  }
}

export function redactItem(
  item: TransportItem,
  capabilityPaths: readonly CapabilityPath[] = [],
): TransportItem | null {
  try {
    const visited = new WeakSet<object>();
    redactDeep(item.meta, visited, capabilityPaths);
    redactDeep(item.payload, visited, capabilityPaths);
    return item;
  } catch {
    return null;
  }
}
