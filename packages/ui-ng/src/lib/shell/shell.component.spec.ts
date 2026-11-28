import '@angular/compiler';
import { BreakpointObserver, type BreakpointState } from '@angular/cdk/layout';
import { OverlayContainer, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { describe, expect, it, vi } from 'vitest';
import { createHarness, setInput } from '../testing/component-harness';
import { ShellComponent, type ShellNavItem } from './shell.component';

class Probe extends ShellComponent {
  get isNavOpen(): boolean {
    return this.navOpen();
  }
  set isNavOpen(value: boolean) {
    this.navOpen.set(value);
  }
  get crumbList() {
    return this.crumbs();
  }
  active(item: ShellNavItem): boolean {
    return this.isActive(item);
  }
  select(item: ShellNavItem): void {
    this.onSelect(item);
  }
  crumbClick(event: Partial<MouseEvent>, href: string): void {
    this.onCrumbClick(event as MouseEvent, href);
  }
  icon(markup: string): SafeHtml | null {
    return this.trustedIcon(markup);
  }
  keydown(event: Partial<KeyboardEvent>): void {
    this.onKeydown(event as KeyboardEvent);
  }
}

class FakeViewport {
  private observers: { next(state: BreakpointState): void }[] = [];

  constructor(private state: BreakpointState) {}

  subscribe(observer: { next(state: BreakpointState): void }) {
    this.observers.push(observer);
    observer.next(this.state);
    return { unsubscribe: () => undefined };
  }

  next(state: BreakpointState): void {
    this.state = state;
    this.observers.forEach((o) => o.next(state));
  }
}

const trusted = (markup: string) => ({ trusted: markup }) as unknown as SafeHtml;

function setup(matches = false) {
  const viewport = new FakeViewport({ matches, breakpoints: {} });
  const scrollBlock = { enable: vi.fn(), disable: vi.fn() };
  const getContainerElement = vi.fn();
  const harness = createHarness([
    { provide: BreakpointObserver, useValue: { observe: () => viewport } },
    { provide: OverlayContainer, useValue: { getContainerElement } },
    { provide: ScrollStrategyOptions, useValue: { block: () => scrollBlock } },
    { provide: DomSanitizer, useValue: { bypassSecurityTrustHtml: trusted } },
  ]);
  const shell = harness.create(() => new Probe());
  harness.flush();
  return { shell, harness, viewport, scrollBlock, getContainerElement };
}

const key = (over: Partial<KeyboardEvent> = {}) => ({
  key: 'k',
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  preventDefault: vi.fn(),
  ...over,
});

describe('ShellComponent', () => {
  describe('rail collapse', () => {
    it('collapses the rail when requested on a wide viewport', () => {
      const { shell } = setup(false);
      expect(shell.railCollapsed()).toBe(false);
      shell.collapsed.set(true);
      expect(shell.railCollapsed()).toBe(true);
    });

    it('never collapses the rail on a narrow viewport', () => {
      const { shell } = setup(true);
      shell.collapsed.set(true);
      expect(shell.railCollapsed()).toBe(false);
    });

    it('reacts to the viewport changing', () => {
      const { shell, viewport } = setup(false);
      shell.collapsed.set(true);
      viewport.next({ matches: true, breakpoints: {} });
      expect(shell.railCollapsed()).toBe(false);
      viewport.next({ matches: false, breakpoints: {} });
      expect(shell.railCollapsed()).toBe(true);
    });
  });

  describe('active item', () => {
    const sections = [
      {
        items: [
          { id: 'home', label: 'Home', href: '/' },
          { id: 'issues', label: 'Issues', href: '/issues' },
          { id: 'action', label: 'Action' },
        ],
      },
    ];

    it('marks the item matching the current path', () => {
      const { shell } = setup();
      setInput(shell.sections, sections);
      setInput(shell.currentPath, '/issues/12');
      expect(shell.active(sections[0].items[1])).toBe(true);
      expect(shell.active(sections[0].items[0])).toBe(false);
    });

    it('never marks an item without href', () => {
      const { shell } = setup();
      setInput(shell.sections, sections);
      expect(shell.active({ id: 'action', label: 'Action' })).toBe(false);
    });
  });

  describe('navigation', () => {
    it('emits the href and closes the drawer on select', () => {
      const { shell } = setup();
      const emitted: string[] = [];
      shell.navigate.subscribe((href) => emitted.push(href));
      shell.isNavOpen = true;
      shell.select({ id: 'a', label: 'A', href: '/a' });
      expect(emitted).toEqual(['/a']);
      expect(shell.isNavOpen).toBe(false);
    });

    it('closes the drawer without emitting for an item without href', () => {
      const { shell } = setup();
      const emitted: string[] = [];
      shell.navigate.subscribe((href) => emitted.push(href));
      shell.isNavOpen = true;
      shell.select({ id: 'a', label: 'A' });
      expect(emitted).toEqual([]);
      expect(shell.isNavOpen).toBe(false);
    });

    it('closes the drawer when the path changes', () => {
      const { shell, harness } = setup();
      shell.isNavOpen = true;
      harness.flush();
      expect(shell.isNavOpen).toBe(true);
      setInput(shell.currentPath, '/next');
      harness.flush();
      expect(shell.isNavOpen).toBe(false);
    });

    it('closes the drawer when the viewport changes', () => {
      const { shell, harness, viewport } = setup(true);
      shell.isNavOpen = true;
      harness.flush();
      viewport.next({ matches: false, breakpoints: {} });
      harness.flush();
      expect(shell.isNavOpen).toBe(false);
    });
  });

  describe('scroll lock', () => {
    it('blocks scrolling while the drawer is open and releases it on close', () => {
      const { shell, harness, scrollBlock, getContainerElement } = setup();
      expect(scrollBlock.enable).not.toHaveBeenCalled();
      shell.isNavOpen = true;
      harness.flush();
      expect(getContainerElement).toHaveBeenCalledOnce();
      expect(scrollBlock.enable).toHaveBeenCalledOnce();
      expect(scrollBlock.disable).not.toHaveBeenCalled();
      shell.isNavOpen = false;
      harness.flush();
      expect(scrollBlock.disable).toHaveBeenCalledOnce();
    });
  });

  describe('breadcrumbs', () => {
    it('resolves the breadcrumb input and flags the last crumb', () => {
      const { shell } = setup();
      setInput(shell.breadcrumb, [{ label: 'A', href: '/a' }, { label: 'B' }]);
      expect(shell.crumbList.map((c) => [c.label, c.last])).toEqual([
        ['A', false],
        ['B', true],
      ]);
    });

    it('emits navigate for a plain left click and cancels the native navigation', () => {
      const { shell } = setup();
      const emitted: string[] = [];
      shell.navigate.subscribe((href) => emitted.push(href));
      const event = { button: 0, preventDefault: vi.fn() };
      shell.crumbClick(event, '/a');
      expect(event.preventDefault).toHaveBeenCalled();
      expect(emitted).toEqual(['/a']);
    });

    it.each([
      ['meta', { button: 0, metaKey: true }],
      ['ctrl', { button: 0, ctrlKey: true }],
      ['shift', { button: 0, shiftKey: true }],
      ['middle button', { button: 1 }],
    ])('leaves a %s click to the browser', (_name, init) => {
      const { shell } = setup();
      const emitted: string[] = [];
      shell.navigate.subscribe((href) => emitted.push(href));
      const event = { preventDefault: vi.fn(), ...init };
      shell.crumbClick(event, '/a');
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(emitted).toEqual([]);
    });
  });

  describe('icons', () => {
    it('trusts svg markup and keeps plain text as text', () => {
      const { shell } = setup();
      const svg = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';
      expect(shell.icon(svg)).toEqual(trusted(svg));
      expect(shell.icon('⚙')).toBeNull();
      expect(shell.icon('<svg onload="x()"></svg>')).toBeNull();
    });
  });

  describe('search shortcut', () => {
    it('does nothing while search is disabled', () => {
      const { shell } = setup();
      let count = 0;
      shell.search.subscribe(() => count++);
      const event = key({ metaKey: true });
      shell.keydown(event);
      expect(count).toBe(0);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it.each([
      ['meta+k', { metaKey: true }],
      ['ctrl+k', { ctrlKey: true }],
      ['meta+K', { metaKey: true, key: 'K' }],
    ])('emits search on %s', (_name, init) => {
      const { shell } = setup();
      setInput(shell.searchEnabled, true);
      let count = 0;
      shell.search.subscribe(() => count++);
      const event = key(init);
      shell.keydown(event);
      expect(count).toBe(1);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it.each([
      ['k alone', {}],
      ['meta+j', { metaKey: true, key: 'j' }],
      ['meta+alt+k', { metaKey: true, altKey: true }],
      ['meta+shift+k', { metaKey: true, shiftKey: true }],
    ])('ignores %s', (_name, init) => {
      const { shell } = setup();
      setInput(shell.searchEnabled, true);
      let count = 0;
      shell.search.subscribe(() => count++);
      const event = key(init);
      shell.keydown(event);
      expect(count).toBe(0);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
