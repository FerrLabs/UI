import { describe, expect, it } from 'vitest';
import { DragTracker } from './splitter-drag';

describe('DragTracker', () => {
  it('hands the session out once, so a re-entrant end from lostpointercapture is a no-op', () => {
    const tracker = new DragTracker<{ pointerId: number }>();
    const session = { pointerId: 7 };
    tracker.begin(session);
    expect(tracker.end(7)).toBe(session);
    expect(tracker.current).toBeNull();
    expect(tracker.end(7)).toBeNull();
  });

  it('ignores other pointers and keeps the session', () => {
    const tracker = new DragTracker<{ pointerId: number }>();
    const session = { pointerId: 1 };
    tracker.begin(session);
    expect(tracker.end(2)).toBeNull();
    expect(tracker.current).toBe(session);
  });

  it('has nothing to end before a drag starts', () => {
    expect(new DragTracker<{ pointerId: number }>().end(1)).toBeNull();
  });
});
