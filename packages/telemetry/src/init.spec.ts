import { getWebInstrumentations, initializeFaro, type Config } from '@grafana/faro-web-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initTelemetry } from './init.js';

vi.mock('@grafana/faro-web-sdk', () => ({
  initializeFaro: vi.fn(),
  getWebInstrumentations: vi.fn(() => ['instrumentation']),
}));

const options = { appName: 'my-app', collectorUrl: 'https://rum.example.com/collect' };

const setEnvironment = (hostname: string, navigatorValue: object = {}) => {
  Object.defineProperty(globalThis, 'window', {
    value: { location: { hostname } },
    configurable: true,
  });
  Object.defineProperty(globalThis, 'navigator', { value: navigatorValue, configurable: true });
};

describe('initTelemetry', () => {
  beforeEach(() => {
    vi.mocked(initializeFaro).mockReset();
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
    Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true });
  });

  it('does nothing without a window', () => {
    initTelemetry(options);
    expect(initializeFaro).not.toHaveBeenCalled();
  });

  it('does nothing on localhost', () => {
    setEnvironment('localhost');
    initTelemetry(options);
    expect(initializeFaro).not.toHaveBeenCalled();
  });

  it('does nothing when Do Not Track is set', () => {
    setEnvironment('app.example.com', { doNotTrack: '1' });
    initTelemetry(options);
    expect(initializeFaro).not.toHaveBeenCalled();
  });

  it('does nothing when Global Privacy Control is set', () => {
    setEnvironment('app.example.com', { globalPrivacyControl: true });
    initTelemetry(options);
    expect(initializeFaro).not.toHaveBeenCalled();
  });

  it('initialises Faro without console capture and without session tracking', () => {
    setEnvironment('app.dev.ferrlabs');
    initTelemetry(options);
    expect(getWebInstrumentations).toHaveBeenCalledWith({ captureConsole: false });
    expect(vi.mocked(initializeFaro).mock.calls[0]?.[0]).toMatchObject({
      url: 'https://rum.example.com/collect',
      app: { name: 'my-app', environment: 'dev' },
      sessionTracking: { enabled: false },
      instrumentations: ['instrumentation'],
    });
  });

  it('redacts items through beforeSend with the capability paths', () => {
    setEnvironment('app.example.com');
    initTelemetry({ ...options, capabilityPaths: [[/(\/s\/)[^/?#\s]+/g, '$1:token']] });
    const config = vi.mocked(initializeFaro).mock.calls[0]?.[0] as Config;
    const item = { type: 'log', payload: { message: 'GET /s/abc failed' }, meta: {} };
    expect(config.beforeSend?.(item as never)).toEqual({
      ...item,
      payload: { message: 'GET /s/:token failed' },
    });
  });

  it('does not throw when Faro fails to initialise', () => {
    setEnvironment('app.example.com');
    vi.mocked(initializeFaro).mockImplementation(() => {
      throw new Error('no faro');
    });
    expect(() => initTelemetry(options)).not.toThrow();
  });
});
