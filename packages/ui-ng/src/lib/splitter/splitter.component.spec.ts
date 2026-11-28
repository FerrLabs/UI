import '@angular/compiler';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ElementRef,
  computed,
  createEnvironmentInjector,
  provideZonelessChangeDetection,
  runInInjectionContext,
  signal,
  ɵINJECTOR_SCOPE,
  type EnvironmentInjector,
  type InputSignal,
  type WritableSignal,
} from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SplitterComponent, type SplitterResizeEvent } from './splitter.component';
import type { SplitterSize } from './splitter-model';

type InputNode<T> = { applyValueToInputSignal(node: unknown, value: T): void };

function setInput<T>(input: InputSignal<T>, value: T): void {
  const node = (input as unknown as Record<symbol, InputNode<T>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

interface PaneSpec {
  readonly defaultSize?: SplitterSize;
  readonly minSize?: SplitterSize;
  readonly maxSize?: SplitterSize;
  readonly collapsible?: boolean;
  readonly collapsed?: boolean;
}

interface FakePane {
  readonly defaultSize: () => SplitterSize | undefined;
  readonly minSize: () => SplitterSize | undefined;
  readonly maxSize: () => SplitterSize | undefined;
  readonly collapsible: () => boolean;
  readonly collapsed: WritableSignal<boolean>;
  readonly isCollapsed: () => boolean;
  readonly displayLabel: () => string;
}

function fakePane(spec: PaneSpec, position: number): FakePane {
  const collapsible = signal(spec.collapsible ?? false);
  const collapsed = signal(spec.collapsed ?? false);
  return {
    defaultSize: () => spec.defaultSize,
    minSize: () => spec.minSize,
    maxSize: () => spec.maxSize,
    collapsible,
    collapsed,
    isCollapsed: computed(() => collapsible() && collapsed()),
    displayLabel: () => `Pane ${position + 1}`,
  };
}

class SplitterProbe extends SplitterComponent {
  setBox(width: number, height = 0): void {
    this['box'].set({ width, height });
  }
  get ratioValues() {
    return this['ratios']();
  }
  get sizeValues() {
    return this['sizes']();
  }
  get lastFrame() {
    return this['drag'].current?.frame ?? null;
  }
  restoreFromStorage(key: string, count: number): void {
    this['restore'](key, count);
  }
  abort(): void {
    this['abortDrag']();
  }
  mount(specs: readonly PaneSpec[]): FakePane[] {
    const panes = specs.map(fakePane);
    Object.assign(this, { panes: () => panes });
    return panes;
  }
}

interface Rig {
  splitter: SplitterProbe;
  panes: FakePane[];
  announce: ReturnType<typeof vi.fn>;
  resized: SplitterResizeEvent[];
}

function createRig(specs: readonly PaneSpec[], width = 1000, height = 600): Rig {
  const announce = vi.fn();
  const injector = createEnvironmentInjector(
    [
      provideZonelessChangeDetection(),
      { provide: ɵINJECTOR_SCOPE, useValue: 'root' },
      { provide: ElementRef, useValue: new ElementRef({}) },
      { provide: LiveAnnouncer, useValue: { announce } },
    ],
    undefined as unknown as EnvironmentInjector,
  );
  const splitter = runInInjectionContext(injector, () => new SplitterProbe());
  const panes = splitter.mount(specs);
  splitter.setBox(width, height);
  const resized: SplitterResizeEvent[] = [];
  splitter.resizeEnd.subscribe((event) => resized.push(event));
  return { splitter, panes, announce, resized };
}

const TWO: readonly PaneSpec[] = [{}, {}];

function keydown(key: string, extra: Partial<KeyboardEvent> = {}) {
  return { key, preventDefault: vi.fn(), ...extra } as unknown as KeyboardEvent & {
    preventDefault: ReturnType<typeof vi.fn>;
  };
}

function handle() {
  const state = { captured: false };
  return {
    state,
    setPointerCapture: vi.fn(() => {
      state.captured = true;
    }),
    releasePointerCapture: vi.fn(() => {
      state.captured = false;
    }),
    hasPointerCapture: vi.fn(() => state.captured),
    focus: vi.fn(),
  };
}

function pointer(
  target: ReturnType<typeof handle>,
  x: number,
  y = 0,
  extra: Partial<PointerEvent> = {},
) {
  return {
    button: 0,
    pointerId: 1,
    clientX: x,
    clientY: y,
    currentTarget: target,
    preventDefault: vi.fn(),
    ...extra,
  } as unknown as PointerEvent & { preventDefault: ReturnType<typeof vi.fn> };
}

let direction = 'ltr';
let frames: Map<number, () => void>;
let storageData: Map<string, string>;

beforeEach(() => {
  direction = 'ltr';
  frames = new Map();
  storageData = new Map();
  let nextFrame = 0;
  vi.stubGlobal('getComputedStyle', () => ({ direction }));
  vi.stubGlobal('requestAnimationFrame', (cb: () => void) => {
    frames.set(++nextFrame, cb);
    return nextFrame;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    frames.delete(id);
  });
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storageData.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storageData.set(key, value);
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function runFrames(): void {
  const pending = [...frames.values()];
  frames.clear();
  for (const run of pending) run();
}

describe('SplitterComponent layout', () => {
  it('uses flexible ratios until the container is measured', () => {
    const { splitter, panes } = createRig(TWO, 0, 0);
    expect(splitter.flexFor(panes[0])).toBe('0.5 1 0%');
  });

  it('gives each pane its fixed pixel size once measured', () => {
    const { splitter, panes } = createRig([{ defaultSize: '30%' }, {}]);
    expect(splitter.flexFor(panes[0])).toBe('0 0 300px');
    expect(splitter.flexFor(panes[1])).toBe('0 0 700px');
  });

  it('fills the remainder of an unclaimed default among unsized panes', () => {
    const { splitter } = createRig([{ defaultSize: 200 }, {}, {}]);
    expect(splitter.sizeValues).toEqual([200, 400, 400]);
  });

  it('clamps sizes to min and max and redistributes the surplus', () => {
    const { splitter } = createRig([{ maxSize: 300 }, {}]);
    expect(splitter.sizeValues).toEqual([300, 700]);
  });

  it('gives a collapsed pane no space', () => {
    const { splitter } = createRig([{}, { collapsible: true, collapsed: true }]);
    expect(splitter.sizeValues).toEqual([1000, 0]);
  });

  it('does not treat a collapsed flag as collapsed when the pane is not collapsible', () => {
    const { splitter } = createRig([{}, { collapsed: true }]);
    expect(splitter.sizeValues).toEqual([500, 500]);
  });

  it('measures the height for vertical orientation', () => {
    const { splitter } = createRig(TWO, 1000, 400);
    setInput(splitter.orientation, 'vertical');
    expect(splitter.sizeValues).toEqual([200, 200]);
  });

  it('indexes panes and finds the last one', () => {
    const { splitter, panes } = createRig(TWO);
    expect(splitter.indexOf(panes[1])).toBe(1);
    expect(splitter.indexOf({})).toBe(-1);
    expect(splitter.isLast(panes[1])).toBe(true);
    expect(splitter.isLast(panes[0])).toBe(false);
  });
});

describe('SplitterComponent stacking', () => {
  it('stacks when forced and flexes panes automatically', () => {
    const { splitter, panes } = createRig(TWO);
    setInput(splitter.stacked, true);
    expect(splitter.isStacked()).toBe(true);
    expect(splitter.flexFor(panes[0])).toBe('1 1 auto');
  });

  it('stacks below the width threshold only', () => {
    const { splitter } = createRig(TWO, 500);
    setInput(splitter.stackBelow, 600);
    expect(splitter.isStacked()).toBe(true);
    splitter.setBox(600);
    expect(splitter.isStacked()).toBe(false);
    splitter.setBox(900);
    expect(splitter.isStacked()).toBe(false);
  });

  it('does not stack before the container is measured', () => {
    const { splitter } = createRig(TWO, 0);
    setInput(splitter.stackBelow, 600);
    expect(splitter.isStacked()).toBe(false);
  });

  it('never stacks a vertical splitter', () => {
    const { splitter } = createRig(TWO, 100);
    setInput(splitter.orientation, 'vertical');
    setInput(splitter.stacked, true);
    expect(splitter.isStacked()).toBe(false);
  });
});

describe('SplitterComponent handle state', () => {
  it('reports the size as a percentage with full range by default', () => {
    const { splitter, panes } = createRig([{ defaultSize: '25%' }, {}]);
    expect(splitter.handleState(panes[0])).toEqual({ valueNow: 25, valueMin: 0, valueMax: 100 });
  });

  it('reports the configured bounds as percentages', () => {
    const { splitter, panes } = createRig([{ minSize: '20%', maxSize: 800 }, {}]);
    expect(splitter.handleState(panes[0])).toEqual({ valueNow: 50, valueMin: 20, valueMax: 80 });
  });

  it('reports a zero minimum when collapsed', () => {
    const { splitter, panes } = createRig([
      {},
      { minSize: '20%', collapsible: true, collapsed: true },
    ]);
    expect(splitter.handleState(panes[1])).toEqual({ valueNow: 0, valueMin: 0, valueMax: 100 });
  });

  it('reports zero for a pane that is not part of the splitter', () => {
    const { splitter } = createRig(TWO);
    expect(splitter.handleState({})).toEqual({ valueNow: 0, valueMin: 0, valueMax: 100 });
  });

  it('reports zero before measuring', () => {
    const { splitter, panes } = createRig([{ minSize: 100 }, {}], 0, 0);
    expect(splitter.handleState(panes[0])).toEqual({ valueNow: 0, valueMin: 0, valueMax: 100 });
  });
});

describe('SplitterComponent keyboard', () => {
  it('moves the handle by the keyboard step and commits sizes', () => {
    const { splitter, resized } = createRig(TWO);
    const event = keydown('ArrowRight');
    splitter.handleKeydown(0, event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(splitter.sizeValues).toEqual([510, 490]);
    expect(resized.at(-1)).toEqual({
      sizes: [510, 490],
      ratios: [0.51, 0.49],
      collapsed: [false, false],
    });
  });

  it('moves backwards with ArrowLeft', () => {
    const { splitter } = createRig(TWO);
    splitter.handleKeydown(0, keydown('ArrowLeft'));
    expect(splitter.sizeValues).toEqual([490, 510]);
  });

  it('multiplies the step with Shift and honours a custom step', () => {
    const { splitter } = createRig(TWO);
    setInput(splitter.keyboardStep, 4);
    splitter.handleKeydown(0, keydown('ArrowRight', { shiftKey: true }));
    expect(splitter.sizeValues).toEqual([520, 480]);
  });

  it('uses the vertical arrows for a vertical splitter and ignores the horizontal ones', () => {
    const { splitter, resized } = createRig(TWO, 1000, 400);
    setInput(splitter.orientation, 'vertical');
    const ignored = keydown('ArrowRight');
    splitter.handleKeydown(0, ignored);
    expect(ignored.preventDefault).not.toHaveBeenCalled();
    expect(resized).toHaveLength(0);
    splitter.handleKeydown(0, keydown('ArrowDown'));
    expect(splitter.sizeValues).toEqual([210, 190]);
  });

  it('mirrors horizontal arrows in right-to-left', () => {
    direction = 'rtl';
    const { splitter } = createRig(TWO);
    splitter.handleKeydown(0, keydown('ArrowRight'));
    expect(splitter.sizeValues).toEqual([490, 510]);
  });

  it('jumps to the minimum with Home and the maximum with End', () => {
    const { splitter } = createRig([{ minSize: 100, maxSize: 700 }, {}]);
    splitter.handleKeydown(0, keydown('Home'));
    expect(splitter.sizeValues).toEqual([100, 900]);
    splitter.handleKeydown(0, keydown('End'));
    expect(splitter.sizeValues).toEqual([700, 300]);
  });

  it.each(['altKey', 'ctrlKey', 'metaKey'] as const)('ignores keys pressed with %s', (modifier) => {
    const { splitter, resized } = createRig(TWO);
    const event = keydown('ArrowRight', { [modifier]: true });
    splitter.handleKeydown(0, event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(resized).toHaveLength(0);
  });

  it('ignores unrelated keys', () => {
    const { splitter, resized } = createRig(TWO);
    const event = keydown('a');
    splitter.handleKeydown(0, event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(resized).toHaveLength(0);
  });

  it('does nothing before the container is measured', () => {
    const { splitter, resized } = createRig(TWO, 0, 0);
    const event = keydown('ArrowRight');
    splitter.handleKeydown(0, event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(resized).toHaveLength(0);
  });

  it('announces the new size of the resized pane', () => {
    const { splitter, announce } = createRig(TWO);
    splitter.handleKeydown(0, keydown('ArrowRight'));
    expect(announce).toHaveBeenCalledWith('Pane 1 51 percent', 'polite');
  });

  it('uses a custom announcer', () => {
    const { splitter, announce } = createRig(TWO);
    setInput(splitter.sizeAnnouncement, (label, percent) => `${label}=${percent}`);
    splitter.handleKeydown(0, keydown('ArrowRight'));
    expect(announce).toHaveBeenCalledWith('Pane 1=51', 'polite');
  });

  it('does not announce for a handle index with no pane', () => {
    const { splitter, announce } = createRig(TWO);
    splitter.handleKeydown(5, keydown('ArrowRight'));
    expect(announce).not.toHaveBeenCalled();
  });
});

describe('SplitterComponent collapse toggling', () => {
  it('collapses the collapsible neighbour on Enter and announces it', () => {
    const { splitter, panes, announce, resized } = createRig([{}, { collapsible: true }]);
    const event = keydown('Enter');
    splitter.handleKeydown(0, event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(panes[1].collapsed()).toBe(true);
    expect(splitter.sizeValues).toEqual([1000, 0]);
    expect(resized.at(-1)?.collapsed).toEqual([false, true]);
    expect(announce).toHaveBeenCalledWith('Pane 2 collapsed', 'polite');
  });

  it('expands an already collapsed pane on Enter', () => {
    const { splitter, panes } = createRig([{}, { collapsible: true, collapsed: true }]);
    splitter.handleKeydown(0, keydown('Enter'));
    expect(panes[1].collapsed()).toBe(false);
    expect(splitter.sizeValues).toEqual([500, 500]);
  });

  it('prefers the pane that is currently collapsed', () => {
    const { splitter, panes } = createRig([
      { collapsible: true },
      { collapsible: true, collapsed: true },
    ]);
    splitter.handleKeydown(0, keydown('Enter'));
    expect(panes[1].collapsed()).toBe(false);
    expect(panes[0].collapsed()).toBe(false);
  });

  it('does nothing on Enter when neither neighbour is collapsible', () => {
    const { splitter, resized } = createRig(TWO);
    const event = keydown('Enter');
    splitter.handleKeydown(0, event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(resized).toHaveLength(0);
  });

  it('gives a pane its default ratio back when it was stored with a zero ratio', () => {
    storageData.set(
      'flr-splitter:layout',
      JSON.stringify({ ratios: [1, 0], collapsed: [false, true] }),
    );
    const { splitter, panes } = createRig([{}, { collapsible: true }]);
    splitter.restoreFromStorage('layout', 2);
    expect(panes[1].collapsed()).toBe(true);
    splitter.handleKeydown(0, keydown('Enter'));
    expect(panes[1].collapsed()).toBe(false);
    expect(splitter.ratioValues).toEqual([1, 0.5]);
    expect(splitter.sizeValues[1]).toBeCloseTo(1000 / 3);
  });

  it('keeps a positive stored ratio when expanding', () => {
    storageData.set(
      'flr-splitter:layout',
      JSON.stringify({ ratios: [0.8, 0.2], collapsed: [false, true] }),
    );
    const { splitter } = createRig([{}, { collapsible: true }]);
    splitter.restoreFromStorage('layout', 2);
    splitter.handleKeydown(0, keydown('Enter'));
    expect(splitter.sizeValues[1]).toBeCloseTo(200);
  });
});

describe('SplitterComponent reset', () => {
  it('uncollapses panes, drops user sizes and announces the reset', () => {
    const { splitter, panes, announce, resized } = createRig([{}, { collapsible: true }]);
    splitter.handleKeydown(0, keydown('ArrowRight', { shiftKey: true }));
    splitter.handleKeydown(0, keydown('Enter'));
    expect(panes[1].collapsed()).toBe(true);

    splitter.reset();

    expect(panes[1].collapsed()).toBe(false);
    expect(splitter.sizeValues).toEqual([500, 500]);
    expect(resized.at(-1)?.sizes).toEqual([500, 500]);
    expect(announce).toHaveBeenLastCalledWith('Panes reset to default sizes', 'polite');
  });

  it('announces a custom reset message', () => {
    const { splitter, announce } = createRig(TWO);
    setInput(splitter.resetAnnouncement, 'Zurückgesetzt');
    splitter.reset();
    expect(announce).toHaveBeenCalledWith('Zurückgesetzt', 'polite');
  });
});

describe('SplitterComponent persistence', () => {
  it('writes ratios and collapsed flags after each change when a key is set', () => {
    const { splitter } = createRig(TWO);
    setInput(splitter.storageKey, 'main');
    splitter.handleKeydown(0, keydown('ArrowRight'));
    expect(JSON.parse(storageData.get('flr-splitter:main') ?? 'null')).toEqual({
      ratios: [0.51, 0.49],
      collapsed: [false, false],
    });
  });

  it('writes nothing without a storage key', () => {
    const { splitter } = createRig(TWO);
    splitter.handleKeydown(0, keydown('ArrowRight'));
    expect(storageData.size).toBe(0);
  });

  it('survives storage that throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
    const { splitter } = createRig(TWO);
    setInput(splitter.storageKey, 'main');
    expect(() => splitter.handleKeydown(0, keydown('ArrowRight'))).not.toThrow();
    expect(() => splitter.restoreFromStorage('main', 2)).not.toThrow();
  });

  it('restores ratios and collapsed flags of collapsible panes only', () => {
    storageData.set(
      'flr-splitter:main',
      JSON.stringify({ ratios: [0.25, 0.75], collapsed: [true, true] }),
    );
    const { splitter, panes } = createRig([{}, { collapsible: true }]);
    splitter.restoreFromStorage('main', 2);
    expect(splitter.ratioValues).toEqual([0.25, 0.75]);
    expect(panes[0].collapsed()).toBe(false);
    expect(panes[1].collapsed()).toBe(true);
  });

  it.each([
    ['missing', undefined],
    ['corrupt json', '{nope'],
    ['wrong pane count', JSON.stringify({ ratios: [1], collapsed: [false] })],
    ['negative ratio', JSON.stringify({ ratios: [-1, 2], collapsed: [false, false] })],
    ['all zero', JSON.stringify({ ratios: [0, 0], collapsed: [false, false] })],
  ])('ignores %s stored data', (_name, raw) => {
    if (raw !== undefined) storageData.set('flr-splitter:main', raw);
    const { splitter } = createRig(TWO);
    splitter.restoreFromStorage('main', 2);
    expect(splitter.ratioValues).toEqual([0.5, 0.5]);
  });
});

describe('SplitterComponent pointer dragging', () => {
  it('ignores non-primary buttons and an unmeasured splitter', () => {
    const grip = handle();
    const { splitter } = createRig(TWO);
    splitter.startDrag(0, pointer(grip, 500, 0, { button: 2 }));
    expect(splitter.dragging()).toBe(false);

    const unmeasured = createRig(TWO, 0, 0).splitter;
    unmeasured.startDrag(0, pointer(grip, 500));
    expect(unmeasured.dragging()).toBe(false);
    expect(grip.setPointerCapture).not.toHaveBeenCalled();
  });

  it('captures the pointer, focuses the handle and flags dragging', () => {
    const grip = handle();
    const { splitter } = createRig(TWO);
    const event = pointer(grip, 500);
    splitter.startDrag(0, event);
    expect(grip.setPointerCapture).toHaveBeenCalledWith(1);
    expect(grip.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(event.preventDefault).toHaveBeenCalled();
    expect(splitter.dragging()).toBe(true);
  });

  it('resizes by the pointer travel, coalescing moves into one frame', () => {
    const grip = handle();
    const { splitter } = createRig(TWO);
    splitter.startDrag(0, pointer(grip, 500));
    splitter.moveDrag(pointer(grip, 560));
    const first = splitter.lastFrame;
    splitter.moveDrag(pointer(grip, 600));
    expect(first).not.toBeNull();
    expect(splitter.lastFrame).toBe(first);
    expect(frames.has(first as number)).toBe(true);

    runFrames();
    expect(splitter.sizeValues).toEqual([600, 400]);
  });

  it('measures vertical drags on the y axis', () => {
    const grip = handle();
    const { splitter } = createRig(TWO, 1000, 400);
    setInput(splitter.orientation, 'vertical');
    splitter.startDrag(0, pointer(grip, 0, 100));
    splitter.moveDrag(pointer(grip, 999, 150));
    runFrames();
    expect(splitter.sizeValues).toEqual([250, 150]);
  });

  it('reverses horizontal drags in right-to-left', () => {
    direction = 'rtl';
    const grip = handle();
    const { splitter } = createRig(TWO);
    splitter.startDrag(0, pointer(grip, 500));
    splitter.moveDrag(pointer(grip, 560));
    runFrames();
    expect(splitter.sizeValues).toEqual([440, 560]);
  });

  it('keeps the drag inside the pane bounds', () => {
    const grip = handle();
    const { splitter } = createRig([{ maxSize: 600 }, { minSize: 100 }]);
    splitter.startDrag(0, pointer(grip, 500));
    splitter.moveDrag(pointer(grip, 5000));
    runFrames();
    expect(splitter.sizeValues).toEqual([600, 400]);
  });

  it('ignores moves from another pointer', () => {
    const grip = handle();
    const { splitter } = createRig(TWO);
    splitter.startDrag(0, pointer(grip, 500));
    splitter.moveDrag(pointer(grip, 700, 0, { pointerId: 2 }));
    expect(splitter.lastFrame).toBeNull();
    runFrames();
    expect(splitter.sizeValues).toEqual([500, 500]);
  });

  it('ignores moves when no drag is active', () => {
    const grip = handle();
    const { splitter } = createRig(TWO);
    splitter.moveDrag(pointer(grip, 700));
    expect(splitter.lastFrame).toBeNull();
    runFrames();
    expect(splitter.sizeValues).toEqual([500, 500]);
  });

  it('applies the final position on release, releases capture and reports the result', () => {
    const grip = handle();
    const { splitter, resized, announce } = createRig(TWO);
    splitter.startDrag(0, pointer(grip, 500));
    splitter.moveDrag(pointer(grip, 700));
    const pending = splitter.lastFrame as number;
    splitter.endDrag(pointer(grip, 700));

    expect(frames.has(pending)).toBe(false);
    expect(splitter.dragging()).toBe(false);
    expect(grip.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(splitter.sizeValues).toEqual([700, 300]);
    expect(resized).toHaveLength(1);
    expect(resized[0].sizes).toEqual([700, 300]);
    expect(announce).toHaveBeenCalledWith('Pane 1 70 percent', 'polite');
  });

  it('does not release capture it no longer holds', () => {
    const grip = handle();
    const { splitter } = createRig(TWO);
    splitter.startDrag(0, pointer(grip, 500));
    grip.state.captured = false;
    splitter.endDrag(pointer(grip, 500));
    expect(grip.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('ignores a release from another pointer or without a drag', () => {
    const grip = handle();
    const { splitter, resized } = createRig(TWO);
    splitter.endDrag(pointer(grip, 500));
    splitter.startDrag(0, pointer(grip, 500));
    splitter.endDrag(pointer(grip, 500, 0, { pointerId: 9 }));
    expect(splitter.dragging()).toBe(true);
    expect(resized).toHaveLength(0);
  });

  it('cancels the pending frame and drops the drag when aborted', () => {
    const grip = handle();
    const { splitter, resized } = createRig(TWO);
    splitter.startDrag(0, pointer(grip, 500));
    splitter.moveDrag(pointer(grip, 700));
    const pending = splitter.lastFrame as number;
    splitter.abort();
    expect(splitter.dragging()).toBe(false);
    expect(frames.has(pending)).toBe(false);
    runFrames();
    expect(splitter.sizeValues).toEqual([500, 500]);
    expect(resized).toHaveLength(0);
    splitter.endDrag(pointer(grip, 700));
    expect(resized).toHaveLength(0);
  });

  it('aborting without a drag is a no-op', () => {
    const { splitter } = createRig(TWO);
    expect(() => splitter.abort()).not.toThrow();
    expect(splitter.dragging()).toBe(false);
  });
});
