import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonComponent, TabComponent, TabsComponent } from '@ferrlabs/ui-ng';
import { MarkdownComponent } from './markdown.component';
import {
  BULLET,
  NUMBERED,
  QUOTE,
  TASK,
  cycleHeading,
  diffReplacement,
  insertBlock,
  insertLink,
  toggleLinePrefix,
  toggleWrap,
  type EditState,
} from './markdown-edit';

type EditorMode = 'write' | 'preview';

interface ToolbarAction {
  readonly id: string;
  readonly glyph: string;
  readonly label: string;
  readonly style?: string;
  readonly apply: (state: EditState) => EditState;
}

const ACTIONS: readonly ToolbarAction[] = [
  {
    id: 'bold',
    glyph: 'B',
    label: 'Bold (Ctrl+B)',
    style: 'font-weight: 700',
    apply: (s) => toggleWrap(s, '**'),
  },
  {
    id: 'italic',
    glyph: 'I',
    label: 'Italic (Ctrl+I)',
    style: 'font-style: italic',
    apply: (s) => toggleWrap(s, '*'),
  },
  {
    id: 'strike',
    glyph: 'S',
    label: 'Strikethrough',
    style: 'text-decoration: line-through',
    apply: (s) => toggleWrap(s, '~~'),
  },
  { id: 'heading', glyph: 'H', label: 'Heading (cycles H1 to H3)', apply: cycleHeading },
  { id: 'code', glyph: '</>', label: 'Inline code', apply: (s) => toggleWrap(s, '`') },
  { id: 'code-block', glyph: '{ }', label: 'Code block', apply: (s) => insertBlock(s, '```') },
  { id: 'link', glyph: 'Link', label: 'Link (Ctrl+K)', apply: (s) => insertLink(s) },
  { id: 'bullet', glyph: '•', label: 'Bulleted list', apply: (s) => toggleLinePrefix(s, BULLET) },
  {
    id: 'numbered',
    glyph: '1.',
    label: 'Numbered list 1.',
    apply: (s) => toggleLinePrefix(s, NUMBERED),
  },
  { id: 'task', glyph: '[ ]', label: 'Task list', apply: (s) => toggleLinePrefix(s, TASK) },
  { id: 'quote', glyph: '"', label: 'Quote', apply: (s) => toggleLinePrefix(s, QUOTE) },
];

const SHORTCUTS: Readonly<Record<string, string>> = { b: 'bold', i: 'italic', k: 'link' };

let sequence = 0;

@Component({
  selector: 'flr-markdown-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, TabsComponent, TabComponent, MarkdownComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownEditorComponent),
      multi: true,
    },
  ],
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.css',
  host: { class: 'flr-md-editor' },
})
export class MarkdownEditorComponent implements ControlValueAccessor {
  readonly placeholder = input<string | null>(null);
  readonly rows = input(8);
  readonly minHeight = input<string | null>(null);
  readonly ariaLabel = input<string | null>('Markdown editor', { alias: 'aria-label' });

  protected readonly actions = ACTIONS;
  protected readonly value = signal('');
  protected readonly written = signal('');
  protected readonly disabled = signal(false);
  protected readonly mode = signal<EditorMode>('write');
  protected readonly writeId = `flr-md-editor-write-${++sequence}`;
  protected readonly previewId = `flr-md-editor-preview-${sequence}`;
  protected readonly previewing = computed(() => this.mode() === 'preview');

  private readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');

  private readonly document = inject(DOCUMENT);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    const text = value ?? '';
    this.value.set(text);
    this.written.set(text);
    const element = this.textarea()?.nativeElement;
    if (element) element.value = text;
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
    this.commit((event.target as HTMLTextAreaElement).value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
    const action = ACTIONS.find((a) => a.id === SHORTCUTS[event.key.toLowerCase()]);
    if (!action) return;
    event.preventDefault();
    this.run(action);
  }

  protected run(action: ToolbarAction): void {
    const element = this.textarea()?.nativeElement;
    if (!element) return;
    const next = action.apply({
      value: element.value,
      start: element.selectionStart,
      end: element.selectionEnd,
    });
    const change = diffReplacement(element.value, next.value);
    element.focus();
    element.setSelectionRange(change.from, change.to);
    if (!this.document.execCommand('insertText', false, change.text)) {
      element.value = next.value;
      this.commit(next.value);
    }
    element.setSelectionRange(next.start, next.end);
  }

  private commit(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }
}
