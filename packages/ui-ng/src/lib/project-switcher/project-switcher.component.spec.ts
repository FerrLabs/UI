import '@angular/compiler';
import { ElementRef, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SHELL_CONTEXT } from '../shell/shell-context';
import { createHarness, setInput } from '../testing/component-harness';
import { ProjectSwitcherComponent, type ProjectSwitcherItem } from './project-switcher.component';

class Probe extends ProjectSwitcherComponent {
  get isOpen(): boolean {
    return this.open();
  }
  get queryValue(): string {
    return this.query();
  }
  set queryValue(value: string) {
    this.query.set(value);
  }
  get highlighted(): number {
    return this.highlight();
  }
  get filteredIds(): string[] {
    return this.filtered().map((i) => i.id);
  }
  get icon(): string {
    return this.displayedIcon();
  }
  get label(): string {
    return this.displayedLabel();
  }
  get meta(): string {
    return this.displayedMeta();
  }
  get isCompact(): boolean {
    return this.compact();
  }
  get letter(): string {
    return this.monogram();
  }
  trusted(markup: string | undefined): SafeHtml | null {
    return this.trustedIcon(markup);
  }
  doToggle(): void {
    this.toggle();
  }
  doClose(): void {
    this.close();
  }
  doSelect(item: ProjectSwitcherItem): void {
    this.onSelect(item);
  }
  doCreate(): void {
    this.onCreate();
  }
  doViewAll(): void {
    this.onViewAll();
  }
  key(key: string): KeyboardEvent {
    const event = { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
    this.onInputKey(event);
    return event;
  }
  documentDown(target: unknown): void {
    this.onDocumentDown({ target } as unknown as MouseEvent);
  }
  replaceSearchInput(focus: () => void): void {
    (this as unknown as Record<string, unknown>)['searchInput'] = () => ({
      nativeElement: { focus },
    });
  }
}

const trustedHtml = (markup: string) => ({ trusted: markup }) as unknown as SafeHtml;

const items: ProjectSwitcherItem[] = [
  { id: 'a', label: 'Alpha', searchTerms: 'first' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma', searchTerms: 'ALPHA-ish' },
];

function setup(options: { contains?: (t: unknown) => boolean; shellCollapsed?: boolean } = {}) {
  const providers: { provide: unknown; useValue: unknown }[] = [
    {
      provide: ElementRef,
      useValue: { nativeElement: { contains: options.contains ?? (() => false) } },
    },
    { provide: DomSanitizer, useValue: { bypassSecurityTrustHtml: trustedHtml } },
  ];
  if (options.shellCollapsed !== undefined) {
    providers.push({
      provide: SHELL_CONTEXT,
      useValue: { collapsed: signal(options.shellCollapsed) },
    });
  }
  const harness = createHarness(providers as never);
  const projects = harness.create(() => new Probe());
  setInput(projects.items, items);
  return { projects, harness };
}

describe('ProjectSwitcherComponent', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  describe('displayed trigger', () => {
    it('uses the current project', () => {
      const { projects } = setup();
      setInput(projects.current, { id: 'x', label: 'Current', icon: 'C!', meta: 'm' });
      setInput(projects.placeholder, { label: 'Placeholder', icon: 'P', meta: 'pm' });
      expect([projects.label, projects.icon, projects.meta]).toEqual(['Current', 'C!', 'm']);
    });

    it('falls back to the placeholder field by field', () => {
      const { projects } = setup();
      setInput(projects.current, { id: 'x', label: 'Current' });
      setInput(projects.placeholder, { label: 'Placeholder', icon: 'P', meta: 'pm' });
      expect([projects.label, projects.icon, projects.meta]).toEqual(['Current', 'P', 'pm']);
    });

    it('uses a generic label and empty icon and meta without any source', () => {
      const { projects } = setup();
      expect([projects.label, projects.icon, projects.meta]).toEqual(['All items', '', '']);
    });

    it('uses the placeholder when nothing is current', () => {
      const { projects } = setup();
      setInput(projects.placeholder, { label: 'Everything' });
      expect(projects.label).toBe('Everything');
    });
  });

  describe('monogram', () => {
    it.each([
      ['alpha', 'A'],
      ['  beta', 'B'],
      ['école', 'É'],
      ['😀 smile', '😀'],
      ['', ''],
    ])('derives the first letter of %j', (label, expected) => {
      const { projects } = setup();
      setInput(projects.current, { id: 'x', label });
      expect(projects.letter).toBe(expected);
    });
  });

  describe('compact', () => {
    it('is compact only for the brand variant inside a collapsed shell', () => {
      const { projects } = setup({ shellCollapsed: true });
      expect(projects.isCompact).toBe(false);
      setInput(projects.variant, 'brand');
      expect(projects.isCompact).toBe(true);
    });

    it('is not compact when the shell is expanded or absent', () => {
      const withShell = setup({ shellCollapsed: false }).projects;
      setInput(withShell.variant, 'brand');
      expect(withShell.isCompact).toBe(false);
      const withoutShell = setup().projects;
      setInput(withoutShell.variant, 'brand');
      expect(withoutShell.isCompact).toBe(false);
    });
  });

  describe('trusted icon', () => {
    it('trusts svg markup', () => {
      const { projects } = setup();
      const svg = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';
      expect(projects.trusted(svg)).toEqual(trustedHtml(svg));
    });

    it.each([undefined, '', '⚙', '<svg onload="x()"></svg>', '<img src=x>'])(
      'keeps %j as text',
      (markup) => {
        expect(setup().projects.trusted(markup)).toBeNull();
      },
    );
  });

  describe('filtering', () => {
    it('returns all items for a blank query', () => {
      const { projects } = setup();
      projects.queryValue = '  ';
      expect(projects.filteredIds).toEqual(['a', 'b', 'c']);
    });

    it('matches label and search terms case insensitively', () => {
      const { projects } = setup();
      projects.queryValue = ' ALPHA';
      expect(projects.filteredIds).toEqual(['a', 'c']);
      projects.queryValue = 'FIRST';
      expect(projects.filteredIds).toEqual(['a']);
    });

    it('matches nothing for an unknown query', () => {
      const { projects } = setup();
      projects.queryValue = 'zzz';
      expect(projects.filteredIds).toEqual([]);
    });
  });

  describe('open state and outputs', () => {
    it('toggles, and close clears the query', () => {
      const { projects } = setup();
      projects.doToggle();
      projects.queryValue = 'be';
      expect(projects.isOpen).toBe(true);
      projects.doClose();
      expect(projects.isOpen).toBe(false);
      expect(projects.queryValue).toBe('');
    });

    it('emits the selected id then closes', () => {
      const { projects } = setup();
      const ids: string[] = [];
      projects.selectItem.subscribe((id) => ids.push(id));
      projects.doToggle();
      projects.doSelect(items[2]);
      expect(ids).toEqual(['c']);
      expect(projects.isOpen).toBe(false);
    });

    it('emits create then closes', () => {
      const { projects } = setup();
      const created = vi.fn();
      projects.create.subscribe(created);
      projects.doToggle();
      projects.doCreate();
      expect(created).toHaveBeenCalledOnce();
      expect(projects.isOpen).toBe(false);
    });

    it('emits viewAll then closes', () => {
      const { projects } = setup();
      const viewAll = vi.fn();
      projects.viewAll.subscribe(viewAll);
      projects.doToggle();
      projects.doViewAll();
      expect(viewAll).toHaveBeenCalledOnce();
      expect(projects.isOpen).toBe(false);
    });
  });

  describe('effects', () => {
    it('resets the highlight when the query or open state changes', () => {
      const { projects, harness } = setup();
      projects.doToggle();
      harness.flush();
      projects.key('ArrowDown');
      expect(projects.highlighted).toBe(1);
      projects.queryValue = 'a';
      harness.flush();
      expect(projects.highlighted).toBe(0);
    });

    it('focuses the search input after opening', () => {
      const { projects, harness } = setup();
      const focus = vi.fn();
      projects.replaceSearchInput(focus);
      harness.flush();
      vi.runAllTimers();
      expect(focus).not.toHaveBeenCalled();
      projects.doToggle();
      harness.flush();
      expect(focus).not.toHaveBeenCalled();
      vi.runAllTimers();
      expect(focus).toHaveBeenCalledOnce();
    });
  });

  describe('keyboard', () => {
    it('clamps the highlight within the filtered list', () => {
      const { projects } = setup();
      for (let i = 0; i < 5; i++) projects.key('ArrowDown');
      expect(projects.highlighted).toBe(2);
      for (let i = 0; i < 5; i++) projects.key('ArrowUp');
      expect(projects.highlighted).toBe(0);
    });

    it('keeps the highlight at zero for an empty list', () => {
      const { projects } = setup();
      projects.queryValue = 'zzz';
      projects.key('ArrowDown');
      expect(projects.highlighted).toBe(0);
    });

    it('selects the highlighted item on Enter', () => {
      const { projects } = setup();
      const ids: string[] = [];
      projects.selectItem.subscribe((id) => ids.push(id));
      projects.key('ArrowDown');
      const event = projects.key('Enter');
      expect(ids).toEqual(['b']);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does nothing on Enter when nothing matches', () => {
      const { projects } = setup();
      const ids: string[] = [];
      projects.selectItem.subscribe((id) => ids.push(id));
      projects.queryValue = 'zzz';
      projects.key('Enter');
      expect(ids).toEqual([]);
    });

    it('ignores unrelated keys', () => {
      const { projects } = setup();
      expect(projects.key('x').preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('outside click', () => {
    it('closes when the target is outside', () => {
      const { projects } = setup({ contains: () => false });
      projects.doToggle();
      projects.documentDown({});
      expect(projects.isOpen).toBe(false);
    });

    it('stays open when the target is inside', () => {
      const { projects } = setup({ contains: () => true });
      projects.doToggle();
      projects.documentDown({});
      expect(projects.isOpen).toBe(true);
    });

    it('ignores the event while closed', () => {
      const contains = vi.fn(() => false);
      const { projects } = setup({ contains });
      projects.queryValue = 'keep';
      projects.documentDown({});
      expect(contains).not.toHaveBeenCalled();
      expect(projects.queryValue).toBe('keep');
    });
  });
});
