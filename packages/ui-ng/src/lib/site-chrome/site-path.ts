import { DestroyRef, inject, signal, type Signal } from '@angular/core';
import { Location } from '@angular/common';

export function injectSitePath(): Signal<string> {
  const location = inject(Location);
  const path = signal(location.path() || '/');
  const stopListening = location.onUrlChange(() => path.set(location.path() || '/'));
  inject(DestroyRef).onDestroy(stopListening);
  return path.asReadonly();
}
