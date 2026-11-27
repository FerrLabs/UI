import { describe, expect, it } from 'vitest';
import { redactText } from './redact-text.js';
import { exactCases, keptInputs, leakInputs } from './redaction-cases.fixture.js';
import { assertNearLinear, type InputBuilder } from './scaling.fixture.js';

type Scaled = readonly [name: string, count: number, build: InputBuilder];

const LEAK_MARKER = 'abc';

describe('redactText query and host handling', () => {
  it('keeps the host and cuts the query when the query contains an @', () => {
    expect(redactText('https://app.example.com/x?next=a@b.c')).toBe('https://app.example.com/x');
  });

  it('keeps the host when the query follows the host directly', () => {
    expect(redactText('https://app.example.com?next=a@b.c')).toBe('https://app.example.com');
    expect(redactText('https://app.example.com:8443?next=a@b.c')).toBe(
      'https://app.example.com:8443',
    );
  });

  it('keeps the port of a host whose name looks sensitive', () => {
    expect(redactText('failed GET https://authserver:11020#f while (x)')).toBe(
      'failed GET https://authserver:11020 while (x)',
    );
    expect(redactText('GET http://authelia:9091 -> 502')).toBe('GET http://authelia:9091 -> 502');
  });

  it('parses userinfo like a URL parser', () => {
    expect(redactText('https://u:123?x@h.com/a')).toBe('https://u:123');
    expect(redactText('http://db:5432?redirect=x@y')).toBe('http://db:5432');
    expect(redactText('http://api-gw:3000#a@b')).toBe('http://api-gw:3000');
    expect(redactText('http://authelia:9091: 504 Gateway Timeout')).toBe(
      'http://authelia:9091: 504 Gateway Timeout',
    );
    expect(redactText('email=a@b.com')).toBe('*');
    expect(redactText('code == 200')).toBe('code == 200');
    expect(redactText('{"a":{"password":"x"}}')).toBe('{"a":{"password":*}}');
    expect(redactText('http://u:+[)v~5-pc[g1A|@[::1]:39503/x')).toBe('http://[::1]:39503/x');
  });

  it('keeps the port of a host with a sensitive name when a quote follows', () => {
    expect(redactText('https://authserver:11020"')).toBe('https://authserver:11020"');
  });

  it('keeps a port only right after a colon', () => {
    expect(redactText('x //pwd: 1234abc')).not.toContain('1234');
    expect(redactText('x //secret:\n12345abc')).not.toContain('12345');
  });

  it('keeps the host when the fragment contains an @', () => {
    const out = redactText('open https://app.example.com/x#next=a@b.c now');
    expect(out, out).toContain('https://app.example.com/x');
    expect(out, out).not.toContain('a@b.c');
  });

  it('masks the whole word when a slashed password runs past 512 characters', () => {
    const password = `pa/${'Zq7'.repeat(200)}#1`;
    expect(redactText(`postgres://app:${password}@db.internal:5432/app`)).toBe('*');
    expect(redactText(`postgres://app:pa/${'Zq7'.repeat(100)}#1@db.internal:5432/app`)).toBe(
      'postgres://db.internal:5432/app',
    );
  });

  it('drops URL userinfo and keeps the host', () => {
    const out = redactText('connect https://user:pw@host.example.com/db failed');
    expect(out, out).not.toContain('pw');
    expect(out, out).not.toContain('user');
    expect(out, out).toContain('https://host.example.com/db');
  });

  it('keeps host:port while masking a numeric password', () => {
    expect(redactText('connect host.example.com:8443')).toBe('connect host.example.com:8443');
    expect(redactText('https://host.example.com:8443/x')).toBe('https://host.example.com:8443/x');
    const masked = redactText('login password: 8443');
    expect(masked, masked).not.toContain('8443');
  });

  it('does not treat a numeric secret after a URL as a port', () => {
    const out = redactText('https://host.example.com/x password: 48291');
    expect(out, out).not.toContain('48291');
  });

  it('masks quoted query values', () => {
    for (const input of [
      'GET /a?x="secret value abc"&y=1',
      "GET /a?x='secret value abc'&y=1",
      'GET https://h.example.com/a?x="secret value abc" failed',
    ]) {
      const out = redactText(input);
      expect(out, `${input} -> ${out}`).not.toContain(LEAK_MARKER);
    }
  });
});

describe('redactText credentials', () => {
  it('masks Basic credentials', () => {
    const out = redactText('Authorization Basic YQ==');
    expect(out, out).not.toContain('YQ==');
    expect(redactText('Basic YQ==')).not.toContain('YQ==');
  });

  it('masks Basic credentials that follow a key', () => {
    for (const input of [
      'token: Basic abcdefghijk==',
      'password=Basic Zm9vOmJhcabc==',
      'token: Basic abc12345',
    ]) {
      const out = redactText(input);
      expect(out, `${input} -> ${out}`).not.toContain('abc');
    }
  });

  it('masks a Bearer token and a JWT', () => {
    expect(redactText('Authorization: Bearer abcOR5iMadOdPDXCB3')).not.toContain('abc');
    expect(redactText('jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4abc.sigabc')).not.toContain('abc');
  });

  it('masks every sensitive pair when several share a line', () => {
    const out = redactText('token=abc12345,password="hunter22abc" key=abcdefgh');
    expect(out, out).not.toContain('abc');
    expect(out, out).not.toContain('hunter22');
  });
});

describe('redactText tables', () => {
  for (const input of leakInputs) {
    it(`masks ${JSON.stringify(input.slice(0, 60))}`, () => {
      const out = redactText(input);
      expect(out, `${JSON.stringify(input)} -> ${JSON.stringify(out)}`).not.toContain(LEAK_MARKER);
    });
  }

  for (const input of keptInputs) {
    it(`keeps ${JSON.stringify(input.slice(0, 60))}`, () => {
      expect(redactText(input)).toBe(input);
    });
  }

  for (const [input, expected] of exactCases) {
    it(`turns ${JSON.stringify(input.slice(0, 60))} into ${JSON.stringify(expected.slice(0, 60))}`, () => {
      expect(redactText(input)).toBe(expected);
      expect(redactText(expected)).toBe(expected);
    });
  }
});

describe('redactText bounds', () => {
  it('never returns more than 2048 characters', () => {
    for (const input of [
      'x'.repeat(256000),
      'a.'.repeat(32000),
      '?a='.repeat(21000),
      'token=abc '.repeat(5000),
    ]) {
      expect(redactText(input).length).toBeLessThanOrEqual(2048);
    }
  });

  it('masks a secret that sits across the input cut', () => {
    for (let n = 2000; n < 2060; n++) {
      const out = redactText(`${'x'.repeat(n)} token=SECRETSECRETSECRET`);
      expect(out, `n=${n}`).not.toMatch(/CRET/);
    }
  });

  it('is idempotent', () => {
    for (const input of leakInputs) {
      const once = redactText(input);
      expect(redactText(once), input).toBe(once);
    }
  });

  const adversarial: readonly Scaled[] = [
    ['empty query values', 4096, (count) => '?a= '.repeat(count)],
    ['at signs', 8192, (count) => 'a@'.repeat(count)],
    ['token keys', 2730, (count) => 'token='.repeat(count)],
    ['basic schemes', 2730, (count) => 'Basic '.repeat(count)],
    ['one long value', 16000, (count) => 'k=' + 'v'.repeat(count)],
    ['userinfo', 1365, (count) => 'https://u:p@'.repeat(count)],
    ['password keys', 1638, (count) => 'password: '.repeat(count)],
    ['bearer schemes', 2340, (count) => 'bearer '.repeat(count)],
  ];

  for (const [name, count, build] of adversarial) {
    it(`scales near-linearly on 16 KB of ${name}`, () => {
      expect(() => assertNearLinear(build, count)).not.toThrow();
    });
  }
});

describe('redactText bracketed keys, multi-chunk quotes and whitespace runs', () => {
  const leaks: ReadonlyArray<readonly [string, string]> = [
    ['user[password]=hunter2abc', 'hunter2abc'],
    ['{"user[password]":"hunter2abc"}', 'hunter2abc'],
    ['user[password]: hunter2abc', 'hunter2abc'],
    ['params[api_key]=x1abc', 'x1abc'],
    ["password='it''s''my''pass''hunter2abc'", 'hunter2abc'],
  ];

  for (const [input, marker] of leaks) {
    it(`masks ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).not.toContain(marker);
    });
  }

  it('is idempotent on auth=""\'\'""\'\'{', () => {
    const once = redactText('auth=""\'\'""\'\'{');
    expect(redactText(once)).toBe(once);
  });

  const runs: readonly Scaled[] = [
    ['spaces after a token word', 16000, (count) => 'token: a' + ' '.repeat(count) + 'x'],
    ['spaces after a bare colon', 16000, (count) => 'token:' + ' '.repeat(count)],
    ['spaces inside a password value', 16000, (count) => 'password=ab' + ' '.repeat(count) + 'x'],
    [
      'spaces after an auth scheme',
      16000,
      (count) => 'Authorization: Token' + ' '.repeat(count) + 'x',
    ],
    ['alternating tabs and spaces', 5400, (count) => 'token: a' + '\t \t'.repeat(count) + 'x'],
    ['a newline then spaces', 16000, (count) => 'token:\n' + ' '.repeat(count) + 'x'],
  ];

  for (const [label, count, build] of runs) {
    it(`scales near-linearly on 16 KB of ${label}`, () => {
      expect(build(count).length).toBeGreaterThanOrEqual(16000);
      expect(() => assertNearLinear(build, count)).not.toThrow();
    });
  }
});

describe('redactText', () => {
  const leaks: ReadonlyArray<readonly [string, string]> = [
    ['email_verification_code=834201', '834201'],
    ['user_mfa_code=834201', '834201'],
    ['user_code=WDJB-MJHT', 'WDJB'],
    ['sms_code=abc123', 'abc123'],
    ['backup_code=abc123', 'abc123'],
    ['params[user_code]=abc123', 'abc123'],
    ['daemonKey=abc123', 'abc123'],
    ['commonKey=abc123', 'abc123'],
    ['codeSig=abc123', 'abc123'],
    ['nodeSignature=abc123', 'abc123'],
    ['passkey=abc123', 'abc123'],
    ['see //password:aJ@+QvZ7 end', 'QvZ7'],
  ];

  for (const [input, marker] of leaks) {
    it(`masks ${JSON.stringify(input)}`, () => {
      expect(redactText(input), redactText(input)).not.toContain(marker);
    });
  }

  it('keeps the host-less userinfo lookalike text around the masked value', () => {
    expect(redactText('see //password:aJ@+QvZ7 end')).toBe('see //password:*');
  });

  for (const input of [
    'error_code=500',
    'status_code=200',
    'errorCode=500',
    'zip_code=59000',
    'barcode=123',
    'keyCode=13',
    'readyState=complete',
  ]) {
    it(`keeps ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).toBe(input);
    });
  }

  const benignKeyWords = [
    'dickey',
    'donkey',
    'doohickey',
    'flukey',
    'flunkey',
    'hickey',
    'hockey',
    'hokey',
    'hookey',
    'hotkey',
    'jockey',
    'lackey',
    'malarkey',
    'mickey',
    'monkey',
    'pokey',
    'rickey',
    'smokey',
    'turkey',
    'turnkey',
    'whiskey',
  ];
  for (const word of benignKeyWords) {
    it(`keeps ${word}=3`, () => {
      expect(redactText(`${word}=3`)).toBe(`${word}=3`);
    });
  }
});

describe('redactText', () => {
  const leaks: ReadonlyArray<readonly [string, string]> = [
    ['session_state=abc123', 'abc123'],
    ['relay_state=abc123', 'abc123'],
    ['token_code=abc123', 'abc123'],
    ['storage_key=abc123', 'abc123'],
  ];

  for (const [input, marker] of leaks) {
    it(`masks ${JSON.stringify(input)}`, () => {
      expect(redactText(input), redactText(input)).not.toContain(marker);
    });
  }

  for (const input of [
    'readyState=complete',
    'game_state=lobby',
    'httpStatusCode=200',
    '//auth:8080/x',
  ]) {
    it(`keeps ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).toBe(input);
    });
  }

  it('does not treat a bracketed host as userinfo', () => {
    expect(redactText('https://[::1]:8080/users/jane@corp.io')).toBe('https://[::1]:8080/users/*');
  });
});

describe('redactText bare //host:port', () => {
  it('masks a port that is not followed by a path', () => {
    for (const input of ['//password:12345', 'see //password:12345', '//password:8080']) {
      const out = redactText(input);
      expect(out, out).not.toContain('12345');
      expect(out, out).not.toContain('8080');
    }
  });

  it('keeps a port followed by a path', () => {
    expect(redactText('//auth:8080/x')).toBe('//auth:8080/x');
  });
});

describe('redactText doubled equals and long or punctuated prefixes', () => {
  const exact: ReadonlyArray<readonly [string, string]> = [
    ['password==""\'\'""\'\'ZqSecret123', 'password==*'],
    ['code==\'\'""\'\'"";', 'code==*;'],
    ['pwd==abcRET1', 'pwd==*'],
    ['https://admin:hunter2@bücher.example/x', 'https://bücher.example/x'],
    ['see //password:aJ@+QvZ7 end', 'see //password:*'],
  ];

  for (const [input, expected] of exact) {
    it(`turns ${JSON.stringify(input)} into ${JSON.stringify(expected)}`, () => {
      expect(redactText(input)).toBe(expected);
      expect(redactText(expected)).toBe(expected);
    });
  }

  for (const input of [
    'a == b',
    'x==y',
    'password===x1',
    'password== x1',
    'readyState=complete',
    'game_state=lobby',
    'iceGatheringState=complete',
    'dial_code=33',
  ]) {
    it(`keeps ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).toBe(input);
    });
  }

  for (const [input, marker] of [
    ['device_state=ZqMark91', 'ZqMark91'],
    ['authRequestState=ZqMark91', 'ZqMark91'],
    ['phone_code=ZqMark91', 'ZqMark91'],
    ['phoneCode=ZqMark91', 'ZqMark91'],
    ['a'.repeat(300) + '_password=hunter2abc', 'hunter2abc'],
    ['a'.repeat(300) + '_otp_code: 834201', '834201'],
  ] as const) {
    it(`masks ${JSON.stringify(input.length > 60 ? `${input.slice(0, 12)}...${input.slice(-24)}` : input)}`, () => {
      expect(redactText(input), redactText(input)).not.toContain(marker);
    });
  }

  it('keeps a long benign prefix before a non-secret key', () => {
    const input = 'a'.repeat(300) + '_monkey=3';
    expect(redactText(input)).toBe(input);
  });

  const prefixed: readonly Scaled[] = [
    [
      'a long prefix before a secret key',
      16000,
      (count) => 'a'.repeat(count) + '_password=hunter2abc',
    ],
    ['a run of equals', 16000, (count) => 'password' + '='.repeat(count) + 'x'],
  ];

  it('scales near-linearly past the longest skip on a long prefix before a benign key', () => {
    const stepAboveLongestSkip = 4;
    expect(() =>
      assertNearLinear((count) => 'a'.repeat(count) + '_monkey=3', 16000, stepAboveLongestSkip),
    ).not.toThrow();
  });

  for (const [name, count, build] of prefixed) {
    it(`scales near-linearly on 16 KB of ${name}`, () => {
      expect(() => assertNearLinear(build, count)).not.toThrow();
    });
  }
});

describe('redactText chained values, slashed passwords and non-ASCII spaces', () => {
  const exact: ReadonlyArray<readonly [string, string]> = [
    ['client_secret: monkeySecret=\nfoo=1', 'client_secret: *'],
    ['Error key: key: \n"Token X" end', 'Error key: * end'],
    [
      'DATABASE_URL=postgres://app:pa/ss#1@db.internal:5432/app',
      'DATABASE_URL=postgres://db.internal:5432/app',
    ],
    ['redis://default:ab/cd?ef@cache:6379/0', 'redis://cache:6379/0'],
    ['https://u:123?x@h.com/a', 'https://u:123'],
    ['password: correct horse', 'password: *'],
    ['password=correct horse', 'password=*'],
    ['password=a"b"c"d"e"f"g"h"hunter2abc', 'password=*'],
    ['pwd=^""""\'\'\'\'k', 'pwd=*'],
    ["auth=&\"\"''''\"\"'", 'auth=*'],
  ];

  for (const [input, expected] of exact) {
    it(`turns ${JSON.stringify(input)} into ${JSON.stringify(expected)}`, () => {
      expect(redactText(input)).toBe(expected);
    });
  }

  for (const input of [
    'password=a"b"c"d"e"f"g"h"hunter2abc',
    'pwd=^""""\'\'\'\'k',
    "auth=&\"\"''''\"\"'",
  ]) {
    it(`is idempotent on ${JSON.stringify(input)}`, () => {
      expect(redactText(redactText(input))).toBe(redactText(input));
    });
  }

  for (let code = 0x2000; code <= 0x200a; code++) {
    const space = String.fromCharCode(code);
    it(`masks a value split by U+${code.toString(16).toUpperCase()}`, () => {
      expect(redactText(`password: correct${space}horse`)).toBe('password: *');
      expect(redactText(`password=correct${space}horse`)).toBe('password=*');
    });
  }

  for (const unit of ['x[', 'a]']) {
    it(`scales near-linearly on unbalanced ${unit} brackets`, () => {
      expect(() => assertNearLinear((count) => unit.repeat(count), 8000)).not.toThrow();
    });
  }
});

describe('redactText primary and query keys, narrowed state words', () => {
  const masked: ReadonlyArray<readonly [string, string]> = [
    ['auth_request_state=SECRET99', 'auth_request_state=*'],
    ['oauth_client_state=SECRET99', 'oauth_client_state=*'],
    ['api_key_code=SECRET99', 'api_key_code=*'],
    ['orderState=paid', 'orderState=*'],
    ['x_keycode=1', 'x_keycode=*'],
    ['cosmosPrimaryKey=SECRET99', 'cosmosPrimaryKey=*'],
    ['storageAccountPrimaryKey: SECRET99', 'storageAccountPrimaryKey: *'],
    ['searchAdminQueryKey=SECRET99', 'searchAdminQueryKey=*'],
    ['cosmos_primary_key=SECRET99', 'cosmos_primary_key=*'],
    ['email=a@b.com', '*'],
  ];
  const kept: readonly string[] = [
    'keyCode=13',
    'key_code=13',
    'readyState=complete',
    'game_state=lobby',
  ];

  for (const [input, expected] of masked) {
    it(`masks ${JSON.stringify(input)} as ${JSON.stringify(expected)}`, () => {
      expect(redactText(input)).toBe(expected);
    });
  }

  for (const input of kept) {
    it(`keeps ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).toBe(input);
    });
  }

  it('drops the password of a host-relative userinfo with a query', () => {
    expect(redactText('//host:abc/path?email=a@b.com')).not.toContain('abc');
  });

  for (const unit of ['x_request_state=', 'cosmosPrimaryKey=', 'x_client_state=', 'x_keycode=']) {
    it(`scales near-linearly on 16 KB of ${unit}`, () => {
      expect(() =>
        assertNearLinear((count) => unit.repeat(count), Math.ceil(16384 / unit.length)),
      ).not.toThrow();
    });
  }
});

describe('bearer tail stops before a following secret key', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['Authorization: Bearer abcdefgh&user=passwd: ZqSECRET9', 'Authorization: Bearer *=passwd: *'],
    [
      'Authorization: Bearer abcdefgh&id=password: ZqSECRET9',
      'Authorization: Bearer *=password: *',
    ],
    ['Authorization: Bearer abcdefgh:token: ZqSECRET9', 'Authorization: Bearer *:token: *'],
    ['Authorization: Bearer abcdefgh=otp_code: ZqSECRET9', 'Authorization: Bearer *=otp_code: *'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }
});

describe('secret words deep inside long keys', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['b'.repeat(100) + 'Password=hunter2', 'b'.repeat(100) + 'Password=*'],
    ['x_' + 'c'.repeat(100) + 'Token: abc', 'x_' + 'c'.repeat(100) + 'Token: *'],
    ['a'.repeat(317) + '_monkey=3', 'a'.repeat(317) + '_monkey=3'],
    ['b'.repeat(100) + '_error_code=500', 'b'.repeat(100) + '_error_code=500'],
    ['b'.repeat(100) + 'ErrorCode=500', 'b'.repeat(100) + 'ErrorCode=500'],
  ];

  rows.forEach(([input, output], index) => {
    it(`redacts row ${index}`, () => {
      expect(redactText(input)).toBe(output);
    });
  });

  for (const unit of ['[a', 'a-']) {
    it(`scales near-linearly on 16 KB of ${unit} before a colon`, () => {
      expect(() => assertNearLinear((count) => unit.repeat(count) + ':', 8000)).not.toThrow();
    });
  }
});

describe('a secret value stops before a following query key', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['token=abc?pwd= hunter2secret', 'token=*?pwd= *'],
    ['token=abc#pwd= hunter2secret', 'token=*#pwd= *'],
    ['token = abc?pwd = hunter2secret', 'token = *?pwd = *'],
    ['password=x?api_key = hunter2secret', 'password=*?api_key = *'],
    ['password=a?b', 'password=*'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }

  it('does not leak a secret behind a fragment key in a url', () => {
    expect(redactText('https://x.com/cb?token=abc#pwd= hunter2secret')).not.toContain(
      'hunter2secret',
    );
  });

  it('scales near-linearly on 16 KB of long words', () => {
    expect(() =>
      assertNearLinear((count) => ('a'.repeat(100) + ' ').repeat(count), 160),
    ).not.toThrow();
  });

  it('scales near-linearly and masks the value on repeated long-word keys', () => {
    const build: InputBuilder = (count) => ('a'.repeat(100) + 'Password=x ').repeat(count);
    expect(() => assertNearLinear(build, 140)).not.toThrow();
    expect(redactText(build(140))).not.toContain('=x');
  });
});

describe('bearer and colon values stop before a separated key', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['Bearer abcdefgh#otp_code: 834201', 'Bearer *#otp_code: *'],
    ['Bearer abcdefgh|otp_code: 834201', 'Bearer *|otp_code: *'],
    ['Bearer {otp_code: ZqSecret9x}', 'Bearer {otp_code: *}'],
    ['Bearer x|otp_code = ZqSecret9x', 'Bearer *|otp_code = *'],
    ['password: x|token:\nZqSecret9x', 'password: *|token:\n*'],
    ['password: |\n  ZqSecret9x\n  line2\nnext: ok', 'password: *\nnext: ok'],
    ['password: >-\n  ZqSecret9x', 'password: *'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input.slice(0, 48))} to ${JSON.stringify(output.slice(-24))}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }
});

describe('nested bracket keys', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['filter[user[token]]=Zq1234567', 'filter[user[token]]=*'],
    ['[params[api_key]]=Zq1234567', '[params[api_key]]=*'],
    ['a[b[password]]=Zq1234567', 'a[b[password]]=*'],
    ['[params[api_key]]: Zq1234567', '[params[api_key]]: *'],
    ['a[b]=c', 'a[b]=c'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input)} to ${JSON.stringify(output)}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }

  it('scales near-linearly on repeated closing brackets', () => {
    expect(() => assertNearLinear((count) => 'a]'.repeat(count) + '=', 8000)).not.toThrow();
  });
});

describe('backslashes inside bearer tokens', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['Bearer abcd\\/efgh1234ZZ', 'Bearer *'],
    ['Bearer abc\\\\def12345', 'Bearer *'],
    ['{"a":"Bearer abcdefgh123\\""}', '{"a":"Bearer *\\""}'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input)} to ${JSON.stringify(output)}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }

  it('scales near-linearly on a run of backslashes', () => {
    expect(() => assertNearLinear((count) => 'Bearer ' + '\\'.repeat(count), 16000)).not.toThrow();
  });
});

describe('quoted values before a query key and keys behind long prefixes', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['token="abc"?pwd= hunter2secret', 'token=*?pwd= *'],
    ['token="abc"#pwd= hunter2secret', 'token=*#pwd= *'],
    ['a'.repeat(600) + '_password: hunter2', 'a'.repeat(600) + '_password: *'],
    ['a'.repeat(317) + '_monkey=3', 'a'.repeat(317) + '_monkey=3'],
    ['a'.repeat(61) + '_monkey=3', 'a'.repeat(61) + '_monkey=3'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input.slice(0, 48))} to ${JSON.stringify(output.slice(-24))}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }

  const longWords: readonly Scaled[] = [
    [
      'long words around a password key',
      7,
      (count) => ('a'.repeat(2100) + ' ').repeat(count) + 'password: x',
    ],
    ['words at the longest skip length', 8, (count) => ('a'.repeat(2047) + ' ').repeat(count)],
  ];

  for (const [name, count, build] of longWords) {
    it(`scales near-linearly on ${name}`, () => {
      expect(() => assertNearLinear(build, count)).not.toThrow();
    });
  }
});

describe('cookie headers anywhere and narrowed auth bypass', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['  Cookie: theme=dark; sid=abc123', '  Cookie: *'],
    ['> Cookie: theme=dark; sid=abc123', '> Cookie: *'],
    ['headers: Cookie: theme=dark; sid=abc123', 'headers: Cookie: *'],
    ['req Cookie: theme=dark; connect.sid=s%3Aabc', 'req Cookie: *'],
    ['GET /x failed Cookie: theme=dark; sid=abc123', 'GET /x failed Cookie: *'],
    ['auth_hotkey=Zq9SECRET', 'auth_hotkey=*'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input)} to ${JSON.stringify(output)}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }

  for (const input of ['author_status_code=200']) {
    it(`keeps ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).toBe(input);
    });
  }
});

describe('glued commas and semicolons inside secret values', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['password: p@ss;word123', 'password: *'],
    ['password: hunter,2abcSecret', 'password: *'],
    ['password: ;hunter2abc', 'password: *'],
    ['Basic dXNlcjpw;ass12', 'Basic *'],
    ['Bearer abc,defgh12345', 'Bearer *'],
    ['password: x, user: bob', 'password: *, user: bob'],
    ['password: x,user=bob', 'password: *,user=bob'],
    ['password: x; y', 'password: *; y'],
    ['{"password":"x","user":"bob"}', '{"password":*,"user":"bob"}'],
    ['password=correct horse', 'password=*'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input)} to ${JSON.stringify(output)}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }

  const timed: readonly Scaled[] = [
    ['a run of glued commas', 8000, (count) => 'password: ' + 'a,'.repeat(count)],
    ['a run of glued semicolons', 8000, (count) => 'Basic dXNlcjpw' + ';a'.repeat(count)],
    ['long dotted words', 230, (count) => ('a'.repeat(70) + '.').repeat(count)],
    ['repeated key prefixes', 150, (count) => ('x_'.repeat(40) + 'token=').repeat(count)],
    ['a dotted run', 8192, (count) => 'a.'.repeat(count)],
  ];

  for (const [name, count, build] of timed) {
    it(`scales near-linearly on ${name}`, () => {
      expect(() => assertNearLinear(build, count)).not.toThrow();
    });
  }
});

describe('equals values spanning spaces', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['password=correct horse battery staple', 'password=*'],
    ['login failed password=abc for user bob', 'login failed password=*'],
    ['password=x user=bob', 'password=* user=bob'],
    ['password=correct horse; user=bob', 'password=*; user=bob'],
    ['password=x user: bob', 'password=* user: bob'],
    ['token=abc, next', 'token=*, next'],
    ['token=abc def ghi=1', 'token=* ghi=1'],
    ['password=hunter2\nnext line', 'password=*\nnext line'],
    ['https://h.com/a?token=x&y=1', 'https://h.com/a'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input)} to ${JSON.stringify(output)}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }

  const timed: readonly Scaled[] = [
    [
      'a long run of spaced words after an equals sign',
      8000,
      (count) => 'password=' + 'a '.repeat(count),
    ],
    ['repeated spaced assignments', 1600, (count) => 'token=a b '.repeat(count)],
  ];

  for (const [name, count, build] of timed) {
    it(`scales near-linearly on ${name}`, () => {
      expect(() => assertNearLinear(build, count)).not.toThrow();
    });
  }
});

describe('userinfo, yaml blocks, glued separators and query values', () => {
  const rows: ReadonlyArray<readonly [string, string]> = [
    ['postgres://u:2/XKGNxq6c9JxDvt@host/db', 'postgres://host/db'],
    ['redis://:12/ab34cd56@cache:6379', 'redis://cache:6379'],
    ['https://admin:2024/Summer!x@db.internal/x', 'https://db.internal/x'],
    ['https://[::1]:8080/users/jane@corp.io', 'https://[::1]:8080/users/*'],
    ['https://h.com:8080/a/b', 'https://h.com:8080/a/b'],
    ['password: |\n  ZqLine1\n\n  ZqLine2\nnext: ok', 'password: *\nnext: ok'],
    ['password: |\n\n  ZqLine1', 'password: *'],
    ['password: |2\n  ZqLine1\nnext: ok', 'password: *\nnext: ok'],
    ['password: | # pw\n  ZqLine1', 'password: *'],
    ['  password: |\n    s3cret\n  user: bob', '  password: *\n  user: bob'],
    ['password: Zq7x,K9m:P2wLr8', 'password: *'],
    ['password: x,user=bob', 'password: *,user=bob'],
    ['password: x, user: bob', 'password: *, user: bob'],
    ['Basic dXNlcjpwYXNz,status=ok', 'Basic *,status=ok'],
    ['Basic dXNlcjpw;ass12', 'Basic *'],
    ['zip-code=57', 'zip-code=57'],
    ['x-api-key=abc123', 'x-api-key=*'],
    ['GET https://api.example/x?token=abc failed', 'GET https://api.example/x failed'],
    ['see https://a.com/p?api_key=x now', 'see https://a.com/p now'],
    ['token=abc?pwd= hunter2secret', 'token=*?pwd= *'],
    ['code==\'\'""\'\'"";', 'code==*;'],
    ['password=correct horse:staple', 'password=*'],
    ['password=correct horse:battery staple', 'password=*'],
    ['password=x user: bob', 'password=* user: bob'],
    ['error.code=3', 'error.code=3'],
    ['error-code=3', 'error-code=3'],
    ['loading-state=1', 'loading-state=1'],
    ['user.password=x1abc', 'user.password=*'],
    ['a.b.token=x1abc', 'a.b.token=*'],
    ['x.code=1', 'x.code=*'],
    ['password: abc?user[token] = ZqSECRET9x', 'password: *?user[token] = *'],
    ['password : abc?[token] =ZqSECRET9x', 'password : *?[token] =*'],
    ['Bearer abcdefgh?token=ZqSECRET9x', 'Bearer *?token=*'],
    ['password: what?', 'password: *'],
    ['cmd --password=hunter2', 'cmd --password=*'],
    ['-Dtoken=abc', '-Dtoken=*'],
    ['--api-key=abc', '--api-key=*'],
    ['- password: |\n  x\n  y', '- password: *'],
    ['- password: |\n  x\nnext: 1', '- password: *\nnext: 1'],
    ['  - token: >-\n      a\n      b\n  - name: z', '  - token: *\n  - name: z'],
    ['- password: |\n  ZqLine1\n  ZqLine2\nnext: ok', '- password: *\nnext: ok'],
    ['x - password: |\n  ZqLine1', 'x - password: *'],
    ['a: b password: |\n  ZqLine1', 'a: b password: *'],
    ['  - password: |\n    ZqLine1', '  - password: *'],
    ['- password: >\n  ZqLine1', '- password: *'],
    ['x\n  password: |\n    s\n  next: 1', 'x\n  password: *\n  next: 1'],
    ['note: a | b', 'note: a | b'],
    [
      'Server=db;User Id=sa;Password=correct horse battery staple;',
      'Server=db;User Id=sa;Password=*;',
    ],
    ['user=bob;password=correct horse battery staple', 'user=bob;password=*'],
    ['a=1&password=correct horse battery staple', 'a=1&password=*'],
    ['user=bob&password=correct horse', 'user=bob&password=*'],
    ['see https://a.com/p?a=1&api_key=x now', 'see https://a.com/p now'],
    [
      'app.integrations.payments.providers.stripe.webhooks.endpoint.signing.secret=whsec_abc',
      'app.integrations.payments.providers.stripe.webhooks.endpoint.signing.secret=*',
    ],
    ['.password=hunter2', '.password=*'],
    ['see .token=abc123', 'see .token=*'],
    ['java -Dpassword=hunter2 -jar app.jar', 'java -Dpassword=* -jar app.jar'],
    ['Basic YWRtaW46cGFzcw==,Basic Ym9iOnNlY3JldA==', 'Basic *,Basic *'],
    ['Bearer tok_abcdefghij,Bearer tok_klmnopqrst', 'Bearer *,Bearer *'],
    [
      'Authorization: Bearer abcdefghijkl,Basic YWRtaW46cGFzcw==',
      'Authorization: Bearer *,Basic *',
    ],
    ['password=hunter2 Basic YWRtaW46cGFzcw==', 'password=* Basic *'],
    ['password=hunter2,Basic YWRtaW46cGFzcw==', 'password=*,Basic *'],
    ['http://localhost:4873/@babel/core', 'http://localhost:4873/@babel/core'],
    ['https://medium.com:443/@alice/post', 'https://medium.com:443/@alice/post'],
    ['- password: |\n    x\n  user: bob', '- password: *\n  user: bob'],
    ['{"password":"@home.Town!2024"}', '{"password":*}'],
    ['{"password": "@a.b!hunter2abc"}', '{"password": *}'],
    ['password: ab);hunter2abc', 'password: *'],
    ['token: x],hunter2abc', 'token: *'],
    ['password: );T4NZq7Mk]D', 'password: *'],
    ['contact "jane doe"@corp.io now', 'contact * now'],
    ['{"a":{"token":"x"},"b":1}', '{"a":{"token":*},"b":1}'],
    ['password: x}, user: bob', 'password: *}, user: bob'],
    ['traceState=abc', 'traceState=abc'],
    ['trace_state=x', 'trace_state=x'],
    ['https://h.com:8080/jane@corp.io', 'https://h.com:8080/*'],
    [
      'https://cdn.example.com:8443/lib@1.2.3/x.js failed',
      'https://cdn.example.com:8443/*/x.js failed',
    ],
    ['(password)=Zq123456', '(password)=*'],
    ['{password}=Zq123456', '{password}=*'],
    ['<client_secret>=ZqKM1234', '<client_secret>=*'],
    ['<db_password>: ZqmLQ!-%spg14', '<db_password>: *'],
    ['pwd==*', 'pwd==*'],
    ['Authorization: Token Zq4WZwg5xZKWfyyh user=bob', 'Authorization: * user=bob'],
    ['password: Zq4WZwg5xZKW user=bob', 'password: * user=bob'],
    ['password: correct horse', 'password: *'],
    [
      'GET https://h.com/a?' + 'x'.repeat(200) + '&token=abc failed now',
      'GET https://h.com/a failed now',
    ],
    ['  password: |\n  s3cret', '  password: *\n  s3cret'],
    [
      'app-config-service-database-primary-connection-settings-credentials-api-key=hunter2',
      'app-config-service-database-primary-connection-settings-credentials-api-key=*',
    ],
    ['x-'.repeat(40) + 'password=hunter2', 'x-'.repeat(40) + 'password=*'],
    ['a-'.repeat(40) + 'api-key=hunter2', 'a-'.repeat(40) + 'api-key=*'],
    ['a: b password: |\n one\n two', 'a: b password: *'],
    ['a: b password: |\n one\nnext: ok', 'a: b password: *\nnext: ok'],
    ['zip-code: 7667', 'zip-code: 7667'],
    ['error-code: 3', 'error-code: 3'],
    ['loading-state: 1', 'loading-state: 1'],
    ['country-code: FR', 'country-code: FR'],
    ['{"zip-code": "57"}', '{"zip-code": "57"}'],
    ['otp-code: 834201', 'otp-code: *'],
    ['x-api-key: abc123', 'x-api-key: *'],
    ['session-state: abc', 'session-state: *'],
  ];

  for (const [input, output] of rows) {
    it(`redacts ${JSON.stringify(input)} to ${JSON.stringify(output)}`, () => {
      expect(redactText(input)).toBe(output);
    });
  }

  const timed: readonly Scaled[] = [
    [
      'a yaml block of blank-separated lines',
      4000,
      (count) => 'password: |\n' + '  x\n\n'.repeat(count),
    ],
    [
      'digit-led path segments before an at sign',
      4000,
      (count) => '//' + 'a:1/'.repeat(count) + '@',
    ],
    ['spaces before a yaml block key', 16000, (count) => ' '.repeat(count) + 'password: |\n  x'],
    ['question marks before an ampersand', 8000, (count) => '?'.repeat(count) + '&'],
    ['query fragments of question mark, letter, ampersand', 5000, (count) => '?a&'.repeat(count)],
    ['dotted segments before an equals sign', 8000, (count) => 'a.'.repeat(count) + '='],
    ['dashed segments before an equals sign', 8000, (count) => 'a-'.repeat(count) + '='],
    ['dashed segments before a colon', 8000, (count) => 'a-'.repeat(count) + ':'],
    [
      'spaced pairs before an inline yaml block key',
      8000,
      (count) => 'x '.repeat(count) + 'password: |\n x',
    ],
    ['glued semicolons in a colon value', 8000, (count) => 'password: a' + ';a'.repeat(count)],
    ['glued semicolon keys', 1700, (count) => ';password'.repeat(count)],
    ['ampersands in one query', 8000, (count) => '?' + 'a&'.repeat(count)],
    [
      'query characters before a secret key',
      16000,
      (count) => '?' + 'x'.repeat(count) + '&token=abc failed',
    ],
    ['long query keys', 160, (count) => '?' + ('&' + 'a'.repeat(100)).repeat(count)],
    [
      'glued semicolons before a spaced key in a query',
      3000,
      (count) => '?token=a' + ';key '.repeat(count),
    ],
    ['glued semicolons in a bearer token', 8000, (count) => 'Bearer abcdefgh' + ';x'.repeat(count)],
    [
      'glued semicolons before a spaced equals in a basic credential',
      4000,
      (count) => 'Basic dXNlcjpw' + ';a ='.repeat(count),
    ],
  ];

  for (const [name, count, build] of timed) {
    it(`scales near-linearly on ${name}`, () => {
      expect(() => assertNearLinear(build, count)).not.toThrow();
    });
  }
});
