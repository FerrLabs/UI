import '@angular/compiler';
import { DOCUMENT } from '@angular/common';
import { Injector, runInInjectionContext, type InputSignalWithTransform } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { describe, expect, it, vi } from 'vitest';
import { MarkdownEditorComponent } from './markdown-editor.component';

vi.mock('@ferrlabs/ui-ng', () => ({
  ButtonComponent: class {},
  TabComponent: class {},
  TabsComponent: class {},
}));

type InputNode<W> = { applyValueToInputSignal(node: unknown, value: W): void };

function setInput<T, W>(input: InputSignalWithTransform<T, W>, value: W): void {
  const node = (input as unknown as Record<symbol, InputNode<W>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

interface Action {
  readonly id: string;
  readonly label: string;
  apply(state: { value: string; start: number; end: number }): {
    value: string;
    start: number;
    end: number;
  };
}

class EditorProbe extends MarkdownEditorComponent {
  get currentValue() {
    return this.value();
  }
  get writtenValue() {
    return this.written();
  }
  get isDisabled() {
    return this.disabled();
  }
  get currentMode() {
    return this.mode();
  }
  get isPreviewing() {
    return this.previewing();
  }
  get labelSet() {
    return this.resolvedLabels();
  }
  get toolbar(): readonly Action[] {
    return this.actions as unknown as readonly Action[];
  }
  get ids() {
    return { write: this.writeId, preview: this.previewId };
  }
  type(value: string) {
    this.handleInput({ target: { value } } as unknown as Event);
  }
  blur() {
    this.handleBlur();
  }
  press(event: Partial<KeyboardEvent>) {
    this.handleKeydown({ preventDefault: vi.fn(), ...event } as KeyboardEvent);
  }
  runAction(id: string) {
    const action = this.toolbar.find((a) => a.id === id);
    if (!action) throw new Error(`no action ${id}`);
    this.run(action as never);
  }
  runCustom(apply: Action['apply']) {
    this.run({ id: 'custom', apply } as never);
  }
  switchMode(mode: 'write' | 'preview') {
    this.mode.set(mode);
  }
}

class FakeTextarea {
  value: string;
  selectionStart: number;
  selectionEnd: number;
  readonly focus = vi.fn();
  constructor(value: string, start: number, end: number) {
    this.value = value;
    this.selectionStart = start;
    this.selectionEnd = end;
  }
  setSelectionRange = vi.fn((start: number, end: number) => {
    this.selectionStart = start;
    this.selectionEnd = end;
  });
}

function create(options: { execCommand?: (text: string) => boolean } = {}) {
  const execCalls: string[] = [];
  const area = new FakeTextarea('', 0, 0);
  const document = {
    execCommand: (_command: string, _ui: boolean, text: string) => {
      execCalls.push(text);
      const accepted = options.execCommand ? options.execCommand(text) : true;
      if (accepted) {
        area.value =
          area.value.slice(0, area.selectionStart) + text + area.value.slice(area.selectionEnd);
      }
      return accepted;
    },
  };
  const injector = Injector.create({ providers: [{ provide: DOCUMENT, useValue: document }] });
  const editor = runInInjectionContext(injector, () => new EditorProbe());
  Object.assign(editor, { textarea: () => ({ nativeElement: area }) });
  const onChange = vi.fn();
  editor.registerOnChange(onChange);
  return { editor, area, onChange, execCalls };
}

function select(area: FakeTextarea, value: string, start: number, end = start): void {
  area.value = value;
  area.selectionStart = start;
  area.selectionEnd = end;
}

describe('MarkdownEditorComponent value accessor', () => {
  it('writes a value to the model, the textarea and the written mirror', () => {
    const { editor, area, onChange } = create();
    editor.writeValue('# Title');
    expect(editor.currentValue).toBe('# Title');
    expect(editor.writtenValue).toBe('# Title');
    expect(area.value).toBe('# Title');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('writes null as an empty string', () => {
    const { editor, area } = create();
    editor.writeValue('abc');
    editor.writeValue(null);
    expect(editor.currentValue).toBe('');
    expect(area.value).toBe('');
  });

  it('accepts a value before the view exists', () => {
    const { editor } = create();
    Object.assign(editor, { textarea: () => undefined });
    expect(() => editor.writeValue('early')).not.toThrow();
    expect(editor.currentValue).toBe('early');
  });

  it('propagates typed input without rewriting the textarea binding', () => {
    const { editor, onChange } = create();
    editor.writeValue('a');
    editor.type('ab');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('ab');
    expect(editor.currentValue).toBe('ab');
    expect(editor.writtenValue).toBe('a');
  });

  it('marks touched on blur', () => {
    const { editor } = create();
    const touched = vi.fn();
    editor.registerOnTouched(touched);
    editor.blur();
    expect(touched).toHaveBeenCalledTimes(1);
  });

  it('tracks the disabled state', () => {
    const { editor } = create();
    editor.setDisabledState(true);
    expect(editor.isDisabled).toBe(true);
  });
});

describe('MarkdownEditorComponent modes and labels', () => {
  it('starts in write mode and previews on demand', () => {
    const { editor } = create();
    expect(editor.currentMode).toBe('write');
    expect(editor.isPreviewing).toBe(false);
    editor.switchMode('preview');
    expect(editor.isPreviewing).toBe(true);
  });

  it('overrides only the supplied labels', () => {
    const { editor } = create();
    setInput(editor.labels, { write: 'Schreiben' });
    expect(editor.labelSet.write).toBe('Schreiben');
    expect(editor.labelSet.preview).toBe('Preview');
  });

  it('gives each editor unique panel ids', () => {
    expect(create().editor.ids.write).not.toBe(create().editor.ids.write);
    const { editor } = create();
    expect(editor.ids.write).not.toBe(editor.ids.preview);
  });

  it('exposes one toolbar action per formatting label', () => {
    const { editor } = create();
    expect(editor.toolbar.map((a) => a.id)).toEqual([
      'bold',
      'italic',
      'strike',
      'heading',
      'code',
      'code-block',
      'link',
      'bullet',
      'numbered',
      'task',
      'quote',
    ]);
    for (const action of editor.toolbar) {
      expect(editor.labelSet[action.label as keyof typeof editor.labelSet]).toBeTruthy();
    }
  });
});

describe('MarkdownEditorComponent toolbar actions', () => {
  it('wraps the selection through insertText so the browser undo stack keeps it', () => {
    const { editor, area, execCalls } = create();
    select(area, 'say hello now', 4, 9);
    editor.runAction('bold');
    expect(execCalls).toEqual(['**hello**']);
    expect(area.value).toBe('say **hello** now');
    expect([area.selectionStart, area.selectionEnd]).toEqual([6, 11]);
    expect(area.focus).toHaveBeenCalled();
  });

  it('removes an existing wrap when applied again', () => {
    const { editor, area } = create();
    select(area, 'say **hello** now', 6, 11);
    editor.runAction('bold');
    expect(area.value).toBe('say hello now');
  });

  it('prefixes every selected line for list actions', () => {
    const { editor, area } = create();
    select(area, 'one\ntwo', 0, 7);
    editor.runAction('bullet');
    expect(area.value).toBe('- one\n- two');
    editor.runAction('bullet');
    expect(area.value).toBe('one\ntwo');
  });

  it('numbers lines for the numbered action', () => {
    const { editor, area } = create();
    select(area, 'a\nb', 0, 3);
    editor.runAction('numbered');
    expect(area.value).toBe('1. a\n2. b');
  });

  it('cycles heading levels', () => {
    const { editor, area } = create();
    select(area, 'Title', 0, 0);
    editor.runAction('heading');
    expect(area.value).toBe('# Title');
    editor.runAction('heading');
    expect(area.value).toBe('## Title');
  });

  it('inserts a link with a selectable url placeholder', () => {
    const { editor, area } = create();
    select(area, 'docs', 0, 4);
    editor.runAction('link');
    expect(area.value).toBe('[docs](https://)');
    expect(area.value.slice(area.selectionStart, area.selectionEnd)).toBe('https://');
  });

  it('inserts a fenced code block', () => {
    const { editor, area } = create();
    select(area, 'x', 0, 1);
    editor.runAction('code-block');
    expect(area.value).toBe('```\nx\n```');
  });

  it('falls back to setting the value and notifying when insertText is refused', () => {
    const { editor, area, onChange } = create({ execCommand: () => false });
    select(area, 'abc', 0, 3);
    editor.runAction('bold');
    expect(area.value).toBe('**abc**');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('**abc**');
    expect(editor.currentValue).toBe('**abc**');
    expect([area.selectionStart, area.selectionEnd]).toEqual([2, 5]);
  });

  it('only moves the selection when the text would not change', () => {
    const { editor, area, execCalls, onChange } = create();
    select(area, 'abc', 0, 0);
    editor.runCustom((state) => ({ ...state, start: 1, end: 2 }));
    expect(execCalls).toEqual([]);
    expect(onChange).not.toHaveBeenCalled();
    expect(area.setSelectionRange).toHaveBeenLastCalledWith(1, 2);
  });

  it('does nothing without a textarea', () => {
    const { editor, execCalls } = create();
    Object.assign(editor, { textarea: () => undefined });
    expect(() => editor.runAction('bold')).not.toThrow();
    expect(execCalls).toEqual([]);
  });
});

describe('MarkdownEditorComponent shortcuts', () => {
  function shortcut(key: string, extra: Partial<KeyboardEvent> = {}) {
    const { editor, area } = create();
    select(area, 'word', 0, 4);
    const preventDefault = vi.fn();
    editor.press({ key, ctrlKey: true, preventDefault, ...extra });
    return { area, preventDefault };
  }

  it.each([
    ['b', '**word**'],
    ['i', '*word*'],
    ['k', '[word](https://)'],
  ])('Ctrl+%s formats the selection', (key, expected) => {
    const { area, preventDefault } = shortcut(key);
    expect(area.value).toBe(expected);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('accepts Cmd as well as Ctrl and uppercase keys', () => {
    const { area } = shortcut('B', { ctrlKey: false, metaKey: true });
    expect(area.value).toBe('**word**');
  });

  it.each([
    ['without a modifier', { ctrlKey: false }],
    ['with Alt', { altKey: true }],
    ['with Shift', { shiftKey: true }],
  ])('ignores the shortcut %s', (_name, extra) => {
    const { area, preventDefault } = shortcut('b', extra);
    expect(area.value).toBe('word');
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('leaves other Ctrl combinations to the browser', () => {
    const { area, preventDefault } = shortcut('z');
    expect(area.value).toBe('word');
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('does not treat inherited object keys as shortcuts', () => {
    const { area, preventDefault } = shortcut('constructor');
    expect(area.value).toBe('word');
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
