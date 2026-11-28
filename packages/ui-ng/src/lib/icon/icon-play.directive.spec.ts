import '@angular/compiler';
import { ElementRef, Injector, runInInjectionContext } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { IconPlayDirective } from './icon-play.directive';

function createDirective(focusVisible: boolean) {
  const classes = new Set<string>();
  const getAnimations = vi.fn(() => []);
  const element = {
    classList: {
      add: (name: string) => classes.add(name),
      remove: (name: string) => classes.delete(name),
      contains: (name: string) => classes.has(name),
    },
    getAnimations,
    matches: vi.fn((selector: string) => selector === ':focus-visible' && focusVisible),
  };
  const injector = Injector.create({
    providers: [{ provide: ElementRef, useValue: new ElementRef(element) }],
  });
  const directive = runInInjectionContext(injector, () => new IconPlayDirective());
  return { directive, element, classes, getAnimations };
}

describe('IconPlayDirective', () => {
  it('plays the animation on its host when the pointer enters', () => {
    const { directive, classes } = createDirective(false);
    directive.play();
    expect(classes.has('fi-play')).toBe(true);
  });

  it('plays on focus that is keyboard driven', () => {
    const { directive, classes, element } = createDirective(true);
    directive.playOnKeyboardFocus();
    expect(element.matches).toHaveBeenCalledWith(':focus-visible');
    expect(classes.has('fi-play')).toBe(true);
  });

  it('stays still when focus comes from a pointer click', () => {
    const { directive, classes, getAnimations } = createDirective(false);
    directive.playOnKeyboardFocus();
    expect(classes.has('fi-play')).toBe(false);
    expect(getAnimations).not.toHaveBeenCalled();
  });
});
