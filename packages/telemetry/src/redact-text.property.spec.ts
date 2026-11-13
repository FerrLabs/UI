import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { redactText } from './redact-text.js';

const TOKENS = [
  'password',
  'token',
  'api_key',
  'secret',
  'Bearer',
  'bearer',
  'Basic',
  'auth',
  'code',
  'state',
  'session_id',
  ':',
  '=',
  ': ',
  '= ',
  '"',
  "'",
  '?',
  '#',
  '@',
  '&',
  ';',
  ',',
  '//',
  'https://',
  'a.com',
  'localhost:3000',
  '/p',
  ' ',
  '\n',
  '\t',
  '\\',
  'eyJ',
  '.',
  'x',
  'ab',
  'Zq9',
  '12',
  '8080',
  '-',
  '_',
  '{',
  '}',
  '[',
  ']',
  '<',
  '>',
  '*',
  '+',
  '/',
  '==',
  'user',
];
const tokenText = fc.array(fc.constantFrom(...TOKENS), { maxLength: 25 }).map((t) => t.join(''));
const charText = fc
  .array(fc.constantFrom(...'ab9AZ?#=&@/:."\' .-_\\\n\t*'), { maxLength: 40 })
  .map((c) => c.join(''));
const anyText = fc.oneof(tokenText, charText, fc.string({ maxLength: 64 }));

const KEYS = [
  'password',
  'passwd',
  'pwd',
  'token',
  'access_token',
  'api_key',
  'apiKey',
  'client_secret',
  'secret',
  'session',
  'sessionId',
  'auth',
  'authorization',
  'Authorization',
  'X-Api-Key',
  'x-auth-token',
  'signature',
  'db_password',
  'refresh_token',
];
const PARAM_KEYS = [...KEYS, 'code', 'state'];
const ALNUM = [...'ABCDEFGHJKLMNPRSTUVWXYabcdefhijkmnoprtuvwxy0123456789'];
const PUNCT = [...ALNUM, ...'!$%^*()~+/._-,;&#|'];
const secretOf = (chars: string[]) =>
  fc
    .array(fc.constantFrom(...chars), { minLength: 6, maxLength: 24 })
    .map((c) => `Zq${c.join('')}`);
const CONTEXT = [
  'error',
  'failed',
  'GET',
  'POST',
  'for',
  'user=bob',
  'id=7',
  'status: 500',
  'main.js:12',
  'ok',
];
const context = fc.array(fc.constantFrom(...CONTEXT), { maxLength: 3 }).map((w) => w.join(' '));

const leakedWindow = (secret: string, output: string): string | null => {
  for (let i = 2; i + 6 <= secret.length; i++) {
    if (output.includes(secret.slice(i, i + 6))) return secret.slice(i, i + 6);
  }
  return null;
};

const placed = fc
  .record({
    key: fc.constantFrom(...KEYS),
    param: fc.constantFrom(...PARAM_KEYS),
    value: fc.oneof(secretOf(ALNUM), secretOf(PUNCT)),
    token: secretOf(ALNUM),
    shape: fc.nat(28),
    pre: context,
    post: context,
    sep: fc.constantFrom(' ', ', ', '; ', '\n'),
  })
  .map(({ key: k, param: p, value: v, token: t, shape, pre, post, sep }) => {
    const u = v.replaceAll('/', '').replaceAll('#', '').replaceAll('@', '');
    const shapes: [string, string][] = [
      [`${p}=${v}`, v],
      [`${k}: ${v}`, v],
      [`${k}:${v}`, v],
      [`"${k}":"${v}"`, v],
      [`"${k}": "${v}"`, v],
      [`'${k}': '${v}'`, v],
      [`${p} = "${v}"`, v],
      [`https://h.example.com/p?${p}=${v}`, v],
      [`/cb?a=1&${p}=${v}`, v],
      [`/cb?${p}=${v}&next=1`, v],
      [`h.example.com:8443/x?${p}=${v}#f`, v],
      [`Authorization: Bearer ${t}`, t],
      [`Bearer ${t}`, t],
      [`authorization: Basic ${t}==`, t],
      [`Basic ${t}=`, t],
      [`https://user:${u}@db.example.com/x`, u],
      [`postgres://app:${u}@db:5432/app`, u],
      [`Cookie: ${p}=${v}; other=1`, v],
      [`{"${k}":"${v}","name":"ok"}`, v],
      [`${k}:\n${v}`, v],
      [`${k}: "${v} with spaces"`, v],
      [`${p}=${v},next=1`, v],
      [`${k}: Token ${t}`, t],
      [`X-Api-Key: ${t}`, t],
      [`https://a.example.com/#${p}=${v}`, v],
      [`${k} = ${v}`, v],
      [`${p}="${v}"`, v],
      [`${k}='${v}'`, v],
      [`{\\"${k}\\":\\"${v}\\"}`, v],
    ];
    const [text, secret] = shapes[shape % shapes.length]!;
    return { input: `${pre ? pre + sep : ''}${text}${post ? ' ' + post : ''}`, secret };
  });

describe('redactText properties', () => {
  it('never grows its input and never exceeds 2048 characters', () => {
    fc.assert(
      fc.property(anyText, (s) => {
        const out = redactText(s);
        return out.length <= s.length && out.length <= 2048;
      }),
      { numRuns: 20000 },
    );
  });

  it('is idempotent', () => {
    fc.assert(
      fc.property(anyText, (s) => redactText(redactText(s)) === redactText(s)),
      { numRuns: 20000 },
    );
  });

  it('leaves text without markers, quotes, slashes or credential schemes unchanged', () => {
    const plain = fc
      .array(fc.constantFrom(...'abcdfghmnorvwxyz0123456789 ,.()-_'), { maxLength: 200 })
      .map((c) => c.join(''));
    fc.assert(
      fc.property(plain, (s) => redactText(s) === s),
      { numRuns: 5000 },
    );
  });

  it('removes every part of a credential placed after a sensitive key, scheme or userinfo', () => {
    fc.assert(
      fc.property(placed, ({ input, secret }) => leakedWindow(secret, redactText(input)) === null),
      {
        numRuns: 20000,
        examples: [
          [
            {
              input: 'Authorization: Basic dTcyOnZiaUtHTDd3NWtFZjgzbQ==',
              secret: 'ZqdTcyOnZiaUtHTDd3NWtFZjgzbQ',
            },
          ],
          [{ input: 'password: hunter,2xyzSECRET', secret: 'Zqhunter,2xyzSECRET' }],
        ],
      },
    );
  });
});

describe('redactText credential regressions', () => {
  it.fails('masks a padded Basic credential after key=Basic', () => {
    expect(redactText('Authorization=Basic dTcyOnZiaUtHTDd3NWtFZjgzbQ==')).not.toMatch(/dTcy/);
  });

  it('masks a padded Basic or Token credential after a sensitive key', () => {
    for (const input of [
      'Authorization: Basic dTcyOnZiaUtHTDd3NWtFZjgzbQ==',
      'Authorization: Token abcdKey=',
    ]) {
      expect(redactText(input)).not.toMatch(/dTcy|abcdKey/);
    }
  });

  it('masks the whole colon-form value when it contains a comma or semicolon', () => {
    expect(redactText('password: hunter,2xyzSECRET')).not.toContain('SECRET');
    expect(redactText('password:hunter;2xyzSECRET')).not.toContain('SECRET');
    expect(redactText('password: hunter2, name: bob')).toBe('password: *, name: bob');
  });
});
