import { describe, expect, it } from 'vitest';
import {
  CONTACT_FORM_LABELS_EN,
  CONTACT_FORM_LABELS_FR,
  CONTACT_KINDS,
  CONTACT_PRODUCTS,
  readContactPrefill,
  readContactResponse,
} from './contact-form.model';

const HOSTS = ['ferrlabs.com'];

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('readContactPrefill', () => {
  it('reads a known product and kind', () => {
    expect(readContactPrefill('?product=ferrflow&kind=bug', HOSTS)).toEqual({
      product: 'ferrflow',
      kind: 'bug',
      fromUrl: undefined,
    });
  });

  it('drops unknown product and kind values', () => {
    const prefill = readContactPrefill('?product=nope&kind=rant', HOSTS);
    expect(prefill.product).toBeUndefined();
    expect(prefill.kind).toBeUndefined();
  });

  it('is case sensitive for enumerated values', () => {
    expect(readContactPrefill('?product=FerrFlow', HOSTS).product).toBeUndefined();
  });

  it('accepts an https url on an allowed host and its subdomains', () => {
    expect(readContactPrefill('?from=https://ferrlabs.com/a?b=1', HOSTS).fromUrl).toBe(
      'https://ferrlabs.com/a?b=1',
    );
    expect(readContactPrefill('?from=https://app.ferrlabs.com/x', HOSTS).fromUrl).toBe(
      'https://app.ferrlabs.com/x',
    );
  });

  it.each([
    ['http scheme', 'http://ferrlabs.com/'],
    ['foreign host', 'https://example.com/'],
    ['lookalike suffix', 'https://evilferrlabs.com/'],
    ['host as a subdomain of a foreign host', 'https://ferrlabs.com.evil.test/'],
    ['javascript url', 'javascript:alert(1)'],
    ['relative path', '/pricing'],
    ['garbage', 'not a url'],
  ])('rejects %s', (_name, from) => {
    expect(readContactPrefill(`?from=${encodeURIComponent(from)}`, HOSTS).fromUrl).toBeUndefined();
  });

  it('rejects urls longer than 2048 characters', () => {
    const long = `https://ferrlabs.com/${'a'.repeat(2100)}`;
    expect(readContactPrefill(`?from=${encodeURIComponent(long)}`, HOSTS).fromUrl).toBeUndefined();
  });

  it('rejects every url when no host is allowed', () => {
    expect(readContactPrefill('?from=https://ferrlabs.com/', []).fromUrl).toBeUndefined();
  });

  it('returns nothing for an empty query', () => {
    expect(readContactPrefill('', HOSTS)).toEqual({
      product: undefined,
      kind: undefined,
      fromUrl: undefined,
    });
  });
});

describe('readContactResponse', () => {
  it('returns the reference for a successful response', async () => {
    const outcome = await readContactResponse(
      jsonResponse(200, { reference: 'FL-123' }),
      CONTACT_FORM_LABELS_EN,
    );
    expect(outcome).toEqual({ state: 'sent', reference: 'FL-123' });
  });

  it('returns an empty reference when it is missing or not a string', async () => {
    expect(await readContactResponse(jsonResponse(200, {}), CONTACT_FORM_LABELS_EN)).toEqual({
      state: 'sent',
      reference: '',
    });
    expect(
      await readContactResponse(jsonResponse(200, { reference: 42 }), CONTACT_FORM_LABELS_EN),
    ).toEqual({ state: 'sent', reference: '' });
  });

  it('treats an unparsable success body as sent without a reference', async () => {
    const outcome = await readContactResponse(
      new Response('not json', { status: 200 }),
      CONTACT_FORM_LABELS_EN,
    );
    expect(outcome).toEqual({ state: 'sent', reference: '' });
  });

  it.each([
    [429, 'tooMany'],
    [422, 'invalid'],
    [500, 'failed'],
    [400, 'failed'],
  ] as const)('maps status %d to the %s message', async (status, key) => {
    const outcome = await readContactResponse(jsonResponse(status, {}), CONTACT_FORM_LABELS_FR);
    expect(outcome).toEqual({ state: 'error', message: CONTACT_FORM_LABELS_FR[key] });
  });

  it('reports an error even when the error body is not json', async () => {
    const outcome = await readContactResponse(
      new Response('<html>', { status: 502 }),
      CONTACT_FORM_LABELS_EN,
    );
    expect(outcome).toEqual({ state: 'error', message: CONTACT_FORM_LABELS_EN.failed });
  });
});

describe('contact catalogues', () => {
  it('has a label for every kind in both languages', () => {
    for (const labels of [CONTACT_FORM_LABELS_EN, CONTACT_FORM_LABELS_FR]) {
      for (const kind of CONTACT_KINDS) expect(labels.kinds[kind]).toBeTruthy();
    }
  });

  it('lists unique products', () => {
    const values = CONTACT_PRODUCTS.map((p) => p.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('French labels cover the same keys as English', () => {
    expect(Object.keys(CONTACT_FORM_LABELS_FR).sort()).toEqual(
      Object.keys(CONTACT_FORM_LABELS_EN).sort(),
    );
  });
});
