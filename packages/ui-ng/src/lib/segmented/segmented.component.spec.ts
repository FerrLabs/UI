import '@angular/compiler';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createComponent, flushEffects } from '../testing/component-harness';
import { SegmentedComponent, type SegmentedOption } from './segmented.component';

interface Internals {
  trustedIcon(markup: string | undefined): SafeHtml | null;
  select(option: SegmentedOption): void;
  handleKeydown(event: KeyboardEvent, index: number): void;
}

const OPTIONS: readonly SegmentedOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const trusted = (markup: string) => ({ trusted: markup }) as unknown as SafeHtml;

interface FakeThumb {
  hidden: boolean;
  style: { width: string; transform: string };
  classList: { add: ReturnType<typeof vi.fn> };
}

function fakeButton(offsetWidth: number, offsetLeft: number) {
  return { nativeElement: { offsetWidth, offsetLeft, focus: vi.fn() } };
}

function fakeThumb(hidden: boolean): FakeThumb {
  return { hidden, style: { width: '', transform: '' }, classList: { add: vi.fn() } };
}

function setup(value = 'week', layout?: { thumb: FakeThumb; buttons: unknown[] }) {
  const buttons = layout?.buttons ?? [fakeButton(40, 0), fakeButton(50, 40), fakeButton(60, 90)];
  const thumb = layout?.thumb ?? fakeThumb(true);
  const component = createComponent(
    SegmentedComponent,
    {
      options: OPTIONS,
      value,
      group: { nativeElement: {} },
      thumb: { nativeElement: thumb },
      buttons,
    },
    {
      providers: [{ provide: DomSanitizer, useValue: { bypassSecurityTrustHtml: trusted } }],
    },
  );
  return { component, internals: component as unknown as Internals, thumb, buttons };
}

class StubResizeObserver {
  static instances: StubResizeObserver[] = [];
  observed: unknown[] = [];
  disconnect = vi.fn();

  constructor(readonly callback: () => void) {
    StubResizeObserver.instances.push(this);
  }

  observe(target: unknown): void {
    this.observed.push(target);
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  StubResizeObserver.instances = [];
});

describe('SegmentedComponent selection', () => {
  it('select writes the option value to the model', () => {
    const { component, internals } = setup('day');
    internals.select(OPTIONS[2]);
    expect(component.value()).toBe('month');
  });

  it('arrow keys move selection with wrap-around and focus the new button', () => {
    const { component, internals, buttons } = setup('day');
    const event = { key: 'ArrowLeft', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    internals.handleKeydown(event, 0);
    expect(component.value()).toBe('month');
    expect(event.preventDefault).toHaveBeenCalled();
    expect((buttons[2] as ReturnType<typeof fakeButton>).nativeElement.focus).toHaveBeenCalled();
  });

  it('Home and End jump to the ends', () => {
    const { component, internals } = setup('week');
    internals.handleKeydown({ key: 'End', preventDefault: vi.fn() } as unknown as KeyboardEvent, 1);
    expect(component.value()).toBe('month');
    internals.handleKeydown(
      { key: 'Home', preventDefault: vi.fn() } as unknown as KeyboardEvent,
      2,
    );
    expect(component.value()).toBe('day');
  });

  it('ignores unrelated keys without preventing default', () => {
    const { component, internals } = setup('week');
    const event = { key: 'a', preventDefault: vi.fn() } as unknown as KeyboardEvent;
    internals.handleKeydown(event, 1);
    expect(component.value()).toBe('week');
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

describe('SegmentedComponent icons', () => {
  const svg = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';

  it('trusts well formed svg markup', () => {
    expect(setup().internals.trustedIcon(svg)).toEqual(trusted(svg));
  });

  it.each([['<svg onload="x()"></svg>'], ['plain'], [''], [undefined]])('rejects %s', (markup) => {
    expect(setup().internals.trustedIcon(markup)).toBeNull();
  });
});

describe('SegmentedComponent thumb', () => {
  it('sizes and moves the thumb to the selected button, revealing a hidden thumb without animating', () => {
    const { component, thumb } = setup('week');
    flushEffects(component);
    expect(thumb.style.width).toBe('50px');
    expect(thumb.style.transform).toBe('translateX(40px)');
    expect(thumb.hidden).toBe(false);
    expect(thumb.classList.add).not.toHaveBeenCalled();
  });

  it('animates once the thumb is already visible', () => {
    const { component, thumb } = setup('week', {
      thumb: fakeThumb(false),
      buttons: [fakeButton(40, 0), fakeButton(50, 40), fakeButton(60, 90)],
    });
    flushEffects(component);
    expect(thumb.classList.add).toHaveBeenCalledWith('flr-seg__thumb--animated');
  });

  it('hides the thumb when the value matches no option', () => {
    const { component, thumb } = setup('nope', {
      thumb: fakeThumb(false),
      buttons: [fakeButton(40, 0)],
    });
    flushEffects(component);
    expect(thumb.hidden).toBe(true);
    expect(thumb.style.width).toBe('');
  });

  it('hides the thumb when the selected button has no width yet', () => {
    const { component, thumb } = setup('day', {
      thumb: fakeThumb(false),
      buttons: [fakeButton(0, 0)],
    });
    flushEffects(component);
    expect(thumb.hidden).toBe(true);
  });

  it('re-places the thumb when the group resizes', () => {
    vi.stubGlobal('ResizeObserver', StubResizeObserver);
    const { component, thumb } = setup('week');
    flushEffects(component);
    const [observer] = StubResizeObserver.instances;
    expect(observer.observed).toHaveLength(1);
    thumb.style.width = '';
    observer.callback();
    expect(thumb.style.width).toBe('50px');
  });
});
