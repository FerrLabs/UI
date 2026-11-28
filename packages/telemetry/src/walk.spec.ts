import { isSecretName, redactText } from './redact-text.js';
import { assert, describe, expect, it } from 'vitest';
import type { TransportItem } from '@grafana/faro-web-sdk';
import { assertNearLinear } from './scaling.fixture.js';
import { redactDeep, sanitizeItem } from './walk.js';

const MARKER = ['hunter2', 'SECRET', 'zq'].join('');

function sanitized(payload: unknown, meta: object = {}): unknown {
  const out = sanitizeItem({ type: 'log', meta, payload } as unknown as TransportItem);
  assert.ok(out);
  return out;
}

function payloadOf(payload: object): Record<string, unknown> {
  return (sanitized(payload) as { payload: Record<string, unknown> }).payload;
}

function containsMarker(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === 'string') return value.includes(MARKER);
  if (value === null || typeof value !== 'object') return false;
  if (seen.has(value)) return false;
  seen.add(value);
  return Object.entries(value).some(
    ([key, entry]) => key.includes(MARKER) || containsMarker(entry, seen),
  );
}

describe('redactDeep', () => {
  it('masks a string field named like a secret', () => {
    expect(redactDeep({ token: 'abc123def' })).toStrictEqual({ token: '*' });
    expect(redactDeep({ password: 'hunter2' })).toStrictEqual({ password: '*' });
    expect(redactDeep({ apiKey: 'x' })).toStrictEqual({ apiKey: '*' });
    expect(redactDeep({ 'x-auth-token': 'x' })).toStrictEqual({ 'x-auth-token': '*' });
  });

  it('masks a nested field named like a secret', () => {
    expect(redactDeep({ a: { apiKey: 'x' } })).toStrictEqual({ a: { apiKey: '*' } });
    expect(redactDeep({ list: [{ session_id: 'x' }] })).toStrictEqual({
      list: [{ session_id: '*' }],
    });
  });

  it('keeps a field that is not named like a secret', () => {
    expect(redactDeep({ name: 'ok' })).toStrictEqual({ name: 'ok' });
  });

  it('masks every leaf under a sensitive key including numbers', () => {
    expect(redactDeep({ token: { value: 'x', note: 'password=abc12345' } })).toStrictEqual({
      token: { '*': '*', '*#2': '*' },
    });
    expect(redactDeep({ key: 42 })).toStrictEqual({ key: '*' });
  });

  it('masks numbers, bigints and array elements under a sensitive key', () => {
    expect(redactDeep({ password: 123456 })).toStrictEqual({ password: '*' });
    expect(redactDeep({ session_id: 987654321 })).toStrictEqual({ session_id: '*' });
    expect(redactDeep({ sessionId: 123456789n })).toStrictEqual({ sessionId: '*' });
    expect(redactDeep({ token: ['abc123def', 5, 7n, ['nested']] })).toStrictEqual({
      token: ['*', '*', '*', ['*']],
    });
    expect(
      redactDeep({ apiKey: ['k1', { note: 'x', url: 'https://a.test/x?code=abc' }] }),
    ).toStrictEqual({
      apiKey: ['*', { '*': '*', '*#2': '*' }],
    });
    expect(redactDeep({ list: ['plain'] })).toStrictEqual({ list: ['plain'] });
  });

  it('masks field names with dots, dollars and spaces and keeps benign names', () => {
    expect(
      redactDeep({
        'user.password': 'hunter2',
        $password: 'h',
        'api key': 'k',
        client$token: 'c',
        'auth.token': 't',
      }),
    ).toStrictEqual({
      'user.password': '*',
      $password: '*',
      'api key': '*',
      client$token: '*',
      'auth.token': '*',
    });
    expect(redactDeep({ cacheKey: 'home', authMethod: 'sso', author: 'jane' })).toStrictEqual({
      cacheKey: 'home',
      authMethod: 'sso',
      author: 'jane',
    });
  });

  it('matches benign field exclusions on the key suffix only', () => {
    expect(
      redactDeep({ homeCacheKey: 'a', x: { idempotencyKey: 'b' }, user: { authType: 'sso' } }),
    ).toStrictEqual({
      homeCacheKey: 'a',
      x: { idempotencyKey: 'b' },
      user: { authType: 'sso' },
    });
    expect(
      redactDeep({ daemonKey: 'a', commonKey: 'b', codeSig: 'c', escrowKey: 'd' }),
    ).toStrictEqual({
      daemonKey: '*',
      commonKey: '*',
      codeSig: '*',
      escrowKey: '*',
    });
  });

  it('masks plural and prefixed code and state field names', () => {
    expect(
      redactDeep({
        storageKey: 'abc',
        tokens: ['x'],
        apiKeys: 'k',
        otp_code: 123456,
        mfaCode: 'm',
        session_state: 's',
      }),
    ).toStrictEqual({
      storageKey: '*',
      tokens: ['*'],
      apiKeys: '*',
      otp_code: '*',
      mfaCode: '*',
      session_state: '*',
    });
  });

  it('keeps bare and benign code and state field names', () => {
    const input = {
      code: 'a',
      state: 'b',
      errorCode: 'c',
      httpStatusCode: 'd',
      readyState: 'e',
      homeCacheKeys: 'f',
    };
    expect(redactDeep(input)).toStrictEqual(input);
  });

  it('keeps every key that redacts to the same string', () => {
    expect(redactDeep({ 'a@b.com': 1, 'c@d.com': 2 })).toStrictEqual({ '*': 1, '*#2': 2 });
  });

  it('scrubs keys and string values with the given redactor', () => {
    expect(redactDeep({ url: 'x' }, (value) => value.toUpperCase())).toStrictEqual({ URL: 'X' });
  });

  it('survives cycles', () => {
    const node: Record<string, unknown> = { name: 'a' };
    node['self'] = node;
    const copy = redactDeep(node) as Record<string, unknown>;
    expect(copy['self']).toBe(copy);
  });
});

describe('sanitizeItem', () => {
  const item = (meta: object, payload: object) => ({ type: 'exception', meta, payload }) as never;

  it('redacts meta and payload', () => {
    const out = sanitizeItem(
      item({ page: { url: 'https://h.example.com/a?token=abc' } }, { value: 'password=abc12345' }),
    ) as never as {
      meta: { page: { url: string } };
      payload: { value: string };
    };
    expect(out.meta.page.url).not.toContain('abc');
    expect(out.payload.value).not.toContain('abc');
  });

  it('drops the item when the walk throws', () => {
    const hostile = {
      get meta(): never {
        throw new Error('boom');
      },
      payload: {},
    };
    expect(sanitizeItem(hostile as never)).toBeNull();
  });
});

describe('aliased containers and metric fields', () => {
  const run = (meta: object, payload: object) => {
    const out = sanitizeItem({ type: 'log', meta, payload } as never);
    expect(out).toBeTruthy();
    return out as unknown as { meta: Record<string, unknown>; payload: Record<string, unknown> };
  };

  it('masks a container reached under a secret field after a benign field', () => {
    const shared = ['hunter2'];
    const { payload } = run({}, { list: shared, password: shared });
    expect(payload['password']).toStrictEqual(['*']);
  });

  it('masks a container reached under a secret field before a benign field', () => {
    const shared = ['hunter2'];
    const { payload } = run({}, { password: shared, list: shared });
    expect(payload['password']).toStrictEqual(['*']);
  });

  it('masks a container shared between meta and payload', () => {
    const shared = ['hunter2'];
    const { payload } = run({ list: shared }, { password: shared });
    expect(payload['password']).toStrictEqual(['*']);
  });

  it('masks a container shared between meta and payload with the secret field in meta', () => {
    const shared = ['hunter2'];
    const { meta } = run({ token: shared }, { list: shared });
    expect(meta['token']).toStrictEqual(['*']);
  });

  it('terminates on a self-referencing object under a secret field', () => {
    const loop: Record<string, unknown> = { note: 'x', password: 'hunter2' };
    loop['self'] = loop;
    const { payload } = run({}, { token: loop });
    expect(Object.values(payload['token'] as Record<string, unknown>).slice(0, 2)).toStrictEqual([
      '*',
      '*',
    ]);
    expect(Object.keys(payload['token'] as object)).not.toContain('password');
  });

  it('terminates on a self-referencing array under a secret field', () => {
    const loop: unknown[] = ['hunter2'];
    loop.push(loop);
    const { payload } = run({}, { token: loop });
    expect((payload['token'] as unknown[])[0]).toStrictEqual('*');
  });

  it('keeps numbers and bigints under measurement-named secret fields', () => {
    const fields = {
      authentication_duration: 120,
      authLatencyMs: 8,
      tokenTtl: 3600,
      authExpiresAt: 1700000000,
      authSessionAgeSecs: 5n,
    };
    const { payload } = run({}, { ...fields });
    expect(payload).toStrictEqual(fields);
  });

  it('masks numbers under other secret fields', () => {
    const { payload } = run({}, { password: 4829, pin_key: 1234, sessionId: 77n, authCode: 5 });
    expect(payload).toStrictEqual({
      password: '*',
      pin_key: '*',
      sessionId: '*',
      authCode: '*',
    });
  });

  it('masks strings under measurement-named secret fields', () => {
    const { payload } = run({}, { authentication_duration: 'abc123', authLatencyMs: '8' });
    expect(payload).toStrictEqual({ authentication_duration: '*', authLatencyMs: '*' });
  });
});

describe('walk keys, non-plain values and metric names', () => {
  const run = (meta: object, payload: object) => {
    const out = sanitizeItem({ type: 'log', meta, payload } as never);
    expect(out).toBeTruthy();
    return out as unknown as { meta: Record<string, unknown>; payload: Record<string, unknown> };
  };

  it('masks numbers in an array reached under a metric-named secret field, in either order', () => {
    const pins = [4829];
    expect(payloadOf({ authCount: pins, password: pins })).toStrictEqual({
      authCount: ['*'],
      password: ['*'],
    });
    const reversed = [4829];
    expect(payloadOf({ password: reversed, authCount: reversed })).toStrictEqual({
      password: ['*'],
      authCount: ['*'],
    });
  });

  it('masks an array shared between meta and payload under a secret name on either side', () => {
    const pins = [4829];
    const first = run({ authCount: pins }, { password: pins });
    expect(first.meta['authCount']).toStrictEqual(['*']);
    expect(first.payload['password']).toStrictEqual(['*']);
    const others = [4829];
    const second = run({ password: others }, { authCount: others });
    expect(second.meta['password']).toStrictEqual(['*']);
    expect(second.payload['authCount']).toStrictEqual(['*']);
  });

  it('keeps a number stored directly under a metric-named secret field', () => {
    expect(
      payloadOf({ authCount: 3, authLatencyMs: 8, authentication_duration: 120, tokenTtl: 3600 }),
    ).toStrictEqual({
      authCount: 3,
      authLatencyMs: 8,
      authentication_duration: 120,
      tokenTtl: 3600,
    });
  });

  it('masks a number under a name that only ends in a metric suffix by accident', () => {
    expect(payloadOf({ authSms: 482913 })).toStrictEqual({ authSms: '*' });
  });

  it('masks values under secret names written with brackets, colons and slashes', () => {
    const out = payloadOf({
      'user[password]': 'hunter2',
      'db:password': 'hunter2',
      'credentials[0].token': 'hunter2',
      'a/b/secret': 'hunter2',
      name: 'ok',
    });
    expect(out).toStrictEqual({
      'user[password]': '*',
      'db:password': '*',
      'credentials[0].token': '*',
      'a/b/secret': '*',
      name: 'ok',
    });
  });

  const nonPlain: ReadonlyArray<readonly [string, () => unknown]> = [
    ['a String object', () => new String('hunter2')],
    [
      'a class instance',
      () =>
        new (class Credentials {
          readonly value = 'hunter2';
        })(),
    ],
    ['a typed array', () => new Uint8Array([1, 2, 3])],
    ['a Date', () => new Date(0)],
    ['a Map', () => new Map([['k', 'hunter2']])],
    ['a Set', () => new Set(['hunter2'])],
  ];
  for (const [label, make] of nonPlain) {
    it(`masks ${label} under a secret name`, () => {
      const out = payloadOf({ password: make(), authCount: make(), token: [make()] });
      expect(out).toStrictEqual({ password: '*', authCount: '*', token: ['*'] });
    });
  }

  it('keeps null, undefined and booleans under a secret name', () => {
    expect(
      payloadOf({ password: null, token: undefined, secret: true, apiKey: false }),
    ).toStrictEqual({
      password: null,
      token: undefined,
      secret: true,
      apiKey: false,
    });
  });

  it('redacts object keys that carry a secret', () => {
    const out = payloadOf({
      context: { 'https://h.com/cb?token=ZqSECRET9': 'clicked', 'ZqSECRET9@example.com': 1 },
    });
    expect(JSON.stringify(out)).not.toContain('ZqSECRET9');
  });

  it('keeps both values when two keys collide after redaction', () => {
    const out = payloadOf({
      context: { 'a?token=ZqSECRETa': 'first', 'a?token=ZqSECRETb': 'second' },
    });
    const context = out['context'] as Record<string, unknown>;
    expect(Object.values(context)).toStrictEqual(['first', 'second']);
    expect(JSON.stringify(out)).not.toContain('ZqSECRET');
  });

  it('keeps ordinary keys untouched', () => {
    expect(payloadOf({ context: { userId: 'u1', 'x-request-id': 'r1' } })).toStrictEqual({
      context: { userId: 'u1', 'x-request-id': 'r1' },
    });
  });

  it('keeps hotkey and error codes and masks apikey in text', () => {
    expect(redactText('hotkey: Ctrl')).toStrictEqual('hotkey: Ctrl');
    expect(redactText('errorCode=E42')).toStrictEqual('errorCode=E42');
    expect(redactText('apikey=S3cret')).not.toContain('S3cret');
  });

  it('has no regex lookbehind in any shipped module source', () => {
    const sources = import.meta.glob<string>('./**/*.ts', {
      query: '?raw',
      import: 'default',
      eager: true,
    });
    const shipped = Object.entries(sources).filter(([file]) => !/\.(spec|fixture)\.ts$/.test(file));
    expect(shipped.some(([file]) => file === './redact-text.ts')).toBe(true);
    for (const [file, source] of shipped) {
      expect(source, file).not.toContain('(?<');
    }
  });
});

describe('secret subtrees, metric names and key normalization', () => {
  const SECRET = 'hunter2abc';
  const subtreeLeaks: ReadonlyArray<readonly [object, string]> = [
    [{ password: { value: SECRET } }, SECRET],
    [{ token: [{ value: SECRET }] }, SECRET],
    [{ apiKey: { primary: SECRET } }, SECRET],
    [{ client_secret: { current: { raw: SECRET } } }, SECRET],
    [{ password: [[SECRET]] }, SECRET],
    [{ secret: { n: 48291234 } }, '48291234'],
    [{ token: { x: 3 } }, '3'],
    [{ auth_count: { x: 3 } }, '3'],
  ];

  for (const [payload, marker] of subtreeLeaks) {
    it(`masks every leaf of ${JSON.stringify(payload)}`, () => {
      const out = JSON.stringify(redactDeep(structuredClone(payload)));
      expect(out, out).not.toContain(marker);
    });
  }

  it('keeps shape, booleans and null under a secret field and leaves other fields alone', () => {
    expect(
      redactDeep({ password: { enabled: true, value: null, deep: { ok: false, v: 'x' } } }),
    ).toStrictEqual({
      password: { '*': true, '*#2': null, '*#3': { '*': false, '*#2': '*' } },
    });
    expect(redactDeep({ settings: { theme: 'dark' } })).toStrictEqual({
      settings: { theme: 'dark' },
    });
  });

  it('keeps numbers under metric names in any case and masks other secret numbers', () => {
    expect(
      redactDeep({
        AUTH_COUNT: 3,
        auth_count: 3,
        authCount: 3,
        SESSION_DURATION_MS: 7,
        TOKEN_TTL: 9,
      }),
    ).toStrictEqual({
      AUTH_COUNT: 3,
      auth_count: 3,
      authCount: 3,
      SESSION_DURATION_MS: 7,
      TOKEN_TTL: 9,
    });
    expect(redactDeep({ AUTH_TOKEN: 3 })).toStrictEqual({ AUTH_TOKEN: '*' });
  });

  it('keeps colliding redacted keys under a secret field', () => {
    expect(redactDeep({ password: { 'a@b.com': 'x', 'c@d.com': 'y' } })).toStrictEqual({
      password: { '*': '*', '*#2': '*' },
    });
  });

  it('does not treat separator-joined benign key names as secret', () => {
    for (const key of ['i18n:key', 'cache:key', 'cache/key'])
      expect(isSecretName(key), key).toBe(false);
  });

  it('treats bracketed, slashed, colon-joined and dotted secret names as secret', () => {
    for (const key of ['user[password]', 'headers/authorization', 'a:b:token', 'x.password'])
      expect(isSecretName(key), key).toBe(true);
  });
});
describe('redactText code and state keys', () => {
  const masked: ReadonlyArray<readonly [string, string]> = [
    ['otp_code: 834201 sent', 'otp_code: *'],
    ['{"mfa_code": "834201"}', '{"mfa_code": *}'],
    ['user_code: WDJB-MJHT', 'user_code: *'],
    ['relay_state: abc123xyz', 'relay_state: *'],
  ];
  const kept: readonly string[] = [
    'Error code: 404',
    'status code: 404',
    'status_code: 200',
    'code: ERR_NETWORK',
    'state: open',
    'readyState: complete',
    'game_state: lobby',
  ];

  for (const [input, expected] of masked) {
    it(`masks ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).toBe(expected);
    });
  }

  for (const input of kept) {
    it(`keeps ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).toBe(input);
    });
  }

  it('scales near-linearly on 16 KB of prefixed code keys', () => {
    expect(() => assertNearLinear((count) => 'x_code:'.repeat(count), 2400)).not.toThrow();
  });
});

describe('spaced field names', () => {
  it('masks benign-looking prefixes before a secret word', () => {
    expect(
      redactDeep({
        'Monkey api_key': 'v0',
        'hotkey password': 'v1',
        'turkey session_id': 'v2',
        'donkey key': 'v3',
        'Hotkey pwd': 'v4',
      }),
    ).toStrictEqual({
      'Monkey api_key': '*',
      'hotkey password': '*',
      'turkey session_id': '*',
      'donkey key': '*',
      'Hotkey pwd': '*',
    });
  });

  it('keeps spaced names that are not secret', () => {
    const payload = { 'cache key': 'ok', monkey: 'ok', hotkey: 'ok' };
    expect(redactDeep(payload)).toStrictEqual({
      'cache key': 'ok',
      monkey: 'ok',
      hotkey: 'ok',
    });
  });
});

describe('field names with punctuation and long prefixes', () => {
  const valueOf = (name: string): unknown => {
    const out = sanitizeItem({ type: 'log', meta: {}, payload: { [name]: 'ZqVal1' } } as never);
    expect(out).toBeTruthy();
    return Object.values((out as unknown as { payload: Record<string, unknown> }).payload)[0];
  };

  for (const name of [
    'login(form)/password',
    'user@host/password',
    'form#login/token',
    'a+b/secret',
    '100%/token',
    'a'.repeat(80) + '_password',
  ]) {
    it(`masks ${JSON.stringify(name.length > 40 ? `${name.slice(0, 4)}...${name.slice(-9)}` : name)}`, () => {
      expect(valueOf(name)).toBe('*');
    });
  }

  for (const name of ['cache key', 'i18n:key', 'homeCacheKey', 'a'.repeat(80) + '_monkey']) {
    it(`keeps ${JSON.stringify(name.length > 40 ? `${name.slice(0, 4)}...${name.slice(-7)}` : name)}`, () => {
      expect(valueOf(name)).toBe('ZqVal1');
    });
  }
});

describe('sanitizeItem copies and the Faro session meta', () => {
  type Tree = { [key: string]: Tree };
  type Sanitized = { meta: Tree; payload: Tree };
  const run = (meta: object, payload: object): Sanitized => {
    const out = sanitizeItem({ type: 'log', meta, payload } as never);
    expect(out).toBeTruthy();
    return out as unknown as Sanitized;
  };

  it('does not mutate the item or anything reachable from it', () => {
    const session = { id: 'sess-123', attributes: { plan: 'pro' } };
    const meta = { session, user: { email: 'jane@corp.io' } };
    const payload = {
      context: { password: MARKER, note: 'a@b.com' },
      list: ['a@b.com'],
    };
    const before = structuredClone({ meta, payload });
    const out = run(meta, payload);
    expect({ meta, payload }).toStrictEqual(before);
    expect(out.meta['session']).not.toBe(session);
    expect(out.payload['context']['password']).toBe('*');
  });

  it('keeps the session id and attributes of the Faro meta', () => {
    const { meta } = run({ session: { id: 'sess-123', attributes: { plan: 'pro' } } }, {});
    expect(meta['session']).toStrictEqual({ id: 'sess-123', attributes: { plan: 'pro' } });
  });

  it('masks a string, number or bigint directly under session', () => {
    const { payload } = run({}, { session: 'abc123SECRET' });
    expect(payload['session']).toBe('*');
    expect(run({}, { Session: 48291234 }).payload['Session']).toBe('*');
    expect(run({}, { session: 48291234n }).payload['session']).toBe('*');
  });

  it('still masks the other session fields', () => {
    const { payload } = run(
      {},
      {
        session_id: 'abc123SECRET',
        sessionId: 'abc123SECRET',
        session_token: 'abc123SECRET',
        sessionKey: 'abc123SECRET',
      },
    );
    expect(Object.values(payload)).toStrictEqual(['*', '*', '*', '*']);
  });

  it('walks a non-extensible object with a secret and colliding keys without touching it', () => {
    const data = Object.preventExtensions({
      password: MARKER,
      'a@b.com': 1,
      'c@d.com': 2,
      keep: 'ok',
    });
    const before = structuredClone(data);
    const { payload } = run({}, { data });
    expect(data).toStrictEqual(before);
    expect(payload['data']['password']).toBe('*');
    expect(payload['data']['keep']).toBe('ok');
    expect(Object.keys(payload['data'])).toHaveLength(4);
  });

  it('masks every leaf of an object that holds itself under a secret field', () => {
    const loop: Record<string, unknown> = {};
    loop['password'] = loop;
    loop['note'] = MARKER;
    const { payload } = run({}, { loop });
    expect(Object.keys(payload['loop'])).not.toContain('note');
    expect(Object.values<unknown>(payload['loop'])).not.toContain(MARKER);
    const reversed: Record<string, unknown> = { note: MARKER };
    reversed['password'] = reversed;
    const reversedOut = run({}, { reversed }).payload['reversed'];
    expect(Object.keys(reversedOut)).not.toContain('note');
    expect(Object.values<unknown>(reversedOut)).not.toContain(MARKER);
  });

  it('keeps token counts and masks bare tokens', () => {
    const { payload } = run(
      {},
      {
        usage: {
          inputTokens: 12,
          max_tokens: 100,
          total_tokens: 7,
          OUTPUT_TOKENS: 3,
          'prompt-tokens': 5,
        },
        tokens: ['abc123SECRET'],
        token: 42,
      },
    );
    expect(payload['usage']).toStrictEqual({
      inputTokens: 12,
      max_tokens: 100,
      total_tokens: 7,
      OUTPUT_TOKENS: 3,
      'prompt-tokens': 5,
    });
    expect(payload['tokens']).toStrictEqual(['*']);
    expect(payload['token']).toBe('*');
  });
});

describe('keys under secret fields', () => {
  const marker = 'ghp_Zq9realTokenValue';

  it('masks keys and leaves under a secret field', () => {
    const out = payloadOf({ token: { [marker]: { a: 1 } } });
    expect(out).toStrictEqual({ token: { '*': { '*': '*' } } });
    expect(JSON.stringify(out)).not.toContain(marker);
  });

  it('keeps colliding masked keys apart', () => {
    expect(payloadOf({ secret: { aaa: 'x', bbb: 'y' } })).toStrictEqual({
      secret: { '*': '*', '*#2': '*' },
    });
  });

  it('keeps null and booleans under a secret subtree', () => {
    expect(payloadOf({ password: { enabled: true, off: false, value: null } })).toStrictEqual({
      password: { '*': true, '*#2': false, '*#3': null },
    });
  });

  it('leaves keys outside secret subtrees unchanged', () => {
    expect(payloadOf({ settings: { theme: 'dark', nested: { size: 'big' } } })).toStrictEqual({
      settings: { theme: 'dark', nested: { size: 'big' } },
    });
  });

  it('masks keys and leaves of a cyclic secret subtree and does not mutate it', () => {
    const loop: Record<string, unknown> = {};
    loop['password'] = loop;
    loop[marker] = marker;
    const keysBefore = Object.keys(loop);
    const out = payloadOf({ loop });
    const seen = new Set<unknown>();
    const strings: string[] = [];
    const collect = (value: unknown): void => {
      if (typeof value === 'string') strings.push(value);
      if (typeof value !== 'object' || value === null || seen.has(value)) return;
      seen.add(value);
      for (const [key, inner] of Object.entries(value)) {
        strings.push(key);
        collect(inner);
      }
    };
    collect(out);
    expect(strings.some((text) => text.includes(marker))).toBe(false);
    expect(Object.keys(loop)).toStrictEqual(keysBefore);
    expect(loop[marker]).toBe(marker);
  });

  it('does not mutate the input', () => {
    const payload = { token: { [marker]: { a: 1 } }, keep: { x: 'y' } };
    const before = structuredClone(payload);
    payloadOf(payload);
    expect(payload).toStrictEqual(before);
  });
});

describe('credential hosts, cookies, bearer chains and code words', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['//password:12345/next', '//password:*'],
    ['see //token:8342/x', 'see //token:*'],
    ['//auth:8080/x', '//auth:8080/x'],
    ['//db.internal:5432/app', '//db.internal:5432/app'],
    ['Cookie: theme=dark; sid=abc123', 'Cookie: *'],
    ['Set-Cookie: sid=abc123; Path=/', 'Set-Cookie: *'],
    ['cookie=abc123', 'cookie=*'],
    ['cookie_consent=accepted', 'cookie_consent=accepted'],
    ['cookieConsent: yes', 'cookieConsent: yes'],
    ['a'.repeat(60) + '_monkey=3', 'a'.repeat(60) + '_monkey=3'],
    ['a'.repeat(317) + '_monkey=3', 'a'.repeat(317) + '_monkey=3'],
    ['a'.repeat(300) + '_password=hunter2abc', 'a'.repeat(300) + '_password=*'],
    ['a'.repeat(300) + '_otp_code: 834201', 'a'.repeat(300) + '_otp_code: *'],
    ['Authorization: Bearer abcdefgh&otp_code: 834201', 'Authorization: Bearer *&otp_code: *'],
    [
      'Authorization: Bearer abcdefgh&id=1&password=Basic ZqSECRET9',
      'Authorization: Bearer *&password=*',
    ],
    ['password: correct\vhorse', 'password: *'],
    ['password: correct\fhorse', 'password: *'],
    ['versionCode=42', 'versionCode=42'],
    ['roomCode=AB12', 'roomCode=AB12'],
    ['combatState=idle', 'combatState=idle'],
    ['boardState=x', 'boardState=x'],
    ['team_code=x', 'team_code=*'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input.slice(0, 48))} to ${JSON.stringify(output.slice(-24))}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }
});

describe('secret reachability does not depend on key order', () => {
  interface Walked {
    meta: { session?: unknown };
    payload: {
      plain?: unknown;
      secret?: unknown;
      password?: object;
      reversed?: object;
      context?: { session?: unknown };
    };
  }

  function walked(payload: object, meta: object = {}): Walked {
    const out = sanitizeItem({ type: 'log', meta, payload } as unknown as TransportItem);
    expect(out).toBeTruthy();
    return out as unknown as Walked;
  }

  for (const keys of [
    ['password', 'reversed'],
    ['reversed', 'password'],
  ]) {
    it(`masks a cycle through a secret field with keys in the order ${keys.join(', ')}`, () => {
      const ring: { note: string; password?: unknown } = { note: MARKER };
      ring.password = ring;
      const payload: Record<string, unknown> = {};
      for (const key of keys) payload[key] = ring;
      const out = walked(payload).payload;
      expect(containsMarker(out)).toBe(false);
      expect(Object.keys(out.reversed ?? {})).toStrictEqual(Object.keys(out.password ?? {}));
    });
  }

  for (const keys of [
    ['token', 'loop'],
    ['loop', 'token'],
  ]) {
    it(`masks a loop shared with a token field with keys in the order ${keys.join(', ')}`, () => {
      const loop: { note: string; password?: unknown } = { note: MARKER };
      loop.password = loop;
      const payload: Record<string, unknown> = {};
      for (const key of keys) payload[key] = loop;
      expect(containsMarker(walked(payload).payload)).toBe(false);
    });
  }

  for (const keys of [
    ['plain', 'secret'],
    ['secret', 'plain'],
  ]) {
    it(`masks a container shared between a plain and a secret field, order ${keys.join(', ')}`, () => {
      const shared = { v: MARKER };
      const payload: Record<string, unknown> = {};
      for (const key of keys) payload[key] = shared;
      const out = walked(payload).payload;
      expect(out.plain).toStrictEqual({ '*': '*' });
      expect(out.secret).toStrictEqual({ '*': '*' });
    });
  }

  it('masks everything under a session key outside meta', () => {
    const out = walked({ context: { session: { value: MARKER, cookie: MARKER } } }).payload;
    expect(out.context?.session).toStrictEqual({ '*': '*', '*#2': '*' });
  });

  it('masks a session key nested in meta.session', () => {
    const out = walked({}, { session: { id: 's1', nested: { session: { value: MARKER } } } }).meta;
    expect(containsMarker(out)).toBe(false);
  });

  it('masks cookie fields', () => {
    const out = walked({ cookie: MARKER, headers: { Cookie: 'a=' + MARKER } }).payload;
    expect(out).toStrictEqual({ cookie: '*', headers: { Cookie: '*' } });
  });

  it('keeps meta.session and masks secrets inside it', () => {
    const session = { id: 'sess-1', attributes: { a: 'b' }, token: MARKER };
    const out = walked({}, { session }).meta;
    expect(out.session).toStrictEqual({ id: 'sess-1', attributes: { a: 'b' }, token: '*' });
  });

  it('masks meta.session when a secret field also reaches it', () => {
    const session = { id: 'sess-1' };
    const out = walked({ token: session }, { session }).meta;
    expect(out.session).toStrictEqual({ '*': '*' });
  });
});

describe('secret reachability across shared containers', () => {
  for (const order of ['secret first', 'plain first']) {
    it(`masks a cycle that reaches itself through a plain key and a secret subtree, ${order}`, () => {
      const node: { note: string; password?: unknown } = { note: MARKER };
      const hub: { b: unknown } = { b: node };
      node.password = hub;
      const payload = order === 'secret first' ? { token: hub, node } : { node, token: hub };
      expect(containsMarker(sanitized(payload))).toBe(false);
    });
  }
});

describe('field names: primary and query keys, narrowed state words', () => {
  for (const name of [
    'auth_request_state',
    'oauth_client_state',
    'api_key_code',
    'orderState',
    'x_keycode',
    'cosmosPrimaryKey',
    'storageAccountPrimaryKey',
    'searchAdminQueryKey',
    'cosmos_primary_key',
  ]) {
    it(`masks the field ${name}`, () => {
      expect(payloadOf({ [name]: 'SECRET99' })).toStrictEqual({ [name]: '*' });
    });
  }

  for (const name of [
    'primaryKey',
    'primary_key',
    'db.primaryKey',
    'queryKey',
    'keyCode',
    'key_code',
    'readyState',
    'game_state',
  ]) {
    it(`keeps the field ${name}`, () => {
      expect(payloadOf({ [name]: 'ok' })).toStrictEqual({ [name]: 'ok' });
    });
  }

  it('keeps a primaryKey nested under a plain parent', () => {
    expect(payloadOf({ db: { primaryKey: 'ok', queryKey: 'ok' } })).toStrictEqual({
      db: { primaryKey: 'ok', queryKey: 'ok' },
    });
  });
});

describe('field names: group, object and lookup keys', () => {
  for (const name of ['wpaGroupKey', 'mlsGroupKey', 's3ObjectKey']) {
    it(`masks the field ${name}`, () => {
      expect(payloadOf({ [name]: 'SECRET99' })).toStrictEqual({ [name]: '*' });
    });
  }

  for (const name of [
    'groupKey',
    'group_key',
    'db.groupKey',
    'objectKey',
    'foreignKey',
    'uniqueKey',
    'lookupKey',
    'homeCacheKey',
    'partitionKey',
    'cosmosPartitionKey',
  ]) {
    it(`keeps the field ${name}`, () => {
      expect(payloadOf({ [name]: 'ok' })).toStrictEqual({ [name]: 'ok' });
    });
  }
});

describe('auth prefixes, cookie headers and state words', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['auth_hotkey=Zq9SECRET', 'auth_hotkey=*'],
    ['authdesig=Zq9SECRET', 'authdesig=*'],
    ['my_hotkey=3', 'my_hotkey=3'],
    ['hotkey=3', 'hotkey=3'],
    ['author=jane', 'author=jane'],
    ['http_status_code=200', 'http_status_code=200'],
    ['Cookie: theme=dark; sid=abc123', 'Cookie: *'],
    ['x\nSet-Cookie: sid=abc; Path=/', 'x\nSet-Cookie: *'],
    ['Error reading cookie: invalid header at line 3, user=bob', 'Error reading cookie: *'],
    ['playerReadyState=1', 'playerReadyState=1'],
    ['orderState=paid', 'orderState=*'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input.slice(0, 48))} to ${JSON.stringify(output.slice(-24))}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }

  it('redacts an auth_hotkey field', () => {
    const out = sanitizeItem({
      type: 'log',
      meta: {},
      payload: { auth_hotkey: 'Zq9SECRET' },
    } as unknown as TransportItem);
    expect(out).toBeTruthy();
    expect(JSON.stringify(out)).not.toContain('Zq9SECRET');
  });
});

describe('each property is read once', () => {
  it('masks an object returned by a getter under a secret key', () => {
    const payload = {
      get password() {
        return { value: MARKER };
      },
    };
    expect(containsMarker(sanitized(payload))).toBe(false);
  });

  it('masks an array returned by a getter under a secret key', () => {
    const payload = Object.defineProperty({}, 'token', {
      enumerable: true,
      get: () => [{ v: MARKER }],
    });
    expect(containsMarker(sanitized(payload))).toBe(false);
  });

  it('masks fresh objects returned by a proxy under a secret key', () => {
    const inner = { value: MARKER };
    const payload = new Proxy(
      { password: inner },
      { get: (target, key) => (key === 'password' ? { ...inner } : Reflect.get(target, key)) },
    );
    expect(containsMarker(sanitized(payload))).toBe(false);
  });

  it('masks a proxy whose prototype alternates between Object.prototype and null under a secret key', () => {
    let calls = 0;
    const secret = new Proxy(
      { value: MARKER, nested: { value: MARKER } },
      { getPrototypeOf: () => (calls++ % 2 === 0 ? Object.prototype : null) },
    );
    const payload = { password: secret };
    expect(containsMarker(sanitized(payload))).toBe(false);
  });

  it('masks a proxy whose first prototype answer is not plain under a secret key', () => {
    let calls = 0;
    const secret = new Proxy(
      { value: MARKER, nested: { value: MARKER } },
      { getPrototypeOf: () => (calls++ === 0 ? Array.prototype : Object.prototype) },
    );
    const payload = { password: secret };
    expect(containsMarker(sanitized(payload))).toBe(false);
  });

  it('masks a container reached through child.password back to itself', () => {
    const root: { child: { password?: unknown }; note: string } = { child: {}, note: MARKER };
    root.child.password = root;
    expect(containsMarker(sanitized(root))).toBe(false);
  });

  const meta = (): { session: { id: string } } => ({ session: { id: MARKER } });

  it('masks meta.session when the payload is the meta object', () => {
    const shared = meta();
    expect(containsMarker(sanitized(shared, shared))).toBe(false);
  });

  it('masks meta.session when the payload holds the meta object in a field', () => {
    const shared = meta();
    expect(containsMarker(sanitized({ ctx: shared }, shared))).toBe(false);
  });

  it('masks meta.session when the payload holds the meta object in an array', () => {
    const shared = meta();
    expect(containsMarker(sanitized([shared], shared))).toBe(false);
  });

  it('keeps meta.session when the payload does not reach it', () => {
    const out = sanitized({}, { session: { id: 'sess-1' } }) as { meta: { session: unknown } };
    expect(out.meta.session).toStrictEqual({ id: 'sess-1' });
  });

  for (const [name, count, unit] of [
    ['words separated by spaces', 31, 'a'.repeat(512) + ' '],
    ['words separated by dashes', 32, 'a'.repeat(511) + '-'],
  ] as const) {
    it(`scales near-linearly on ${name}`, () => {
      expect(() => assertNearLinear((size) => unit.repeat(size), count)).not.toThrow();
    });
  }
});

describe('bearer tokens that start with a short chunk', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['Bearer abc=defghijklmnopqrst', 'Bearer *'],
    ['Bearer abcd:efghijklmnopqr', 'Bearer *'],
    ['Bearer dGVzdA==', 'Bearer *'],
    ['Authorization: Bearer abcdefgh&user=passwd: ZqSECRET9', 'Authorization: Bearer *=passwd: *'],
    [
      'Authorization: Bearer abcdefgh&id=password: ZqSECRET9',
      'Authorization: Bearer *=password: *',
    ],
    ['Authorization: Bearer abcdefgh:token: ZqSECRET9', 'Authorization: Bearer *:token: *'],
    ['Authorization: Bearer abcdefgh=otp_code: ZqSECRET9', 'Authorization: Bearer *=otp_code: *'],
    ['Bearer short', 'Bearer short'],
    ['the bearer of bad news', 'the bearer of bad news'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input.slice(0, 48))} to ${JSON.stringify(output.slice(-24))}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }
});

describe('meta.session exemption', () => {
  const SECRET = 'sess-secret-1';

  function metaOf(session: unknown): { session: unknown } {
    const out = sanitizeItem({
      type: 'log',
      meta: { session },
      payload: {},
    } as unknown as TransportItem);
    return (out as unknown as { meta: { session: unknown } }).meta;
  }

  it('keeps a plain object under meta.session', () => {
    expect(metaOf({ id: 'sess-1' }).session).toStrictEqual({ id: 'sess-1' });
  });

  it('masks a string under meta.session', () => {
    expect(metaOf(SECRET).session).toBe('*');
  });

  it('masks a number under meta.session', () => {
    expect(metaOf(48291234).session).toBe('*');
  });

  it('masks an array under meta.session', () => {
    expect(JSON.stringify(metaOf([SECRET]))).not.toContain(SECRET);
  });
});

describe('Date and Map values under plain and secret keys', () => {
  it('keeps a Date under a plain key as its ISO string and masks a Map under a secret key', () => {
    const out = sanitizeItem({
      type: 'log',
      meta: {},
      payload: {
        when: new Date('2026-01-02T03:04:05.000Z'),
        password: new Map([['a', MARKER]]),
      },
    } as unknown as TransportItem);
    expect(out).toBeTruthy();
    expect(JSON.stringify((out as unknown as { payload: unknown }).payload)).toBe(
      '{"when":"2026-01-02T03:04:05.000Z","password":"*"}',
    );
  });
});

describe('sanitizeItem key cache', () => {
  const payload = {
    first: { 'k@e.com': 1, plain: 'v' },
    second: { 'k@e.com': 2, plain: 'v' },
    list: [{ 'k@e.com': 3 }],
  };
  const item = { type: 'log', meta: {}, payload } as unknown as TransportItem;

  it('redacts a repeated key once per item without changing the output', () => {
    const keyCalls: string[] = [];
    const counting = (value: string): string => {
      if (value === 'k@e.com') keyCalls.push(value);
      return redactText(value);
    };
    const cached = sanitizeItem(item, { redactString: counting });
    expect(keyCalls).toHaveLength(1);
    expect(cached).toStrictEqual(sanitizeItem(item));
  });

  it('starts a fresh cache for every item', () => {
    let calls = 0;
    const counting = (value: string): string => {
      if (value === 'k@e.com') calls++;
      return redactText(value);
    };
    sanitizeItem(item, { redactString: counting });
    sanitizeItem(item, { redactString: counting });
    expect(calls).toBe(2);
  });
});

function dropped(payload: object): unknown {
  return sanitizeItem({ type: 'log', meta: {}, payload } as unknown as TransportItem);
}

describe('Date handling in redactDeep', () => {
  it('copies a real Date instead of returning the same reference', () => {
    const original = new Date('2026-01-02T03:04:05.000Z');
    const out = redactDeep({ when: original }) as { when: Date };
    expect(out.when).toBeInstanceOf(Date);
    expect(out.when).not.toBe(original);
    expect(out.when.getTime()).toBe(original.getTime());
  });

  it('keeps an invalid Date as an invalid Date', () => {
    const out = redactDeep({ when: new Date(Number.NaN) }) as { when: Date };
    expect(out.when).toBeInstanceOf(Date);
    expect(Number.isNaN(out.when.getTime())).toBe(true);
  });

  it('copies a Date nested in an array and in an object', () => {
    const first = new Date(1000);
    const second = new Date(2000);
    const out = redactDeep({ list: [first], nested: { at: second } }) as {
      list: Date[];
      nested: { at: Date };
    };
    expect(out.list[0]).not.toBe(first);
    expect(out.list[0]?.getTime()).toBe(1000);
    expect(out.nested.at).not.toBe(second);
    expect(out.nested.at.getTime()).toBe(2000);
  });

  it('drops the item for an object that only inherits from Date.prototype', () => {
    const lookalike = Object.setPrototypeOf({ toJSON: () => MARKER, note: MARKER }, Date.prototype);
    expect(dropped({ when: lookalike })).toBeNull();
  });

  it('drops the item for Object.create(Date.prototype) carrying a secret field', () => {
    const lookalike = Object.create(Date.prototype, {
      secret: { value: MARKER, enumerable: true },
    }) as object;
    expect(dropped({ when: lookalike })).toBeNull();
  });

  it('turns a stringifiable lookalike into a string instead of passing it through', () => {
    const lookalike = Object.setPrototypeOf(
      { toString: () => 'plain text', toJSON: () => MARKER },
      Date.prototype,
    );
    expect(payloadOf({ when: lookalike })).toStrictEqual({ when: 'plain text' });
  });

  it('does not let a Date subclass override toJSON to emit a secret', () => {
    class Leaky extends Date {
      override toJSON(): string {
        return MARKER;
      }
    }
    const out = redactDeep({ when: new Leaky(0) }) as { when: unknown };
    expect(JSON.stringify(out).includes(MARKER)).toBe(false);
    expect(out.when).toBeInstanceOf(Date);
    expect((out.when as Date).getTime()).toBe(0);
  });

  it('stringifies a Proxy whose getPrototypeOf returns Date.prototype', () => {
    const proxy = new Proxy({ toJSON: () => MARKER }, { getPrototypeOf: () => Date.prototype });
    const out = payloadOf({ when: proxy });
    expect(typeof out['when']).toBe('string');
    expect(JSON.stringify(out).includes(MARKER)).toBe(false);
  });

  it('masks a Date under a secret key', () => {
    const out = redactDeep({ token: new Date(0) });
    expect(out).toStrictEqual({ token: '*' });
  });
});
