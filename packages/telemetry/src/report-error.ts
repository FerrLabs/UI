import { faro } from '@grafana/faro-web-sdk';

const FALLBACK_MESSAGE = 'Non-Error value';

function messageOf(value: unknown): string {
  if (typeof value === 'object' && value !== null && 'message' in value) {
    const { message } = value;
    if (typeof message === 'string') return message;
  }
  try {
    return String(value);
  } catch {
    return FALLBACK_MESSAGE;
  }
}

function stackOf(value: unknown): string | undefined {
  if (typeof value === 'object' && value !== null && 'stack' in value) {
    const { stack } = value;
    if (typeof stack === 'string') return stack;
  }
  return undefined;
}

function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  const error = new Error(messageOf(value));
  const stack = stackOf(value);
  if (stack) error.stack = stack;
  return error;
}

export function reportError(value: unknown): void {
  try {
    faro.api?.pushError(toError(value));
  } catch {
    return;
  }
}
