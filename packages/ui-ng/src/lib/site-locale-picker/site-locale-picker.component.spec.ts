import '@angular/compiler';
import { DOCUMENT } from '@angular/common';
import type { WritableSignal } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHarness, setInput } from '../testing/component-harness';
import type { SiteLocaleOption } from './site-locale-option';
import { SiteLocalePickerComponent } from './site-locale-picker.component';

const linkSignal = vi.hoisted(() => ({ value: undefined as unknown as WritableSignal<unknown[]> }));

vi.mock('@angular/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@angular/core')>();
  linkSignal.value = actual.signal<unknown[]>([]);
  return { ...actual, viewChildren: () => actual.computed(() => linkSignal.value()) };
});

class Probe extends SiteLocalePickerComponent {
  get isOpen(): boolean {
    return this.open();
  }
  set isOpen(value: boolean) {
    this.open.set(value);
  }
  get panel(): string {
    return this.panelId;
  }
  get placement() {
    return this.positions;
  }
  focusSelected(): void {
    this.focusCurrent();
  }
  detach(): void {
    this.onDetach();
  }
  keydown(event: Partial<KeyboardEvent>): void {
    this.onKeydown(event as KeyboardEvent);
  }
  replaceTrigger(focus: () => void): void {
    (this as unknown as Record<string, unknown>)['trigger'] = () => ({ nativeElement: { focus } });
  }
}

const options: SiteLocaleOption[] = [
  { code: 'en', endonym: 'English', href: '/' },
  { code: 'fr', endonym: 'Français', href: '/fr/' },
  { code: 'de', endonym: 'Deutsch', href: '/de/' },
];

function link(label: string) {
  return { focus: vi.fn(), getLabel: () => label, disabled: false };
}

function setup(
  document: { activeElement: unknown; body: unknown } = { activeElement: null, body: {} },
) {
  const harness = createHarness([{ provide: DOCUMENT, useValue: document }]);
  const picker = harness.create(() => new Probe());
  setInput(picker.options, options);
  setInput(picker.current, 'fr');
  setInput(picker.label, 'Language');
  return { picker, harness };
}

describe('SiteLocalePickerComponent', () => {
  afterEach(() => linkSignal.value.set([]));

  it('gives each picker a unique panel id', () => {
    expect(setup().picker.panel).not.toBe(setup().picker.panel);
  });

  it('opens below, falling back to above, aligned to the end', () => {
    expect(
      setup().picker.placement.map((p) => [p.originY, p.overlayY, p.originX, p.overlayX]),
    ).toEqual([
      ['bottom', 'top', 'end', 'end'],
      ['top', 'bottom', 'end', 'end'],
    ]);
  });

  describe('focusCurrent', () => {
    it('focuses the link of the current locale after the next render', () => {
      const links = [link('English'), link('Français'), link('Deutsch')];
      linkSignal.value.set(links);
      const { picker, harness } = setup();
      picker.focusSelected();
      expect(links[1].focus).not.toHaveBeenCalled();
      harness.flush();
      expect(links[1].focus).toHaveBeenCalledOnce();
      expect(links[0].focus).not.toHaveBeenCalled();
    });

    it('focuses the first link when the current locale is not in the options', () => {
      const links = [link('English'), link('Français'), link('Deutsch')];
      linkSignal.value.set(links);
      const { picker, harness } = setup();
      setInput(picker.current, 'ja');
      picker.focusSelected();
      harness.flush();
      expect(links[0].focus).toHaveBeenCalledOnce();
    });
  });

  describe('detach', () => {
    it('closes and returns focus to the trigger when nothing is focused', () => {
      const { picker } = setup({ activeElement: null, body: {} });
      const focus = vi.fn();
      picker.replaceTrigger(focus);
      picker.isOpen = true;
      picker.detach();
      expect(picker.isOpen).toBe(false);
      expect(focus).toHaveBeenCalledOnce();
    });

    it('returns focus to the trigger when focus fell back to the body', () => {
      const body = {};
      const { picker } = setup({ activeElement: body, body });
      const focus = vi.fn();
      picker.replaceTrigger(focus);
      picker.detach();
      expect(focus).toHaveBeenCalledOnce();
    });

    it('leaves focus alone when another element holds it', () => {
      const { picker } = setup({ activeElement: {}, body: {} });
      const focus = vi.fn();
      picker.replaceTrigger(focus);
      picker.isOpen = true;
      picker.detach();
      expect(picker.isOpen).toBe(false);
      expect(focus).not.toHaveBeenCalled();
    });
  });

  describe('keyboard', () => {
    const key = (name: string, keyCode: number) => ({
      key: name,
      keyCode,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });

    it('closes on Tab without moving focus', () => {
      const links = [link('English'), link('Français')];
      linkSignal.value.set(links);
      const { picker } = setup();
      picker.isOpen = true;
      picker.keydown(key('Tab', 9));
      expect(picker.isOpen).toBe(false);
      expect(links.every((l) => l.focus.mock.calls.length === 0)).toBe(true);
    });

    it('moves focus with arrows, wrapping at both ends', () => {
      const links = [link('English'), link('Français'), link('Deutsch')];
      linkSignal.value.set(links);
      const { picker } = setup();
      picker.keydown(key('ArrowDown', 40));
      picker.keydown(key('ArrowDown', 40));
      picker.keydown(key('ArrowDown', 40));
      picker.keydown(key('ArrowDown', 40));
      expect(links.map((l) => l.focus.mock.calls.length)).toEqual([2, 1, 1]);
      picker.keydown(key('ArrowUp', 38));
      expect(links[2].focus).toHaveBeenCalledTimes(2);
    });

    it('jumps to the ends with Home and End', () => {
      const links = [link('English'), link('Français'), link('Deutsch')];
      linkSignal.value.set(links);
      const { picker } = setup();
      picker.keydown(key('End', 35));
      expect(links[2].focus).toHaveBeenCalledOnce();
      picker.keydown(key('Home', 36));
      expect(links[0].focus).toHaveBeenCalledOnce();
    });
  });
});
