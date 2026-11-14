export type TelemetryEnvironment = 'dev' | 'interne' | 'home' | 'prod';

export function environmentFromHostname(hostname: string): TelemetryEnvironment {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  if (host === 'dev.ferrlabs' || host.endsWith('.dev.ferrlabs')) return 'dev';
  if (host.endsWith('.ferrlabs')) return 'interne';
  if (host.endsWith('.home')) return 'home';
  return 'prod';
}
