import { afterEach, describe, expect, it } from 'vitest';
import { isLocalHostname, isOptedOut } from './opt-out.js';

describe('isLocalHostname', () => {
  it('treats loopback names and addresses as local', () => {
    for (const host of [
      'localhost',
      'LOCALHOST.',
      'app.localhost',
      '127.0.0.1',
      '127.1.2.3',
      '[::1]',
      '::1',
    ]) {
      expect(isLocalHostname(host)).toBe(true);
    }
  });

  it('does not treat real hosts as local', () => {
    for (const host of ['app.ferrfleet.com', 'localhost.example.com', '1127.0.0.1', '128.0.0.1']) {
      expect(isLocalHostname(host)).toBe(false);
    }
  });
});

describe('isOptedOut', () => {
  const setNavigator = (value: object) =>
    Object.defineProperty(globalThis, 'navigator', { value, configurable: true });

  it('is true for Global Privacy Control', () => {
    setNavigator({ globalPrivacyControl: true });
    expect(isOptedOut()).toBe(true);
  });

  it.each(['1', 'yes'])('is true for navigator.doNotTrack %j', (value) => {
    setNavigator({ doNotTrack: value });
    expect(isOptedOut()).toBe(true);
  });

  describe('window.doNotTrack', () => {
    const setWindow = (value: unknown) =>
      Object.defineProperty(globalThis, 'window', {
        value: { doNotTrack: value },
        configurable: true,
      });

    afterEach(() => {
      Reflect.deleteProperty(globalThis, 'window');
    });

    it.each(['1', 'yes'])('is true for %j', (value) => {
      setNavigator({});
      setWindow(value);
      expect(isOptedOut()).toBe(true);
    });

    it.each(['0', undefined, 'unspecified'])('is false for %j', (value) => {
      setNavigator({});
      setWindow(value);
      expect(isOptedOut()).toBe(false);
    });
  });

  it.each(['0', undefined, 'unspecified'])('is false for navigator.doNotTrack %j', (value) => {
    setNavigator({ globalPrivacyControl: false, doNotTrack: value });
    expect(isOptedOut()).toBe(false);
  });

  it('is false with no signal and no window', () => {
    setNavigator({});
    expect(isOptedOut()).toBe(false);
  });
});
