import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import { ConnectionCardComponent } from './connection-card.component';

class ConnectionCardProbe extends ConnectionCardComponent {
  readonly id = () => this.titleId;
  readonly currentPhase = () => this.phase();
  readonly currentRole = () => this.role();
  readonly shownMeta = () => this.items();
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createCard(): ConnectionCardProbe {
  return runInInjectionContext(Injector.create({ providers: [] }), () => new ConnectionCardProbe());
}

describe('ConnectionCardComponent', () => {
  it('gives every card its own title id for aria-labelledby', () => {
    const a = createCard();
    const b = createCard();
    expect(a.id()).toMatch(/^flr-connection-card-title-\d+$/);
    expect(b.id()).not.toBe(a.id());
  });

  it('starts ready with a status role', () => {
    const card = createCard();
    expect(card.currentPhase()).toBe('ready');
    expect(card.currentRole()).toBe('status');
  });

  it('moves through loading, failed and confirming in priority order', () => {
    const card = createCard();
    setInput(card.confirming, true);
    expect(card.currentPhase()).toBe('confirming');
    setInput(card.error, 'Token expired');
    expect(card.currentPhase()).toBe('failed');
    setInput(card.loading, true);
    expect(card.currentPhase()).toBe('loading');
  });

  it('announces an alert tone assertively', () => {
    const card = createCard();
    setInput(card.tone, 'alert');
    expect(card.currentRole()).toBe('alert');
    setInput(card.tone, 'ok');
    expect(card.currentRole()).toBe('status');
  });

  it('hides meta rows whose value is blank', () => {
    const card = createCard();
    setInput(card.meta, [
      { label: 'Account', value: 'acme' },
      { label: 'Scope', value: '   ' },
      { label: 'Region', value: '' },
    ]);
    expect(card.shownMeta()).toEqual([{ label: 'Account', value: 'acme' }]);
  });
});
