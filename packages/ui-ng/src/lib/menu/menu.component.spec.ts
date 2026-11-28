import '@angular/compiler';
import { ElementRef } from '@angular/core';
import type { WritableSignal } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHarness, setInput } from '../testing/component-harness';
import { MenuComponent, MenuItemComponent } from './menu.component';

const menuItems = vi.hoisted(() => ({ signal: undefined as unknown as WritableSignal<unknown[]> }));

vi.mock('@angular/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@angular/core')>();
  menuItems.signal = actual.signal<unknown[]>([]);
  return { ...actual, contentChildren: () => () => menuItems.signal() };
});

class MenuProbe extends MenuComponent {
  get placement() {
    return this.positions();
  }
  doToggle(): void {
    this.toggle();
  }
  attach(): void {
    this.onAttach();
  }
  detach(): void {
    this.onDetach();
  }
  keydown(event: Partial<KeyboardEvent>): void {
    this.onKeydown(event as KeyboardEvent);
  }
  useItems(items: unknown[]): void {
    menuItems.signal.set(items);
  }
}

class ItemProbe extends MenuItemComponent {
  click(): void {
    this.onClick();
  }
}

interface FakeTrigger {
  setAttribute: ReturnType<typeof vi.fn>;
  matches: (selector: string) => boolean;
  querySelector: (selector: string) => unknown;
  focus: ReturnType<typeof vi.fn>;
}

function trigger(over: Partial<FakeTrigger> = {}): FakeTrigger {
  return {
    setAttribute: vi.fn(),
    matches: () => true,
    querySelector: () => null,
    focus: vi.fn(),
    ...over,
  };
}

function setup(found: FakeTrigger | null = null) {
  const querySelector = vi.fn(() => found);
  const harness = createHarness([
    { provide: ElementRef, useValue: { nativeElement: { querySelector } } },
  ]);
  const menu = harness.create(() => new MenuProbe());
  return { menu, harness, querySelector };
}

describe('MenuComponent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    menuItems.signal.set([]);
  });

  describe('positions', () => {
    it('opens below first, aligned to the start, with an upward fallback', () => {
      const { menu } = setup();
      expect(menu.placement).toEqual([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
      ]);
    });

    it('prefers above when the direction is up', () => {
      const { menu } = setup();
      setInput(menu.direction, 'up');
      expect(menu.placement.map((p) => p.originY)).toEqual(['top', 'bottom']);
    });

    it('aligns to the end', () => {
      const { menu } = setup();
      setInput(menu.align, 'end');
      expect(menu.placement.every((p) => p.originX === 'end' && p.overlayX === 'end')).toBe(true);
    });
  });

  describe('trigger attributes', () => {
    it('mirrors the open state onto the trigger', () => {
      const el = trigger();
      const { menu, harness } = setup(el);
      harness.flush();
      expect(el.setAttribute).toHaveBeenCalledWith('aria-haspopup', 'menu');
      expect(el.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
      menu.open.set(true);
      harness.flush();
      expect(el.setAttribute).toHaveBeenLastCalledWith('aria-expanded', 'true');
    });

    it('does nothing when there is no trigger', () => {
      const { menu, harness, querySelector } = setup(null);
      menu.open.set(true);
      expect(() => harness.flush()).not.toThrow();
      expect(querySelector).toHaveBeenCalledWith('[flr-menu-trigger]');
    });
  });

  describe('open state', () => {
    it('toggles', () => {
      const { menu } = setup();
      menu.doToggle();
      expect(menu.open()).toBe(true);
      menu.doToggle();
      expect(menu.open()).toBe(false);
    });

    it('closes on Tab without moving focus through the key manager', () => {
      const { menu } = setup();
      const focus = vi.fn();
      menu.useItems([{ focus, disabled: () => false }]);
      menu.open.set(true);
      menu.keydown({ key: 'Tab' });
      expect(menu.open()).toBe(false);
      expect(focus).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    const items = () => {
      const focuses = [vi.fn(), vi.fn(), vi.fn()];
      const disabled = [false, true, false];
      return {
        focuses,
        list: focuses.map((focus, i) => ({ focus, disabled: () => disabled[i] })),
      };
    };
    const keyCodes: Record<string, number> = { ArrowDown: 40, ArrowUp: 38, Home: 36, End: 35 };
    const key = (k: string) => ({
      key: k,
      keyCode: keyCodes[k],
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    it('moves focus down, skipping disabled items, and wraps', () => {
      const { menu } = setup();
      const { focuses, list } = items();
      menu.useItems(list);
      menu.keydown(key('ArrowDown'));
      menu.keydown(key('ArrowDown'));
      menu.keydown(key('ArrowDown'));
      expect(focuses.map((f) => f.mock.calls.length)).toEqual([2, 0, 1]);
    });

    it('moves focus up with wrap', () => {
      const { menu } = setup();
      const { focuses, list } = items();
      menu.useItems(list);
      menu.keydown(key('ArrowUp'));
      expect(focuses[2]).toHaveBeenCalledOnce();
    });

    it('jumps to the last item on End and the first on Home', () => {
      const { menu } = setup();
      const { focuses, list } = items();
      menu.useItems(list);
      menu.keydown(key('End'));
      expect(focuses[2]).toHaveBeenCalledOnce();
      menu.keydown(key('Home'));
      expect(focuses[0]).toHaveBeenCalledOnce();
    });
  });

  describe('attach', () => {
    it('focuses the first enabled item after the next render', () => {
      const { menu, harness } = setup();
      const focuses = [vi.fn(), vi.fn()];
      menuItems.signal.set([
        { focus: focuses[0], disabled: () => true },
        { focus: focuses[1], disabled: () => false },
      ]);
      menu.attach();
      expect(focuses[1]).not.toHaveBeenCalled();
      harness.flush();
      expect(focuses[0]).not.toHaveBeenCalled();
      expect(focuses[1]).toHaveBeenCalledOnce();
    });
  });

  describe('detach focus restore', () => {
    it('closes the menu', () => {
      const { menu } = setup();
      vi.stubGlobal('document', { activeElement: {}, body: {} });
      menu.open.set(true);
      menu.detach();
      expect(menu.open()).toBe(false);
    });

    it('keeps focus where it is when something else holds it', () => {
      const el = trigger();
      const { menu } = setup(el);
      vi.stubGlobal('document', { activeElement: {}, body: {} });
      menu.detach();
      expect(el.focus).not.toHaveBeenCalled();
    });

    it('focuses a focusable trigger when focus fell to the body', () => {
      const el = trigger();
      const { menu } = setup(el);
      const body = {};
      vi.stubGlobal('document', { activeElement: body, body });
      menu.detach();
      expect(el.focus).toHaveBeenCalledOnce();
    });

    it('focuses a focusable descendant when the trigger itself is not focusable', () => {
      const inner = { focus: vi.fn() };
      const el = trigger({ matches: () => false, querySelector: () => inner });
      const { menu } = setup(el);
      vi.stubGlobal('document', { activeElement: null, body: {} });
      menu.detach();
      expect(inner.focus).toHaveBeenCalledOnce();
      expect(el.focus).not.toHaveBeenCalled();
    });

    it('tolerates a missing trigger', () => {
      const { menu } = setup(null);
      vi.stubGlobal('document', { activeElement: null, body: {} });
      expect(() => menu.detach()).not.toThrow();
    });
  });
});

describe('MenuItemComponent', () => {
  const create = () => {
    const item = createHarness().create(() => new ItemProbe());
    const selected = vi.fn();
    item.selected.subscribe(selected);
    return { item, selected };
  };

  it('emits selected on click', () => {
    const { item, selected } = create();
    item.click();
    expect(selected).toHaveBeenCalledOnce();
  });

  it('does not emit while disabled', () => {
    const { item, selected } = create();
    setInput(item.disabled, true);
    item.click();
    expect(selected).not.toHaveBeenCalled();
  });

  it('focuses its control, and tolerates a missing one', () => {
    const { item } = create();
    expect(() => item.focus()).not.toThrow();
    const focus = vi.fn();
    (item as unknown as Record<string, unknown>)['control'] = () => ({ nativeElement: { focus } });
    item.focus();
    expect(focus).toHaveBeenCalledOnce();
  });
});
