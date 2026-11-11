const LOOPBACK_HOSTNAME = /^(?:(?:[^.]+\.)*localhost|::1|127(?:\.\d{1,3}){3})$/;

export function isLocalHostname(hostname: string): boolean {
  const normalized = hostname
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^\[(.*)\]$/, '$1');
  return LOOPBACK_HOSTNAME.test(normalized);
}

export function isOptedOut(): boolean {
  const { globalPrivacyControl, doNotTrack } = navigator as Navigator & {
    globalPrivacyControl?: boolean;
  };
  return globalPrivacyControl === true || doNotTrack === '1';
}
