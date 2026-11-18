import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
} from '@angular/core';
import { SPLITTER_HOST } from './splitter-host';
import {
  coerceSize,
  resolveHandleLabel,
  resolvePaneLabel,
  type SplitterSize,
} from './splitter-model';

let nextPaneId = 0;

@Component({
  selector: 'flr-splitter-pane',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './splitter-pane.component.html',
  styleUrl: './splitter-pane.component.css',
  host: {
    '[id]': 'paneId',
    '[style.flex]': 'flex()',
    '[class.flr-pane--inert]': 'host.dragging()',
    '[class.flr-pane--collapsed]': 'isCollapsed()',
  },
})
export class SplitterPaneComponent {
  protected readonly host = inject(SPLITTER_HOST);

  readonly defaultSize = input<SplitterSize | undefined, number | string | null | undefined>(
    undefined,
    { transform: coerceSize },
  );
  readonly minSize = input<SplitterSize | undefined, number | string | null | undefined>(
    undefined,
    { transform: coerceSize },
  );
  readonly maxSize = input<SplitterSize | undefined, number | string | null | undefined>(
    undefined,
    { transform: coerceSize },
  );
  readonly collapsible = input(false, { transform: booleanAttribute });
  readonly collapsed = model(false);
  readonly label = input<string | undefined>(undefined);
  readonly handleLabel = input<string | null>(null);

  protected readonly paneId = `flr-splitter-pane-${nextPaneId++}`;

  readonly isCollapsed = computed(() => this.collapsible() && this.collapsed());
  readonly displayLabel = computed(() =>
    resolvePaneLabel(this.label(), this.index(), this.host.paneLabel()),
  );

  protected readonly index = computed(() => this.host.indexOf(this));
  protected readonly flex = computed(() => this.host.flexFor(this));
  protected readonly handleState = computed(() => this.host.handleState(this));
  protected readonly showHandle = computed(() => !this.host.isStacked() && !this.host.isLast(this));
  protected readonly handleOrientation = computed(() =>
    this.host.orientation() === 'horizontal' ? 'vertical' : 'horizontal',
  );
  protected readonly handleAriaLabel = computed(() =>
    resolveHandleLabel(this.handleLabel(), this.displayLabel(), this.host.resizeLabel()),
  );
}
