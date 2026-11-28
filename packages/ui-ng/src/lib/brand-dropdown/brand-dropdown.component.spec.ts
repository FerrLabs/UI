import '@angular/compiler';
import { ElementRef } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHarness, setInput } from '../testing/component-harness';
import {
  BrandDropdownComponent,
  DEFAULT_APPS,
  type BrandDropdownApp,
} from './brand-dropdown.component';

class Probe extends BrandDropdownComponent {
  get isOpen(): boolean {
    return this.open();
  }
  set isOpen(value: boolean) {
    this.open.set(value);
  }
  get overlayApp(): BrandDropdownApp | null {
    return this.switchVisible();
  }
  get rowList() {
    return this.rows();
  }
  get title(): string {
    return this.triggerTitle();
  }
  documentDown(target: unknown): void {
    this.onDocumentDown({ target } as unknown as MouseEvent);
  }
  select(app: BrandDropdownApp, init: Partial<MouseEvent> = {}): MouseEvent {
    const event = { preventDefault: vi.fn(), ...init } as unknown as MouseEvent;
    this.onSelect(event, app);
    return event;
  }
  replaceOverlay(togglePopover: unknown): void {
    (this as unknown as Record<string, unknown>)['switchOverlay'] = () => ({
      nativeElement: { togglePopover },
    });
  }
}

const apps: BrandDropdownApp[] = [
  { id: 'ferrlabs', label: 'FerrLabs', href: 'https://labs.test', accent: '#000' },
  { id: 'ferrtrack', label: 'FerrTrack', href: 'https://track.test', accent: '#111' },
  {
    id: 'storybook',
    label: 'Storybook',
    href: 'https://sb.test',
    accent: '#222',
    section: 'Tools',
  },
  {
    id: 'ferrlens',
    label: 'FerrLens',
    href: 'https://lens.test',
    accent: '#333',
    section: 'Tools',
  },
  {
    id: 'ferrvault',
    label: 'FerrVault',
    href: 'https://vault.test',
    accent: '#444',
    section: 'More',
  },
];

function setup(contains: (target: unknown) => boolean = () => false) {
  const harness = createHarness([
    { provide: ElementRef, useValue: { nativeElement: { contains } } },
  ]);
  const dropdown = harness.create(() => new Probe());
  setInput(dropdown.current, 'ferrtrack');
  setInput(dropdown.apps, apps);
  return { dropdown, harness };
}

describe('BrandDropdownComponent', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('ships default apps with unique ids', () => {
    expect(new Set(DEFAULT_APPS.map((a) => a.id)).size).toBe(DEFAULT_APPS.length);
  });

  describe('rows', () => {
    it('marks the first row and shows a header when the section changes', () => {
      const { dropdown } = setup();
      expect(dropdown.rowList.map((r) => [r.app.id, r.first, r.showHeader])).toEqual([
        ['ferrlabs', true, false],
        ['ferrtrack', false, false],
        ['storybook', false, true],
        ['ferrlens', false, false],
        ['ferrvault', false, true],
      ]);
    });

    it('omits headers when collapsed', () => {
      const { dropdown } = setup();
      setInput(dropdown.collapsed, true);
      expect(dropdown.rowList.some((r) => r.showHeader)).toBe(false);
    });

    it('is empty without apps', () => {
      const { dropdown } = setup();
      setInput(dropdown.apps, []);
      expect(dropdown.rowList).toEqual([]);
    });
  });

  describe('trigger title', () => {
    it('names the current app', () => {
      expect(setup().dropdown.title).toBe('FerrTrack, switch to another FerrLabs app');
    });

    it('falls back when the current app is not in the list', () => {
      const { dropdown } = setup();
      setInput(dropdown.current, 'ferrflow');
      expect(dropdown.title).toBe('Switch app');
    });
  });

  describe('outside click', () => {
    it('closes when the target is outside the host', () => {
      const { dropdown } = setup(() => false);
      dropdown.isOpen = true;
      dropdown.documentDown({});
      expect(dropdown.isOpen).toBe(false);
    });

    it('stays open when the target is inside the host', () => {
      const { dropdown } = setup(() => true);
      dropdown.isOpen = true;
      dropdown.documentDown({});
      expect(dropdown.isOpen).toBe(true);
    });

    it('does not inspect the target while closed', () => {
      const contains = vi.fn(() => false);
      const { dropdown } = setup(contains);
      dropdown.documentDown({});
      expect(contains).not.toHaveBeenCalled();
    });
  });

  describe('switch overlay popover', () => {
    it('shows the popover once the overlay element exists', () => {
      const { dropdown, harness } = setup();
      const togglePopover = vi.fn();
      dropdown.replaceOverlay(togglePopover);
      harness.flush();
      expect(togglePopover).toHaveBeenCalledWith(true);
    });

    it('tolerates browsers without the popover api', () => {
      const { dropdown, harness } = setup();
      dropdown.replaceOverlay(undefined);
      expect(() => harness.flush()).not.toThrow();
    });

    it('tolerates a missing overlay element', () => {
      const { harness } = setup();
      expect(() => harness.flush()).not.toThrow();
    });
  });

  describe('selecting an app', () => {
    const stubWindow = () => {
      const assign = vi.fn();
      const setTimeout = vi.fn((fn: () => void) => fn());
      vi.stubGlobal('window', { location: { assign }, setTimeout });
      return { assign, setTimeout };
    };

    it('closes the menu, cancels the link and navigates in the same tab', () => {
      const { dropdown } = setup();
      const win = stubWindow();
      dropdown.isOpen = true;
      const event = dropdown.select(apps[2]);
      expect(dropdown.isOpen).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(win.assign).toHaveBeenCalledWith('https://sb.test');
    });

    it('shows the switching overlay after a delay', () => {
      const { dropdown } = setup();
      const win = stubWindow();
      win.setTimeout.mockImplementation(() => 1);
      dropdown.select(apps[0]);
      expect(win.setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
      expect(dropdown.overlayApp).toBeNull();
      win.setTimeout.mock.calls[0][0]();
      expect(dropdown.overlayApp).toBe(apps[0]);
    });

    it('does nothing more when selecting the current app', () => {
      const { dropdown } = setup();
      const win = stubWindow();
      dropdown.isOpen = true;
      const event = dropdown.select(apps[1]);
      expect(dropdown.isOpen).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(win.assign).not.toHaveBeenCalled();
      expect(win.setTimeout).not.toHaveBeenCalled();
    });

    it('lets the browser open apps flagged as new tab', () => {
      const { dropdown } = setup();
      const win = stubWindow();
      const event = dropdown.select({ ...apps[0], newTab: true });
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(win.assign).not.toHaveBeenCalled();
    });

    it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey'] as const)(
      'lets the browser handle a %s click',
      (modifier) => {
        const { dropdown } = setup();
        const win = stubWindow();
        dropdown.isOpen = true;
        const event = dropdown.select(apps[0], { [modifier]: true });
        expect(dropdown.isOpen).toBe(false);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(win.assign).not.toHaveBeenCalled();
      },
    );

    it('cancels the click but does not navigate without a window', () => {
      const { dropdown } = setup();
      const event = dropdown.select(apps[0]);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(dropdown.overlayApp).toBeNull();
    });
  });
});
