import { Directive, ElementRef, inject, input } from '@angular/core';
import type { FocusableOption } from '@angular/cdk/a11y';

@Directive({
  selector: 'a[flrSiteLocaleLink]',
})
export class SiteLocaleLinkDirective implements FocusableOption {
  readonly endonym = input.required<string>({ alias: 'flrSiteLocaleLink' });

  private readonly host = inject<ElementRef<HTMLAnchorElement>>(ElementRef);

  focus(): void {
    this.host.nativeElement.focus();
  }

  getLabel(): string {
    return this.endonym();
  }
}
