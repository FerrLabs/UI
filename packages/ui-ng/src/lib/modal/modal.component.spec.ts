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

import { ModalComponent } from './modal.component';

class ModalProbe extends ModalComponent {
  readonly ceiling = () => this.maxWidth();
  readonly ids = () => [this.titleId, this.descId];
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
  const overlayRef = {
    attach: vi.fn(),
    dispose: vi.fn(),
    backdropClick: () => backdrop,
    keydownEvents: () => keys,
  };
  const positionCalls: string[] = [];
  const position = {
    centerHorizontally: () => {
      positionCalls.push('centerHorizontally');
      return position;
    },
    centerVertically: () => {
      positionCalls.push('centerVertically');
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
  const modal = runInInjectionContext(injector, () => new ModalProbe());
  const runEffect = registered.effects[0] as () => void;
  const template = {} as TemplateRef<unknown>;
  Object.defineProperty(modal, 'panelTpl', { value: () => template });
  const closed = vi.fn();
  modal.closed.subscribe(closed);
  return { modal, overlay, overlayRef, backdrop, keys, closed, runEffect, positionCalls };
}

describe('ModalComponent open state', () => {
  let h: ReturnType<typeof createHarness>;

  beforeEach(() => {
    h = createHarness();
  });

  it('creates nothing while closed', () => {
    h.runEffect();
    expect(h.overlay.create).not.toHaveBeenCalled();
  });

  it('opens a centered blocking overlay with a backdrop', () => {
    setInput(h.modal.open, true);
    h.runEffect();
    expect(h.overlay.create).toHaveBeenCalledTimes(1);
    expect(h.overlay.create).toHaveBeenCalledWith(
      expect.objectContaining({
        hasBackdrop: true,
        backdropClass: 'flr-modal-backdrop',
        scrollStrategy: 'block-strategy',
      }),
    );
    expect(h.positionCalls).toEqual(['centerHorizontally', 'centerVertically']);
    expect(h.overlayRef.attach).toHaveBeenCalledTimes(1);
  });

  it('does not stack a second overlay when the effect reruns while open', () => {
    setInput(h.modal.open, true);
    h.runEffect();
    h.runEffect();
    expect(h.overlay.create).toHaveBeenCalledTimes(1);
  });

  it('disposes the overlay when closed and can reopen afterwards', () => {
    setInput(h.modal.open, true);
    h.runEffect();
    setInput(h.modal.open, false);
    h.runEffect();
    expect(h.overlayRef.dispose).toHaveBeenCalledTimes(1);
    setInput(h.modal.open, true);
    h.runEffect();
    expect(h.overlay.create).toHaveBeenCalledTimes(2);
  });

  it('closing a modal that never opened disposes nothing', () => {
    h.runEffect();
    h.modal.ngOnDestroy();
    expect(h.overlayRef.dispose).not.toHaveBeenCalled();
  });

  it('disposes the overlay when destroyed while open', () => {
    setInput(h.modal.open, true);
    h.runEffect();
    h.modal.ngOnDestroy();
    expect(h.overlayRef.dispose).toHaveBeenCalledTimes(1);
  });

  it('does not open when the panel template is not available yet', () => {
    Object.defineProperty(h.modal, 'panelTpl', { value: () => undefined });
    setInput(h.modal.open, true);
    h.runEffect();
    expect(h.overlay.create).not.toHaveBeenCalled();
  });
});

describe('ModalComponent dismissal', () => {
  let h: ReturnType<typeof createHarness>;

  beforeEach(() => {
    h = createHarness();
    setInput(h.modal.open, true);
    h.runEffect();
  });

  it('emits closed on backdrop click', () => {
    h.backdrop.next({} as MouseEvent);
    expect(h.closed).toHaveBeenCalledTimes(1);
  });

  it('ignores backdrop clicks when dismissOnBackdrop is off', () => {
    setInput(h.modal.dismissOnBackdrop, false);
    h.backdrop.next({} as MouseEvent);
    expect(h.closed).not.toHaveBeenCalled();
  });

  it('emits closed on Escape and prevents the default', () => {
    const preventDefault = vi.fn();
    h.keys.next({ key: 'Escape', preventDefault } as unknown as KeyboardEvent);
    expect(h.closed).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('keeps Escape working even when backdrop dismissal is off', () => {
    setInput(h.modal.dismissOnBackdrop, false);
    h.keys.next({ key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent);
    expect(h.closed).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys', () => {
    const preventDefault = vi.fn();
    h.keys.next({ key: 'Enter', preventDefault } as unknown as KeyboardEvent);
    expect(h.closed).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe('ModalComponent derived values', () => {
  it.each([
    ['sm', 384],
    ['md', 448],
    ['lg', 512],
    ['xl', 672],
  ] as const)('size %s caps the panel at %d px', (size, width) => {
    const { modal } = createHarness();
    setInput(modal.size, size);
    expect(modal.ceiling()).toBe(width);
  });

  it('gives each modal its own title and description ids', () => {
    const [a, b] = [createHarness().modal, createHarness().modal];
    const [aTitle, aDesc] = a.ids();
    const [bTitle, bDesc] = b.ids();
    expect(aTitle).not.toBe(bTitle);
    expect(aDesc).not.toBe(bDesc);
    expect(aTitle).toMatch(/^flr-modal-\d+-title$/);
    expect(aDesc).toMatch(/^flr-modal-\d+-desc$/);
  });
});
