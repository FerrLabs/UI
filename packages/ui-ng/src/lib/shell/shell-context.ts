import { InjectionToken, type Signal } from '@angular/core';

export interface ShellContext {
  readonly collapsed: Signal<boolean>;
}

export const SHELL_CONTEXT = new InjectionToken<ShellContext>('SHELL_CONTEXT');
