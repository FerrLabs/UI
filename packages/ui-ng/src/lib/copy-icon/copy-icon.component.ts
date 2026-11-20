import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'flr-copy-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './copy-icon.component.html',
  styleUrl: './copy-icon.component.css',
  host: { '[class.flr-copy-icon--copied]': 'copied()' },
})
export class CopyIconComponent {
  readonly copied = input(false);
}
