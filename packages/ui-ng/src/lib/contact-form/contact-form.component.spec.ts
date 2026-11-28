import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { signal } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createComponent, flushEffects } from '../testing/component-harness';
import { ContactFormComponent } from './contact-form.component';
import { CONTACT_FORM_LABELS_EN } from './contact-form.model';

interface Internals {
  selectedProduct: WritableSignal<string>;
  selectedKind: WritableSignal<string>;
  emailValue: WritableSignal<string>;
  nameValue: WritableSignal<string>;
  subject: WritableSignal<string>;
  message: WritableSignal<string>;
  website: WritableSignal<string>;
  sending: Signal<boolean>;
  error: Signal<string | null>;
  reference: Signal<string | null>;
  payload(): Record<string, unknown>;
  submit(event: Event): Promise<void>;
}

const submitEvent = () =>
  ({ preventDefault: vi.fn() }) as unknown as Event & {
    preventDefault: ReturnType<typeof vi.fn>;
  };

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(ContactFormComponent, {
    endpoint: '/api/contact',
    product: 'ferrlabs',
    kind: 'question',
    email: '',
    name: '',
    orgId: null,
    fromUrl: null,
    locale: 'en',
    labels: CONTACT_FORM_LABELS_EN,
    ...inputs,
  });
  const sent = vi.fn();
  component.sent.subscribe(sent);
  flushEffects(component);
  return { component, internals: component as unknown as Internals, sent };
}

function fill(internals: Internals) {
  internals.emailValue.set(' me@example.com ');
  internals.subject.set(' Hello ');
  internals.message.set(' Body ');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ContactFormComponent input sync', () => {
  it('seeds product and kind from inputs', () => {
    const { internals } = setup({ product: 'ferrvault', kind: 'bug' });
    expect(internals.selectedProduct()).toBe('ferrvault');
    expect(internals.selectedKind()).toBe('bug');
  });

  it('follows later product and kind changes', () => {
    const product = signal('ferrlabs');
    const { component, internals } = setup({ product });
    product.set('ferrtrack');
    flushEffects(component);
    expect(internals.selectedProduct()).toBe('ferrtrack');
  });

  it('prefills email and name once without overwriting what the user typed', () => {
    const email = signal('');
    const { component, internals } = setup({ email, name: 'Ada' });
    expect(internals.nameValue()).toBe('Ada');
    internals.emailValue.set('typed@example.com');
    email.set('account@example.com');
    flushEffects(component);
    expect(internals.emailValue()).toBe('typed@example.com');
  });

  it('fills the email when it arrives later and the field is still empty', () => {
    const email = signal('');
    const { component, internals } = setup({ email });
    email.set('late@example.com');
    flushEffects(component);
    expect(internals.emailValue()).toBe('late@example.com');
  });
});

describe('ContactFormComponent payload', () => {
  it('trims text fields and omits empty optional ones', () => {
    const { internals } = setup();
    fill(internals);
    expect(internals.payload()).toEqual({
      product: 'ferrlabs',
      kind: 'question',
      subject: 'Hello',
      message: 'Body',
      email: 'me@example.com',
      locale: 'en',
      website: '',
    });
  });

  it('includes name, org_id and from_url when provided', () => {
    const { internals } = setup({
      orgId: 'org-1',
      fromUrl: 'https://ferrlabs.com/x',
      locale: 'fr',
    });
    fill(internals);
    internals.nameValue.set('  Ada ');
    expect(internals.payload()).toMatchObject({
      name: 'Ada',
      org_id: 'org-1',
      from_url: 'https://ferrlabs.com/x',
      locale: 'fr',
    });
  });

  it('treats a whitespace only name as absent', () => {
    const { internals } = setup();
    internals.nameValue.set('   ');
    expect('name' in internals.payload()).toBe(false);
  });
});

describe('ContactFormComponent submit', () => {
  it.each([
    ['email', (i: Internals) => i.emailValue.set('  ')],
    ['subject', (i: Internals) => i.subject.set('')],
    ['message', (i: Internals) => i.message.set('   ')],
  ])('refuses to send without a %s', async (_field, blank) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { internals } = setup();
    fill(internals);
    blank(internals);
    const event = submitEvent();
    await internals.submit(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(internals.error()).toBe(CONTACT_FORM_LABELS_EN.incomplete);
  });

  it('posts json, shows the reference and emits sent', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ reference: 'FL-9' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { internals, sent } = setup();
    fill(internals);
    await internals.submit(submitEvent());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/contact');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toMatchObject({ email: 'me@example.com', subject: 'Hello' });
    expect(internals.reference()).toBe('FL-9');
    expect(internals.error()).toBeNull();
    expect(sent).toHaveBeenCalledWith('FL-9');
    expect(internals.sending()).toBe(false);
  });

  it.each([
    [429, CONTACT_FORM_LABELS_EN.tooMany],
    [422, CONTACT_FORM_LABELS_EN.invalid],
    [503, CONTACT_FORM_LABELS_EN.failed],
  ])('maps status %d to its message without emitting sent', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status })));
    const { internals, sent } = setup();
    fill(internals);
    await internals.submit(submitEvent());
    expect(internals.error()).toBe(message);
    expect(internals.reference()).toBeNull();
    expect(sent).not.toHaveBeenCalled();
  });

  it('shows the generic failure on a network error and re-enables sending', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const { internals } = setup();
    fill(internals);
    await internals.submit(submitEvent());
    expect(internals.error()).toBe(CONTACT_FORM_LABELS_EN.failed);
    expect(internals.sending()).toBe(false);
  });

  it('ignores a second submit while one is in flight', async () => {
    let resolve!: (response: Response) => void;
    const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((r) => (resolve = r)));
    vi.stubGlobal('fetch', fetchMock);
    const { internals } = setup();
    fill(internals);
    const first = internals.submit(submitEvent());
    expect(internals.sending()).toBe(true);
    await internals.submit(submitEvent());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolve(new Response('{}', { status: 200 }));
    await first;
    expect(internals.reference()).toBe('');
  });

  it('keeps the form after a failure so the user can retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 500 })));
    const { internals } = setup();
    fill(internals);
    await internals.submit(submitEvent());
    expect(internals.reference()).toBeNull();
    expect(internals.subject()).toBe(' Hello ');
  });
});
