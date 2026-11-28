import '@angular/compiler';
import {
  Injector,
  runInInjectionContext,
  signal,
  type InputSignalWithTransform,
  type WritableSignal,
} from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { describe, expect, it, vi } from 'vitest';
import { TabComponent } from './tab.component';
import { TABS_STRIP, type TabsMode, type TabsStrip } from './tabs.model';

type InputNode<W> = { applyValueToInputSignal(node: unknown, value: W): void };

function setInput<T, W>(input: InputSignalWithTransform<T, W>, value: W): void {
  const node = (input as unknown as Record<symbol, InputNode<W>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

class TabProbe extends TabComponent {
  get link() {
    return this.asLink();
  }
  get panel() {
    return this.isPanel();
  }
  get focusIndex() {
    return this.tabIndex();
  }
  click(event: Partial<MouseEvent>) {
    this.onClick(event as MouseEvent);
  }
  key(event: Partial<KeyboardEvent>) {
    this.onKeydown(event as KeyboardEvent);
  }
}

interface Rig {
  tab: TabProbe;
  mode: WritableSignal<TabsMode>;
  strip: TabsStrip & {
    isFocusable: ReturnType<typeof vi.fn>;
    handleKeydown: ReturnType<typeof vi.fn>;
  };
  selected: ReturnType<typeof vi.fn>;
}

function create(mode: TabsMode = 'nav'): Rig {
  const modeSignal = signal<TabsMode>(mode);
  const strip = {
    mode: modeSignal,
    isFocusable: vi.fn(() => false),
    handleKeydown: vi.fn(),
  };
  const injector = Injector.create({ providers: [{ provide: TABS_STRIP, useValue: strip }] });
  const tab = runInInjectionContext(injector, () => new TabProbe());
  const selected = vi.fn();
  tab.selected.subscribe(selected);
  return { tab, mode: modeSignal, strip, selected };
}

function click(extra: Partial<MouseEvent> = {}) {
  return { button: 0, preventDefault: vi.fn(), ...extra } as Partial<MouseEvent> & {
    preventDefault: ReturnType<typeof vi.fn>;
  };
}

describe('TabComponent mode', () => {
  it('is a panel tab only in panel mode', () => {
    const { tab, mode } = create('nav');
    expect(tab.panel).toBe(false);
    mode.set('panel');
    expect(tab.panel).toBe(true);
  });

  it('renders as a link only in nav mode with an href and not disabled', () => {
    const { tab, mode } = create('nav');
    expect(tab.link).toBe(false);
    setInput(tab.href, '/docs');
    expect(tab.link).toBe(true);
    mode.set('panel');
    expect(tab.link).toBe(false);
    mode.set('nav');
    setInput(tab.disabled, true);
    expect(tab.link).toBe(false);
  });

  it('has no explicit tabindex in nav mode', () => {
    const { tab, strip } = create('nav');
    expect(tab.focusIndex).toBeNull();
    expect(strip.isFocusable).not.toHaveBeenCalled();
  });

  it('uses a roving tabindex in panel mode', () => {
    const { tab, strip } = create('panel');
    expect(tab.focusIndex).toBe(-1);
    expect(strip.isFocusable).toHaveBeenCalledWith(tab);
    strip.isFocusable.mockReturnValue(true);
    const focusable = create('panel');
    focusable.strip.isFocusable.mockReturnValue(true);
    expect(focusable.tab.focusIndex).toBe(0);
  });
});

describe('TabComponent click', () => {
  it('swallows clicks while disabled', () => {
    const { tab, selected } = create();
    setInput(tab.disabled, true);
    const event = click();
    tab.click(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
  });

  it('emits selected for a button tab without cancelling the click', () => {
    const { tab, selected } = create();
    const event = click();
    tab.click(event);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('emits selected and cancels navigation for a plain link click', () => {
    const { tab, selected } = create();
    setInput(tab.href, '/docs');
    const event = click();
    tab.click(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['meta', { metaKey: true }],
    ['ctrl', { ctrlKey: true }],
    ['shift', { shiftKey: true }],
    ['middle button', { button: 1 }],
  ])('leaves a %s click on a link to the browser', (_name, extra) => {
    const { tab, selected } = create();
    setInput(tab.href, '/docs');
    const event = click(extra);
    tab.click(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
  });

  it('treats a modified click as a normal selection when the tab is not a link', () => {
    const { tab, selected } = create('panel');
    setInput(tab.href, '/docs');
    tab.click(click({ metaKey: true }));
    expect(selected).toHaveBeenCalledTimes(1);
  });
});

describe('TabComponent keyboard and focus', () => {
  it('forwards keydown to the strip in panel mode only', () => {
    const panel = create('panel');
    const event = { key: 'ArrowRight' };
    panel.tab.key(event);
    expect(panel.strip.handleKeydown).toHaveBeenCalledWith(event, panel.tab);

    const nav = create('nav');
    nav.tab.key(event);
    expect(nav.strip.handleKeydown).not.toHaveBeenCalled();
  });

  it('has no element and ignores focus before the view exists', () => {
    const { tab } = create();
    expect(tab.element()).toBeNull();
    expect(() => tab.focus()).not.toThrow();
  });

  it('focuses and exposes its control element', () => {
    const { tab } = create();
    const control = { focus: vi.fn() };
    Object.assign(tab, { control: () => ({ nativeElement: control }) });
    tab.focus();
    expect(control.focus).toHaveBeenCalledTimes(1);
    expect(tab.element()).toBe(control);
  });
});
