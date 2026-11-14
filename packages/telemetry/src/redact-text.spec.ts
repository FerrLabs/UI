import { expect, it, describe } from 'vitest';
import { redactText } from './redact-text.js';

describe('redactText', () => {
  const secretCases = [
    '//password: hunter22abc',
    'see //token:hunter22secretabc',
    'http://example.com/a//session: abcdefgh',
    'https://mysession:hunter22abc',
    'Authorization: Basic YTpiabc==',
    'password: basic correcthorseabc',
    'Authorization: Basic user:password1abc',
    'Authorization: Bearer abc:defghijk',
    'Basic YTpiYabc==',
    'token=abc12345,password="hunter22abc"',
    'token=abc12345;password = hunter22abc',
    'password=a1&password = 1BfulZ9EpwVabc',
    'body user=bob&password="correct horse battery abc" failed',
    'user=bob&password=Basic Zm9vOmJhcabc==',
    'Error: grant_type=a&client_secret=Token Zq9secretabc',
    'redirect /cb?auth=Token Zq9secretabc failed',
    'POST /login?user=bob&password: hunter2abc',
    'see //password:12345abc',
    'https://u:12?abc@host/',
    'contact john.doe#work@abc.com today',
    'abc.doe?x@example.com',
    'contact tom&abc@example.com now',
    'x //pin_key:4829abc',
    'GET /a?x="secret value abc"&y=1',
    'x ;key=\\"S3cretabc\\" end',
    'contact jane&doeabc@example.com',
    'janeabc#doe@example.com',
    'o/brienabc@example.com',
    'janeabc?@example.com',
    'password: basic hunter2abc, next',
    'token: bearer abc1234"',
    'x jane!abc@example.com',
    ' ZqOcq1b7G+9I=abc@example.com ',
    'contact jane~doeabc@example.com',
    "o'brienabc@example.com",
    'password: basic hunter2abc',
    'password=Basic hunter2abc',
    '//user:p?ssabc@host/x',
    '//u:p#wabc@h/x',
    'postgres://app:s3cr3t%21xabc@db.internal:5432/app',
    'https://alice:p!ssW0rdabc@db.example.com/x',
    'session_id=8f14abce45fceea167a5a36dedd4bea2543',
    'user session_id: Xabc12345',
    'Bearer AAAAAAAA=BBBBBBBB=CCCCCCCC=DDDDDDDD=EabcEEEEEEE',
    'bearer Authorization: Bearer Zq9abcdefXYZ123',
    'Bearer token: Bearer S3cretabcS3cret1',
    'expected Bearer authorization: Basic dXNlcjpabcwYXNzd29yZA==',
    'Bearer state: "secret":"Zq7abcXk9Vw3Rt5"',
    'password:\n\nS3cretabc',
    'password: a b key:\nS3cretabcXYZ123',
    'password: x "token": "S3cretabcXYZ123"',
    'password: hunter2abc token=abc',
    'password: hunter2abc token: x',
    'X-Api-Key: S3cretabc X-Auth-Token: other',
    'pwd: hunter2abc code: 1',
    'Authorization: Token token="hunter2abcdef"',
    'Authorization: Digest token="hunter2abcdef"',
    "password: Token session='hunter2abcdef'",
    "auth=Bearer session='hunter2abcdef'",
    'auth=Bearer x_token="hunter2abcdef"',
    'auth=Bearer mystate="hunter2abcdef"',
    '"access_token"="hunter2abcdef"',
    "'password' = hunter2abcdef",
    'Authorization: Bearer Zk3qP9xLmT2vR8wYsecretkey==',
    'Bearer abcAUTHxyz12345=',
    'Bearer password = S3abcdef',
    'Bearer "access_token":"hunter2abcdef"',
    'Bearer "access_token": "hunter2abcdef"',
    "Bearer 'access_token': 'hunter2abcdef'",
    'Bearer access_token":"hunter2abcdef"',
    'bearer "apiKey":"S3cretabc"',
    "bearer 'token': 'S3cretabc'",
    'Invalid key: "password":"hunter2abc"',
    'missing key: password: hunter2abc',
    'key: " apikey":"hunter2abc"',
    'key: user.password: "S3abc"',
    'key=\\"S3abc\\"',
    'key = Token S3abcdefgh',
    'key:\nS3abc',
    'X-Api-Key: \nX-Auth-Token: S3cretabc',
    'Invalid Bearer accessToken: S3cretabc',
    'secret: password: S3cretabc',
    'Basic Authorization: Token S3cretabc',
    'apiKey: token = S3cretabc',
    'session_key:\ncsrf_token: S3cretabc123',
    'secret= password= S3cretabc123',
    'Authorization: Bearer accessToken: S3abc',
    "{'password': 'hunter2abc'}",
    'password = hunter2abc',
    'api_key =abc',
    'token= "abc"',
    "failed 'authorization': 'S3cr7abc'",
    "{'X-Api-Key': 'Q7abc'}",
    'Authorization: Token S3cr73abcDcVGFxpmMuqmm1E',
    'authorization: ApiKey Q7abcdefghij',
    '{\\"password\\":\\"hunter2abc\\"}',
    '{"user.password":"hunter2abc"}',
    '{"$password":"hunter2abc"}',
    '{"auth.token": "Q7abcdefghij"}',
    'api_key":"Q7abc"',
    '{\\\\"api_key\\\\": \\\\"Q7abc\\\\"}',
    'password=hunter2#abc',
    'password=hunter2;abc',
    'client_secret=ab&abc',
    'Login failed: password: abc',
    'jean.dupont@gmail.abc',
    'contact: abc+x@example.co.uk now',
    'password: abc',
    '{"password":"abc"}',
    '{"api_key": "abc", "name":"ok"}',
    'Authorization: BEARER abcOR5iMadOdPDXCB3',
    'BeArEr abcOR5iMadOdPDXCB3',
    'Authorization: BASIC dXNlcjpQYXNzabc',
    'token: abc',
    'client_secret : "abc"',
    'Basic eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9abc.c2lnbmF0dXJlabc',
    'token="abc"',
    "password='abc'",
    'x.com#abc',
    'localhost:3000?abc',
    'x.com:8080#abc',
    'Bearer "abc"',
    'Bearer Bearer abcdefgh1',
    'Basic dXNlcjpwYXNzabc=',
    'token="a b abc"',
    '../reset?token=abc',
    './a?token=abc',
    'reset-password?token=abc',
    '?token=abc',
    '#access_token=abc',
    'example.com?token=abc',
    'https://user:abc@h.com/x',
    'HTTPS://x.com/a?token=abc',
    'wss://x.com/s?token=abc',
    '//x.com/a?token=abc',
    '/reset?token=abc',
    "https://x.com/a?token=abc'def",
    'x.com/a?token=abc',
    'Http failure response for https://app.ferrlabs.com/api/invitations/accept?token=abc: 401',
    "Cannot match any routes. URL Segment: 'reset?token=abc'",
    'a?b=1&token=abc',
    '"url":"/x?token=abc"',
    'redirect_uri=x&code=abc',
    'token=abc',
    'access_token=abc',
    'API_KEY=abc',
    'GET api.ferrlabs.com:443/v1?token=abc failed',
    '10.0.0.5:8080/api/cb?code=abc',
    'index.html?session=abc',
    'api/v1/users?token=abc',
    '?code=abc',
    'localhost:4326/reset?token=abc',
    'x.com:8080/a?t=abc',
    'example.com:8443/reset#abc',
    'localhost:3000/p#abc',
    '10.0.0.1:8080/p?abc',
    'https://u:p@abc@h/',
    'client_secret=abc',
    'db_password=abc',
    'jsessionid=abc',
    'private_key=abc',
    'aws_secret_access_key=abc',
    'Authorization=abc',
    'Error: bad body client_secret=abc&grant_type=a',
    'Authorization: Bearer abcdefgh1',
    'eyJhbGciOi.eyJzdWIiOiJ4abc.sigabc',
  ];
  const plainCases = [
    'if (x == y) return',
    'a = b',
    'code == 200',
    'Error: code: 500',
    'time 12:30',
    '{"name":"ok"}',
    'BASIC SETUP',
    'state: loading',
    'Are you sure?',
    'item #3',
    'div#root>main',
    'a/b',
    'html>body>div#root>main>button.save',
    'see file.ts:12 now',
    'what? yes',
    'x == y',
    'a=b',
    'https://a.com/p/1',
    'Invalid token provided',
    'basic setup guide',
    'Basic authentication failed',
    'bearer of bad news',
    '',
  ];
  const hugeCases = [
    '?a= '.repeat(512),
    'Basic //u@abcdefgh',
    'x'.repeat(256000),
    `data:image/png;base64,${'A'.repeat(200000)}`,
    'a.'.repeat(32000),
    '/'.repeat(64000),
    '?a='.repeat(21000),
  ];

  for (const input of secretCases) {
    it(`removes the secret from ${JSON.stringify(input)}`, () => {
      expect(redactText(input)).not.toContain('abc');
    });
  }

  for (const input of plainCases) {
    it(`leaves ${JSON.stringify(input)} unchanged`, () => {
      expect(redactText(input)).toBe(input);
    });
  }

  it('drops query and fragment of urls inside text', () => {
    expect(redactText('https://a.com/invite?token=s3cret')).toBe('https://a.com/invite');
    expect(redactText('see https://a.com/p?code=1#state=2 now')).toBe('see https://a.com/p now');
    expect(redactText('/reset?token=abc')).toBe('/reset');
  });

  it('masks a JWT that follows Basic entirely', () => {
    const output = redactText('Basic eyJhbGciOiJIUzI1.eyJzdWIiOiJTRUNSRVQ.SIGSECRET');
    expect(output).not.toContain('SECRET');
    expect(output).not.toContain('eyJ');
  });

  it('does not leak part of a credential split by truncation', () => {
    const output = redactText(`${'x'.repeat(2035)} Bearer abcdefghijklmnopSECRET`);
    expect(output).not.toContain('SECRET');
    expect(output).not.toContain('abcdefghijklmnop');
  });

  it('does not leak a credential split by the input cut', () => {
    const head = `${Array(27)
      .fill(`k=${'v'.repeat(600)}`)
      .join(' ')} `;
    const tails = [
      ' https://user:hunter2SECRET@api.ferrlabs.com/',
      ' eyJhbGciOiJIUzI1NiJ9.eyJzdWIiSECRETabc.c2lnSECRET',
      ' Bearer abcdefghSECRETSECRET',
      ' password=SECRETSECRET',
    ];
    for (const tail of tails) {
      for (let n = 16384 - head.length - tail.length - 5; n <= 16384 - head.length + 5; n++) {
        const output = redactText(head + 'x'.repeat(Math.max(0, n)) + tail);
        expect(output).not.toMatch(/SECRET|hunter2/);
      }
    }
  });

  it('masks the rest of the segment after a sensitive key and keeps the next segment', () => {
    expect(redactText('password: hunter2, name: bob')).toBe('password: *, name: bob');
    expect(redactText('password: hunter2 and more')).toBe('password: *');
  });

  it('stays idempotent when the cut leaves a bare scheme word at the end', () => {
    const output = redactText(`${'x '.repeat(1017)}token: bearer abcdefghijklmn`);
    expect(redactText(output)).toBe(output);
  });

  it('masks quoted Bearer credentials and keeps the surrounding structure', () => {
    expect(redactText('Bearer "x"')).toBe('Bearer *');
    expect(redactText("bearer 'x'")).toBe('bearer *');
    expect(redactText('{"auth":"Bearer x"}')).toBe('{"auth":*}');
  });

  it('settles again after the output cut', () => {
    const output = redactText(`${'x '.repeat(1017)}password=PASSWD = S3cretabcdef more`);
    expect(redactText(output)).toBe(output);
  });

  it('masks bearer tokens with their separator and keeps what follows', () => {
    expect(redactText('Bearer token=abc123')).toBe('Bearer *');
    expect(redactText('Authorization: Bearer abcdefghij1, next')).toBe(
      'Authorization: Bearer *, next',
    );
  });

  it('masks a whole non-bearer credential after a colon key', () => {
    expect(redactText('Authorization: Token abc123def456ghi')).toBe('Authorization: *');
  });

  it('masks both values when two keys share a line', () => {
    expect(redactText('password: hunter2abc token: x')).toBe('password: * token: *');
    expect(redactText('Authorization: Token token="hunter2abcdef"')).toBe('Authorization: *');
  });

  it('keeps the reported host when a query contains @', () => {
    expect(redactText('https://example.com?ref=a@b.com')).toBe('https://example.com');
  });

  it('keeps the host when a URL with a port has @ in its query or fragment', () => {
    expect(redactText('GET https://api.example.com:8443?email=jane@corp.io failed')).toBe(
      'GET https://api.example.com:8443 failed',
    );
    expect(redactText('https://a.com:443#x@evil.com/path')).toBe('https://a.com:443');
  });

  it('masks Basic credentials after a key and keeps host:port intact', () => {
    expect(redactText('Authorization: Basic dXNlcjpwYXNz=')).toBe('Authorization: *');
    expect(redactText('http://auth:9000/login?next=a@b.co')).toBe('http://auth:9000/login');
  });

  it('skips host:port only when the value is a real port', () => {
    expect(redactText('http://mysession:8080')).toBe('http://mysession:8080');
    expect(redactText('https://x.io/a//token:443/b')).toBe('https://x.io/a//token:*');
  });

  it('keeps the Bearer scheme visible and masks the credential', () => {
    expect(redactText('Authorization: Bearer abcdefghij1')).toBe('Authorization: Bearer *');
  });

  it('stays idempotent when the output cut splits a word', () => {
    const output = redactText(`${'x'.repeat(2032)} Basic abcdefgh1_x`);
    expect(redactText(output)).toBe(output);
  });

  it('replaces long marker-bearing words wholesale', () => {
    expect(redactText(`${'a'.repeat(600)}=abc`)).toBe('*');
  });

  it('never grows the input, caps at 2048, is idempotent and fast on pseudo-random input', () => {
    let seed = 7;
    const next = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const alphabet = 'ab9AZ?#=&@/:."\' .-_';
    const samples = [...secretCases, ...plainCases, ...hugeCases];
    for (let i = 0; i < 5000; i++) {
      const length = Math.floor(next() * 40);
      let sample = '';
      for (let j = 0; j < length; j++) sample += alphabet[Math.floor(next() * alphabet.length)];
      samples.push(sample);
    }
    for (const sample of samples) {
      const start = performance.now();
      const output = redactText(sample);
      expect(performance.now() - start).toBeLessThan(1000);
      expect(output.length).toBeLessThanOrEqual(2048);
      expect(output.length).toBeLessThanOrEqual(sample.length);
      expect(redactText(output)).toBe(output);
    }
  });
});

describe('redactText on 16 KB inputs', () => {
  const inputs = [
    '?a= '.repeat(4096),
    '?a='.repeat(5462),
    'password: '.repeat(1639),
    'Bearer '.repeat(2341),
    'x'.repeat(16384),
    'a.'.repeat(8192),
    '/'.repeat(16384),
    `token=${'a'.repeat(16000)}`,
    `${'a@b.c '.repeat(2700)}`,
    '{"password":"x",'.repeat(1024),
  ];

  for (const input of inputs) {
    it(`stays under 50 ms for ${JSON.stringify(input.slice(0, 24))}... (${input.length} chars)`, () => {
      redactText(input);
      const start = performance.now();
      const output = redactText(input);
      expect(performance.now() - start).toBeLessThan(50);
      expect(output.length).toBeLessThanOrEqual(2048);
    });
  }
});

describe('redactText padded basic credentials after an equals sign', () => {
  it.each([
    ['password=Basic dTcyOnZiaUtHTDd3NWtFZjgzbQ==', 'password=*'],
    ['Authorization=Basic dTcyOnZiaUtHTDd3NWtFZjgzbQ==', 'Authorization=*'],
    ['password=Basic dTcyOnZiaUtHTDd3NWtFZjgz', 'password=*'],
  ])('gives %j for %j', (input, expected) => {
    expect(redactText(input)).toBe(expected);
  });
});
