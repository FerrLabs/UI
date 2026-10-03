import type { ContactLocale, ContactProduct } from '../contact-form/contact-form.model';

export interface WaitlistFormLabels {
  readonly email: string;
  readonly submit: string;
  readonly joinedTitle: string;
  readonly joinedBody: string;
  readonly incomplete: string;
  readonly invalid: string;
  readonly tooMany: string;
  readonly failed: string;
}

export const WAITLIST_FORM_LABELS_EN: WaitlistFormLabels = {
  email: 'Your email',
  submit: 'Join the waitlist',
  joinedTitle: 'You are on the list',
  joinedBody: 'We will write to you when it opens. A confirmation is on its way to your inbox.',
  incomplete: 'Enter your email address.',
  invalid: 'Check your email address.',
  tooMany: 'Too many attempts from here in a short time. Please try again in a few minutes.',
  failed: 'That did not go through. Please try again, or write to contact@ferrlabs.com.',
};

export const WAITLIST_FORM_LABELS_FR: WaitlistFormLabels = {
  email: 'Votre e-mail',
  submit: 'Rejoindre la liste d’attente',
  joinedTitle: 'Vous êtes sur la liste',
  joinedBody:
    'Nous vous écrirons à l’ouverture. Une confirmation arrive dans votre boîte de réception.',
  incomplete: 'Indiquez votre adresse e-mail.',
  invalid: 'Vérifiez votre adresse e-mail.',
  tooMany: 'Trop de tentatives d’ici en peu de temps. Réessayez dans quelques minutes.',
  failed: 'L’inscription n’a pas abouti. Réessayez, ou écrivez à contact@ferrlabs.com.',
};

export interface WaitlistPayload {
  readonly product: ContactProduct;
  readonly email: string;
  readonly from_url?: string;
  readonly locale: ContactLocale;
  readonly website: string;
}

export type WaitlistOutcome =
  { readonly state: 'joined' } | { readonly state: 'error'; readonly message: string };

export function readWaitlistResponse(
  response: Response,
  labels: WaitlistFormLabels,
): WaitlistOutcome {
  if (response.ok) return { state: 'joined' };
  if (response.status === 429) return { state: 'error', message: labels.tooMany };
  if (response.status === 422) return { state: 'error', message: labels.invalid };
  return { state: 'error', message: labels.failed };
}
