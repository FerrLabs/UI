import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { UserMenuComponent } from './user-menu.component';

class UserMenuProbe extends UserMenuComponent {
  resolveIcon(markup: string | undefined): SafeHtml | null {
    return this.trustedIcon(markup);
  }
}

const REGISTRY_STYLE_ICONS: readonly string[] = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/></svg>',
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="7" height="9"/><line x1="3" y1="3" x2="10" y2="3"/><polyline points="1,1 2,2"/></svg>',
];

const trusted = (markup: string) => ({ trusted: markup }) as unknown as SafeHtml;

function createProbe(): UserMenuProbe {
  const injector = Injector.create({
    providers: [{ provide: DomSanitizer, useValue: { bypassSecurityTrustHtml: trusted } }],
  });
  return runInInjectionContext(injector, () => new UserMenuProbe());
}

describe('UserMenuComponent icon', () => {
  const menu = createProbe();

  it('injects registry style svg unchanged', () => {
    for (const markup of REGISTRY_STYLE_ICONS) {
      expect(menu.resolveIcon(markup)).toEqual(trusted(markup));
    }
  });

  it.each([
    ['plain text', '⌘'],
    ['emoji', '⚙️'],
    ['empty string', ''],
    ['undefined', undefined],
  ])('keeps %s as text', (_name, value) => {
    expect(menu.resolveIcon(value)).toBeNull();
  });

  it.each([
    ['script element', '<svg><script>alert(1)</script></svg>'],
    ['event handler attribute', '<svg onload="alert(1)"><path d="M0 0"/></svg>'],
    ['foreignObject', '<svg><foreignObject><div></div></foreignObject></svg>'],
    ['non-svg markup', '<img src=x onerror="alert(1)">'],
    ['svg with trailing html', '<svg><path d="M0 0"/></svg><b>x</b>'],
    ['markup embedded in text', 'icon <svg><path d="M0 0"/></svg>'],
  ])('keeps %s as text', (_name, value) => {
    expect(menu.resolveIcon(value)).toBeNull();
  });
});
