import '@angular/compiler';
import { ElementRef } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { createHarness, setInput } from '../testing/component-harness';
import { SiteLocaleLinkDirective } from './site-locale-link.directive';

function setup() {
  const focus = vi.fn();
  const harness = createHarness([{ provide: ElementRef, useValue: { nativeElement: { focus } } }]);
  return { link: harness.create(() => new SiteLocaleLinkDirective()), focus };
}

describe('SiteLocaleLinkDirective', () => {
  it('focuses its host anchor', () => {
    const { link, focus } = setup();
    link.focus();
    expect(focus).toHaveBeenCalledOnce();
  });

  it('labels itself with the endonym for typeahead', () => {
    const { link } = setup();
    setInput(link.endonym, 'Français');
    expect(link.getLabel()).toBe('Français');
  });
});
