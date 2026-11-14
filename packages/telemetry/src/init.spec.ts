import { getWebInstrumentations, initializeFaro, type Config } from '@grafana/faro-web-sdk';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_COLLECTOR_URL, initTelemetry } from './init.js';

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

  it('does nothing when the consent hook reports a refusal', () => {
    setEnvironment('app.example.com');
    initTelemetry({ ...options, isConsentRefused: () => true });
    expect(initializeFaro).not.toHaveBeenCalled();
  });

  it('does nothing when enabled is false', () => {
    setEnvironment('app.example.com');
    initTelemetry({ ...options, enabled: false });
    expect(initializeFaro).not.toHaveBeenCalled();
  });

  it('initialises when enabled is true', () => {
    setEnvironment('app.example.com');
    initTelemetry({ ...options, enabled: true });
    expect(initializeFaro).toHaveBeenCalledTimes(1);
  });

  it('initialises when enabled is absent', () => {
    setEnvironment('app.example.com');
    initTelemetry(options);
    expect(initializeFaro).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the consent hook throws', () => {
    setEnvironment('app.example.com');
    initTelemetry({
      ...options,
      isConsentRefused: () => {
        throw new Error('storage blocked');
      },
    });
    expect(initializeFaro).not.toHaveBeenCalled();
  });

  it('initialises when the consent hook does not refuse', () => {
    setEnvironment('app.example.com');
    initTelemetry({ ...options, isConsentRefused: () => false });
    expect(initializeFaro).toHaveBeenCalledTimes(1);
  });

  it('uses the environment option over the hostname mapping', () => {
    setEnvironment('app.dev.ferrlabs');
    initTelemetry({ ...options, environment: 'staging' });
    expect(vi.mocked(initializeFaro).mock.calls[0]?.[0]).toMatchObject({
      app: { environment: 'staging' },
    });
  });

  it.each([undefined, ''])('falls back to the hostname mapping when environment is %j', (value) => {
    setEnvironment('app.dev.ferrlabs');
    initTelemetry({ ...options, environment: value });
    expect(vi.mocked(initializeFaro).mock.calls[0]?.[0]).toMatchObject({
      app: { environment: 'dev' },
    });
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

  it('sends to the default collector when no collectorUrl is given', () => {
    setEnvironment('app.example.com');
    initTelemetry({ appName: 'my-app' });
    expect(DEFAULT_COLLECTOR_URL).toBe('https://rum.ferrlabs.com/collect');
    expect(vi.mocked(initializeFaro).mock.calls[0]?.[0]).toMatchObject({
      url: 'https://rum.ferrlabs.com/collect',
    });
  });

  it('sends to the given collectorUrl instead of the default', () => {
    setEnvironment('app.example.com');
    initTelemetry(options);
    expect(vi.mocked(initializeFaro).mock.calls[0]?.[0]).toMatchObject({
      url: 'https://rum.example.com/collect',
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
