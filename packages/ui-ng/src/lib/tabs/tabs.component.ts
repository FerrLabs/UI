import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TABS_STRIP, type TabsMode, type TabsStrip, type TabsStripItem } from './tabs.model';
import { TabComponent } from './tab.component';
import {
  centeredScrollLeft,
  fadeEdges,
  focusScrollLeft,
  scrollBehavior,
  shouldReveal,
  type StripGeometry,
} from './tabs-scroll';

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

  private readonly strip = viewChild.required<ElementRef<HTMLElement>>('strip');
  private readonly activeTab = computed(() => this.tabs().find((t) => t.active()));
  private placed = false;
  private userScrolled = false;
  private geometry: StripGeometry | null = null;
  private observer: ResizeObserver | undefined;

  protected readonly fadeStart = signal(false);
  protected readonly fadeEnd = signal(false);

  protected readonly role = computed(() => {
    if (this.mode() === 'panel') return 'tablist';
    return this.ariaLabel() ? 'navigation' : null;
  });

  constructor() {
    afterRenderEffect(() => {
      this.activeTab();
      this.mode();
      this.userScrolled = false;
      this.revealActive(this.placed);
      this.placed = true;
    });

    afterRenderEffect(() => this.observeLayout(this.tabs()));

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.observer = new ResizeObserver(() => this.settleLayout());
      this.observeLayout(this.tabs());
      destroyRef.onDestroy(() => this.observer?.disconnect());
    });
  }

  protected updateFade(): void {
    const { scrollLeft, clientWidth, scrollWidth } = this.strip().nativeElement;
    const { start, end } = fadeEdges(scrollLeft, clientWidth, scrollWidth);
    this.fadeStart.set(start);
    this.fadeEnd.set(end);
  }

  protected markUserScrolled(): void {
    this.userScrolled = true;
  }

  protected keepFocusVisible(event: FocusEvent): void {
    if (this.mode() !== 'nav' || !(event.target instanceof Node)) return;
    const target = event.target;
    const element = this.tabs()
      .map((tab) => tab.element())
      .find((el) => el?.contains(target));
    if (!element) return;
    const strip = this.strip().nativeElement;
    const left = focusScrollLeft(
      strip.scrollLeft,
      element.getBoundingClientRect(),
      strip.getBoundingClientRect(),
    );
    if (left !== null) {
      strip.scrollTo({ left, behavior: scrollBehavior(prefersReducedMotion(), true) });
    }
  }

  private observeLayout(tabs: readonly TabsStripItem[]): void {
    const observer = this.observer;
    if (!observer) return;
    observer.disconnect();
    observer.observe(this.strip().nativeElement);
    for (const tab of tabs) {
      const element = tab.element();
      if (element) observer.observe(element);
    }
  }

  private settleLayout(): void {
    const { clientWidth, scrollWidth } = this.strip().nativeElement;
    const next = { clientWidth, scrollWidth };
    if (shouldReveal(this.geometry, next, this.userScrolled)) this.revealActive(false);
    this.geometry = next;
    this.updateFade();
  }

  private revealActive(animate: boolean): void {
    const active = this.activeTab();
    if (this.mode() === 'nav' && active) this.scrollToActive(active, animate);
    this.updateFade();
  }

  private scrollToActive(tab: TabsStripItem, animate: boolean): void {
    const element = tab.element();
    if (!element) return;
    const strip = this.strip().nativeElement;
    const left = centeredScrollLeft(
      strip.scrollLeft,
      element.getBoundingClientRect(),
      strip.getBoundingClientRect(),
    );
    strip.scrollTo({ left, behavior: scrollBehavior(prefersReducedMotion(), animate) });
  }

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

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
