import '@angular/compiler';
import {
  Injector,
  runInInjectionContext,
  ViewContainerRef,
  type InputSignal,
  type TemplateRef,
} from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { Overlay } from '@angular/cdk/overlay';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const registered = vi.hoisted(() => ({ effects: [] as Array<() => void> }));

vi.mock('@angular/core', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@angular/core')>()),
  effect: (fn: () => void) => {
    registered.effects.push(fn);
    return { destroy: () => undefined };
  },
}));

import { DrawerComponent } from './drawer.component';

class DrawerProbe extends DrawerComponent {
  readonly panelWidth = () => this.width();
  readonly id = () => this.titleId;
}

function emitter<T>() {
  const listeners: Array<(value: T) => void> = [];
  return {
    subscribe: (listener: (value: T) => void) => {
      listeners.push(listener);
    },
    next: (value: T) => listeners.forEach((listener) => listener(value)),
  };
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createHarness() {
  const backdrop = emitter<MouseEvent>();
  const keys = emitter<KeyboardEvent>();
  const panelClasses = new Set<string>();
  const backdropClasses = new Set<string>();
  const toggle = (set: Set<string>) => (name: string, force?: boolean) => {
    if (force) set.add(name);
    else set.delete(name);
  };
  let animations: Array<{ finished: Promise<unknown> }> = [];
  const panel = {
    classList: { toggle: toggle(panelClasses) },
    getAnimations: () => animations,
  };
  const overlayRef = {
    attach: vi.fn(),
    dispose: vi.fn(),
    backdropClick: () => backdrop,
    keydownEvents: () => keys,
    overlayElement: { querySelector: vi.fn(() => panel as unknown) },
    backdropElement: { classList: { toggle: toggle(backdropClasses) } },
  };
  const edges: string[] = [];
  const position = {
    top: (value: string) => {
      edges.push(`top:${value}`);
      return position;
    },
    right: (value: string) => {
      edges.push(`right:${value}`);
      return position;
    },
    left: (value: string) => {
      edges.push(`left:${value}`);
      return position;
    },
  };
  const overlay = {
    position: () => ({ global: () => position }),
    scrollStrategies: { block: () => 'block-strategy' },
    create: vi.fn(() => overlayRef),
  };
  const injector = Injector.create({
    providers: [
      { provide: Overlay, useValue: overlay },
      { provide: ViewContainerRef, useValue: {} },
    ],
  });
  registered.effects.length = 0;
  const drawer = runInInjectionContext(injector, () => new DrawerProbe());
  const runEffect = registered.effects[0] as () => void;
  Object.defineProperty(drawer, 'panelTpl', { value: () => ({}) as TemplateRef<unknown> });
  const closed = vi.fn();
  drawer.closed.subscribe(closed);
  return {
    drawer,
    overlay,
    overlayRef,
    backdrop,
    keys,
    closed,
    runEffect,
    edges,
    panelClasses,
    backdropClasses,
    setAnimations: (next: Array<{ finished: Promise<unknown> }>) => (animations = next),
  };
}

function deferred() {
  let settle = () => undefined as void;
  const finished = new Promise<unknown>((resolve) => {
    settle = () => resolve(undefined);
  });
  return { animation: { finished }, settle };
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('DrawerComponent open', () => {
  let h: ReturnType<typeof createHarness>;

  beforeEach(() => {
    h = createHarness();
  });

  it('does nothing while closed and never opened', () => {
    h.runEffect();
    expect(h.overlay.create).not.toHaveBeenCalled();
    expect(h.overlayRef.dispose).not.toHaveBeenCalled();
  });

  it('pins to the right edge by default', () => {
    setInput(h.drawer.open, true);
    h.runEffect();
    expect(h.edges).toEqual(['top:0', 'right:0']);
    expect(h.overlay.create).toHaveBeenCalledWith(
      expect.objectContaining({
        hasBackdrop: true,
        backdropClass: 'flr-drawer-backdrop',
        scrollStrategy: 'block-strategy',
      }),
    );
  });

  it('pins to the left edge when asked', () => {
    setInput(h.drawer.side, 'left');
    setInput(h.drawer.open, true);
    h.runEffect();
    expect(h.edges).toEqual(['top:0', 'left:0']);
  });

  it('reuses the overlay when the effect reruns while open', () => {
    setInput(h.drawer.open, true);
    h.runEffect();
    h.runEffect();
    expect(h.overlay.create).toHaveBeenCalledTimes(1);
  });

  it('does not open without the panel template', () => {
    Object.defineProperty(h.drawer, 'panelTpl', { value: () => undefined });
    setInput(h.drawer.open, true);
    h.runEffect();
    expect(h.overlay.create).not.toHaveBeenCalled();
  });

  it('disposes on destroy', () => {
    setInput(h.drawer.open, true);
    h.runEffect();
    h.drawer.ngOnDestroy();
    expect(h.overlayRef.dispose).toHaveBeenCalledTimes(1);
  });
});

describe('DrawerComponent leave animation', () => {
  let h: ReturnType<typeof createHarness>;

  beforeEach(() => {
    h = createHarness();
    setInput(h.drawer.open, true);
    h.runEffect();
  });

  it('marks the panel and backdrop as leaving and disposes once animations finish', async () => {
    const exit = deferred();
    h.setAnimations([exit.animation]);
    setInput(h.drawer.open, false);
    h.runEffect();
    expect(h.panelClasses.has('flr-drawer__panel--leaving')).toBe(true);
    expect(h.backdropClasses.has('flr-drawer-backdrop--leaving')).toBe(true);
    await flush();
    expect(h.overlayRef.dispose).not.toHaveBeenCalled();
    exit.settle();
    await flush();
    expect(h.overlayRef.dispose).toHaveBeenCalledTimes(1);
  });

  it('disposes even when an animation was cancelled', async () => {
    const cancelled = Promise.reject(new Error('cancelled'));
    cancelled.catch(() => undefined);
    h.setAnimations([{ finished: cancelled }]);
    setInput(h.drawer.open, false);
    h.runEffect();
    await flush();
    expect(h.overlayRef.dispose).toHaveBeenCalledTimes(1);
  });

  it('disposes right away when there is nothing to animate', async () => {
    h.setAnimations([]);
    setInput(h.drawer.open, false);
    h.runEffect();
    await flush();
    expect(h.overlayRef.dispose).toHaveBeenCalledTimes(1);
  });

  it('reopening mid-exit cancels the dispose and clears the leaving classes', async () => {
    const exit = deferred();
    h.setAnimations([exit.animation]);
    setInput(h.drawer.open, false);
    h.runEffect();
    setInput(h.drawer.open, true);
    h.runEffect();
    expect(h.panelClasses.has('flr-drawer__panel--leaving')).toBe(false);
    expect(h.backdropClasses.has('flr-drawer-backdrop--leaving')).toBe(false);
    exit.settle();
    await flush();
    expect(h.overlayRef.dispose).not.toHaveBeenCalled();
    expect(h.overlay.create).toHaveBeenCalledTimes(1);
  });

  it('a second close while leaving does not start another exit', async () => {
    const exit = deferred();
    h.setAnimations([exit.animation]);
    setInput(h.drawer.open, false);
    h.runEffect();
    h.runEffect();
    exit.settle();
    await flush();
    expect(h.overlayRef.dispose).toHaveBeenCalledTimes(1);
  });

  it('closing without a rendered panel leaves the overlay alone', async () => {
    h.overlayRef.overlayElement.querySelector.mockReturnValue(null);
    setInput(h.drawer.open, false);
    h.runEffect();
    await flush();
    expect(h.overlayRef.dispose).not.toHaveBeenCalled();
  });

  it('destroying mid-exit disposes immediately and only once', async () => {
    const exit = deferred();
    h.setAnimations([exit.animation]);
    setInput(h.drawer.open, false);
    h.runEffect();
    h.drawer.ngOnDestroy();
    exit.settle();
    await flush();
    expect(h.overlayRef.dispose).toHaveBeenCalledTimes(1);
  });
});

describe('DrawerComponent dismissal', () => {
  let h: ReturnType<typeof createHarness>;

  beforeEach(() => {
    h = createHarness();
    setInput(h.drawer.open, true);
    h.runEffect();
  });

  it('emits closed on backdrop click', () => {
    h.backdrop.next({} as MouseEvent);
    expect(h.closed).toHaveBeenCalledTimes(1);
  });

  it('ignores backdrop clicks when dismissOnBackdrop is off', () => {
    setInput(h.drawer.dismissOnBackdrop, false);
    h.backdrop.next({} as MouseEvent);
    expect(h.closed).not.toHaveBeenCalled();
  });

  it('emits closed on Escape and prevents the default', () => {
    const preventDefault = vi.fn();
    h.keys.next({ key: 'Escape', preventDefault } as unknown as KeyboardEvent);
    expect(h.closed).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    const preventDefault = vi.fn();
    h.keys.next({ key: 'Tab', preventDefault } as unknown as KeyboardEvent);
    expect(h.closed).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe('DrawerComponent derived values', () => {
  it.each([
    ['sm', 288],
    ['md', 384],
    ['lg', 448],
  ] as const)('size %s is %d px wide', (size, width) => {
    const { drawer } = createHarness();
    setInput(drawer.size, size);
    expect(drawer.panelWidth()).toBe(width);
  });

  it('gives each drawer its own title id', () => {
    expect(createHarness().drawer.id()).not.toBe(createHarness().drawer.id());
  });
});
