# UI

Shared UI primitives for [FerrLabs](https://github.com/FerrLabs) products.

pnpm workspace with 5 packages: React components, Astro components, Tailwind tokens, icons, and auth forms. Consumed by every product frontend.

## Packages

| Package | Role |
|---------|------|
| [`packages/tailwind`](packages/tailwind) | `@ferrlabs/ui-tailwind` — CSS tokens + product palettes (slate / orange / emerald) |
| [`packages/icons`](packages/icons) | `@ferrlabs/ui-icons` — SVG icon set |
| [`packages/react`](packages/react) | `@ferrlabs/ui-react` — React components (Button, Input, Card, Dialog, …) |
| [`packages/astro`](packages/astro) | `@ferrlabs/ui-astro` — Astro components for marketing sites (CrossProductFooter, LanguageSelect) |
| [`packages/auth`](packages/auth) | `@ferrlabs/ui-auth` — React auth forms (LoginForm, SignupForm, OAuthButton, TOTP, …) |

## Status

**Bootstrap** — scaffolds in place with one concrete component per package (`Button`, `LoginForm`). The rest is `TODO` markers to be filled as FerrLabs-Cloud's app and admin land.

## Consumption

Each product site / app adds these to its `package.json`:

```json
{
  "dependencies": {
    "@ferrlabs/ui-tailwind": "workspace:*",
    "@ferrlabs/ui-react": "workspace:*",
    "@ferrlabs/ui-auth": "workspace:*"
  }
}
```

Once stable, publish to GitHub Packages under the `@ferrlabs` scope so external consumers can install them too.

## Design tokens

Every FerrLabs site imports tokens + exactly one product accent:

```css
@import "@ferrlabs/ui-tailwind/tokens";
@import "@ferrlabs/ui-tailwind/products";
```

Product accents, fixed:
- **FerrLabs** (holding) — slate-800
- **FerrFlow** — orange (`#e8733a`)
- **FerrVault** — emerald (`#10B981`)

## Develop

```bash
pnpm install
pnpm typecheck    # all packages
pnpm build        # all packages
```

## License

Proprietary.
