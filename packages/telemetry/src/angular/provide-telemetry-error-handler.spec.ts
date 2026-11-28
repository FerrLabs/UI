import { ErrorHandler } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { TelemetryErrorHandler, provideTelemetryErrorHandler } from './telemetry-error-handler.js';

describe('provideTelemetryErrorHandler', () => {
  it('replaces the default ErrorHandler with the telemetry one', () => {
    expect(provideTelemetryErrorHandler()).toEqual({
      provide: ErrorHandler,
      useClass: TelemetryErrorHandler,
    });
  });
});
