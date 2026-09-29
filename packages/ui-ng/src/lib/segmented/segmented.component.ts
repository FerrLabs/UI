import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  input,
  model,
  viewChild,
  viewChildren,
} from '@angular/core';
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

  private readonly group = viewChild.required<ElementRef<HTMLElement>>('group');
  private readonly thumb = viewChild.required<ElementRef<HTMLElement>>('thumb');
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('optionButton');

  private readonly selectedIndex = computed(() =>
    this.options().findIndex((o) => o.value === this.value()),
  );

  constructor() {
    afterRenderEffect(() => this.placeThumb(this.selectedIndex()));

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.placeThumb(this.selectedIndex()));
      observer.observe(this.group().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected trustedIcon(markup: string | undefined): SafeHtml | null {
    return markup && isTrustedIconMarkup(markup)
      ? this.sanitizer.bypassSecurityTrustHtml(markup)
      : null;
  }

  protected select(option: SegmentedOption): void {
    this.value.set(option.value);
  }

  protected handleKeydown(event: KeyboardEvent, index: number): void {
    const options = this.options();
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    this.value.set(options[next].value);
    this.buttons()[next]?.nativeElement.focus();
  }

  private placeThumb(index: number): void {
    const thumb = this.thumb().nativeElement;
    const button = this.buttons()[index]?.nativeElement;
    if (!button || button.offsetWidth === 0) {
      thumb.hidden = true;
      return;
    }
    thumb.style.width = `${button.offsetWidth}px`;
    thumb.style.transform = `translateX(${button.offsetLeft}px)`;
    if (thumb.hidden) {
      thumb.hidden = false;
      return;
    }
    thumb.classList.add('flr-seg__thumb--animated');
  }
}
