import { describe, expect, it } from 'vitest';
import {
  readWaitlistResponse,
  WAITLIST_FORM_LABELS_EN,
  WAITLIST_FORM_LABELS_FR,
} from './waitlist-form.model';

const respond = (status: number) => new Response(null, { status });

describe('readWaitlistResponse', () => {
  it.each([200, 201, 204])('status %d joins the waitlist', (status) => {
    expect(readWaitlistResponse(respond(status), WAITLIST_FORM_LABELS_EN)).toEqual({
      state: 'joined',
    });
  });

  it.each([
    [429, 'tooMany'],
    [422, 'invalid'],
    [400, 'failed'],
    [500, 'failed'],
  ] as const)('status %d maps to the %s message', (status, key) => {
    expect(readWaitlistResponse(respond(status), WAITLIST_FORM_LABELS_FR)).toEqual({
      state: 'error',
      message: WAITLIST_FORM_LABELS_FR[key],
    });
  });

  it('French labels cover the same keys as English', () => {
    expect(Object.keys(WAITLIST_FORM_LABELS_FR).sort()).toEqual(
      Object.keys(WAITLIST_FORM_LABELS_EN).sort(),
    );
  });
});
