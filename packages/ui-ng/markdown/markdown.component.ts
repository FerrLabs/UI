import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { renderMarkdown } from './markdown-renderer';

@Component({
  selector: 'flr-markdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './markdown.component.html',
  styleUrls: ['./code-tokens.css', './markdown.component.css'],
  host: { class: 'flr-markdown' },
})
export class MarkdownComponent {
  readonly source = input<string>('');

  protected readonly html = computed(() => renderMarkdown(this.source()));
}
