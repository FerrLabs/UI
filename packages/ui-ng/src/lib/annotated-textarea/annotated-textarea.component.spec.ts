import '@angular/compiler';
import {
  createEnvironmentInjector,
  provideZonelessChangeDetection,
  runInInjectionContext,
  ɵINJECTOR_SCOPE,
  type EnvironmentInjector,
  type InputSignalWithTransform,
} from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AnnotatedTextareaComponent,
  type TextareaDiagnostic,
} from './annotated-textarea.component';

type InputNode<W> = { applyValueToInputSignal(node: unknown, value: W): void };

function setInput<T, W>(input: InputSignalWithTransform<T, W>, value: W): void {
  const node = (input as unknown as Record<symbol, InputNode<W>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

function withNode(run: () => void): void {
  vi.stubGlobal('Node', { TEXT_NODE: 3 });
  try {
    run();
  } finally {
    Reflect.deleteProperty(globalThis, 'Node');
  }
}

class AnnotatedProbe extends AnnotatedTextareaComponent {
  get currentValue() {
    return this.value();
  }
  get currentSegments() {
    return this.segments();
  }
  get shownDiagnostics() {
    return this.shown();
  }
  get errors() {
    return this.hasErrors();
  }
  get describedByValue() {
    return this.describedByAttr();
  }
  get summary() {
    return this.srSummary();
  }
  get frameCss() {
    return this.frameStyles();
  }
  get id() {
    return this.listId;
  }
  get isFocused() {
    return this.focused();
  }
  get isDisabled() {
    return this.disabled();
  }
  get currentBubble() {
    return this.bubble();
  }
  topOf(bubble: Parameters<AnnotatedTextareaComponent['bubbleTop']>[0]) {
    return this.bubbleTop(bubble);
  }
  hover(event: Partial<MouseEvent>) {
    withNode(() => this.probe(event as MouseEvent));
  }
  showCaret() {
    withNode(() => this['showCaretBubble']());
  }
  leave() {
    this.handleMouseLeave();
  }
  track() {
    this.trackCaret();
  }
  scrollSync() {
    this.syncScroll();
  }
  type(value: string) {
    this.handleInput({ target: { value } } as unknown as Event);
  }
  focus() {
    this.handleFocus();
  }
  blur() {
    this.handleBlur();
  }
}

function create(diagnostics: readonly TextareaDiagnostic[] = [], value = ''): AnnotatedProbe {
  const component = runInInjectionContext(
    createEnvironmentInjector(
      [provideZonelessChangeDetection(), { provide: ɵINJECTOR_SCOPE, useValue: 'root' }],
      undefined as unknown as EnvironmentInjector,
    ),
    () => new AnnotatedProbe(),
  );
  Object.assign(component, {
    editor: () => ({ nativeElement: { scrollTop: 0, scrollLeft: 0, selectionStart: 0 } }),
    mirror: () => ({
      nativeElement: {
        scrollTop: 0,
        scrollLeft: 0,
        parentElement: null,
        querySelectorAll: () => [],
      },
    }),
  });
  setInput(component.diagnostics, diagnostics);
  component.writeValue(value);
  return component;
}

function diagnostic(
  line: number,
  from: number,
  to: number,
  message = 'bad',
  severity?: 'error' | 'warning',
): TextareaDiagnostic {
  return { line, from, to, message, severity };
}

beforeEach(() => {
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  let nextFrame = 0;
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn(() => ++nextFrame),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AnnotatedTextareaComponent segments', () => {
  it('returns a single plain segment without diagnostics', () => {
    const textarea = create([], 'hello');
    expect(textarea.currentSegments).toEqual([{ text: 'hello' }]);
  });

  it('returns no segments for an empty value', () => {
    expect(create([diagnostic(0, 0, 3)], '').currentSegments).toEqual([]);
  });

  it('splits around a diagnostic range', () => {
    const d = diagnostic(0, 2, 5);
    expect(create([d], 'abcdefg').currentSegments).toEqual([
      { text: 'ab' },
      { text: 'cde', diagnostic: d },
      { text: 'fg' },
    ]);
  });

  it('resolves the line and column to an absolute offset', () => {
    const d = diagnostic(2, 1, 3);
    const segments = create([d], 'one\ntwo\nthree').currentSegments;
    expect(segments).toEqual([
      { text: 'one\ntwo\nt' },
      { text: 'hr', diagnostic: d },
      { text: 'ee' },
    ]);
  });

  it('clamps a range to the end of its line', () => {
    const d = diagnostic(0, 1, 99);
    expect(create([d], 'abc\ndef').currentSegments).toEqual([
      { text: 'a' },
      { text: 'bc', diagnostic: d },
      { text: '\ndef' },
    ]);
  });

  it('clamps a range on the last line to the end of the value', () => {
    const d = diagnostic(1, 1, 99);
    expect(create([d], 'abc\ndef').currentSegments).toEqual([
      { text: 'abc\nd' },
      { text: 'ef', diagnostic: d },
    ]);
  });

  it.each([
    ['empty range', diagnostic(0, 2, 2)],
    ['inverted range', diagnostic(0, 4, 1)],
    ['negative line', diagnostic(-1, 0, 2)],
    ['line past the end', diagnostic(5, 0, 2)],
    ['range starting past the line end', diagnostic(0, 10, 12)],
  ])('drops a diagnostic with an %s', (_name, d) => {
    expect(create([d], 'abc').currentSegments).toEqual([{ text: 'abc' }]);
  });

  it('orders unsorted diagnostics by position', () => {
    const late = diagnostic(0, 4, 6, 'late');
    const early = diagnostic(0, 0, 2, 'early');
    const marked = create([late, early], 'abcdefgh').currentSegments.filter((s) => s.diagnostic);
    expect(marked.map((s) => s.diagnostic?.message)).toEqual(['early', 'late']);
  });

  it('skips a diagnostic that overlaps one already placed', () => {
    const first = diagnostic(0, 0, 4, 'first');
    const overlapping = diagnostic(0, 2, 6, 'second');
    const segments = create([first, overlapping], 'abcdefgh').currentSegments;
    expect(segments).toEqual([{ text: 'abcd', diagnostic: first }, { text: 'efgh' }]);
  });

  it('reflects a changed value', () => {
    const d = diagnostic(0, 0, 1);
    const textarea = create([d], 'ab');
    textarea.writeValue('xyz');
    expect(textarea.currentSegments).toEqual([{ text: 'x', diagnostic: d }, { text: 'yz' }]);
  });
});

describe('AnnotatedTextareaComponent diagnostics summary', () => {
  it('lists only diagnostics that were actually placed', () => {
    const placed = diagnostic(0, 0, 2, 'placed');
    const dropped = diagnostic(9, 0, 2, 'dropped');
    expect(create([placed, dropped], 'abcd').shownDiagnostics).toEqual([placed]);
  });

  it('announces nothing, one or many problems', () => {
    const one = diagnostic(0, 0, 1);
    const two = diagnostic(0, 2, 3);
    expect(create([], 'abcd').summary).toBe('');
    expect(create([one], 'abcd').summary).toBe('1 problem found');
    expect(create([one, two], 'abcd').summary).toBe('2 problems found');
  });

  it('treats a missing severity as an error and a warning as not an error', () => {
    expect(create([diagnostic(0, 0, 1)], 'abc').errors).toBe(true);
    expect(create([diagnostic(0, 0, 1, 'x', 'error')], 'abc').errors).toBe(true);
    expect(create([diagnostic(0, 0, 1, 'x', 'warning')], 'abc').errors).toBe(false);
  });

  it('has errors when a warning sits next to an error', () => {
    const mixed = [diagnostic(0, 0, 1, 'w', 'warning'), diagnostic(0, 2, 3, 'e')];
    expect(create(mixed, 'abcd').errors).toBe(true);
  });

  it('does not count a hidden error', () => {
    expect(create([diagnostic(4, 0, 1)], 'abc').errors).toBe(false);
  });
});

describe('AnnotatedTextareaComponent aria-describedby', () => {
  it('references only the diagnostics list by default', () => {
    const textarea = create();
    expect(textarea.describedByValue).toBe(textarea.id);
  });

  it('appends the diagnostics list to a caller supplied id', () => {
    const textarea = create();
    setInput(textarea.describedBy, 'hint');
    expect(textarea.describedByValue).toBe(`hint ${textarea.id}`);
  });

  it('gives every instance its own list id', () => {
    expect(create().id).not.toBe(create().id);
  });
});

describe('AnnotatedTextareaComponent frame styles', () => {
  it('uses the neutral border at rest, without a ring', () => {
    const { border, 'box-shadow': shadow } = create().frameCss;
    expect(border).toContain('--color-rule-strong');
    expect(shadow).toBeNull();
  });

  it('uses the accent border and ring when focused', () => {
    const textarea = create();
    textarea.focus();
    const { border, 'box-shadow': shadow } = textarea.frameCss;
    expect(border).toContain('--color-accent');
    expect(shadow).toContain('--color-accent');
  });

  it('prefers the danger border over focus when errors are shown', () => {
    const textarea = create([diagnostic(0, 0, 1)], 'abc');
    textarea.focus();
    const { border, 'box-shadow': shadow } = textarea.frameCss;
    expect(border).toContain('--color-danger');
    expect(shadow).toContain('--color-danger');
  });

  it('does not turn the border red for warnings only', () => {
    const textarea = create([diagnostic(0, 0, 1, 'w', 'warning')], 'abc');
    expect(textarea.frameCss['border']).toContain('--color-rule-strong');
  });

  it('dims the frame when disabled', () => {
    const textarea = create();
    textarea.setDisabledState(true);
    expect(textarea.frameCss['opacity']).toBe('0.65');
    expect(textarea.frameCss['background']).toContain('--color-paper-2');
    expect(create().frameCss['opacity']).toBe('1');
  });
});

describe('AnnotatedTextareaComponent value accessor', () => {
  it('writes null as an empty string', () => {
    const textarea = create([], 'abc');
    textarea.writeValue(null);
    expect(textarea.currentValue).toBe('');
  });

  it('propagates typed input, clears the bubble and requests a caret update', () => {
    const textarea = create();
    const onChange = vi.fn();
    textarea.registerOnChange(onChange);
    textarea.type('typed');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('typed');
    expect(textarea.currentValue).toBe('typed');
    expect(textarea.currentBubble).toBeNull();
    expect(textarea['frame']).toBeGreaterThan(0);
  });

  it('cancels the pending frame before scheduling a new caret update', () => {
    const textarea = create();
    textarea.type('a');
    const first = textarea['frame'];
    textarea.type('ab');
    expect(cancelAnimationFrame).toHaveBeenLastCalledWith(first);
    expect(textarea['frame']).not.toBe(first);
  });

  it('marks touched and drops focus and bubble on blur', () => {
    const textarea = create();
    const onTouched = vi.fn();
    textarea.registerOnTouched(onTouched);
    textarea.focus();
    expect(textarea.isFocused).toBe(true);
    textarea.blur();
    expect(textarea.isFocused).toBe(false);
    expect(textarea.currentBubble).toBeNull();
    expect(onTouched).toHaveBeenCalledTimes(1);
  });

  it('tracks the disabled state', () => {
    const textarea = create();
    textarea.setDisabledState(true);
    expect(textarea.isDisabled).toBe(true);
  });
});

describe('AnnotatedTextareaComponent bubble placement', () => {
  const bubble = {
    message: 'm',
    severity: 'error' as const,
    left: 0,
    anchorTop: 100,
    anchorBottom: 120,
    below: false,
  };

  it('sits above the anchor by the gap', () => {
    expect(create().topOf(bubble)).toBe(94);
  });

  it('sits below the anchor by the gap when flipped', () => {
    expect(create().topOf({ ...bubble, below: true })).toBe(126);
  });
});

interface FakeRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  height: number;
}

const rect = (left: number, top: number, width = 40, height = 20): FakeRect => ({
  left,
  right: left + width,
  top,
  bottom: top + height,
  height,
});

interface Scene {
  textarea: AnnotatedProbe;
  editor: { scrollTop: number; scrollLeft: number; selectionStart: number | null };
  mirror: { scrollTop: number; scrollLeft: number };
}

function scene(
  diagnostics: readonly TextareaDiagnostic[],
  value: string,
  markRects: readonly FakeRect[],
  options: { framed?: boolean } = {},
): Scene {
  const textarea = create(diagnostics, value);
  const editor = { scrollTop: 0, scrollLeft: 0, selectionStart: 0 as number | null };
  const marks = markRects.map((r) => ({ firstChild: null, getClientRects: () => [r] }));
  const mirror = {
    scrollTop: 0,
    scrollLeft: 0,
    parentElement:
      options.framed === false ? null : { getBoundingClientRect: () => rect(10, 10, 500, 200) },
    querySelectorAll: () => marks,
  };
  Object.assign(textarea, {
    editor: () => ({ nativeElement: editor }),
    mirror: () => ({ nativeElement: mirror }),
  });
  return { textarea, editor, mirror };
}

function flushCaret(textarea: AnnotatedProbe): void {
  textarea.showCaret();
}

describe('AnnotatedTextareaComponent scroll sync', () => {
  it('copies the editor scroll offsets onto the mirror', () => {
    const { textarea, editor, mirror } = scene([], '', []);
    editor.scrollTop = 42;
    editor.scrollLeft = 7;
    textarea.scrollSync();
    expect(mirror.scrollTop).toBe(42);
    expect(mirror.scrollLeft).toBe(7);
  });
});

describe('AnnotatedTextareaComponent hover bubble', () => {
  const diagnostics = [diagnostic(0, 0, 3, 'first'), diagnostic(0, 4, 7, 'second', 'warning')];
  const rects = [rect(30, 50), rect(100, 50)];

  it('shows the bubble for the mark under the pointer, relative to the frame', () => {
    const { textarea } = scene(diagnostics, 'abc defg', rects);
    textarea.hover({ clientX: 110, clientY: 60 });
    expect(textarea.currentBubble).toEqual({
      message: 'second',
      severity: 'warning',
      left: 90,
      anchorTop: 40,
      anchorBottom: 60,
      below: false,
    });
  });

  it('defaults severity to error', () => {
    const { textarea } = scene(diagnostics, 'abc defg', rects);
    textarea.hover({ clientX: 35, clientY: 55 });
    expect(textarea.currentBubble?.severity).toBe('error');
    expect(textarea.currentBubble?.message).toBe('first');
  });

  it('treats the rectangle edges as inside', () => {
    const { textarea } = scene(diagnostics, 'abc defg', rects);
    textarea.hover({ clientX: 30, clientY: 50 });
    expect(textarea.currentBubble?.message).toBe('first');
    textarea.hover({ clientX: 140, clientY: 70 });
    expect(textarea.currentBubble?.message).toBe('second');
  });

  it('keeps the same bubble object when nothing moved', () => {
    const { textarea } = scene(diagnostics, 'abc defg', rects);
    textarea.hover({ clientX: 35, clientY: 55 });
    const before = textarea.currentBubble;
    textarea.hover({ clientX: 36, clientY: 56 });
    expect(textarea.currentBubble).toBe(before);
  });

  it('clears a visible bubble when there are no marks at all', () => {
    const { textarea } = scene(diagnostics, 'abc defg', rects);
    textarea.hover({ clientX: 35, clientY: 55 });
    Object.assign(textarea, {
      mirror: () => ({
        nativeElement: { parentElement: null, querySelectorAll: () => [] },
      }),
    });
    textarea.hover({ clientX: 0, clientY: 0 });
    expect(textarea.currentBubble).toBeNull();
  });

  it('does nothing when the mirror has no frame', () => {
    const { textarea } = scene(diagnostics, 'abc defg', rects, { framed: false });
    textarea.hover({ clientX: 35, clientY: 55 });
    expect(textarea.currentBubble).toBeNull();
  });

  it('falls back to the caret bubble when the pointer misses every mark', () => {
    const { textarea, editor } = scene(diagnostics, 'abc defg', rects);
    textarea.focus();
    editor.selectionStart = 5;
    textarea.hover({ clientX: 500, clientY: 500 });
    expect(textarea.currentBubble?.message).toBe('second');
  });

  it('drops the bubble on mouse leave when the editor is not focused', () => {
    const { textarea } = scene(diagnostics, 'abc defg', rects);
    textarea.hover({ clientX: 35, clientY: 55 });
    textarea.leave();
    expect(textarea.currentBubble).toBeNull();
  });
});

describe('AnnotatedTextareaComponent caret bubble', () => {
  const diagnostics = [diagnostic(0, 2, 5, 'inside')];
  const rects = [rect(60, 30)];

  it('shows the bubble when the caret is inside a marked range', () => {
    const { textarea, editor } = scene(diagnostics, 'abcdefg', rects);
    textarea.focus();
    editor.selectionStart = 3;
    flushCaret(textarea);
    expect(textarea.currentBubble).toMatchObject({ message: 'inside', left: 50, anchorTop: 20 });
  });

  it.each([2, 5])('includes the range boundary at offset %i', (caret) => {
    const { textarea, editor } = scene(diagnostics, 'abcdefg', rects);
    textarea.focus();
    editor.selectionStart = caret;
    flushCaret(textarea);
    expect(textarea.currentBubble?.message).toBe('inside');
  });

  it.each([0, 1, 6])('hides the bubble when the caret is outside at offset %i', (caret) => {
    const { textarea, editor } = scene(diagnostics, 'abcdefg', rects);
    textarea.focus();
    editor.selectionStart = 3;
    flushCaret(textarea);
    editor.selectionStart = caret;
    flushCaret(textarea);
    expect(textarea.currentBubble).toBeNull();
  });

  it('treats a missing selection as the start of the text', () => {
    const { textarea, editor } = scene([diagnostic(0, 0, 3, 'start')], 'abcdef', [rect(60, 30)]);
    textarea.focus();
    editor.selectionStart = null;
    flushCaret(textarea);
    expect(textarea.currentBubble?.message).toBe('start');
  });

  it('hides the bubble when the editor loses focus', () => {
    const { textarea, editor } = scene(diagnostics, 'abcdefg', rects);
    textarea.focus();
    editor.selectionStart = 3;
    flushCaret(textarea);
    textarea.blur();
    expect(textarea.currentBubble).toBeNull();
    flushCaret(textarea);
    expect(textarea.currentBubble).toBeNull();
  });

  it('hides the bubble when the mirror has no frame', () => {
    const { textarea, editor } = scene(diagnostics, 'abcdefg', rects, { framed: false });
    textarea.focus();
    editor.selectionStart = 3;
    flushCaret(textarea);
    expect(textarea.currentBubble).toBeNull();
  });

  it('uses the second mark when the caret is in the second range', () => {
    const two = [diagnostic(0, 0, 2, 'one'), diagnostic(0, 4, 6, 'two')];
    const { textarea, editor } = scene(two, 'abcdefgh', [rect(30, 30), rect(90, 30)]);
    textarea.focus();
    editor.selectionStart = 5;
    flushCaret(textarea);
    expect(textarea.currentBubble).toMatchObject({ message: 'two', left: 80 });
  });

  it('hides the bubble when the marked element has no rectangle', () => {
    const { textarea, editor } = scene(diagnostics, 'abcdefg', []);
    textarea.focus();
    editor.selectionStart = 3;
    flushCaret(textarea);
    expect(textarea.currentBubble).toBeNull();
  });
});

describe('AnnotatedTextareaComponent caret rectangle from a text node', () => {
  function withTextMark(caretRect: FakeRect, markRect: FakeRect) {
    const setStart = vi.fn();
    const setEnd = vi.fn();
    vi.stubGlobal('document', {
      createRange: () => ({ setStart, setEnd, getBoundingClientRect: () => caretRect }),
    });
    const textarea = create([diagnostic(0, 0, 4, 'text')], 'abcdef');
    const editor = { scrollTop: 0, scrollLeft: 0, selectionStart: 2 };
    const textNode = { nodeType: 3, textContent: 'abcd' };
    const mirror = {
      scrollTop: 0,
      scrollLeft: 0,
      parentElement: { getBoundingClientRect: () => rect(0, 0, 500, 200) },
      querySelectorAll: () => [{ firstChild: textNode, getClientRects: () => [markRect] }],
    };
    Object.assign(textarea, {
      editor: () => ({ nativeElement: editor }),
      mirror: () => ({ nativeElement: mirror }),
    });
    textarea.focus();
    return { textarea, setStart, setEnd, textNode };
  }

  it('anchors at the caret position inside the text node', () => {
    const { textarea, setStart, setEnd, textNode } = withTextMark(rect(24, 8, 0, 16), rect(0, 0));
    flushCaret(textarea);
    expect(setStart).toHaveBeenCalledWith(textNode, 2);
    expect(setEnd).toHaveBeenCalledWith(textNode, 2);
    expect(textarea.currentBubble).toMatchObject({ left: 24, anchorTop: 8, anchorBottom: 24 });
  });

  it('falls back to the mark rectangle when the caret rectangle is collapsed', () => {
    const { textarea } = withTextMark(rect(0, 0, 0, 0), rect(12, 6, 30, 18));
    flushCaret(textarea);
    expect(textarea.currentBubble).toMatchObject({ left: 12, anchorTop: 6, anchorBottom: 24 });
  });
});
