import '@angular/compiler';
import type { Signal, WritableSignal } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createComponent } from '../testing/component-harness';
import { WAITLIST_FORM_LABELS_EN } from './waitlist-form.model';
import { WaitlistFormComponent } from './waitlist-form.component';

interface Internals {
  email: WritableSignal<string>;
  website: WritableSignal<string>;
  sending: Signal<boolean>;
  isJoined: Signal<boolean>;
  error: Signal<string | null>;
  payload(): Record<string, unknown>;
  submit(event: Event): Promise<void>;
}

const submitEvent = () =>
  ({ preventDefault: vi.fn() }) as unknown as Event & {
    preventDefault: ReturnType<typeof vi.fn>;
  };

function setup(inputs: Record<string, unknown> = {}) {
  const component = createComponent(WaitlistFormComponent, {
    endpoint: '/api/waitlist',
    product: 'ferrflow',
    fromUrl: null,
    locale: 'en',
    labels: WAITLIST_FORM_LABELS_EN,
    ...inputs,
  });
  const joined = vi.fn();
  component.joined.subscribe(joined);
  return { internals: component as unknown as Internals, joined };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('WaitlistFormComponent payload', () => {
  it('trims the email and carries product, locale and the honeypot', () => {
    const { internals } = setup({ locale: 'fr' });
    internals.email.set('  me@example.com ');
    internals.website.set('spam');
    expect(internals.payload()).toEqual({
      product: 'ferrflow',
      email: 'me@example.com',
      locale: 'fr',
      website: 'spam',
    });
  });

  it('includes from_url only when set', () => {
    expect('from_url' in setup().internals.payload()).toBe(false);
    const withUrl = setup({ fromUrl: 'https://ferrlabs.com/x' }).internals.payload();
    expect(withUrl['from_url']).toBe('https://ferrlabs.com/x');
  });
});

describe('WaitlistFormComponent submit', () => {
  it('prevents the native submit and rejects an empty email without calling the network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { internals } = setup();
    internals.email.set('   ');
    const event = submitEvent();
    await internals.submit(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(internals.error()).toBe(WAITLIST_FORM_LABELS_EN.incomplete);
    expect(internals.sending()).toBe(false);
  });

  it('posts the payload as json and reports joined', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { internals, joined } = setup();
    internals.email.set(' me@example.com ');
    await internals.submit(submitEvent());
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/waitlist');
    expect(init.method).toBe('POST');
    expect(init.headers['content-type']).toBe('application/json');
    expect(JSON.parse(init.body)).toMatchObject({ email: 'me@example.com', product: 'ferrflow' });
    expect(internals.isJoined()).toBe(true);
    expect(internals.error()).toBeNull();
    expect(joined).toHaveBeenCalledTimes(1);
    expect(internals.sending()).toBe(false);
  });

  it.each([
    [429, WAITLIST_FORM_LABELS_EN.tooMany],
    [422, WAITLIST_FORM_LABELS_EN.invalid],
    [500, WAITLIST_FORM_LABELS_EN.failed],
  ])('shows the message for status %d and does not emit joined', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));
    const { internals, joined } = setup();
    internals.email.set('me@example.com');
    await internals.submit(submitEvent());
    expect(internals.error()).toBe(message);
    expect(internals.isJoined()).toBe(false);
    expect(joined).not.toHaveBeenCalled();
  });

  it('shows the generic failure when the request throws, and re-enables sending', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const { internals, joined } = setup();
    internals.email.set('me@example.com');
    await internals.submit(submitEvent());
    expect(internals.error()).toBe(WAITLIST_FORM_LABELS_EN.failed);
    expect(internals.sending()).toBe(false);
    expect(joined).not.toHaveBeenCalled();
  });

  it('clears a previous error when retrying', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const { internals } = setup();
    internals.email.set('me@example.com');
    await internals.submit(submitEvent());
    expect(internals.error()).not.toBeNull();
    await internals.submit(submitEvent());
    expect(internals.error()).toBeNull();
    expect(internals.isJoined()).toBe(true);
  });

  it('ignores a second submit while one is in flight', async () => {
    let resolve!: (response: Response) => void;
    const fetchMock = vi.fn().mockReturnValue(new Promise<Response>((r) => (resolve = r)));
    vi.stubGlobal('fetch', fetchMock);
    const { internals } = setup();
    internals.email.set('me@example.com');
    const first = internals.submit(submitEvent());
    expect(internals.sending()).toBe(true);
    await internals.submit(submitEvent());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolve(new Response(null, { status: 200 }));
    await first;
    expect(internals.sending()).toBe(false);
  });
});
