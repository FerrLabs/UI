import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  input,
} from '@angular/core';
import { TABS_STRIP, type TabsMode, type TabsStrip, type TabsStripItem } from './tabs.model';
import { TabComponent } from './tab.component';

@Component({
  selector: 'flr-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
  providers: [{ provide: TABS_STRIP, useExisting: forwardRef(() => TabsComponent) }],
})
export class TabsComponent implements TabsStrip {
  readonly mode = input<TabsMode>('nav');
  readonly ariaLabel = input<string | null>(null);

  private readonly tabs = contentChildren(TabComponent, { descendants: true });

  protected readonly role = computed(() => {
    if (this.mode() === 'panel') return 'tablist';
    return this.ariaLabel() ? 'navigation' : null;
  });

  isFocusable(tab: TabsStripItem): boolean {
    const reachable = this.tabs().filter((t) => !t.disabled());
    const active = reachable.find((t) => t.active());
    return (active ?? reachable[0]) === tab;
  }

  handleKeydown(event: KeyboardEvent, tab: TabsStripItem): void {
    const reachable = this.tabs().filter((t) => !t.disabled());
    const from = reachable.findIndex((t) => t === tab);
    if (from === -1) return;

    const to = this.nextIndex(event.key, from, reachable.length);
    if (to === null) return;

    event.preventDefault();
    reachable[to].focus();
    reachable[to].selected.emit();
  }

  private nextIndex(key: string, from: number, total: number): number | null {
    switch (key) {
      case 'ArrowRight':
        return (from + 1) % total;
      case 'ArrowLeft':
        return (from - 1 + total) % total;
      case 'Home':
        return 0;
      case 'End':
        return total - 1;
      default:
        return null;
    }
  }
}
