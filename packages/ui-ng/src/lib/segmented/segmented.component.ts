import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { isTrustedIconMarkup } from '../icon/icon-markup';

export interface SegmentedOption {
  readonly value: string;
  readonly label: string;
  readonly icon?: string;
}

@Component({
  selector: 'flr-segmented',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './segmented.component.html',
  styleUrl: './segmented.component.css',
})
export class SegmentedComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly options = input.required<readonly SegmentedOption[]>();
  readonly value = model.required<string>();
  readonly iconOnly = input(false);
  readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

  protected trustedIcon(markup: string | undefined): SafeHtml | null {
    return markup && isTrustedIconMarkup(markup)
      ? this.sanitizer.bypassSecurityTrustHtml(markup)
      : null;
  }

  protected select(option: SegmentedOption): void {
    this.value.set(option.value);
  }

  protected handleKeydown(event: KeyboardEvent, index: number, buttons: HTMLElement): void {
    const options = this.options();
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    this.value.set(options[next].value);
    buttons.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  }
}
