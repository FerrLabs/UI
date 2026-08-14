# UI

Shared UI primitives for [FerrLabs](https://github.com/FerrLabs) products.

pnpm workspace consolidated into a small set of published packages: Angular components, Astro components, and the framework-agnostic design foundation (tokens, fonts, icons). Consumed by every product frontend.

## Packages

| Package                                      | Name                      | Role                                                                                      |
| -------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| [`packages/ui-ng`](packages/ui-ng)           | `@ferrlabs/ui-ng`         | Angular components — app chrome, form and surface primitives, plus a `docs` entry point   |
| [`packages/astro`](packages/astro)           | `@ferrlabs/ui-astro`      | Astro components for marketing sites (Navbar, Footer, PreFooterCTA, Icon, LanguageSelect) |
| [`packages/foundation`](packages/foundation) | `@ferrlabs/ui-foundation` | Framework-agnostic foundation — base CSS + self-hosted fonts, design tokens, SVG icons    |
| [`packages/showcase`](packages/showcase)     | `@ferrlabs/ui-showcase`   | Storybook showcase on `@storybook/angular` (private, not published)                       |

`@ferrlabs/ui-react` was removed once every product frontend had migrated to Angular — no repo imported it any more. Its history is in git; `@ferrlabs/ui-ng` is the component surface.

## Consumption

Each product app adds the Angular and foundation packages to its `package.json`:

```json
{
  "dependencies": {
    "@ferrlabs/ui-ng": "workspace:*",
    "@ferrlabs/ui-foundation": "workspace:*"
  }
}
```

Marketing sites built with Astro also add `@ferrlabs/ui-astro`.

Published to GitHub Packages under the `@ferrlabs` scope.

## Angular imports

```ts
import { FieldComponent, InputComponent, PaginationComponent } from '@ferrlabs/ui-ng';
```

The versioned-docs engine ships as a secondary entry point:

```ts
import { DocsLayoutComponent } from '@ferrlabs/ui-ng/docs';
```

## Design tokens

Every FerrLabs site imports the foundation stylesheet, which loads Tailwind v4, the self-hosted fonts, and the design tokens in one go:

```css
@import '@ferrlabs/ui-foundation/styles/global.css';
```

Tokens only (when the app imports Tailwind itself):

```css
@import '@ferrlabs/ui-foundation/styles/tokens.css';
```

Product accents, fixed — one product, one accent, never mixed:

- **FerrLabs** (holding) — slate (`#1e293b`)
- **FerrFlow** — orange (`#e8733a`)
- **FerrVault** — emerald (`#10b981`)
- **FerrTrack** — indigo (`#6366f1`)
- **FerrGrowth** — violet (`#8b5cf6`)
- **FerrFleet** — amber (`#f59e0b`)
- **FerrLens** — teal (`#14b8a6`)

## Develop

```bash
pnpm install
pnpm typecheck    # all packages
pnpm build        # all packages
```

## License

Proprietary.
