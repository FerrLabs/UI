import '@angular/compiler';
import {
  PLATFORM_ID,
  createEnvironmentInjector,
  provideZonelessChangeDetection,
  runInInjectionContext,
  ɵINJECTOR_SCOPE,
  type EnvironmentInjector,
  type InputSignalWithTransform,
} from '@angular/core';
import { SIGNAL } from '@angular/core/primitives/signals';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocsLayoutComponent } from './docs-layout.component';
import type { DocSection, DocsLang } from './docs-types';

type InputNode<W> = { applyValueToInputSignal(node: unknown, value: W): void };

function setInput<T, W>(input: InputSignalWithTransform<T, W>, value: W): void {
  const node = (input as unknown as Record<symbol, InputNode<W>>)[SIGNAL];
  node.applyValueToInputSignal(node, value);
}

const NAV: readonly DocSection[] = [
  {
    label: 'Start',
    items: [
      { label: 'Intro', slug: 'intro' },
      { label: 'Install', slug: 'install' },
    ],
  },
  { label: 'Guides', items: [{ label: 'Theming', slug: 'theming' }] },
];

class DocsProbe extends DocsLayoutComponent {
  get previous() {
    return this.prev();
  }
  get following() {
    return this.next();
  }
  get sidebarText() {
    return this.sidebarLabel();
  }
  get landmark() {
    return this.sidebarLandmarkLabel();
  }
  get tocText() {
    return this.tocLabel();
  }
  get prevText() {
    return this.prevLabel();
  }
  get nextText() {
    return this.nextLabel();
  }
  get open() {
    return this.sidebarOpen();
  }
  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
  hrefFor(slug: string) {
    return this.docHref(slug);
  }
  versionHrefFor(version: string) {
    return this.versionHref(version);
  }
  changeVersion(value: string) {
    this.onVersionChange({ target: { value } } as unknown as Event);
  }
}

function create(
  options: {
    slug?: string;
    lang?: DocsLang;
    version?: string;
    segment?: string;
    platform?: string;
  } = {},
): DocsProbe {
  const injector = createEnvironmentInjector(
    [
      provideZonelessChangeDetection(),
      { provide: ɵINJECTOR_SCOPE, useValue: 'root' },
      { provide: PLATFORM_ID, useValue: options.platform ?? 'browser' },
    ],
    undefined as unknown as EnvironmentInjector,
  );
  const layout = runInInjectionContext(injector, () => new DocsProbe());
  setInput(layout.slug, options.slug ?? 'install');
  setInput(layout.nav, NAV);
  if (options.lang) setInput(layout.lang, options.lang);
  if (options.version) setInput(layout.version, options.version);
  if (options.segment) setInput(layout.docsSegment, options.segment);
  return layout;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DocsLayoutComponent links', () => {
  it('builds doc links under the default segment', () => {
    expect(create().hrefFor('intro')).toBe('/docs/intro/');
  });

  it('prefixes the french locale and a pinned version, in that order', () => {
    expect(create({ lang: 'fr' }).hrefFor('intro')).toBe('/fr/docs/intro/');
    expect(create({ version: 'v2' }).hrefFor('intro')).toBe('/v2/docs/intro/');
    expect(create({ lang: 'fr', version: 'v2' }).hrefFor('intro')).toBe('/fr/v2/docs/intro/');
  });

  it('honours a custom docs segment', () => {
    expect(create({ segment: 'guide' }).hrefFor('intro')).toBe('/guide/intro/');
  });

  it('links the version switcher to the same page of another version', () => {
    const layout = create({ slug: 'install', lang: 'fr' });
    expect(layout.versionHrefFor('v1')).toBe('/fr/v1/docs/install/');
    expect(layout.versionHrefFor('current')).toBe('/fr/docs/install/');
  });

  it('keeps the version switcher independent of the page version', () => {
    expect(create({ version: 'v2' }).versionHrefFor('current')).toBe('/docs/install/');
  });
});

describe('DocsLayoutComponent pager', () => {
  it('links to the neighbours across sections', () => {
    const layout = create({ slug: 'install' });
    expect(layout.previous).toEqual({ label: 'Intro', href: '/docs/intro/' });
    expect(layout.following).toEqual({ label: 'Theming', href: '/docs/theming/' });
  });

  it('has no previous link on the first page', () => {
    const layout = create({ slug: 'intro' });
    expect(layout.previous).toBeNull();
    expect(layout.following?.label).toBe('Install');
  });

  it('has no next link on the last page', () => {
    const layout = create({ slug: 'theming' });
    expect(layout.following).toBeNull();
    expect(layout.previous?.label).toBe('Install');
  });

  it('has no pager for a slug that is not in the nav', () => {
    const layout = create({ slug: 'missing' });
    expect(layout.previous).toBeNull();
    expect(layout.following).toBeNull();
  });

  it('keeps the locale and version in pager links', () => {
    const layout = create({ slug: 'install', lang: 'fr', version: 'v2' });
    expect(layout.previous?.href).toBe('/fr/v2/docs/intro/');
    expect(layout.following?.href).toBe('/fr/v2/docs/theming/');
  });
});

describe('DocsLayoutComponent labels', () => {
  it('uses english labels by default', () => {
    const layout = create();
    expect(layout.sidebarText).toBe('Menu');
    expect(layout.landmark).toBe('Documentation menu');
    expect(layout.tocText).toBe('On this page');
    expect(layout.prevText).toBe('Previous');
    expect(layout.nextText).toBe('Next');
  });

  it('uses french labels for the fr locale', () => {
    const layout = create({ lang: 'fr' });
    expect(layout.sidebarText).toBe('Sommaire');
    expect(layout.landmark).toBe('Sommaire de la documentation');
    expect(layout.tocText).toBe('Sur cette page');
    expect(layout.prevText).toBe('Précédent');
    expect(layout.nextText).toBe('Suivant');
  });

  it('switches the toggle label while the sidebar is open', () => {
    const layout = create();
    layout.toggleSidebar();
    expect(layout.open).toBe(true);
    expect(layout.sidebarText).toBe('Close');
    const fr = create({ lang: 'fr' });
    fr.toggleSidebar();
    expect(fr.sidebarText).toBe('Fermer');
    fr.toggleSidebar();
    expect(fr.sidebarText).toBe('Sommaire');
  });
});

describe('DocsLayoutComponent version switcher', () => {
  it('navigates to the chosen version in the browser', () => {
    const assign = vi.fn();
    vi.stubGlobal('window', { location: { assign } });
    create().changeVersion('/v1/docs/install/');
    expect(assign).toHaveBeenCalledExactlyOnceWith('/v1/docs/install/');
  });

  it('ignores an empty selection', () => {
    const assign = vi.fn();
    vi.stubGlobal('window', { location: { assign } });
    create().changeVersion('');
    expect(assign).not.toHaveBeenCalled();
  });

  it('does nothing on the server', () => {
    const assign = vi.fn();
    vi.stubGlobal('window', { location: { assign } });
    create({ platform: 'server' }).changeVersion('/v1/docs/install/');
    expect(assign).not.toHaveBeenCalled();
  });
});
