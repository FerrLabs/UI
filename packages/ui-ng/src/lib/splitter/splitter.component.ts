import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  booleanAttribute,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { DragTracker } from './splitter-drag';
import { SPLITTER_HOST, type SplitterHandleState, type SplitterHost } from './splitter-host';
import {
  coerceStackBelow,
  coerceStep,
  defaultRatios,
  DEFAULT_RESET_ANNOUNCEMENT,
  describeHandle,
  describePane,
  describeSize,
  intentDelta,
  isRtl,
  keyIntent,
  layoutSizes,
  pointerDelta,
  ratiosAfterResize,
  resizePair,
  resolveBounds,
  toPercent,
  toRatios,
  toggleTarget,
  type HandleLabeller,
  type PaneBounds,
  type PaneLabeller,
  type SizeAnnouncer,
  type SplitterOrientation,
} from './splitter-model';
import { SplitterPaneComponent } from './splitter-pane.component';
import { defaultStorage, needsRestore, readStored, writeStored } from './splitter-storage';

export interface SplitterResizeEvent {
  readonly sizes: readonly number[];
  readonly ratios: readonly number[];
  readonly collapsed: readonly boolean[];
}

interface DragSession {
  readonly index: number;
  readonly pointerId: number;
  readonly startPosition: number;
  readonly startSizes: readonly number[];
  readonly bounds: readonly PaneBounds[];
  readonly rtl: boolean;
  position: number;
  frame: number | null;
}

const BIG_STEP_FACTOR = 5;
const COLLAPSED_RESTORE_THRESHOLD = 0.001;

@Component({
  selector: 'flr-splitter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './splitter.component.html',
  styleUrl: './splitter.component.css',
  providers: [{ provide: SPLITTER_HOST, useExisting: forwardRef(() => SplitterComponent) }],
  host: {
    '[class.flr-splitter--vertical]': "orientation() === 'vertical'",
    '[class.flr-splitter--stacked]': 'isStacked()',
    '[class.flr-splitter--dragging]': 'dragging()',
  },
})
export class SplitterComponent implements SplitterHost {
  readonly orientation = input<SplitterOrientation>('horizontal');
  readonly stacked = input(false, { transform: booleanAttribute });
  readonly stackBelow = input<number | null, number | string | null | undefined>(null, {
    transform: coerceStackBelow,
  });
  readonly storageKey = input<string | null>(null);
  readonly keyboardStep = input(10, { transform: coerceStep });
  readonly resetAnnouncement = input(DEFAULT_RESET_ANNOUNCEMENT);
  readonly sizeAnnouncement = input<SizeAnnouncer>(describeSize);
  readonly paneLabel = input<PaneLabeller>(describePane);
  readonly resizeLabel = input<HandleLabeller>(describeHandle);
  readonly resizeEnd = output<SplitterResizeEvent>();

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly panes = contentChildren(SplitterPaneComponent);
  private readonly box = signal({ width: 0, height: 0 });
  private readonly userRatios = signal<readonly number[] | null>(null);
  private readonly drag = new DragTracker<DragSession>();
  private restoredKey: string | null = null;

  private readonly draggingState = signal(false);
  readonly dragging = this.draggingState.asReadonly();
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  private readonly total = computed(() =>
    this.orientation() === 'horizontal' ? this.box().width : this.box().height,
  );

  readonly isStacked = computed(() => {
    if (this.orientation() !== 'horizontal') return false;
    const below = this.stackBelow();
    return this.stacked() || (below !== null && this.box().width > 0 && this.box().width < below);
  });

  private readonly collapsedFlags = computed(() => this.panes().map((pane) => pane.isCollapsed()));

  private readonly openBounds = computed(() =>
    this.panes().map((pane) =>
      resolveBounds(
        { minSize: pane.minSize(), maxSize: pane.maxSize(), collapsed: false },
        this.total(),
      ),
    ),
  );

  private readonly bounds = computed(() =>
    this.openBounds().map((open, i) => (this.collapsedFlags()[i] ? { min: 0, max: 0 } : open)),
  );

  private readonly defaults = computed(() =>
    defaultRatios(
      this.panes().map((pane) => pane.defaultSize()),
      this.total(),
    ),
  );

  private readonly ratios = computed(() => {
    const user = this.userRatios();
    return user && user.length === this.panes().length ? user : this.defaults();
  });

  private readonly sizes = computed(() =>
    this.total() > 0 && this.panes().length > 0
      ? layoutSizes(this.ratios(), this.collapsedFlags(), this.bounds(), this.total())
      : [],
  );

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver((entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        const { width, height } = entry.contentRect;
        this.box.set({ width, height });
      });
      observer.observe(this.element);
      destroyRef.onDestroy(() => observer.disconnect());
    });
    destroyRef.onDestroy(() => this.cancelFrame(this.drag.current));

    effect(() => {
      const count = this.panes().length;
      const key = this.storageKey();
      if (count === 0 || key === null || !needsRestore(this.restoredKey, key)) return;
      untracked(() => this.restore(key, count));
    });

    effect(() => {
      this.isStacked();
      this.panes();
      untracked(() => this.abortDrag());
    });
  }

  indexOf(pane: unknown): number {
    return this.panes().indexOf(pane as SplitterPaneComponent);
  }

  isLast(pane: unknown): boolean {
    return this.indexOf(pane) === this.panes().length - 1;
  }

  flexFor(pane: unknown): string {
    if (this.isStacked()) return '1 1 auto';
    const index = this.indexOf(pane);
    const size = this.sizes()[index];
    return size === undefined ? `${this.ratios()[index] ?? 1} 1 0%` : `0 0 ${size}px`;
  }

  handleState(pane: unknown): SplitterHandleState {
    const index = this.indexOf(pane);
    const total = this.total();
    const open = this.openBounds()[index];
    const collapsed = this.panes()[index]?.isCollapsed() ?? false;
    return {
      valueNow: toPercent(this.sizes()[index] ?? 0, total),
      valueMin: collapsed || !open ? 0 : toPercent(open.min, total),
      valueMax: !open || open.max === Infinity ? 100 : toPercent(open.max, total),
    };
  }

  startDrag(index: number, event: PointerEvent): void {
    if (event.button !== 0 || this.sizes().length === 0) return;
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    handle.focus({ preventScroll: true });
    event.preventDefault();
    const position = this.axisPosition(event);
    this.drag.begin({
      index,
      pointerId: event.pointerId,
      startPosition: position,
      startSizes: this.sizes(),
      bounds: this.bounds(),
      rtl: this.readRtl(),
      position,
      frame: null,
    });
    this.draggingState.set(true);
  }

  moveDrag(event: PointerEvent): void {
    const drag = this.drag.current;
    if (drag?.pointerId !== event.pointerId) return;
    drag.position = this.axisPosition(event);
    drag.frame ??= requestAnimationFrame(() => this.applyDrag(drag));
  }

  endDrag(event: PointerEvent): void {
    const drag = this.drag.end(event.pointerId);
    if (!drag) return;
    this.cancelFrame(drag);
    this.applyDrag(drag);
    this.draggingState.set(false);
    const handle = event.currentTarget as HTMLElement;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    this.finish(drag.index);
  }

  handleKeydown(index: number, event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Enter') {
      this.toggleFromHandle(index, event);
      return;
    }
    const step = this.keyboardStep() * (event.shiftKey ? BIG_STEP_FACTOR : 1);
    const intent = keyIntent(event.key, this.orientation(), this.readRtl(), step);
    const sizes = this.sizes();
    if (intent === null || sizes.length === 0) return;
    event.preventDefault();
    this.commit(resizePair(sizes, index, intentDelta(intent), this.bounds()));
    this.finish(index);
  }

  reset(): void {
    this.panes().forEach((pane) => pane.collapsed.set(false));
    this.userRatios.set(null);
    this.finish(null);
  }

  private toggleFromHandle(index: number, event: KeyboardEvent): void {
    const panes = this.panes();
    const target = toggleTarget(
      index,
      panes.map((pane) => pane.collapsible()),
      this.collapsedFlags(),
    );
    if (target === null) return;
    event.preventDefault();
    const pane = panes[target];
    if (pane.isCollapsed()) this.restoreRatio(target);
    pane.collapsed.set(!pane.isCollapsed());
    this.finish(target);
  }

  private restoreRatio(index: number): void {
    const ratios = this.ratios();
    if (ratios[index] > COLLAPSED_RESTORE_THRESHOLD) return;
    this.userRatios.set(ratios.map((ratio, i) => (i === index ? this.defaults()[i] : ratio)));
  }

  private applyDrag(drag: DragSession): void {
    drag.frame = null;
    const delta = pointerDelta(this.orientation(), drag.rtl, drag.startPosition, drag.position);
    this.commit(resizePair(drag.startSizes, drag.index, delta, drag.bounds));
  }

  private abortDrag(): void {
    const drag = this.drag.abort();
    if (!drag) return;
    this.cancelFrame(drag);
    this.draggingState.set(false);
  }

  private cancelFrame(drag: DragSession | null): void {
    if (drag?.frame == null) return;
    cancelAnimationFrame(drag.frame);
    drag.frame = null;
  }

  private commit(sizes: readonly number[]): void {
    this.userRatios.set(
      ratiosAfterResize(this.ratios(), sizes, this.collapsedFlags(), this.total()),
    );
  }

  private finish(announcedIndex: number | null): void {
    const key = this.storageKey();
    if (key !== null) {
      writeStored(defaultStorage(), key, {
        ratios: this.ratios(),
        collapsed: this.collapsedFlags(),
      });
    }
    this.resizeEnd.emit({
      sizes: this.sizes(),
      ratios: toRatios(this.sizes(), this.total()),
      collapsed: this.collapsedFlags(),
    });
    this.announce(announcedIndex);
  }

  private announce(index: number | null): void {
    if (index === null) {
      this.liveAnnouncer.announce(this.resetAnnouncement(), 'polite');
      return;
    }
    const pane = this.panes()[index];
    if (!pane) return;
    const percent = toPercent(this.sizes()[index] ?? 0, this.total());
    this.liveAnnouncer.announce(
      this.sizeAnnouncement()(pane.displayLabel(), percent, pane.isCollapsed()),
      'polite',
    );
  }

  private restore(key: string, count: number): void {
    const stored = readStored(defaultStorage(), key, count);
    if (!stored) return;
    this.restoredKey = key;
    this.userRatios.set(stored.ratios);
    this.panes().forEach((pane, i) => {
      if (pane.collapsible()) pane.collapsed.set(stored.collapsed[i]);
    });
  }

  private axisPosition(event: PointerEvent): number {
    return this.orientation() === 'horizontal' ? event.clientX : event.clientY;
  }

  private readRtl(): boolean {
    return isRtl(getComputedStyle(this.element).direction);
  }
}
