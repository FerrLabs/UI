import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { fieldIds, labelForTarget, mergeDescribedBy } from './field-aria';

let fieldCounter = 0;

@Component({
  selector: 'flr-field',
  exportAs: 'flrField',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './field.component.html',
  styleUrl: './field.component.css',
})
export class FieldComponent {
  readonly label = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly required = input(false);
  readonly optional = input(false);
  readonly optionalLabel = input('optional');
  readonly group = input(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly ids = fieldIds(++fieldCounter);
  readonly fieldId = this.ids.fieldId;
  readonly labelId = this.ids.labelId;
  readonly hintId = this.ids.hintId;
  readonly errorId = this.ids.errorId;

  protected readonly labelFor = computed(() => labelForTarget(this.group(), this.ids));

  readonly describedBy = computed(() => {
    if (this.error()) return this.errorId;
    if (this.hint()) return this.hintId;
    return null;
  });

  readonly invalid = computed(() => {
    const error = this.error();
    return error != null && error !== '';
  });

  constructor() {
    afterRenderEffect(() => {
      if (this.group()) {
        return;
      }
      const describedBy = this.describedBy();
      const control = this.host.nativeElement.querySelector<HTMLElement>('input, textarea, select');
      if (!control) {
        return;
      }
      if (!control.id) {
        control.id = this.fieldId;
      }
      const merged = mergeDescribedBy(
        control.getAttribute('aria-describedby'),
        [this.hintId, this.errorId],
        describedBy,
      );
      if (merged) {
        control.setAttribute('aria-describedby', merged);
      } else {
        control.removeAttribute('aria-describedby');
      }
    });
  }
}
