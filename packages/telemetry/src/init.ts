import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { environmentFromHostname } from './environment.js';
import { isLocalHostname, isOptedOut } from './opt-out.js';
import { redactItem, type CapabilityPath } from './redact-item.js';

export const DEFAULT_COLLECTOR_URL = 'https://rum.ferrlabs.com/collect';

export interface TelemetryOptions {
  appName: string;
  collectorUrl?: string;
  capabilityPaths?: readonly CapabilityPath[];
  dropSessionMeta?: boolean;
  environment?: string;
  isConsentRefused?: () => boolean;
  enabled?: boolean;
}

function consentRefused(isConsentRefused: (() => boolean) | undefined): boolean {
  if (!isConsentRefused) return false;
  try {
    return isConsentRefused();
  } catch {
    return true;
  }
}

export function initTelemetry({
  appName,
  collectorUrl = DEFAULT_COLLECTOR_URL,
  capabilityPaths = [],
  dropSessionMeta = false,
  environment,
  isConsentRefused,
  enabled = true,
}: TelemetryOptions): void {
  if (!enabled) return;
  if (typeof window === 'undefined') return;
  const { hostname } = window.location;
  if (isLocalHostname(hostname) || isOptedOut() || consentRefused(isConsentRefused)) return;
  try {
    initializeFaro({
      url: collectorUrl,
      app: { name: appName, environment: environment || environmentFromHostname(hostname) },
      instrumentations: getWebInstrumentations({ captureConsole: false }),
      beforeSend: (item) => redactItem(item, capabilityPaths, { dropSessionMeta }),
      sessionTracking: { enabled: false },
    });
  } catch {
    return;
  }
}
