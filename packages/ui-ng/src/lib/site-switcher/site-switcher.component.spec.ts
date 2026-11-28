import { ElementRef } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHarness, setInput } from '../testing/component-harness';
import { SiteSwitcherComponent, type SiteSwitcherItem } from './site-switcher.component';

class Probe extends SiteSwitcherComponent {
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
  get triggerText(): string {
    return this.triggerLabel();
  }
  get triggerMetaText(): string | null {
    return this.triggerMeta();
  }
  get filteredIds(): string[] {
    return this.filtered().map((i) => i.id);
  }
  get activeItem(): SiteSwitcherItem | null {
    return this.active();
  }
  doToggle(): void {
    this.toggle();
  }
  doClose(): void {
    this.close();
  }
  doCreate(): void {
    this.onCreate();
  }
  doSelect(item: SiteSwitcherItem): void {
    this.onSelect(item);
  }
  key(key: string): KeyboardEvent {
    const event = { key, preventDefault: vi.fn() } as unknown as KeyboardEvent;
    this.onInputKey(event);
    return event;
  }
  replaceSearchInput(focus: () => void): void {
    (this as unknown as Record<string, unknown>)['searchInput'] = () => ({
      nativeElement: { focus },
    });
  }
  documentDown(target: unknown): void {
    this.onDocumentDown({ target } as unknown as MouseEvent);
  }
}

const items: SiteSwitcherItem[] = [
  { id: 'a', label: 'Alpha', meta: 'one', searchTerms: 'first' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma', searchTerms: 'ALPHA-ish' },
];

function setup(contains = (_: unknown) => false) {
  const harness = createHarness([
    { provide: ElementRef, useValue: { nativeElement: { contains } } },
  ]);
  const site = harness.create(() => new Probe());
  setInput(site.items, items);
  return { site, harness };
}

describe('SiteSwitcherComponent', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  describe('trigger', () => {
    it('shows the placeholder without an active site', () => {
      const { site } = setup();
      expect(site.triggerText).toBe('Select site');
      expect(site.triggerMetaText).toBeNull();
    });

    it('shows the active site label and meta', () => {
      const { site } = setup();
      setInput(site.activeId, 'a');
      expect(site.triggerText).toBe('Alpha');
      expect(site.triggerMetaText).toBe('one');
    });

    it('hides the meta when showTriggerMeta is off', () => {
      const { site } = setup();
      setInput(site.activeId, 'a');
      setInput(site.showTriggerMeta, false);
      expect(site.triggerMetaText).toBeNull();
    });

    it('falls back to the placeholder when the active id is unknown', () => {
      const { site } = setup();
      setInput(site.activeId, 'zzz');
      expect(site.activeItem).toBeNull();
      expect(site.triggerText).toBe('Select site');
    });
  });

  describe('filtering', () => {
    it('returns every item for a blank query', () => {
      const { site } = setup();
      site.queryValue = '   ';
      expect(site.filteredIds).toEqual(['a', 'b', 'c']);
    });

    it('matches labels and search terms case insensitively', () => {
      const { site } = setup();
      site.queryValue = ' ALPHA ';
      expect(site.filteredIds).toEqual(['a', 'c']);
      site.queryValue = 'first';
      expect(site.filteredIds).toEqual(['a']);
    });

    it('returns nothing when no item matches', () => {
      const { site } = setup();
      site.queryValue = 'nope';
      expect(site.filteredIds).toEqual([]);
    });
  });

  describe('open state', () => {
    it('toggles open and close resets the query', () => {
      const { site } = setup();
      site.doToggle();
      expect(site.isOpen).toBe(true);
      site.queryValue = 'be';
      site.doClose();
      expect(site.isOpen).toBe(false);
      expect(site.queryValue).toBe('');
    });

    it('resets the highlight to the first row when the query changes', () => {
      const { site, harness } = setup();
      site.doToggle();
      harness.flush();
      site.key('ArrowDown');
      expect(site.highlighted).toBe(1);
      site.queryValue = 'a';
      harness.flush();
      expect(site.highlighted).toBe(0);
    });

    it('focuses the search input after opening', () => {
      const { site, harness } = setup();
      const focus = vi.fn();
      site.replaceSearchInput(focus);
      harness.flush();
      vi.runAllTimers();
      expect(focus).not.toHaveBeenCalled();
      site.doToggle();
      harness.flush();
      vi.runAllTimers();
      expect(focus).toHaveBeenCalledOnce();
    });

    it('emits the id and closes on select', () => {
      const { site } = setup();
      const selected: string[] = [];
      site.select.subscribe((id) => selected.push(id));
      site.doToggle();
      site.doSelect(items[1]);
      expect(selected).toEqual(['b']);
      expect(site.isOpen).toBe(false);
    });

    it('emits create and closes', () => {
      const { site } = setup();
      let created = 0;
      site.create.subscribe(() => created++);
      site.doToggle();
      site.doCreate();
      expect(created).toBe(1);
      expect(site.isOpen).toBe(false);
    });
  });

  describe('keyboard', () => {
    it('moves the highlight down but not past the last row', () => {
      const { site } = setup();
      const event = site.key('ArrowDown');
      site.key('ArrowDown');
      site.key('ArrowDown');
      site.key('ArrowDown');
      expect(site.highlighted).toBe(2);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('moves the highlight up but not above the first row', () => {
      const { site } = setup();
      site.key('ArrowDown');
      site.key('ArrowUp');
      site.key('ArrowUp');
      expect(site.highlighted).toBe(0);
    });

    it('keeps the highlight at zero when the list is empty', () => {
      const { site } = setup();
      site.queryValue = 'nope';
      site.key('ArrowDown');
      expect(site.highlighted).toBe(0);
    });

    it('selects the highlighted item on Enter', () => {
      const { site } = setup();
      const selected: string[] = [];
      site.select.subscribe((id) => selected.push(id));
      site.key('ArrowDown');
      const event = site.key('Enter');
      expect(selected).toEqual(['b']);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('does nothing on Enter without a match', () => {
      const { site } = setup();
      const selected: string[] = [];
      site.select.subscribe((id) => selected.push(id));
      site.queryValue = 'nope';
      site.key('Enter');
      expect(selected).toEqual([]);
    });

    it('ignores other keys', () => {
      const { site } = setup();
      const event = site.key('a');
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('outside click', () => {
    it('closes when the target is outside the host', () => {
      const { site } = setup(() => false);
      site.doToggle();
      site.documentDown({});
      expect(site.isOpen).toBe(false);
    });

    it('stays open when the target is inside the host', () => {
      const { site } = setup(() => true);
      site.doToggle();
      site.documentDown({});
      expect(site.isOpen).toBe(true);
    });

    it('ignores the event when already closed', () => {
      const contains = vi.fn(() => false);
      const { site } = setup(contains);
      site.queryValue = 'keep';
      site.documentDown({});
      expect(contains).not.toHaveBeenCalled();
      expect(site.queryValue).toBe('keep');
    });
  });
});
