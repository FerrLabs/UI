const LOOPBACK_HOSTNAME = /^(?:(?:[^.]+\.)*localhost|::1|0\.0\.0\.0|127(?:\.\d{1,3}){3})$/;

export function isLocalHostname(hostname: string): boolean {
  const normalized = hostname
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^\[(.*)\]$/, '$1');
  return LOOPBACK_HOSTNAME.test(normalized);
}

const DO_NOT_TRACK_VALUES: ReadonlySet<unknown> = new Set(['1', 'yes']);

export function isOptedOut(): boolean {
  const { globalPrivacyControl, doNotTrack } = navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  if (globalPrivacyControl === true || DO_NOT_TRACK_VALUES.has(doNotTrack)) return true;
  if (typeof window === 'undefined') return false;
  return DO_NOT_TRACK_VALUES.has((window as { doNotTrack?: unknown }).doNotTrack);
}
