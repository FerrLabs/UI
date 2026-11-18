import { playIconAnimation } from '@ferrlabs/ui-foundation';
import { describe, expect, it } from 'vitest';

interface Deferred {
  readonly animation: { finished: Promise<unknown> };
  settle(): void;
  fail(): void;
}

function deferredAnimation(): Deferred {
  let settle = () => {};
  let fail = () => {};
  const finished = new Promise<unknown>((resolve, reject) => {
    settle = () => resolve(undefined);
    fail = () => reject(new Error('cancelled'));
  });
  finished.catch(() => undefined);
  return { animation: { finished }, settle, fail };
}

function fakeElement(getAnimations: unknown): Element {
  const classes = new Set<string>();
  const classList = {
    add: (name: string) => classes.add(name),
    remove: (name: string) => classes.delete(name),
    contains: (name: string) => classes.has(name),
  };
  return { classList, getAnimations } as unknown as Element;
}

function hasClass(element: Element, name: string): boolean {
  return element.classList.contains(name);
}

function elementWith(animations: Deferred[]): { element: Element; calls: () => number } {
  let calls = 0;
  const element = fakeElement((options?: { subtree: boolean }) => {
    calls += 1;
    expect(options).toEqual({ subtree: true });
    return animations.map((d) => d.animation);
  });
  return { element, calls: () => calls };
}

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('playIconAnimation', () => {
  it('adds the playing class and removes it once every animation finished', async () => {
    const first = deferredAnimation();
    const second = deferredAnimation();
    const { element } = elementWith([first, second]);

    playIconAnimation(element);
    expect(hasClass(element, 'fi-play')).toBe(true);

    first.settle();
    await flush();
    expect(hasClass(element, 'fi-play')).toBe(true);

    second.settle();
    await flush();
    expect(hasClass(element, 'fi-play')).toBe(false);
  });

  it('does not restart while the class is present', () => {
    const { element, calls } = elementWith([deferredAnimation()]);

    playIconAnimation(element);
    playIconAnimation(element);

    expect(calls()).toBe(1);
  });

  it('plays again after the previous run ended', async () => {
    const run = deferredAnimation();
    const { element, calls } = elementWith([run]);
    playIconAnimation(element);
    run.settle();
    await flush();

    playIconAnimation(element);

    expect(calls()).toBe(2);
    expect(hasClass(element, 'fi-play')).toBe(true);
  });

  it('removes the class when an animation is cancelled', async () => {
    const run = deferredAnimation();
    const { element } = elementWith([run]);
    playIconAnimation(element);

    run.fail();
    await flush();

    expect(hasClass(element, 'fi-play')).toBe(false);
  });

  it('removes the class right away when nothing animates', async () => {
    const { element } = elementWith([]);

    playIconAnimation(element);
    await flush();

    expect(hasClass(element, 'fi-play')).toBe(false);
  });

  it('does nothing when getAnimations is unavailable', () => {
    const element = fakeElement(undefined);

    expect(() => playIconAnimation(element)).not.toThrow();
    expect(hasClass(element, 'fi-play')).toBe(false);
  });
});
