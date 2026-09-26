import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldComponent } from '../field/field.component';
import { InputComponent } from '../input/input.component';
import { SelectComponent } from '../select/select.component';
import { SubmitComponent } from '../submit/submit.component';
import { TextareaComponent } from '../textarea/textarea.component';
import {
  CONTACT_FORM_LABELS_EN,
  CONTACT_KINDS,
  CONTACT_PRODUCTS,
  type ContactFormLabels,
  type ContactKind,
  type ContactLocale,
  type ContactOutcome,
  type ContactPayload,
  type ContactProduct,
  readContactResponse,
} from './contact-form.model';

@Component({
  selector: 'flr-contact-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    FieldComponent,
    InputComponent,
    SelectComponent,
    SubmitComponent,
    TextareaComponent,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.css',
})
export class ContactFormComponent {
  readonly endpoint = input.required<string>();
  readonly product = input<ContactProduct>('ferrlabs');
  readonly kind = input<ContactKind>('question');
  readonly email = input('');
  readonly name = input('');
  readonly orgId = input<string | null>(null);
  readonly fromUrl = input<string | null>(null);
  readonly locale = input<ContactLocale>('en');
  readonly labels = input<ContactFormLabels>(CONTACT_FORM_LABELS_EN);

  readonly sent = output<string>();

  protected readonly products = CONTACT_PRODUCTS;
  protected readonly kinds = CONTACT_KINDS;

  protected readonly selectedProduct = signal<ContactProduct>('ferrlabs');
  protected readonly selectedKind = signal<ContactKind>('question');
  protected readonly emailValue = signal('');
  protected readonly nameValue = signal('');
  protected readonly subject = signal('');
  protected readonly message = signal('');
  protected readonly website = signal('');

  protected readonly sending = signal(false);
  protected readonly outcome = signal<ContactOutcome | null>(null);
  protected readonly error = computed(() => {
    const outcome = this.outcome();
    return outcome?.state === 'error' ? outcome.message : null;
  });
  protected readonly reference = computed(() => {
    const outcome = this.outcome();
    return outcome?.state === 'sent' ? outcome.reference : null;
  });

  constructor() {
    effect(() => this.selectedProduct.set(this.product()));
    effect(() => this.selectedKind.set(this.kind()));
    effect(() => {
      const email = this.email();
      if (email && !untracked(this.emailValue)) this.emailValue.set(email);
    });
    effect(() => {
      const name = this.name();
      if (name && !untracked(this.nameValue)) this.nameValue.set(name);
    });
  }

  protected payload(): ContactPayload {
    const name = this.nameValue().trim();
    const orgId = this.orgId();
    const fromUrl = this.fromUrl();
    return {
      product: this.selectedProduct(),
      kind: this.selectedKind(),
      subject: this.subject().trim(),
      message: this.message().trim(),
      email: this.emailValue().trim(),
      ...(name ? { name } : {}),
      ...(orgId ? { org_id: orgId } : {}),
      ...(fromUrl ? { from_url: fromUrl } : {}),
      locale: this.locale(),
      website: this.website(),
    };
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.sending()) return;
    const payload = this.payload();
    if (!payload.email || !payload.subject || !payload.message) {
      this.outcome.set({ state: 'error', message: this.labels().incomplete });
      return;
    }
    this.sending.set(true);
    this.outcome.set(null);
    try {
      const response = await fetch(this.endpoint(), {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const outcome = await readContactResponse(response, this.labels());
      this.outcome.set(outcome);
      if (outcome.state === 'sent') this.sent.emit(outcome.reference);
    } catch {
      this.outcome.set({ state: 'error', message: this.labels().failed });
    } finally {
      this.sending.set(false);
    }
  }
}
