import '@angular/compiler';
import {
  ApplicationRef,
  createEnvironmentInjector,
  provideZonelessChangeDetection,
  runInInjectionContext,
  ɵINJECTOR_SCOPE,
  ɵSIGNAL,
  type EnvironmentInjector,
  type InputSignalWithTransform,
  type Provider,
} from '@angular/core';

export interface ComponentHarness {
  readonly injector: EnvironmentInjector;
  create<T>(factory: () => T): T;
  flush(): void;
}

interface InputNode<T> {
  applyValueToInputSignal(node: InputNode<T>, value: T): void;
}

export function createHarness(providers: readonly Provider[] = []): ComponentHarness {
  const root = createEnvironmentInjector([], null as unknown as EnvironmentInjector);
  const injector = createEnvironmentInjector(
    [
      { provide: ɵINJECTOR_SCOPE, useValue: 'root' },
      provideZonelessChangeDetection(),
      ...providers,
    ],
    root,
  );
  return {
    injector,
    create: (factory) => runInInjectionContext(injector, factory),
    flush: () => injector.get(ApplicationRef).tick(),
  };
}

export function setInput<T, U>(input: InputSignalWithTransform<T, U>, value: U): void {
  const node = (input as unknown as Record<symbol, InputNode<U>>)[ɵSIGNAL];
  node.applyValueToInputSignal(node, value);
}
