import '@angular/compiler';
import { Location } from '@angular/common';
import { describe, expect, it } from 'vitest';
import { createHarness } from '../testing/component-harness';
import { FakeLocation } from '../testing/site-chrome-fixture';
import { injectSitePath } from './site-path';

function setup(initial: string) {
  const location = new FakeLocation(initial);
  const harness = createHarness([{ provide: Location, useValue: location }]);
  const path = harness.create(() => injectSitePath());
  return { location, path, harness };
}

describe('injectSitePath', () => {
  it('starts from the current location path', () => {
    expect(setup('/pricing').path()).toBe('/pricing');
  });

  it('falls back to the root for an empty path', () => {
    expect(setup('').path()).toBe('/');
  });

  it('follows url changes, including back to the root', () => {
    const { location, path } = setup('/a');
    location.navigate('/b?x=1');
    expect(path()).toBe('/b?x=1');
    location.navigate('');
    expect(path()).toBe('/');
  });

  it('is read only', () => {
    expect('set' in setup('/a').path).toBe(false);
  });

  it('stops listening when the injector is destroyed', () => {
    const { location, path, harness } = setup('/a');
    expect(location.listenerCount).toBe(1);
    harness.injector.destroy();
    expect(location.listenerCount).toBe(0);
    location.navigate('/b');
    expect(path()).toBe('/a');
  });
});
