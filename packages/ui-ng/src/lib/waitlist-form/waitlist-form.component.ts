import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../input/input.component';
import { SubmitComponent } from '../submit/submit.component';
import type { ContactLocale, ContactProduct } from '../contact-form/contact-form.model';
import {
  WAITLIST_FORM_LABELS_EN,
  type WaitlistFormLabels,
  type WaitlistOutcome,
  type WaitlistPayload,
  readWaitlistResponse,
} from './waitlist-form.model';

@Component({
  selector: 'flr-waitlist-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputComponent, SubmitComponent],
  templateUrl: './waitlist-form.component.html',
  styleUrl: './waitlist-form.component.css',
})
export class WaitlistFormComponent {
  readonly endpoint = input.required<string>();
  readonly product = input.required<ContactProduct>();
  readonly fromUrl = input<string | null>(null);
  readonly locale = input<ContactLocale>('en');
  readonly labels = input<WaitlistFormLabels>(WAITLIST_FORM_LABELS_EN);

  readonly joined = output<void>();

  protected readonly email = signal('');
  protected readonly website = signal('');
  protected readonly sending = signal(false);
  protected readonly outcome = signal<WaitlistOutcome | null>(null);
  protected readonly isJoined = computed(() => this.outcome()?.state === 'joined');
  protected readonly error = computed(() => {
    const outcome = this.outcome();
    return outcome?.state === 'error' ? outcome.message : null;
  });

  protected payload(): WaitlistPayload {
    const fromUrl = this.fromUrl();
    return {
      product: this.product(),
      email: this.email().trim(),
      ...(fromUrl ? { from_url: fromUrl } : {}),
      locale: this.locale(),
      website: this.website(),
    };
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.sending()) return;
    const payload = this.payload();
    if (!payload.email) {
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
      const outcome = readWaitlistResponse(response, this.labels());
      this.outcome.set(outcome);
      if (outcome.state === 'joined') this.joined.emit();
    } catch {
      this.outcome.set({ state: 'error', message: this.labels().failed });
    } finally {
      this.sending.set(false);
    }
  }
}
