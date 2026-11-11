import { faro } from '@grafana/faro-web-sdk';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { TelemetryErrorHandler } from './telemetry-error-handler.js';

describe('TelemetryErrorHandler', () => {
  const pushError = vi.fn();
  const handler = new TelemetryErrorHandler();
  let consoleError: MockInstance;

  beforeEach(() => {
    pushError.mockClear();
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    Object.assign(faro, { api: { pushError } });
  });

  afterEach(() => {
    consoleError.mockRestore();
    Object.assign(faro, { api: undefined });
  });

  it('pushes Error instances as is and still delegates to the default handler', () => {
    const error = new Error('boom');
    handler.handleError(error);
    expect(pushError).toHaveBeenCalledTimes(1);
    expect(pushError.mock.calls[0]?.[0]).toBe(error);
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('wraps non-Error values', () => {
    handler.handleError('plain string');
    const pushed = pushError.mock.calls[0]?.[0];
    expect(pushed instanceof Error).toBe(true);
    expect(pushed.message).toBe('plain string');
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('keeps the message of Error-like objects such as HttpErrorResponse', () => {
    handler.handleError({ message: 'Http failure response for /api: 500', status: 500 });
    const pushed = pushError.mock.calls[0]?.[0];
    expect(pushed instanceof Error).toBe(true);
    expect(pushed.message).toBe('Http failure response for /api: 500');
  });

  it('copies the stack of Error-like objects', () => {
    handler.handleError({ message: 'boom', stack: 'Error: boom\n    at somewhere' });
    const pushed = pushError.mock.calls[0]?.[0];
    expect(pushed.stack).toBe('Error: boom\n    at somewhere');
  });

  it('does not throw on values that cannot be stringified and still delegates', () => {
    expect(() => handler.handleError(Object.create(null))).not.toThrow();
    const pushed = pushError.mock.calls[0]?.[0];
    expect(pushed.message).toBe('Non-Error value');
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('still delegates when pushing to faro throws', () => {
    pushError.mockImplementationOnce(() => {
      throw new Error('transport down');
    });
    expect(() => handler.handleError(new Error('boom'))).not.toThrow();
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('still delegates when faro is not initialized', () => {
    Object.assign(faro, { api: undefined });
    handler.handleError(new Error('early'));
    expect(pushError).toHaveBeenCalledTimes(0);
    expect(consoleError).toHaveBeenCalledTimes(1);
  });
});
