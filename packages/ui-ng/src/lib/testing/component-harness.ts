import {
  ApplicationRef,
  createEnvironmentInjector,
  ElementRef,
  Injector,
  isSignal,
  provideZonelessChangeDetection,
  runInInjectionContext,
  signal,
  type Provider,
  ɵINJECTOR_SCOPE,
} from '@angular/core';

export interface HarnessOptions {
  readonly providers?: readonly Provider[];
  readonly host?: Partial<HTMLElement>;
}

const environments = new WeakMap<object, Injector>();

export function createComponent<T extends object>(
  type: new () => T,
  inputs: Record<string, unknown> = {},
  options: HarnessOptions = {},
): T {
  const environment = createEnvironmentInjector(
    [{ provide: ɵINJECTOR_SCOPE, useValue: 'root' }, provideZonelessChangeDetection()],
    Injector.NULL as never,
  );
  const host = { contains: () => false, ...options.host } as unknown as HTMLElement;
  const injector = Injector.create({
    providers: [
      { provide: ElementRef, useValue: new ElementRef(host) },
      ...(options.providers ?? []),
    ],
    parent: environment,
  });
  const instance = runInInjectionContext(injector, () => new type());
  environments.set(instance, environment);
  setInputs(instance, inputs);
  return instance;
}

export function setInputs(instance: object, inputs: Record<string, unknown>): void {
  const target = instance as Record<string, unknown>;
  for (const [name, value] of Object.entries(inputs)) {
    target[name] = isSignal(value) ? value : signal(value);
  }
}

export function flushEffects(instance: object): void {
  environments.get(instance)?.get(ApplicationRef).tick();
}
