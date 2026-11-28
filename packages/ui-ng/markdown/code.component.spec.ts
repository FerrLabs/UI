import '@angular/compiler';
import { DOCUMENT } from '@angular/common';
import { Injector, runInInjectionContext, type InputSignalWithTransform } from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeComponent } from './code.component';

type InputNode<W> = { applyValueToInputSignal(node: unknown, value: W): void };

function setInput<T, W>(input: InputSignalWithTransform<T, W>, value: W): void {
  const node = (input as unknown as Record<symbol, InputNode<W>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

class CodeProbe extends CodeComponent {
  get rendered() {
    return this.html();
  }
  get languageLabel() {
    return this.label();
  }
  get isCopied() {
    return this.copied();
  }
  press() {
    return this.copy();
  }
}

function create(code: string, language: string | undefined, view: unknown): CodeProbe {
  const injector = Injector.create({
    providers: [{ provide: DOCUMENT, useValue: { defaultView: view } }],
  });
  const component = runInInjectionContext(injector, () => new CodeProbe());
  setInput(component.code, code);
  setInput(component.language, language);
  return component;
}

const viewWith = (clipboard: unknown) => ({ navigator: { clipboard } });

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('CodeComponent rendering', () => {
  it('highlights by language', () => {
    const code = create('const a = 1;', 'ts', null);
    expect(code.rendered).toContain('<span class="token keyword">const</span>');
  });

  it('escapes the code when the language is missing or unknown', () => {
    expect(create('<b>', undefined, null).rendered).toBe('&lt;b&gt;');
    expect(create('<b>', 'nope', null).rendered).toBe('&lt;b&gt;');
  });

  it('labels the block with the trimmed language, or text', () => {
    expect(create('x', ' ts ', null).languageLabel).toBe('ts');
    expect(create('x', undefined, null).languageLabel).toBe('text');
    expect(create('x', '   ', null).languageLabel).toBe('text');
  });
});

describe('CodeComponent copy', () => {
  it('writes the raw code to the clipboard and flags copied', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    const code = create('<b>raw</b>', 'html', viewWith({ writeText }));
    await code.press();
    expect(writeText).toHaveBeenCalledExactlyOnceWith('<b>raw</b>');
    expect(code.isCopied).toBe(true);
  });

  it('resets the copied flag after the timeout', async () => {
    const code = create('x', 'ts', viewWith({ writeText: () => Promise.resolve() }));
    await code.press();
    vi.advanceTimersByTime(1599);
    expect(code.isCopied).toBe(true);
    vi.advanceTimersByTime(1);
    expect(code.isCopied).toBe(false);
  });

  it('restarts the timeout when copying again', async () => {
    const code = create('x', 'ts', viewWith({ writeText: () => Promise.resolve() }));
    await code.press();
    vi.advanceTimersByTime(1000);
    await code.press();
    vi.advanceTimersByTime(1000);
    expect(code.isCopied).toBe(true);
    vi.advanceTimersByTime(600);
    expect(code.isCopied).toBe(false);
  });

  it('stays quiet when the clipboard rejects', async () => {
    const code = create('x', 'ts', viewWith({ writeText: () => Promise.reject(new Error('no')) }));
    await expect(code.press()).resolves.toBeUndefined();
    expect(code.isCopied).toBe(false);
  });

  it.each([
    ['no clipboard api', viewWith(undefined)],
    ['no window', null],
  ])('does nothing with %s', async (_name, view) => {
    const code = create('x', 'ts', view);
    await code.press();
    expect(code.isCopied).toBe(false);
  });

  it('cancels the reset timer on destroy', async () => {
    const code = create('x', 'ts', viewWith({ writeText: () => Promise.resolve() }));
    await code.press();
    code.ngOnDestroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});
