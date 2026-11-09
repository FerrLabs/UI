import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { highlightCode } from './highlight';

const COPIED_RESET_MS = 1600;

@Component({
  selector: 'flr-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './code.component.html',
  styleUrls: ['./code-tokens.css', './code.component.css'],
  host: { class: 'flr-code' },
})
export class CodeComponent implements OnDestroy {
  readonly code = input.required<string>();
  readonly language = input<string>();

  private readonly document = inject(DOCUMENT);
  private resetTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly html = computed(() => highlightCode(this.code(), this.language()));
  protected readonly label = computed(() => this.language()?.trim() || 'text');
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    const clipboard = this.document.defaultView?.navigator.clipboard;
    if (!clipboard) return;
    try {
      await clipboard.writeText(this.code());
    } catch {
      return;
    }
    this.copied.set(true);
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copied.set(false), COPIED_RESET_MS);
  }

  ngOnDestroy(): void {
    clearTimeout(this.resetTimer);
  }
}
