import { faro } from '@grafana/faro-web-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reportError } from './report-error.js';

describe('reportError', () => {
  const pushError = vi.fn();

  beforeEach(() => {
    pushError.mockReset();
    Object.assign(faro, { api: { pushError } });
  });

  afterEach(() => {
    Object.assign(faro, { api: undefined });
  });

  it('pushes Error instances as is', () => {
    const error = new Error('boom');
    reportError(error);
    expect(pushError).toHaveBeenCalledTimes(1);
    expect(pushError.mock.calls[0]?.[0]).toBe(error);
  });

  it('wraps non-Error values into an Error', () => {
    reportError('plain string');
    const pushed = pushError.mock.calls[0]?.[0];
    expect(pushed).toBeInstanceOf(Error);
    expect(pushed.message).toBe('plain string');
  });

  it('keeps message and stack of Error-like objects', () => {
    reportError({ message: 'boom', stack: 'Error: boom\n    at somewhere' });
    const pushed = pushError.mock.calls[0]?.[0];
    expect(pushed).toBeInstanceOf(Error);
    expect(pushed.message).toBe('boom');
    expect(pushed.stack).toBe('Error: boom\n    at somewhere');
  });

  it('falls back to a fixed message when the value cannot be stringified', () => {
    reportError(Object.create(null));
    expect(pushError.mock.calls[0]?.[0].message).toBe('Non-Error value');
  });

  it('is a no-op when faro is not initialised', () => {
    Object.assign(faro, { api: undefined });
    expect(() => reportError(new Error('early'))).not.toThrow();
    expect(pushError).not.toHaveBeenCalled();
  });

  it('does not throw when pushError throws', () => {
    pushError.mockImplementationOnce(() => {
      throw new Error('transport down');
    });
    expect(() => reportError(new Error('boom'))).not.toThrow();
  });
});
