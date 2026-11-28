import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it, vi } from 'vitest';
import { SiteCardComponent } from './site-card.component';

class SiteCardProbe extends SiteCardComponent {
  activate(): void {
    this.onActivate();
  }
  press(event: KeyboardEvent): void {
    this.onKeydown(event);
  }
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createCard(interactive = true) {
  const card = runInInjectionContext(Injector.create({ providers: [] }), () => new SiteCardProbe());
  setInput(card.interactive, interactive);
  const selected = vi.fn();
  card.select.subscribe(selected);
  return { card, selected };
}

const key = (name: string) => {
  const preventDefault = vi.fn();
  return { event: { key: name, preventDefault } as unknown as KeyboardEvent, preventDefault };
};

describe('SiteCardComponent click', () => {
  it('emits select when interactive', () => {
    const { card, selected } = createCard();
    card.activate();
    expect(selected).toHaveBeenCalledTimes(1);
  });

  it('stays silent when not interactive', () => {
    const { card, selected } = createCard(false);
    card.activate();
    expect(selected).not.toHaveBeenCalled();
  });
});

describe('SiteCardComponent keyboard', () => {
  it.each(['Enter', ' '])('%j activates and prevents the default scroll or submit', (name) => {
    const { card, selected } = createCard();
    const { event, preventDefault } = key(name);
    card.press(event);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it.each(['Tab', 'Escape', 'a', 'ArrowDown'])('%s is ignored', (name) => {
    const { card, selected } = createCard();
    const { event, preventDefault } = key(name);
    card.press(event);
    expect(selected).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('ignores Enter and Space when not interactive and leaves the default alone', () => {
    const { card, selected } = createCard(false);
    const { event, preventDefault } = key('Enter');
    card.press(event);
    expect(selected).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
