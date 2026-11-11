export type TelemetryEnvironment = 'dev' | 'interne' | 'home' | 'prod';

export function environmentFromHostname(hostname: string): TelemetryEnvironment {
  if (hostname.endsWith('.dev.ferrlabs')) return 'dev';
  if (hostname.endsWith('.ferrlabs')) return 'interne';
  if (hostname.endsWith('.home')) return 'home';
  return 'prod';
}
