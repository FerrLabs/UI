import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { TABS_STRIP, type TabsStripItem } from './tabs.model';

@Component({
  selector: 'flr-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.css',
})
export class TabComponent implements TabsStripItem {
  readonly label = input.required<string>();
  readonly href = input<string | null>(null);
  readonly active = input(false);
  readonly count = input<string | number | null>(null);
  readonly disabled = input(false);
  readonly panelId = input<string | null>(null);

  readonly selected = output<void>();

  private readonly strip = inject(TABS_STRIP);
  private readonly control = viewChild<ElementRef<HTMLElement>>('control');

  protected readonly isPanel = computed(() => this.strip.mode() === 'panel');
  protected readonly asLink = computed(() => !this.isPanel() && !!this.href() && !this.disabled());
  protected readonly tabIndex = computed(() =>
    this.isPanel() ? (this.strip.isFocusable(this) ? 0 : -1) : null,
  );

  focus(): void {
    this.control()?.nativeElement.focus();
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      return;
    }
    if (this.asLink() && (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)) {
      return;
    }
    if (this.asLink()) event.preventDefault();
    this.selected.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isPanel()) this.strip.handleKeydown(event, this);
  }
}
