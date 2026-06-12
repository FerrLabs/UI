# UI

Shared UI primitives for [FerrLabs](https://github.com/FerrLabs) products.

pnpm workspace consolidated into a small set of published packages: React components, Astro components, the framework-agnostic design foundation (tokens, fonts, icons), and an Angular port. Consumed by every product frontend.

## Packages

| Package                                      | Name                      | Role                                                                                      |
| -------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------- |
| [`packages/ui`](packages/ui)                 | `@ferrlabs/ui-react`      | React components — primitives (`/primitives`) and composed app chrome (`/react`)          |
| [`packages/astro`](packages/astro)           | `@ferrlabs/ui-astro`      | Astro components for marketing sites (Navbar, Footer, PreFooterCTA, Icon, LanguageSelect) |
| [`packages/foundation`](packages/foundation) | `@ferrlabs/ui-foundation` | Framework-agnostic foundation — base CSS + self-hosted fonts, design tokens, SVG icons    |
| [`packages/ui-ng`](packages/ui-ng)           | `@ferrlabs/ui-ng`         | Angular port (currently Button)                                                           |
| [`packages/showcase`](packages/showcase)     | `@ferrlabs/ui-showcase`   | Storybook showcase (private, not published)                                               |

The earlier `@ferrlabs/ui-primitives`, `@ferrlabs/ui-react`, `@ferrlabs/ui-auth`, `@ferrlabs/ui-icons`, `@ferrlabs/styles`, and `@ferrlabs/ui-tailwind` packages have been consolidated into the three published packages above (UI#105). The React surface is reachable through `@ferrlabs/ui-react` subpaths; tokens, fonts, and icons live in `@ferrlabs/ui-foundation`.

## Consumption

Each product site / app adds the React and foundation packages to its `package.json`:

```json
{
  "dependencies": {
    "@ferrlabs/ui-react": "workspace:*",
    "@ferrlabs/ui-foundation": "workspace:*"
  }
}
```

Marketing sites built with Astro also add `@ferrlabs/ui-astro`.

Published to GitHub Packages under the `@ferrlabs` scope.

## React imports

```tsx
import { Field, Input } from '@ferrlabs/ui-react/primitives';
import { Shell, type NavGroup } from '@ferrlabs/ui-react/react';
```

`Spinner` and `Footer` exist in both `primitives` and `react` with different implementations, so the package keeps each layer addressable through a subpath rather than a single flat export.

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
