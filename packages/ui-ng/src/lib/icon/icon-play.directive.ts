import { Directive, ElementRef, inject } from '@angular/core';
import { playIconAnimation } from './play-icon-animation';

@Directive({
  selector: '[flrIconPlay]',
  host: {
    '(pointerenter)': 'play()',
    '(focusin)': 'playOnKeyboardFocus()',
  },
})
export class IconPlayDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  play(): void {
    playIconAnimation(this.host.nativeElement);
  }

  playOnKeyboardFocus(): void {
    if (this.host.nativeElement.matches(':focus-visible')) this.play();
  }
}
