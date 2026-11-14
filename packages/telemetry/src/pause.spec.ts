import { faro } from '@grafana/faro-web-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pauseTelemetry, resumeTelemetry } from './pause.js';

describe('pauseTelemetry and resumeTelemetry', () => {
  const pause = vi.fn();
  const unpause = vi.fn();

  beforeEach(() => {
    pause.mockReset();
    unpause.mockReset();
    Object.assign(faro, { api: {}, pause, unpause });
  });

  afterEach(() => {
    Object.assign(faro, { api: undefined });
  });

  it('pauseTelemetry pauses the initialised instance only', () => {
    pauseTelemetry();
    expect(pause).toHaveBeenCalledTimes(1);
    expect(unpause).not.toHaveBeenCalled();
  });

  it('resumeTelemetry unpauses the initialised instance only', () => {
    resumeTelemetry();
    expect(unpause).toHaveBeenCalledTimes(1);
    expect(pause).not.toHaveBeenCalled();
  });

  it('are no-ops when faro is not initialised', () => {
    Object.assign(faro, { api: undefined });
    expect(() => pauseTelemetry()).not.toThrow();
    expect(() => resumeTelemetry()).not.toThrow();
    expect(pause).not.toHaveBeenCalled();
    expect(unpause).not.toHaveBeenCalled();
  });

  it('never throw when faro throws', () => {
    pause.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    unpause.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    expect(() => pauseTelemetry()).not.toThrow();
    expect(() => resumeTelemetry()).not.toThrow();
  });
});
