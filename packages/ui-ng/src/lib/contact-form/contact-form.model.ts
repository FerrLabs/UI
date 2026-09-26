export type ContactProduct =
  | 'ferrlabs'
  | 'ferrflow'
  | 'ferrvault'
  | 'ferrtrack'
  | 'ferrgrowth'
  | 'ferrfleet'
  | 'ferrlens'
  | 'ferrgames'
  | 'awesome_alternatives';

export type ContactKind = 'question' | 'bug' | 'billing' | 'security' | 'privacy' | 'other';

export type ContactLocale = 'en' | 'fr';

export const CONTACT_PRODUCTS: readonly { value: ContactProduct; label: string }[] = [
  { value: 'ferrlabs', label: 'FerrLabs' },
  { value: 'ferrflow', label: 'FerrFlow' },
  { value: 'ferrvault', label: 'FerrVault' },
  { value: 'ferrtrack', label: 'FerrTrack' },
  { value: 'ferrgrowth', label: 'FerrGrowth' },
  { value: 'ferrfleet', label: 'FerrFleet' },
  { value: 'ferrlens', label: 'FerrLens' },
  { value: 'ferrgames', label: 'FerrGames' },
  { value: 'awesome_alternatives', label: 'awesome-alternatives' },
];

export const CONTACT_KINDS: readonly ContactKind[] = [
  'question',
  'bug',
  'billing',
  'security',
  'privacy',
  'other',
];

export interface ContactFormLabels {
  readonly product: string;
  readonly kind: string;
  readonly kinds: Readonly<Record<ContactKind, string>>;
  readonly email: string;
  readonly name: string;
  readonly optional: string;
  readonly subject: string;
  readonly message: string;
  readonly submit: string;
  readonly sentTitle: string;
  readonly sentBody: string;
  readonly reference: string;
  readonly incomplete: string;
  readonly invalid: string;
  readonly tooMany: string;
  readonly failed: string;
}

export const CONTACT_FORM_LABELS_EN: ContactFormLabels = {
  product: 'Product',
  kind: 'What is it about?',
  kinds: {
    question: 'A question',
    bug: 'Something is broken',
    billing: 'Billing',
    security: 'A security issue',
    privacy: 'My personal data',
    other: 'Something else',
  },
  email: 'Your email',
  name: 'Your name',
  optional: 'optional',
  subject: 'Subject',
  message: 'Message',
  submit: 'Send',
  sentTitle: 'Message sent',
  sentBody:
    'A person on the team will answer at the address you gave. A copy is on its way to your inbox.',
  reference: 'Reference',
  incomplete: 'Fill in your email, a subject and a message.',
  invalid: 'Check your email address, and that the subject and message are not too long.',
  tooMany: 'Too many messages from here in a short time. Please try again in a few minutes.',
  failed: 'The message could not be sent. Please try again, or write to contact@ferrlabs.com.',
};

export const CONTACT_FORM_LABELS_FR: ContactFormLabels = {
  product: 'Produit',
  kind: 'De quoi s’agit-il ?',
  kinds: {
    question: 'Une question',
    bug: 'Quelque chose ne marche pas',
    billing: 'Facturation',
    security: 'Un problème de sécurité',
    privacy: 'Mes données personnelles',
    other: 'Autre chose',
  },
  email: 'Votre e-mail',
  name: 'Votre nom',
  optional: 'facultatif',
  subject: 'Sujet',
  message: 'Message',
  submit: 'Envoyer',
  sentTitle: 'Message envoyé',
  sentBody:
    'Une personne de l’équipe vous répondra à l’adresse indiquée. Une copie arrive dans votre boîte de réception.',
  reference: 'Référence',
  incomplete: 'Indiquez votre e-mail, un sujet et un message.',
  invalid: 'Vérifiez votre adresse e-mail, et que le sujet et le message ne sont pas trop longs.',
  tooMany: 'Trop de messages envoyés d’ici en peu de temps. Réessayez dans quelques minutes.',
  failed: 'Le message n’a pas pu être envoyé. Réessayez, ou écrivez à contact@ferrlabs.com.',
};

export interface ContactPrefill {
  readonly product?: ContactProduct;
  readonly kind?: ContactKind;
  readonly fromUrl?: string;
}

const PRODUCT_VALUES = new Set<string>(CONTACT_PRODUCTS.map((p) => p.value));
const KIND_VALUES = new Set<string>(CONTACT_KINDS);

function isFerrLabsOrigin(url: URL, allowedHosts: readonly string[]): boolean {
  return (
    url.protocol === 'https:' &&
    allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  );
}

export function readContactPrefill(
  search: string,
  allowedHosts: readonly string[],
): ContactPrefill {
  const params = new URLSearchParams(search);
  const product = params.get('product') ?? '';
  const kind = params.get('kind') ?? '';
  const from = params.get('from');
  let fromUrl: string | undefined;
  if (from) {
    try {
      const parsed = new URL(from);
      if (isFerrLabsOrigin(parsed, allowedHosts) && parsed.href.length <= 2048) {
        fromUrl = parsed.href;
      }
    } catch {
      fromUrl = undefined;
    }
  }
  return {
    product: PRODUCT_VALUES.has(product) ? (product as ContactProduct) : undefined,
    kind: KIND_VALUES.has(kind) ? (kind as ContactKind) : undefined,
    fromUrl,
  };
}

export interface ContactPayload {
  readonly product: ContactProduct;
  readonly kind: ContactKind;
  readonly subject: string;
  readonly message: string;
  readonly email: string;
  readonly name?: string;
  readonly org_id?: string;
  readonly from_url?: string;
  readonly locale: ContactLocale;
  readonly website: string;
}

export type ContactOutcome =
  | { readonly state: 'sent'; readonly reference: string }
  | { readonly state: 'error'; readonly message: string };

export async function readContactResponse(
  response: Response,
  labels: ContactFormLabels,
): Promise<ContactOutcome> {
  const body = (await response.json().catch(() => null)) as {
    reference?: unknown;
  } | null;
  if (response.ok) {
    return { state: 'sent', reference: typeof body?.reference === 'string' ? body.reference : '' };
  }
  if (response.status === 429) return { state: 'error', message: labels.tooMany };
  if (response.status === 422) return { state: 'error', message: labels.invalid };
  return { state: 'error', message: labels.failed };
}
