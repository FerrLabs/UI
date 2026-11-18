import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ErrorStateComponent, LoadingStateComponent } from '../states/states.component';
import {
  cardPhase,
  type ConnectionMeta,
  type ConnectionTone,
  toneRole,
  visibleMeta,
} from './connection-card.model';

let nextId = 0;

@Component({
  selector: 'flr-connection-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorStateComponent, LoadingStateComponent],
  templateUrl: './connection-card.component.html',
  styleUrl: './connection-card.component.css',
})
export class ConnectionCardComponent {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly tone = input<ConnectionTone>('idle');
  readonly headline = input('');
  readonly meta = input<readonly ConnectionMeta[]>([]);
  readonly progress = input<string | null>(null);
  readonly confirming = input(false);
  readonly loading = input(false);
  readonly loadingLabel = input('Loading…');
  readonly error = input<string | null>(null);
  readonly retryLabel = input('Retry');

  readonly retry = output<void>();

  protected readonly titleId = `flr-connection-card-title-${nextId++}`;
  protected readonly phase = computed(() =>
    cardPhase(this.loading(), this.error(), this.confirming()),
  );
  protected readonly role = computed(() => toneRole(this.tone()));
  protected readonly items = computed(() => visibleMeta(this.meta()));
}
