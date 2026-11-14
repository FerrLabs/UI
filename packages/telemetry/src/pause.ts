import { faro } from '@grafana/faro-web-sdk';

export function pauseTelemetry(): void {
  try {
    if (faro.api) faro.pause();
  } catch {
    return;
  }
}

export function resumeTelemetry(): void {
  try {
    if (faro.api) faro.unpause();
  } catch {
    return;
  }
}
