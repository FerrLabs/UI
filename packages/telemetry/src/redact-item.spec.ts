import { TransportItemType, type TransportItem } from '@grafana/faro-web-sdk';
import { describe, expect, it } from 'vitest';
import { redactItem, type CapabilityPath } from './redact-item.js';

const scrub = (
  value: TransportItem,
  capabilityPaths?: readonly CapabilityPath[],
): TransportItem => {
  const out = redactItem(value, capabilityPaths);
  if (!out) throw new Error('item was dropped');
  return out;
};

describe('redactItem', () => {
  const item = (type: TransportItemType, payload: object, pageUrl?: string): TransportItem =>
    ({
      type,
      payload,
      meta: pageUrl ? { page: { url: pageUrl } } : {},
    }) as unknown as TransportItem;

  it('redacts page url', () => {
    const out = scrub(item(TransportItemType.LOG, {}, 'https://a.com/accept?token=s3cret#x'));
    expect(out.meta.page?.url).toBe('https://a.com/accept');
  });

  it('redacts every string of event attributes', () => {
    const out = scrub(
      item(TransportItemType.EVENT, {
        name: 'faro.navigation',
        attributes: {
          fromUrl: 'https://a.com/auth/callback?code=abc&state=x',
          toUrl: 'https://a.com/#token=y',
          documentURI: 'https://a.com/p?secret=1',
          blockedURI: 'https://c.com/x?k=v',
          other: 'plain?',
        },
      }),
    );
    expect((out.payload as { attributes: object }).attributes).toEqual({
      fromUrl: 'https://a.com/auth/callback',
      toUrl: 'https://a.com/',
      documentURI: 'https://a.com/p',
      blockedURI: 'https://c.com/x',
      other: 'plain?',
    });
  });

  it('redacts measurement context', () => {
    const out = scrub(
      item(TransportItemType.MEASUREMENT, {
        values: { lcp: 1 },
        context: { resource_url: 'https://a.com/img.png?sig=abc', id: 'v3' },
      }),
    );
    const payload = out.payload as { values: object; context: object };
    expect(payload.context).toEqual({ resource_url: 'https://a.com/img.png', id: 'v3' });
    expect(payload.values).toEqual({ lcp: 1 });
  });

  it('redacts exception value, context and stack frame filenames', () => {
    const out = scrub(
      item(TransportItemType.EXCEPTION, {
        type: 'TypeError',
        value: 'Failed to fetch https://x.example/reset?token=S3CR3T',
        context: { url: 'https://x.example/a?b=1' },
        stacktrace: { frames: [{ filename: 'https://a.com/main.js?v=S3CR3T', lineno: 1 }] },
      }),
    );
    const serialized = JSON.stringify(out.payload);
    expect(serialized).not.toContain('S3CR3T');
    expect(serialized).toContain('https://a.com/main.js');
    expect(serialized).toContain('"lineno":1');
  });

  it('redacts log messages and context', () => {
    const out = scrub(
      item(TransportItemType.LOG, {
        message: 'GET https://a.com/api?key=S3CR3T failed',
        context: { href: 'https://a.com/x#frag' },
      }),
    );
    const payload = out.payload as { message: string; context: object };
    expect(payload.message).toBe('GET https://a.com/api failed');
    expect(payload.context).toEqual({ href: 'https://a.com/x' });
  });

  it('redacts secrets in meta fields other than page.url', () => {
    const out = scrub({
      type: TransportItemType.LOG,
      payload: {},
      meta: { view: { name: 'https://a.com/v?token=S3CR3T' }, page: { url: 'https://a.com/' } },
    } as unknown as TransportItem);
    expect(JSON.stringify(out.meta)).not.toContain('S3CR3T');
  });

  it('does not throw on cyclic payloads', () => {
    const payload: Record<string, unknown> = { message: 'https://a.com/x?k=S3CR3T' };
    payload['self'] = payload;
    const out = scrub({
      type: TransportItemType.LOG,
      payload,
      meta: {},
    } as unknown as TransportItem);
    expect((out.payload as { message: string }).message).toBe('https://a.com/x');
  });

  it('redacts back-references of cyclic payloads too', () => {
    const child: Record<string, unknown> = { url: 'https://a.com/y?token=S3CR3T' };
    const payload: Record<string, unknown> = { message: 'https://a.com/x?token=S3CR3T', child };
    child['parent'] = payload;
    const out = scrub({
      type: TransportItemType.LOG,
      payload,
      meta: {},
    } as unknown as TransportItem);
    const outPayload = out.payload as {
      message: string;
      child: { url: string; parent: unknown };
    };
    expect(outPayload.message).toBe('https://a.com/x');
    expect(outPayload.child.url).toBe('https://a.com/y');
    expect(outPayload.child.parent).toBe(outPayload);
  });

  it('drops the item when a property read throws', () => {
    const payload = {};
    Object.defineProperty(payload, 'message', {
      enumerable: true,
      get() {
        throw new Error('nope');
      },
    });
    expect(
      redactItem({ type: TransportItemType.LOG, payload, meta: {} } as unknown as TransportItem),
    ).toBe(null);
  });

  it('scrubs a frozen item without mutating it', () => {
    const payload = Object.freeze({ message: 'https://a.com/x?token=abc' });
    const frozen = Object.freeze({ type: TransportItemType.LOG, payload, meta: Object.freeze({}) });
    const out = scrub(frozen as unknown as TransportItem);
    expect((out.payload as { message: string }).message).toBe('https://a.com/x');
    expect(payload.message).toBe('https://a.com/x?token=abc');
    expect(out).not.toBe(frozen);
  });

  it('handles items without page meta', () => {
    const out = scrub(item(TransportItemType.EVENT, { name: 'x' }));
    expect(out.payload).toEqual({ name: 'x' });
  });

  it('redacts non-plain objects by their string form and null-prototype objects as plain', () => {
    class Holder {
      toString(): string {
        return 'https://a.com/x?token=S3CR3T';
      }
    }
    const nullProto = Object.assign(Object.create(null), { message: 'password: S3CR3T' });
    const out = redactItem({
      type: TransportItemType.LOG,
      payload: { holder: new Holder(), nullProto },
      meta: {},
    } as unknown as TransportItem);
    const serialized = JSON.stringify(out?.payload);
    expect(serialized).not.toContain('S3CR3T');
  });

  it('drops the item when a non-plain object cannot be stringified', () => {
    const unprintable = new (class {
      toString(): string {
        throw new Error('nope');
      }
    })();
    const out = redactItem({
      type: TransportItemType.LOG,
      payload: { unprintable },
      meta: {},
    } as unknown as TransportItem);
    expect(out).toBe(null);
  });
  it('masks string fields named like secrets whatever their value', () => {
    const out = scrub(
      item(TransportItemType.EVENT, {
        name: 'login',
        attributes: {
          password: 'hunter2',
          apiKey: 'plainvalue',
          client_secret: 'x',
          Authorization: 'y',
          sessionId: 'z',
          note: 'ok',
        },
      }),
    );
    expect((out.payload as { attributes: object }).attributes).toEqual({
      password: '*',
      apiKey: '*',
      client_secret: '*',
      Authorization: '*',
      sessionId: '*',
      note: 'ok',
    });
  });

  it('masks object and array values of secret-like fields', () => {
    const out = scrub(
      item(TransportItemType.EVENT, {
        name: 'x',
        password: ['hunter2'],
        token: { value: 'hunter2' },
      }),
    );
    expect(out.payload).toEqual({ name: 'x', password: ['*'], token: { '*': '*' } });
  });

  it('masks numbers under secret-like fields except metric names, and keeps Dates', () => {
    const when = new Date(0);
    const out = scrub(item(TransportItemType.EVENT, { name: 'x', token: 42, tokenCount: 7, when }));
    expect(out.payload).toEqual({ name: 'x', token: '*', tokenCount: 7, when });
  });

  it('keeps meta.session by default and removes it with dropSessionMeta', () => {
    const session = { id: 'abc123', attributes: { a: 'b' } };
    const source = { type: TransportItemType.LOG, payload: {}, meta: { session } };
    const kept = redactItem(source as unknown as TransportItem);
    expect(kept?.meta.session).toEqual({ id: 'abc123', attributes: { a: 'b' } });
    const dropped = redactItem(source as unknown as TransportItem, [], { dropSessionMeta: true });
    expect(dropped?.meta).toEqual({});
    expect(source.meta.session).toBe(session);
  });

  it('removes a non-object meta.session with dropSessionMeta instead of masking it', () => {
    const out = redactItem(
      {
        type: TransportItemType.LOG,
        payload: {},
        meta: { session: 'abc' },
      } as unknown as TransportItem,
      [],
      { dropSessionMeta: true },
    );
    expect(out?.meta).toEqual({});
  });

  it.each(['session', 'Session', 'SESSION'])('drops meta.%s with dropSessionMeta', (name) => {
    const out = redactItem(
      {
        type: TransportItemType.LOG,
        payload: {},
        meta: { [name]: { id: 'abc123' }, page: { url: 'https://h.example.com/p' } },
      } as unknown as TransportItem,
      [],
      { dropSessionMeta: true },
    );
    expect(out?.meta).toEqual({ page: { url: 'https://h.example.com/p' } });
  });

  it('applies capability paths to object keys as well as values', () => {
    const capabilityPaths: CapabilityPath[] = [[/(\/s\/)[^/?#\s]+/g, '$1:token']];
    const out = scrub(item(TransportItemType.LOG, { '/s/abcdef123456': 'x' }), capabilityPaths);
    expect(out.payload).toEqual({ '/s/:token': 'x' });
  });

  it('applies capability paths before redaction, to meta and payload', () => {
    const capabilityPaths: CapabilityPath[] = [[/(\/s\/)[^/?#\s]+/g, '$1:token']];
    const out = scrub(
      item(
        TransportItemType.LOG,
        { message: 'GET /s/abcDEF123 failed' },
        'https://a.com/s/abcDEF123',
      ),
      capabilityPaths,
    );
    expect((out.payload as { message: string }).message).toBe('GET /s/:token failed');
    expect(out.meta.page?.url).toBe('https://a.com/s/:token');
  });

  it('does not touch strings with the default capability paths', () => {
    const out = scrub(item(TransportItemType.LOG, { message: 'GET /s/abcDEF123 failed' }));
    expect((out.payload as { message: string }).message).toBe('GET /s/abcDEF123 failed');
  });
});
