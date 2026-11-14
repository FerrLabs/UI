import type { TransportItem } from '@grafana/faro-web-sdk';
import { redactText } from './redact-text.js';
import { sanitizeItem } from './walk.js';

export type CapabilityPath = readonly [pattern: RegExp, replacement: string];

export interface RedactItemOptions {
  dropSessionMeta?: boolean;
}

export function redactItem(
  item: TransportItem,
  capabilityPaths: readonly CapabilityPath[] = [],
  { dropSessionMeta = false }: RedactItemOptions = {},
): TransportItem | null {
  const redactString = (value: string): string =>
    redactText(
      capabilityPaths.reduce(
        (text, [pattern, replacement]) => text.replace(pattern, replacement),
        value,
      ),
    );
  return sanitizeItem(item, { redactString, dropSessionMeta });
}
