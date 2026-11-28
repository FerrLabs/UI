import { ElementRef, signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppRailItem } from '../app-rail/app-rail.component';
import { SHELL_CONTEXT } from '../shell/shell-context';
import { createHarness, setInput } from '../testing/component-harness';
import { AppSwitcherComponent } from './app-switcher.component';

class Probe extends AppSwitcherComponent {
  get isOpen(): boolean {
    return this.open();
  }
  set isOpen(value: boolean) {
    this.open.set(value);
  }
  get isCustomizing(): boolean {
    return this.customizing();
  }
  get isCompact(): boolean {
    return this.compact();
  }
  get visibleIds(): string[] {
    return this.visibleItems().map((i) => i.id);
  }
  get label(): string | null {
    return this.triggerLabel();
  }
  get currentApp(): AppRailItem | null {
    return this.currentItem();
  }
  get panel(): string {
    return this.panelId;
  }
  doToggle(): void {
    this.toggle();
  }
  doClose(): void {
    this.close();
  }
  doSelect(item: AppRailItem): void {
    this.onSelect(item);
  }
  doCustomize(): void {
    this.openCustomize();
  }
  locked(item: AppRailItem): boolean {
    return this.isLocked(item);
  }
  shown(item: AppRailItem): boolean {
    return this.isShown(item);
  }
  doSetShown(item: AppRailItem, shown: boolean): void {
    this.setShown(item, shown);
  }
  documentClick(target: unknown): void {
    this.onDocumentClick({ target } as unknown as MouseEvent);
  }
  color(item: AppRailItem): string {
    return this.markColor(item);
  }
  slug(item: AppRailItem): string {
    return this.glyph(item);
  }
  replaceTrigger(focus: () => void): void {
    (this as unknown as Record<string, unknown>)['trigger'] = () => ({ nativeElement: { focus } });
  }
}

const item = (id: string, over: Partial<AppRailItem> = {}): AppRailItem => ({
  id,
  label: id.toUpperCase(),
  href: `/${id}`,
  accent: '#7c3aed',
  ...over,
});

const apps = [item('ferrlabs'), item('ferrtrack'), item('ferrvault'), item('custom')];

class FakeNode {}

class FakeElement extends FakeNode {
  constructor(readonly closest: (selector: string) => unknown = () => null) {
    super();
  }
}

interface HostOptions {
  contains?: (node: unknown) => boolean;
  activeElement?: unknown;
  shellCollapsed?: boolean;
}

function setup(options: HostOptions = {}) {
  const providers: { provide: unknown; useValue: unknown }[] = [
    {
      provide: ElementRef,
      useValue: {
        nativeElement: {
          contains: options.contains ?? (() => false),
          ownerDocument: { activeElement: options.activeElement ?? null },
        },
      },
    },
  ];
  if (options.shellCollapsed !== undefined) {
    providers.push({
      provide: SHELL_CONTEXT,
      useValue: { collapsed: signal(options.shellCollapsed) },
    });
  }
  const harness = createHarness(providers as never);
  const switcher = harness.create(() => new Probe());
  setInput(switcher.items, apps);
  return switcher;
}

describe('AppSwitcherComponent', () => {
  beforeEach(() => {
    vi.stubGlobal('Node', FakeNode);
    vi.stubGlobal('Element', FakeElement);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('gives each instance a unique panel id', () => {
    expect(setup().panel).not.toBe(setup().panel);
  });

  describe('compact', () => {
    it('is false by default and without a shell', () => {
      expect(setup().isCompact).toBe(false);
    });

    it('follows the collapsed input', () => {
      const switcher = setup();
      setInput(switcher.collapsed, true);
      expect(switcher.isCompact).toBe(true);
    });

    it('follows the shell context', () => {
      expect(setup({ shellCollapsed: true }).isCompact).toBe(true);
      expect(setup({ shellCollapsed: false }).isCompact).toBe(false);
    });
  });

  describe('triggerLabel', () => {
    it('prefers the explicit aria label', () => {
      const switcher = setup();
      setInput(switcher.current, 'ferrtrack');
      setInput(switcher.ariaLabel, 'Apps menu');
      expect(switcher.label).toBe('Apps menu');
    });

    it('is null when expanded with a current app, so the visible text names it', () => {
      const switcher = setup();
      setInput(switcher.current, 'ferrtrack');
      expect(switcher.label).toBeNull();
    });

    it('names the caption and the current app when compact', () => {
      const switcher = setup();
      setInput(switcher.current, 'ferrtrack');
      setInput(switcher.collapsed, true);
      expect(switcher.label).toBe('Switch app, FERRTRACK');
    });

    it('is the caption alone without a current app', () => {
      const switcher = setup();
      expect(switcher.label).toBe('Switch app');
      setInput(switcher.current, 'missing');
      expect(switcher.currentApp).toBeNull();
      expect(switcher.label).toBe('Switch app');
    });
  });

  describe('visibleItems', () => {
    it('hides hidden apps', () => {
      const switcher = setup();
      switcher.hidden.set(['ferrtrack']);
      expect(switcher.visibleIds).toEqual(['ferrlabs', 'ferrvault', 'custom']);
    });

    it('always keeps the org hub and the current app', () => {
      const switcher = setup();
      switcher.hidden.set(['ferrlabs', 'ferrtrack', 'ferrvault']);
      setInput(switcher.current, 'ferrvault');
      expect(switcher.visibleIds).toEqual(['ferrlabs', 'ferrvault', 'custom']);
    });
  });

  describe('open and close', () => {
    it('toggles', () => {
      const switcher = setup();
      switcher.doToggle();
      expect(switcher.isOpen).toBe(true);
      switcher.doToggle();
      expect(switcher.isOpen).toBe(false);
    });

    it('does nothing when closing a closed menu', () => {
      const focus = vi.fn();
      const switcher = setup();
      switcher.replaceTrigger(focus);
      switcher.doClose();
      expect(focus).not.toHaveBeenCalled();
    });

    it('returns focus to the trigger when focus was inside the host', () => {
      const focus = vi.fn();
      const inside = new FakeNode();
      const switcher = setup({ activeElement: inside, contains: (n) => n === inside });
      switcher.replaceTrigger(focus);
      switcher.isOpen = true;
      switcher.doClose();
      expect(switcher.isOpen).toBe(false);
      expect(focus).toHaveBeenCalledOnce();
    });

    it('does not steal focus when it was elsewhere', () => {
      const focus = vi.fn();
      const switcher = setup({ activeElement: new FakeNode(), contains: () => false });
      switcher.replaceTrigger(focus);
      switcher.isOpen = true;
      switcher.doClose();
      expect(switcher.isOpen).toBe(false);
      expect(focus).not.toHaveBeenCalled();
    });

    it('does not steal focus when nothing is focused', () => {
      const focus = vi.fn();
      const switcher = setup({ activeElement: null });
      switcher.replaceTrigger(focus);
      switcher.isOpen = true;
      switcher.doClose();
      expect(focus).not.toHaveBeenCalled();
    });
  });

  describe('actions', () => {
    it('closes and emits the selected item', () => {
      const switcher = setup();
      const emitted: AppRailItem[] = [];
      switcher.selected.subscribe((i) => emitted.push(i));
      switcher.isOpen = true;
      switcher.doSelect(apps[1]);
      expect(switcher.isOpen).toBe(false);
      expect(emitted).toEqual([apps[1]]);
    });

    it('closes the menu and opens the customize dialog', () => {
      const switcher = setup();
      switcher.isOpen = true;
      switcher.doCustomize();
      expect(switcher.isOpen).toBe(false);
      expect(switcher.isCustomizing).toBe(true);
    });
  });

  describe('customize', () => {
    it('locks only the org hub', () => {
      const switcher = setup();
      expect(switcher.locked(apps[0])).toBe(true);
      expect(switcher.locked(apps[1])).toBe(false);
    });

    it('reports the hub as shown even when listed as hidden', () => {
      const switcher = setup();
      switcher.hidden.set(['ferrlabs', 'ferrtrack']);
      expect(switcher.shown(apps[0])).toBe(true);
      expect(switcher.shown(apps[1])).toBe(false);
      expect(switcher.shown(apps[2])).toBe(true);
    });

    it('hides an app without duplicating it', () => {
      const switcher = setup();
      switcher.doSetShown(apps[1], false);
      switcher.doSetShown(apps[1], false);
      expect(switcher.hidden()).toEqual(['ferrtrack']);
    });

    it('shows a hidden app again and keeps the others hidden', () => {
      const switcher = setup();
      switcher.hidden.set(['ferrtrack', 'ferrvault']);
      switcher.doSetShown(apps[1], true);
      expect(switcher.hidden()).toEqual(['ferrvault']);
    });
  });

  describe('document click', () => {
    it('ignores clicks while closed', () => {
      const contains = vi.fn(() => false);
      const switcher = setup({ contains });
      switcher.documentClick({});
      expect(contains).not.toHaveBeenCalled();
    });

    it('closes on a click outside the host', () => {
      const switcher = setup({ contains: () => false });
      switcher.isOpen = true;
      switcher.documentClick(new FakeNode());
      expect(switcher.isOpen).toBe(false);
    });

    it('closes when the target is not a node', () => {
      const switcher = setup({ contains: () => true });
      switcher.isOpen = true;
      switcher.documentClick(null);
      expect(switcher.isOpen).toBe(false);
    });

    it('stays open on a click inside the host', () => {
      const switcher = setup({ contains: () => true });
      switcher.isOpen = true;
      switcher.documentClick(new FakeNode());
      expect(switcher.isOpen).toBe(true);
    });

    it('closes when a footer link inside the host was followed', () => {
      const closest = vi.fn((selector: string) => (selector === '.flr-as__footer a' ? {} : null));
      const target = new FakeElement(closest);
      const switcher = setup({ contains: () => true });
      switcher.isOpen = true;
      switcher.documentClick(target);
      expect(closest).toHaveBeenCalledWith('.flr-as__footer a');
      expect(switcher.isOpen).toBe(false);
    });

    it('stays open for a non footer element inside the host', () => {
      const target = new FakeElement();
      const switcher = setup({ contains: () => true });
      switcher.isOpen = true;
      switcher.documentClick(target);
      expect(switcher.isOpen).toBe(true);
    });
  });

  describe('glyph and mark color', () => {
    it('uses the explicit product', () => {
      expect(setup().slug(item('custom', { product: 'ferrlens' }))).toBe('ferrlens');
    });

    it('falls back to the id when it is a known product', () => {
      expect(setup().slug(item('ferrvault'))).toBe('ferrvault');
    });

    it('falls back to the org mark for unknown ids', () => {
      expect(setup().slug(item('unknown'))).toBe('ferrlabs');
    });

    it('picks a readable mark color for dark accents', () => {
      const switcher = setup();
      expect(switcher.color(item('a', { accent: '#1e293b' }))).toBe('#ffffff');
      expect(switcher.color(item('a', { accent: '#f59e0b' }))).toBe('#f59e0b');
    });
  });
});
