import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
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
  readonly top: number;
}

function lineOffsets(value: string): number[] {
  const offsets = [0];
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '\n') offsets.push(i + 1);
  }
  return offsets;
}

/**
 * Flatten the diagnostics into one ordered list of runs over the whole value,
 * newlines included in the plain runs.
 *
 * Deliberately flat rather than grouped per line: the newlines then travel
 * inside interpolated values, which Angular does not touch, instead of as
 * template whitespace, which it collapses by default. Grouping per line is the
 * version that renders correctly in a unit test and misaligns in the browser.
 */
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

/**
 * Textarea that draws diagnostics under the text it is describing, rather than
 * listing them somewhere else on the page.
 *
 * A textarea cannot decorate its own content, so this renders a mirror layer
 * behind a transparent-background textarea: same box, same typography, the
 * mirror's glyphs invisible and only its underlines showing. Both layers are
 * declared here on purpose. An overlay built on top of a textarea from outside
 * has to guess that typography and silently misaligns when it changes; owning
 * both sides is what makes the alignment hold.
 *
 * Hover is hit-tested against the rendered underline rectangles instead of
 * relying on pointer events, because the textarea sits on top and takes them
 * all. Reading the real layout also means no font-metric arithmetic.
 */
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
        [attr.aria-describedby]="describedBy()"
        [attr.aria-invalid]="hasErrors() || null"
        [readOnly]="readonly()"
        [required]="required()"
        [disabled]="disabled()"
        (input)="handleInput($event)"
        (scroll)="syncScroll()"
        (mousemove)="probe($event)"
        (mouseleave)="bubble.set(null)"
        (focus)="focused.set(true)"
        (blur)="handleBlur()"
      ></textarea>
      @if (bubble(); as b) {
        <div
          class="flr-at__bubble"
          [class.flr-at__bubble--warning]="b.severity === 'warning'"
          [style.left.px]="b.left"
          [style.top.px]="b.top"
          role="status"
        >
          {{ b.message }}
        </div>
      }
    </div>
    <p class="flr-at__sr" role="status">{{ srSummary() }}</p>
  `,
  styles: `
    :host {
      display: block;
    }
    .flr-at {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
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

  private readonly mirror = viewChild.required<ElementRef<HTMLPreElement>>('mirror');
  private readonly editor = viewChild.required<ElementRef<HTMLTextAreaElement>>('editor');

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly focused = signal(false);
  protected readonly bubble = signal<Bubble | null>(null);

  protected readonly segments = computed(() => segmentsFor(this.value(), this.diagnostics()));

  protected readonly hasErrors = computed(() =>
    this.diagnostics().some((d) => d.severity !== 'warning'),
  );

  protected readonly srSummary = computed(() => {
    const count = this.diagnostics().length;
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
      const rect = mark.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inside) continue;

      const hit = this.markAt(i);
      if (!hit) return;
      const next: Bubble = {
        message: hit.message,
        severity: hit.severity ?? 'error',
        left: rect.left - frameRect.left,
        top: rect.top - frameRect.top - 6,
      };
      const current = this.bubble();
      if (!current || current.message !== next.message || current.top !== next.top) {
        this.bubble.set(next);
      }
      return;
    }

    if (this.bubble()) this.bubble.set(null);
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
