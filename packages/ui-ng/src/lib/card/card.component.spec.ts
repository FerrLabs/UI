import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import { CardComponent, type CardPadding, type CardVariant } from './card.component';

class CardProbe extends CardComponent {
  readonly style = () => this.styles();
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createCard(): CardProbe {
  return runInInjectionContext(Injector.create({ providers: [] }), () => new CardProbe());
}

describe('CardComponent styles', () => {
  it('defaults to medium padding with an outline', () => {
    const style = createCard().style();
    expect(style['padding']).toBe('24px');
    expect(style['border']).toBe('1px solid var(--color-card-rule, rgba(30, 41, 59, 0.1))');
    expect(style['box-shadow']).toBeNull();
  });

  it.each<[CardPadding, string]>([
    ['none', '0'],
    ['sm', '16px'],
    ['md', '24px'],
    ['lg', '32px'],
  ])('padding %s resolves to %s', (padding, expected) => {
    const card = createCard();
    setInput(card.padding, padding);
    expect(card.style()['padding']).toBe(expected);
  });

  it.each<[CardVariant, string, boolean]>([
    ['outlined', '1px solid var(--color-card-rule, rgba(30, 41, 59, 0.1))', false],
    ['flat', '1px solid transparent', false],
    ['raised', '1px solid transparent', true],
  ])('variant %s sets the border and shadow', (variant, border, shadow) => {
    const card = createCard();
    setInput(card.variant, variant);
    const style = card.style();
    expect(style['border']).toBe(border);
    expect(style['box-shadow'] !== null).toBe(shadow);
  });
});
