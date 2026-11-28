import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignalWithTransform } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { describe, expect, it, vi } from 'vitest';
import { TextareaComponent } from './textarea.component';

type InputNode<W> = { applyValueToInputSignal(node: unknown, value: W): void };

function setInput<T, W>(input: InputSignalWithTransform<T, W>, value: W): void {
  const node = (input as unknown as Record<symbol, InputNode<W>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

class TextareaProbe extends TextareaComponent {
  get state() {
    return { value: this.value(), disabled: this.disabled(), focused: this.focused() };
  }

  get frame() {
    return this.styles();
  }

  type(value: string): void {
    this.handleInput({ target: { value } } as unknown as Event);
  }

  focus(): void {
    this.focused.set(true);
  }

  blur(): void {
    this.handleBlur();
  }
}

function create(): TextareaProbe {
  return runInInjectionContext(Injector.create({ providers: [] }), () => new TextareaProbe());
}

describe('TextareaComponent value accessor', () => {
  it('writes null as an empty string', () => {
    const textarea = create();
    textarea.writeValue('hello');
    textarea.writeValue(null);
    expect(textarea.state.value).toBe('');
  });

  it('writes the given value', () => {
    const textarea = create();
    textarea.writeValue('hello');
    expect(textarea.state.value).toBe('hello');
  });

  it('forwards typed text to the registered change callback and keeps it', () => {
    const textarea = create();
    const onChange = vi.fn();
    textarea.registerOnChange(onChange);
    textarea.type('abc');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('abc');
    expect(textarea.state.value).toBe('abc');
  });

  it('does not throw when typing before a callback is registered', () => {
    const textarea = create();
    expect(() => textarea.type('abc')).not.toThrow();
  });

  it('marks touched and clears focus on blur', () => {
    const textarea = create();
    const onTouched = vi.fn();
    textarea.registerOnTouched(onTouched);
    textarea.focus();
    textarea.blur();
    expect(onTouched).toHaveBeenCalledTimes(1);
    expect(textarea.state.focused).toBe(false);
  });

  it('tracks the disabled state', () => {
    const textarea = create();
    textarea.setDisabledState(true);
    expect(textarea.state.disabled).toBe(true);
    textarea.setDisabledState(false);
    expect(textarea.state.disabled).toBe(false);
  });
});

describe('TextareaComponent frame styles', () => {
  it('uses the neutral rule border at rest', () => {
    const { border, 'box-shadow': shadow } = create().frame;
    expect(border).toContain('--color-rule-strong');
    expect(shadow).toBeNull();
  });

  it('uses the accent border and a ring while focused', () => {
    const textarea = create();
    textarea.focus();
    const { border, 'box-shadow': shadow } = textarea.frame;
    expect(border).toContain('--color-accent');
    expect(shadow).toContain('--color-accent');
  });

  it('uses the danger border and danger ring when invalid and focused', () => {
    const textarea = create();
    setInput(textarea.invalid, true);
    textarea.focus();
    const { border, 'box-shadow': shadow } = textarea.frame;
    expect(border).toContain('--color-danger');
    expect(shadow).toContain('--color-danger');
  });

  it('keeps the danger border when invalid and not focused, without a ring', () => {
    const textarea = create();
    setInput(textarea.invalid, true);
    const { border, 'box-shadow': shadow } = textarea.frame;
    expect(border).toContain('--color-danger');
    expect(shadow).toBeNull();
  });

  it('dims and blocks the cursor when disabled', () => {
    const textarea = create();
    textarea.setDisabledState(true);
    const { background, cursor, opacity } = textarea.frame;
    expect(background).toContain('--color-paper-2');
    expect(cursor).toBe('not-allowed');
    expect(opacity).toBe('0.65');
  });

  it('shows a text cursor at full opacity when enabled', () => {
    const { background, cursor, opacity } = create().frame;
    expect(background).toContain('--color-card');
    expect(cursor).toBe('text');
    expect(opacity).toBe('1');
  });
});
