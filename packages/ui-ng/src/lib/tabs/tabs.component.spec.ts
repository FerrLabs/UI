import '@angular/compiler';
import {
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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TabsComponent } from './tabs.component';
import type { TabsStripItem } from './tabs.model';

type InputNode<T> = { applyValueToInputSignal(node: unknown, value: T): void };

function setInput<T>(input: InputSignal<T>, value: T): void {
  const node = (input as unknown as Record<symbol, InputNode<T>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

interface FakeTab extends TabsStripItem {
  readonly activeState: WritableSignal<boolean>;
  readonly disabledState: WritableSignal<boolean>;
  readonly selected: { emit: ReturnType<typeof vi.fn> };
  readonly focus: ReturnType<typeof vi.fn>;
  readonly box: { left: number; width: number };
  readonly el: FakeElement | null;
}

interface FakeElement {
  contains(target: unknown): boolean;
  getBoundingClientRect(): { left: number; width: number };
}

function fakeTab(
  options: {
    active?: boolean;
    disabled?: boolean;
    left?: number;
    width?: number;
    element?: boolean;
  } = {},
): FakeTab {
  const activeState = signal(options.active ?? false);
  const disabledState = signal(options.disabled ?? false);
  const box = { left: options.left ?? 0, width: options.width ?? 80 };
  const el: FakeElement | null =
    options.element === false ? null : { contains: () => false, getBoundingClientRect: () => box };
  return {
    activeState,
    disabledState,
    active: activeState,
    disabled: disabledState,
    selected: { emit: vi.fn() },
    focus: vi.fn(),
    element: () => el as unknown as HTMLElement | null,
    box,
    el,
  };
}

class TabsProbe extends TabsComponent {
  get roleValue() {
    return this.role();
  }
  get fade() {
    return { start: this.fadeStart(), end: this.fadeEnd() };
  }
  refreshFade() {
    this.updateFade();
  }
  scrolledByUser() {
    this.markUserScrolled();
  }
  focusIn(event: Partial<FocusEvent>) {
    this.keepFocusVisible(event as FocusEvent);
  }
  settle() {
    this['settleLayout']();
  }
  reveal(animate: boolean) {
    this['revealActive'](animate);
  }
  get userScrolled() {
    return this['userScrolled'];
  }
}

interface FakeStrip {
  scrollLeft: number;
  clientWidth: number;
  scrollWidth: number;
  scrollTo: ReturnType<typeof vi.fn>;
  getBoundingClientRect(): { left: number; width: number };
}

function createTabs(
  tabs: readonly TabsStripItem[],
  strip: Partial<FakeStrip> = {},
): { tabs: TabsProbe; strip: FakeStrip } {
  const injector = createEnvironmentInjector(
    [provideZonelessChangeDetection(), { provide: ɵINJECTOR_SCOPE, useValue: 'root' }],
    undefined as unknown as EnvironmentInjector,
  );
  const component = runInInjectionContext(injector, () => new TabsProbe());
  const fakeStrip: FakeStrip = {
    scrollLeft: 0,
    clientWidth: 400,
    scrollWidth: 400,
    scrollTo: vi.fn(),
    getBoundingClientRect: () => ({ left: 0, width: 400 }),
    ...strip,
  };
  Object.assign(component, {
    tabs: () => tabs,
    strip: () => ({ nativeElement: fakeStrip }),
  });
  return { tabs: component, strip: fakeStrip };
}

function keydown(key: string) {
  return { key, preventDefault: vi.fn() } as unknown as KeyboardEvent & {
    preventDefault: ReturnType<typeof vi.fn>;
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TabsComponent role', () => {
  it('is a tablist in panel mode', () => {
    const { tabs } = createTabs([]);
    setInput(tabs.mode, 'panel');
    expect(tabs.roleValue).toBe('tablist');
  });

  it('is a navigation landmark in nav mode only when labelled', () => {
    const { tabs } = createTabs([]);
    expect(tabs.roleValue).toBeNull();
    setInput(tabs.ariaLabel, 'Sections');
    expect(tabs.roleValue).toBe('navigation');
  });
});

describe('TabsComponent focusable tab', () => {
  it('makes the active tab the single tab stop', () => {
    const [a, b, c] = [fakeTab(), fakeTab({ active: true }), fakeTab()];
    const { tabs } = createTabs([a, b, c]);
    expect(tabs.isFocusable(a)).toBe(false);
    expect(tabs.isFocusable(b)).toBe(true);
    expect(tabs.isFocusable(c)).toBe(false);
  });

  it('falls back to the first reachable tab when none is active', () => {
    const [a, b] = [fakeTab({ disabled: true }), fakeTab()];
    const { tabs } = createTabs([a, b]);
    expect(tabs.isFocusable(a)).toBe(false);
    expect(tabs.isFocusable(b)).toBe(true);
  });

  it('skips a disabled active tab', () => {
    const [a, b] = [fakeTab(), fakeTab({ active: true, disabled: true })];
    const { tabs } = createTabs([a, b]);
    expect(tabs.isFocusable(a)).toBe(true);
    expect(tabs.isFocusable(b)).toBe(false);
  });

  it('has no focusable tab when all are disabled', () => {
    const a = fakeTab({ disabled: true });
    const { tabs } = createTabs([a]);
    expect(tabs.isFocusable(a)).toBe(false);
  });
});

describe('TabsComponent arrow key navigation', () => {
  function three() {
    const list = [fakeTab({ active: true }), fakeTab(), fakeTab()];
    return { list, ...createTabs(list) };
  }

  it('moves focus and selection to the next tab', () => {
    const { list, tabs } = three();
    const event = keydown('ArrowRight');
    tabs.handleKeydown(event, list[0]);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(list[1].focus).toHaveBeenCalledTimes(1);
    expect(list[1].selected.emit).toHaveBeenCalledTimes(1);
    expect(list[0].selected.emit).not.toHaveBeenCalled();
  });

  it('wraps from the last tab to the first on ArrowRight', () => {
    const { list, tabs } = three();
    tabs.handleKeydown(keydown('ArrowRight'), list[2]);
    expect(list[0].selected.emit).toHaveBeenCalledTimes(1);
  });

  it('wraps from the first tab to the last on ArrowLeft', () => {
    const { list, tabs } = three();
    tabs.handleKeydown(keydown('ArrowLeft'), list[0]);
    expect(list[2].focus).toHaveBeenCalledTimes(1);
    expect(list[2].selected.emit).toHaveBeenCalledTimes(1);
  });

  it('moves back with ArrowLeft', () => {
    const { list, tabs } = three();
    tabs.handleKeydown(keydown('ArrowLeft'), list[2]);
    expect(list[1].selected.emit).toHaveBeenCalledTimes(1);
  });

  it('jumps to the ends with Home and End', () => {
    const { list, tabs } = three();
    tabs.handleKeydown(keydown('End'), list[0]);
    expect(list[2].selected.emit).toHaveBeenCalledTimes(1);
    tabs.handleKeydown(keydown('Home'), list[2]);
    expect(list[0].selected.emit).toHaveBeenCalledTimes(1);
  });

  it('skips disabled tabs', () => {
    const list = [fakeTab(), fakeTab({ disabled: true }), fakeTab()];
    const { tabs } = createTabs(list);
    tabs.handleKeydown(keydown('ArrowRight'), list[0]);
    expect(list[1].selected.emit).not.toHaveBeenCalled();
    expect(list[2].selected.emit).toHaveBeenCalledTimes(1);
  });

  it('keeps focus on the only reachable tab', () => {
    const list = [fakeTab()];
    const { tabs } = createTabs(list);
    tabs.handleKeydown(keydown('ArrowRight'), list[0]);
    expect(list[0].selected.emit).toHaveBeenCalledTimes(1);
  });

  it('ignores other keys without cancelling them', () => {
    const { list, tabs } = three();
    const event = keydown('Enter');
    tabs.handleKeydown(event, list[0]);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(list.every((t) => t.selected.emit.mock.calls.length === 0)).toBe(true);
  });

  it('ignores keys from a disabled or unknown tab', () => {
    const list = [fakeTab(), fakeTab({ disabled: true })];
    const { tabs } = createTabs(list);
    const event = keydown('ArrowRight');
    tabs.handleKeydown(event, list[1]);
    tabs.handleKeydown(event, fakeTab());
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(list[0].selected.emit).not.toHaveBeenCalled();
  });
});

describe('TabsComponent edge fades', () => {
  it('shows no fade when the strip fits', () => {
    const { tabs } = createTabs([], { clientWidth: 400, scrollWidth: 400 });
    tabs.refreshFade();
    expect(tabs.fade).toEqual({ start: false, end: false });
  });

  it('fades only the end at the start of an overflowing strip', () => {
    const { tabs } = createTabs([], { clientWidth: 200, scrollWidth: 600, scrollLeft: 0 });
    tabs.refreshFade();
    expect(tabs.fade).toEqual({ start: false, end: true });
  });

  it('fades both edges in the middle and only the start at the end', () => {
    const { tabs, strip } = createTabs([], { clientWidth: 200, scrollWidth: 600, scrollLeft: 100 });
    tabs.refreshFade();
    expect(tabs.fade).toEqual({ start: true, end: true });
    strip.scrollLeft = 400;
    tabs.refreshFade();
    expect(tabs.fade).toEqual({ start: true, end: false });
  });
});

describe('TabsComponent focus visibility', () => {
  const stubMotion = (reduce: boolean) =>
    vi.stubGlobal('window', { matchMedia: () => ({ matches: reduce }) });

  class FakeNode {}

  function focusFixture(options: { left: number; width: number; mode?: 'nav' | 'panel' }) {
    const tab = fakeTab({ left: options.left, width: options.width });
    const other = fakeTab({ left: 0, width: 50 });
    const { tabs, strip } = createTabs([other, tab], {
      scrollLeft: 100,
      getBoundingClientRect: () => ({ left: 0, width: 400 }),
    });
    if (options.mode) setInput(tabs.mode, options.mode);
    vi.stubGlobal('Node', FakeNode);
    const target = new FakeNode();
    if (tab.el) tab.el.contains = (candidate) => candidate === target;
    return { tabs, strip, target };
  }

  it('scrolls a tab hidden under the end fade into view', () => {
    stubMotion(false);
    const { tabs, strip, target } = focusFixture({ left: 380, width: 100 });
    tabs.focusIn({ target: target as unknown as EventTarget });
    expect(strip.scrollTo).toHaveBeenCalledWith({ left: 100 + 480 - 376, behavior: 'smooth' });
  });

  it('scrolls a tab hidden under the start fade into view', () => {
    stubMotion(false);
    const { tabs, strip, target } = focusFixture({ left: 4, width: 100 });
    tabs.focusIn({ target: target as unknown as EventTarget });
    expect(strip.scrollTo).toHaveBeenCalledWith({ left: 100 + 4 - 24, behavior: 'smooth' });
  });

  it('does not animate when reduced motion is requested', () => {
    stubMotion(true);
    const { tabs, strip, target } = focusFixture({ left: 380, width: 100 });
    tabs.focusIn({ target: target as unknown as EventTarget });
    expect(strip.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
  });

  it('does not scroll a tab that is already comfortably visible', () => {
    stubMotion(false);
    const { tabs, strip, target } = focusFixture({ left: 100, width: 80 });
    tabs.focusIn({ target: target as unknown as EventTarget });
    expect(strip.scrollTo).not.toHaveBeenCalled();
  });

  it('does nothing in panel mode', () => {
    stubMotion(false);
    const { tabs, strip, target } = focusFixture({ left: 380, width: 100, mode: 'panel' });
    tabs.focusIn({ target: target as unknown as EventTarget });
    expect(strip.scrollTo).not.toHaveBeenCalled();
  });

  it('ignores focus events from outside any tab', () => {
    stubMotion(false);
    const { tabs, strip } = focusFixture({ left: 380, width: 100 });
    tabs.focusIn({ target: new FakeNode() as unknown as EventTarget });
    tabs.focusIn({ target: null });
    expect(strip.scrollTo).not.toHaveBeenCalled();
  });
});

describe('TabsComponent reveal active tab', () => {
  const stubMotion = (reduce = false) =>
    vi.stubGlobal('window', { matchMedia: () => ({ matches: reduce }) });

  it('centres the active tab in nav mode', () => {
    stubMotion();
    const active = fakeTab({ active: true, left: 300, width: 100 });
    const { tabs, strip } = createTabs([fakeTab(), active], { scrollLeft: 50 });
    tabs.reveal(true);
    expect(strip.scrollTo).toHaveBeenCalledWith({ left: 50 + 350 - 200, behavior: 'smooth' });
  });

  it('jumps without animation on the first placement', () => {
    stubMotion();
    const { tabs, strip } = createTabs([fakeTab({ active: true, left: 300, width: 100 })]);
    tabs.reveal(false);
    expect(strip.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
  });

  it('does not scroll in panel mode or without an active tab, but still updates the fade', () => {
    stubMotion();
    const { tabs, strip } = createTabs([fakeTab({ active: true })], {
      clientWidth: 100,
      scrollWidth: 300,
    });
    setInput(tabs.mode, 'panel');
    tabs.reveal(true);
    expect(strip.scrollTo).not.toHaveBeenCalled();
    expect(tabs.fade.end).toBe(true);

    const none = createTabs([fakeTab()]);
    none.tabs.reveal(true);
    expect(none.strip.scrollTo).not.toHaveBeenCalled();
  });

  it('does not scroll when the active tab has no element yet', () => {
    stubMotion();
    const { tabs, strip } = createTabs([fakeTab({ active: true, element: false })]);
    tabs.reveal(true);
    expect(strip.scrollTo).not.toHaveBeenCalled();
  });
});

describe('TabsComponent layout settling', () => {
  const stubMotion = () => vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });

  it('reveals the active tab on the first measurement and when the geometry changes', () => {
    stubMotion();
    const { tabs, strip } = createTabs([fakeTab({ active: true, left: 300, width: 100 })]);
    tabs.settle();
    expect(strip.scrollTo).toHaveBeenCalledTimes(1);
    tabs.settle();
    expect(strip.scrollTo).toHaveBeenCalledTimes(1);
    strip.scrollWidth = 800;
    tabs.settle();
    expect(strip.scrollTo).toHaveBeenCalledTimes(2);
    expect(strip.scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'auto' }));
  });

  it('leaves the scroll position alone once the user scrolled', () => {
    stubMotion();
    const { tabs, strip } = createTabs([fakeTab({ active: true, left: 300, width: 100 })]);
    tabs.scrolledByUser();
    expect(tabs.userScrolled).toBe(true);
    tabs.settle();
    expect(strip.scrollTo).not.toHaveBeenCalled();
  });

  it('refreshes the fade after settling', () => {
    stubMotion();
    const { tabs } = createTabs([], { clientWidth: 100, scrollWidth: 300 });
    tabs.settle();
    expect(tabs.fade.end).toBe(true);
  });
});
