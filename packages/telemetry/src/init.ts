import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { environmentFromHostname } from './environment.js';
import { isLocalHostname, isOptedOut } from './opt-out.js';
import { redactItem, type CapabilityPath } from './redact-item.js';

export interface TelemetryOptions {
  appName: string;
  collectorUrl: string;
  capabilityPaths?: readonly CapabilityPath[];
}

export function initTelemetry({
  appName,
  collectorUrl,
  capabilityPaths = [],
}: TelemetryOptions): void {
  if (typeof window === 'undefined') return;
  const { hostname } = window.location;
  if (isLocalHostname(hostname) || isOptedOut()) return;
  try {
    initializeFaro({
      url: collectorUrl,
      app: { name: appName, environment: environmentFromHostname(hostname) },
      instrumentations: getWebInstrumentations({ captureConsole: false }),
      beforeSend: (item) => redactItem(item, capabilityPaths),
      sessionTracking: { enabled: false },
    });
  } catch {
    return;
  }
}
