import '@angular/compiler';
import { describe, expect, it, vi } from 'vitest';
import { createHarness, setInput } from '../testing/component-harness';
import { SidebarComponent, SidebarItemComponent } from './sidebar.component';

class SidebarProbe extends SidebarComponent {
  get width$(): string {
    return this.widthPx();
  }
  escape(): void {
    this.onEscape();
  }
  replacePanel(querySelector: (selector: string) => unknown): void {
    (this as unknown as Record<string, unknown>)['panel'] = () => ({
      nativeElement: { querySelector },
    });
  }
}

class ItemProbe extends SidebarItemComponent {
  get color(): string {
    return this.accentColor();
  }
  get onDark(): string | null {
    return this.accentOnDark();
  }
  click(event: Partial<MouseEvent>): Partial<MouseEvent> {
    this.handleClick(event as MouseEvent);
    return event;
  }
}

describe('SidebarComponent', () => {
  const create = () => createHarness().create(() => new SidebarProbe());

  it('gives each sidebar a distinct panel id', () => {
    expect(create().panelId).not.toBe(create().panelId);
  });

  it('uses the expanded width, then the collapsed width', () => {
    const sidebar = create();
    expect(sidebar.width$).toBe('256px');
    sidebar.collapsed.set(true);
    expect(sidebar.width$).toBe('64px');
  });

  it('honours custom widths', () => {
    const sidebar = create();
    setInput(sidebar.width, 300);
    setInput(sidebar.collapsedWidth, 48);
    expect(sidebar.width$).toBe('300px');
    sidebar.collapsed.set(true);
    expect(sidebar.width$).toBe('48px');
  });

  describe('escape', () => {
    it('closes an open drawer', () => {
      const sidebar = create();
      sidebar.replacePanel(() => null);
      sidebar.drawerOpen.set(true);
      sidebar.escape();
      expect(sidebar.drawerOpen()).toBe(false);
    });

    it('leaves a closed drawer alone without touching the panel', () => {
      const sidebar = create();
      const querySelector = vi.fn();
      sidebar.replacePanel(querySelector);
      sidebar.escape();
      expect(querySelector).not.toHaveBeenCalled();
      expect(sidebar.drawerOpen()).toBe(false);
    });

    it('keeps the drawer open while an inner popup is expanded', () => {
      const sidebar = create();
      const querySelector = vi.fn(() => ({}));
      sidebar.replacePanel(querySelector);
      sidebar.drawerOpen.set(true);
      sidebar.escape();
      expect(querySelector).toHaveBeenCalledWith('[aria-expanded="true"]');
      expect(sidebar.drawerOpen()).toBe(true);
    });
  });
});

describe('SidebarItemComponent', () => {
  const create = () => {
    const item = createHarness().create(() => new ItemProbe());
    const selected = vi.fn();
    item.selected.subscribe(selected);
    return { item, selected };
  };
  const click = (over: Partial<MouseEvent> = {}) => ({
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    preventDefault: vi.fn(),
    ...over,
  });

  describe('accent', () => {
    it('falls back to the themed accent variable', () => {
      expect(create().item.color).toBe('var(--color-accent, var(--color-ink, #1e293b))');
      expect(create().item.onDark).toBeNull();
    });

    it('uses the supplied accent and derives a readable on-dark color', () => {
      const { item } = create();
      setInput(item.accent, '#1e293b');
      expect(item.color).toBe('#1e293b');
      expect(item.onDark).toBe('#ffffff');
      setInput(item.accent, '#f59e0b');
      expect(item.onDark).toBe('#f59e0b');
    });
  });

  describe('click', () => {
    it('ignores a click on a disabled item and cancels navigation', () => {
      const { item, selected } = create();
      setInput(item.disabled, true);
      setInput(item.href, '/a');
      const event = item.click(click());
      expect(event.preventDefault).toHaveBeenCalled();
      expect(selected).not.toHaveBeenCalled();
    });

    it('emits selected and cancels the native navigation for a link', () => {
      const { item, selected } = create();
      setInput(item.href, '/a');
      const event = item.click(click());
      expect(event.preventDefault).toHaveBeenCalled();
      expect(selected).toHaveBeenCalledOnce();
    });

    it('emits selected without cancelling when there is no href', () => {
      const { item, selected } = create();
      const event = item.click(click());
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(selected).toHaveBeenCalledOnce();
    });

    it.each([
      ['meta', { metaKey: true }],
      ['ctrl', { ctrlKey: true }],
      ['shift', { shiftKey: true }],
      ['middle button', { button: 1 }],
    ])('leaves a %s click on a link to the browser', (_name, init) => {
      const { item, selected } = create();
      setInput(item.href, '/a');
      const event = item.click(click(init));
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(selected).not.toHaveBeenCalled();
    });

    it('still selects a button item on a modified click', () => {
      const { item, selected } = create();
      item.click(click({ metaKey: true }));
      expect(selected).toHaveBeenCalledOnce();
    });
  });
});
