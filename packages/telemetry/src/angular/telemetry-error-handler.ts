import { ErrorHandler, type Provider } from '@angular/core';
import { reportError } from '../report-error.js';

export class TelemetryErrorHandler extends ErrorHandler {
  override handleError(error: unknown): void {
    reportError(error);
    super.handleError(error);
  }
}

export function provideTelemetryErrorHandler(): Provider {
  return { provide: ErrorHandler, useClass: TelemetryErrorHandler };
}
