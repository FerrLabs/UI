import { describe, expect, it } from 'vitest';
import { isTrustedIconMarkup } from './icon-markup';

const REGISTRY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><g><rect x="3" y="3" width="7" height="9"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/></g></svg>';

describe('isTrustedIconMarkup', () => {
  it.each([
    ['registry style icon', REGISTRY_ICON],
    ['surrounding html whitespace', `\n ${REGISTRY_ICON}\t`],
    ['end tag with trailing whitespace', '<svg><g></g\n></svg>'],
    ['self closing children', '<svg><path d="M0 0"/><rect x="1" y="1"/></svg>'],
  ])('accepts %s', (_name, markup) => {
    expect(isTrustedIconMarkup(markup)).toBe(true);
  });

  it.each([
    ['unterminated quote on svg end tag', "<svg></svg a='></svg>"],
    ['unterminated quote on rect end tag', "<svg></rect a='></svg>"],
    ['double quotes across end tags', '<svg></polyline a="></line a="></svg>'],
    ['allowlisted attribute on end tag', '<svg><g></g fill="none"></svg>'],
    ['handler on end tag', '<svg><g></g onload="x"></svg>'],
    ['script element', '<svg><script>alert(1)</script></svg>'],
    ['event handler attribute', '<svg onload="alert(1)"><path d="M0 0"/></svg>'],
    ['trailing html', '<svg><path d="M0 0"/></svg><b>x</b>'],
    ['leading text', 'x <svg></svg>'],
  ])('rejects %s', (_name, markup) => {
    expect(isTrustedIconMarkup(markup)).toBe(false);
  });
});
