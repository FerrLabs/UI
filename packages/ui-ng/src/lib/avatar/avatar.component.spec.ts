import '@angular/compiler';
import { Injector, runInInjectionContext, type InputSignal } from '@angular/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { describe, expect, it } from 'vitest';
import { AvatarComponent, type AvatarShape, type AvatarSize } from './avatar.component';

class AvatarProbe extends AvatarComponent {
  readonly pixels = () => this.px();
  readonly cornerRadius = () => this.radius();
  readonly letters = () => this.initials();
  readonly failed = () => this.errored();
  failImage(): void {
    this.errored.set(true);
  }
}

function setInput<T>(input: InputSignal<T>, value: T): void {
  signalSetFn(input[SIGNAL] as never, value as never);
}

function createAvatar(name: string): AvatarProbe {
  const avatar = runInInjectionContext(Injector.create({ providers: [] }), () => new AvatarProbe());
  setInput(avatar.name, name);
  return avatar;
}

describe('AvatarComponent initials', () => {
  it.each([
    ['Ada Lovelace', 'AL'],
    ['ada lovelace', 'AL'],
    ['Ada', 'A'],
    ['Ada Augusta King Lovelace', 'AA'],
    ['  Ada   Lovelace  ', 'AL'],
    ['', '?'],
    ['   ', '?'],
  ])('%j gives %j', (name, expected) => {
    expect(createAvatar(name).letters()).toBe(expected);
  });

  it('follows the name input', () => {
    const avatar = createAvatar('Ada Lovelace');
    setInput(avatar.name, 'Grace Hopper');
    expect(avatar.letters()).toBe('GH');
  });
});

describe('AvatarComponent size', () => {
  it('defaults to 28px', () => {
    expect(createAvatar('A').pixels()).toBe(28);
  });

  it.each<[AvatarSize, number]>([
    ['xs', 20],
    ['sm', 24],
    ['md', 28],
    ['lg', 40],
    ['xl', 56],
    [64, 64],
    [0, 0],
  ])('maps %j to %d px', (size, expected) => {
    const avatar = createAvatar('A');
    setInput(avatar.size, size);
    expect(avatar.pixels()).toBe(expected);
  });
});

describe('AvatarComponent radius', () => {
  it.each<[AvatarShape, AvatarSize, number]>([
    ['circle', 'lg', 20],
    ['circle', 'xs', 10],
    ['square', 'xl', 56 * 0.18],
    ['square', 'xs', 4],
    ['square', 'sm', 4.32],
  ])('%s at %j has radius %d', (shape, size, expected) => {
    const avatar = createAvatar('A');
    setInput(avatar.shape, shape);
    setInput(avatar.size, size);
    expect(avatar.cornerRadius()).toBeCloseTo(expected, 5);
  });
});

describe('AvatarComponent image failure', () => {
  it('starts without an error and keeps it once the image fails', () => {
    const avatar = createAvatar('A');
    expect(avatar.failed()).toBe(false);
    avatar.failImage();
    expect(avatar.failed()).toBe(true);
  });
});
