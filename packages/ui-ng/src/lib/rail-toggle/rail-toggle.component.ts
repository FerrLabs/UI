import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'flr-rail-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rail-toggle.component.html',
  styleUrl: './rail-toggle.component.css',
})
export class RailToggleComponent {
  readonly collapsed = model(false);
  readonly collapseLabel = input('Collapse sidebar');
  readonly expandLabel = input('Expand sidebar');

  protected readonly label = computed(() =>
    this.collapsed() ? this.expandLabel() : this.collapseLabel(),
  );

  protected toggle(): void {
    this.collapsed.set(!this.collapsed());
  }
}
