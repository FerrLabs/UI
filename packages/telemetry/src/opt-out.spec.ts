import { describe, expect, it } from 'vitest';
import { isLocalHostname, isOptedOut } from './opt-out.js';

describe('isLocalHostname', () => {
  it('treats loopback names and addresses as local', () => {
    for (const host of ['localhost', 'LOCALHOST.', '127.0.0.1', '127.1.2.3', '[::1]', '::1']) {
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

  it('is true for Do Not Track', () => {
    setNavigator({ doNotTrack: '1' });
    expect(isOptedOut()).toBe(true);
  });

  it('is false with neither signal', () => {
    setNavigator({ globalPrivacyControl: false, doNotTrack: '0' });
    expect(isOptedOut()).toBe(false);
    setNavigator({});
    expect(isOptedOut()).toBe(false);
  });
});
