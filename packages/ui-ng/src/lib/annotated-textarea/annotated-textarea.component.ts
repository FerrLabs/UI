import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface TextareaDiagnostic {
  readonly line: number;
  readonly from: number;
  readonly to: number;
  readonly message: string;
  readonly severity?: 'error' | 'warning';
}

interface Segment {
  readonly text: string;
  readonly diagnostic?: TextareaDiagnostic;
}

interface Bubble {
  readonly message: string;
  readonly severity: 'error' | 'warning';
  readonly left: number;
  readonly anchorTop: number;
  readonly anchorBottom: number;
  readonly below: boolean;
}

const BUBBLE_GAP = 6;

function caretRect(mark: HTMLElement, offset: number): DOMRect | undefined {
  const node = mark.firstChild;
  if (!node || node.nodeType !== Node.TEXT_NODE) return mark.getClientRects()[0];

  const range = document.createRange();
  const at = Math.min(Math.max(offset, 0), node.textContent?.length ?? 0);
  range.setStart(node, at);
  range.setEnd(node, at);
  const rect = range.getBoundingClientRect();
  return rect.height > 0 ? rect : mark.getClientRects()[0];
}

let sequence = 0;

function lineOffsets(value: string): number[] {
  const offsets = [0];
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '\n') offsets.push(i + 1);
  }
  return offsets;
}

function segmentsFor(value: string, diagnostics: readonly TextareaDiagnostic[]): Segment[] {
  const offsets = lineOffsets(value);

  const ranges = diagnostics
    .filter((d) => d.to > d.from && d.line >= 0 && d.line < offsets.length)
    .map((d) => {
      const base = offsets[d.line];
      const lineEnd = d.line + 1 < offsets.length ? offsets[d.line + 1] - 1 : value.length;
      return {
        diagnostic: d,
        start: Math.min(base + d.from, lineEnd),
        end: Math.min(base + d.to, lineEnd),
      };
    })
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) segments.push({ text: value.slice(cursor, range.start) });
    segments.push({ text: value.slice(range.start, range.end), diagnostic: range.diagnostic });
    cursor = range.end;
  }
  if (cursor < value.length) segments.push({ text: value.slice(cursor) });
  return segments;
}

@Component({
  selector: 'flr-annotated-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AnnotatedTextareaComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flr-at" [style]="frameStyles()">
      <pre
        #mirror
        class="flr-at__mirror"
        aria-hidden="true"
      >@for (seg of segments(); track $index) {@if (seg.diagnostic) {<span
            class="flr-at__mark"
            [class.flr-at__mark--warning]="seg.diagnostic.severity === 'warning'"
            >{{ seg.text }}</span
          >} @else {<span>{{ seg.text }}</span>}}</pre>
      <textarea
        #editor
        class="flr-at__editor"
        [rows]="rows_()"
        [value]="value()"
        [attr.placeholder]="placeholder()"
        [attr.name]="name()"
        [attr.id]="textareaId()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-describedby]="describedByAttr()"
        [attr.aria-invalid]="hasErrors() || null"
        [readOnly]="readonly()"
        [required]="required()"
        [disabled]="disabled()"
        (input)="handleInput($event)"
        (scroll)="syncScroll()"
        (mousemove)="probe($event)"
        (mouseleave)="handleMouseLeave()"
        (keyup)="trackCaret()"
        (click)="trackCaret()"
        (focus)="handleFocus()"
        (blur)="handleBlur()"
      ></textarea>
      @if (bubble(); as b) {
        <div
          #bubbleEl
          class="flr-at__bubble"
          [class.flr-at__bubble--warning]="b.severity === 'warning'"
          [class.flr-at__bubble--below]="b.below"
          [style.left.px]="b.left"
          [style.top.px]="bubbleTop(b)"
          aria-hidden="true"
        >
          {{ b.message }}
        </div>
      }
    </div>
    <p class="flr-at__sr" role="status">{{ srSummary() }}</p>
    <ul class="flr-at__sr" [id]="listId">
      @for (d of shown(); track $index) {
        <li>Line {{ d.line + 1 }}: {{ d.message }}</li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-at {
      position: relative;
      border-radius: 8px;
      overflow: visible;
      transition:
        border-color 140ms,
        box-shadow 140ms;
    }
    .flr-at__mirror,
    .flr-at__editor {
      margin: 0;
      padding: 10px 12px;
      border: 0;
      font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
      font-size: 13px;
      line-height: 1.6;
      letter-spacing: normal;
      tab-size: 2;
      white-space: pre-wrap;
      overflow-wrap: break-word;
      word-break: normal;
      scrollbar-gutter: stable;
    }
    .flr-at__mirror {
      position: absolute;
      inset: 0;
      overflow: hidden;
      color: transparent;
      pointer-events: none;
      user-select: none;
    }
    .flr-at__mark {
      text-decoration-line: underline;
      text-decoration-style: wavy;
      text-decoration-thickness: 1px;
      text-underline-offset: 3px;
      text-decoration-color: var(--color-danger, #dc2626);
    }
    .flr-at__mark--warning {
      text-decoration-color: var(--color-warning, #d97706);
    }
    .flr-at__editor {
      position: relative;
      display: block;
      width: 100%;
      box-sizing: border-box;
      background: transparent;
      color: var(--color-ink, #1e293b);
      caret-color: var(--color-ink, #1e293b);
      outline: none;
      resize: vertical;
    }
    .flr-at__bubble {
      position: absolute;
      z-index: 2;
      max-width: 34ch;
      padding: 6px 9px;
      transform: translateY(-100%);
      border-radius: 6px;
      background: var(--color-ink, #1e293b);
      color: var(--color-paper, #faf7f2);
      font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
      font-size: 12px;
      line-height: 1.4;
      pointer-events: none;
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.22);
    }
    .flr-at__bubble--below {
      transform: none;
    }
    .flr-at__bubble--warning {
      background: var(--color-warning, #d97706);
      color: #ffffff;
    }
    .flr-at__sr {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
})
export class AnnotatedTextareaComponent implements ControlValueAccessor {
  readonly diagnostics = input<readonly TextareaDiagnostic[]>([]);
  readonly rows_ = input(8, { alias: 'rows' });
  readonly placeholder = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly readonly = input(false);
  readonly required = input(false);
  readonly textareaId = input<string | null>(null, { alias: 'id' });
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });
  readonly describedBy = input<string | null>(null, { alias: 'aria-describedby' });

  private readonly bubbleEl = viewChild<ElementRef<HTMLElement>>('bubbleEl');
  private readonly mirror = viewChild.required<ElementRef<HTMLPreElement>>('mirror');
  private readonly editor = viewChild.required<ElementRef<HTMLTextAreaElement>>('editor');

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly focused = signal(false);
  protected readonly bubble = signal<Bubble | null>(null);

  protected readonly segments = computed(() => segmentsFor(this.value(), this.diagnostics()));

  protected readonly listId = `flr-at-diagnostics-${++sequence}`;

  protected readonly shown = computed(() => {
    const seen = new Set<TextareaDiagnostic>();
    for (const seg of this.segments()) {
      if (seg.diagnostic) seen.add(seg.diagnostic);
    }
    return [...seen];
  });

  protected readonly hasErrors = computed(() => this.shown().some((d) => d.severity !== 'warning'));

  protected readonly describedByAttr = computed(() => {
    const outer = this.describedBy();
    return outer ? `${outer} ${this.listId}` : this.listId;
  });

  protected readonly srSummary = computed(() => {
    const count = this.shown().length;
    if (count === 0) return '';
    return count === 1 ? '1 problem found' : `${count} problems found`;
  });

  protected readonly frameStyles = computed<Record<string, string | null>>(() => {
    const border = this.hasErrors()
      ? 'var(--color-danger, #dc2626)'
      : this.focused()
        ? 'var(--color-accent, var(--color-ink, #1e293b))'
        : 'var(--color-rule-strong, rgba(30, 41, 59, 0.28))';
    const ring = this.hasErrors()
      ? 'color-mix(in oklab, var(--color-danger, #dc2626) 25%, transparent)'
      : 'color-mix(in oklab, var(--color-accent, var(--color-ink, #1e293b)) 30%, transparent)';
    return {
      background: this.disabled() ? 'var(--color-paper-2, #f3efe7)' : 'var(--color-card, #ffffff)',
      border: `1px solid ${border}`,
      'box-shadow': this.focused() ? `0 0 0 3px ${ring}` : null,
      opacity: this.disabled() ? '0.65' : '1',
    };
  });

  private frame = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));

    afterRenderEffect({
      read: () => {
        const current = this.bubble();
        const el = this.bubbleEl()?.nativeElement;
        if (!current || current.below || !el) return;
        if (el.getBoundingClientRect().top >= 0) return;
        this.bubble.set({ ...current, below: true });
      },
    });
  }

  protected bubbleTop(bubble: Bubble): number {
    return bubble.below ? bubble.anchorBottom + BUBBLE_GAP : bubble.anchorTop - BUBBLE_GAP;
  }

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
    queueMicrotask(() => this.syncScroll());
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const next = (event.target as HTMLTextAreaElement).value;
    this.value.set(next);
    this.onChange(next);
    this.bubble.set(null);
    this.syncScroll();
    this.trackCaret();
  }

  protected handleFocus(): void {
    this.focused.set(true);
    this.trackCaret();
  }

  protected handleMouseLeave(): void {
    this.showCaretBubble();
  }

  protected trackCaret(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.showCaretBubble());
  }

  protected handleBlur(): void {
    this.focused.set(false);
    this.bubble.set(null);
    this.onTouched();
  }

  protected syncScroll(): void {
    const from = this.editor().nativeElement;
    const to = this.mirror().nativeElement;
    to.scrollTop = from.scrollTop;
    to.scrollLeft = from.scrollLeft;
  }

  protected probe(event: MouseEvent): void {
    const marks = this.mirror().nativeElement.querySelectorAll<HTMLElement>('.flr-at__mark');
    if (marks.length === 0) {
      if (this.bubble()) this.bubble.set(null);
      return;
    }

    const frame = this.mirror().nativeElement.parentElement;
    if (!frame) return;
    const frameRect = frame.getBoundingClientRect();

    for (let i = 0; i < marks.length; i++) {
      const mark = marks[i];
      const rect = Array.from(mark.getClientRects()).find(
        (r) =>
          event.clientX >= r.left &&
          event.clientX <= r.right &&
          event.clientY >= r.top &&
          event.clientY <= r.bottom,
      );
      if (!rect) continue;

      const hit = this.markAt(i);
      if (!hit) return;
      this.placeBubble(hit, rect, frameRect);
      return;
    }

    this.showCaretBubble();
  }

  private showCaretBubble(): void {
    if (!this.focused()) {
      if (this.bubble()) this.bubble.set(null);
      return;
    }

    const caret = this.editor().nativeElement.selectionStart ?? 0;
    const at = this.markIndexAt(caret);
    const frame = this.mirror().nativeElement.parentElement;
    const hit = at ? this.markAt(at.index) : undefined;
    if (!at || !hit || !frame) {
      if (this.bubble()) this.bubble.set(null);
      return;
    }

    const marks = this.mirror().nativeElement.querySelectorAll<HTMLElement>('.flr-at__mark');
    const mark = marks[at.index];
    const rect = mark ? caretRect(mark, caret - at.start) : undefined;
    if (!rect) {
      if (this.bubble()) this.bubble.set(null);
      return;
    }

    this.placeBubble(hit, rect, frame.getBoundingClientRect());
  }

  private placeBubble(hit: TextareaDiagnostic, rect: DOMRect, frameRect: DOMRect): void {
    const next: Bubble = {
      message: hit.message,
      severity: hit.severity ?? 'error',
      left: rect.left - frameRect.left,
      anchorTop: rect.top - frameRect.top,
      anchorBottom: rect.bottom - frameRect.top,
      below: false,
    };
    const current = this.bubble();
    if (
      !current ||
      current.message !== next.message ||
      current.left !== next.left ||
      current.anchorTop !== next.anchorTop ||
      current.anchorBottom !== next.anchorBottom
    ) {
      this.bubble.set(next);
    }
  }

  private markIndexAt(caret: number): { index: number; start: number } | null {
    let offset = 0;
    let index = 0;
    for (const seg of this.segments()) {
      const end = offset + seg.text.length;
      if (seg.diagnostic) {
        if (caret >= offset && caret <= end) return { index, start: offset };
        index++;
      }
      offset = end;
    }
    return null;
  }

  private markAt(index: number): TextareaDiagnostic | undefined {
    let seen = 0;
    for (const seg of this.segments()) {
      if (!seg.diagnostic) continue;
      if (seen === index) return seg.diagnostic;
      seen++;
    }
    return undefined;
  }
}
