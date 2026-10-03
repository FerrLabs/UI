# @ferrlabs/ui-ng

FerrLabs design system — **Angular 22** components (standalone, signals, zoneless).

Sibling of `@ferrlabs/ui-react`: same design language, same tokens. Visual
parity comes from the shared, framework-agnostic
[`@ferrlabs/ui-foundation`](../foundation) (token CSS variables + Tailwind
layers) — `ui-ng` ships no design values of its own, it reads
`--color-accent`, `--color-fg`, `--font-mono`, etc.

> **Status: WIP.** Scaffold + first primitive (`Button`). The rest of the
> ~40 primitives + app chrome are being ported surface-by-surface during the
> React → Angular migration. At the end of the migration this becomes the only
> component library and is renamed to `@ferrlabs/ui`.

## Install

```bash
pnpm add @ferrlabs/ui-ng @ferrlabs/ui-foundation
```

Pull the tokens once (e.g. in your global stylesheet or Tailwind entry):

```css
@import '@ferrlabs/ui-foundation/styles/tokens.css';
```

## Usage

```ts
import { ButtonComponent } from '@ferrlabs/ui-ng';

@Component({
  imports: [ButtonComponent],
  template: `
    <flr-button variant="primary" size="md" (pressed)="save()">Save</flr-button>
    <flr-button variant="ghost" [loading]="saving()">Saving…</flr-button>
    <flr-button variant="danger" href="/delete">Delete</flr-button>
  `,
})
export class Demo {}
```

## Versioned docs (`@ferrlabs/ui-ng/docs`)

Brand-agnostic versioned-documentation layout, shared across product sites.
`DocsLayoutComponent` renders the docs grid only (sidebar + version switcher,
scrollable main with prev/next pager, on-this-page TOC) and projects rendered
markdown into a `.ferr-prose` article via `<ng-content>`. It is shell-free — wrap
it in your own product shell. The nav, versions, language, and URL segment are
inputs, so the content stays in the consumer; only the structure ships here.

```ts
import { DocsLayoutComponent, DocSection, DocVersion } from '@ferrlabs/ui-ng/docs';

const NAV: readonly DocSection[] = [
  { label: 'Getting started', items: [{ label: 'Introduction', slug: 'introduction' }] },
];
const VERSIONS: readonly DocVersion[] = [{ slug: 'current', label: 'v5' }];

@Component({
  imports: [DocsLayoutComponent],
  template: `
    <flr-docs-layout [nav]="nav" [versions]="versions" slug="introduction" lang="en">
      <!-- rendered markdown -->
    </flr-docs-layout>
  `,
})
export class DocsPage {
  protected readonly nav = NAV;
  protected readonly versions = VERSIONS;
}
```

Import the markdown-content stylesheet once (it styles `.ferr-prose`,
`.ferr-aside`, `.ferr-card`, `.ferr-tabs` — all CSS-var driven):

```css
@import '@ferrlabs/ui-ng/docs/styles.css';
```

## Conventions

- **Standalone** components, no NgModules.
- **Signal inputs** (`input()`) and **signal outputs** (`output()`).
- `ChangeDetectionStrategy.OnPush` everywhere (the app runs **zoneless**).
- Selectors are prefixed `flr-`.
- Build: `pnpm --filter @ferrlabs/ui-ng build` (ng-packagr → Angular Package Format).

## License

Licensed under either of [Apache-2.0](LICENSE-APACHE) or [MIT](LICENSE-MIT), at your option.
