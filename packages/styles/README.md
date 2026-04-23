# @ferrlabs/styles

Shared base stylesheet for every FerrLabs product. Loads the brand fonts
(Fraunces + DM Mono, self-hosted), Tailwind CSS v4, and the design
tokens documented in [`DESIGN.md`](../../../DESIGN.md).

## Install

```sh
pnpm add @ferrlabs/styles
```

> The package is private on GitHub Packages. Authenticate with a PAT
> that has `read:packages` for the `FerrLabs` org.

## Use

In your app's `src/styles/global.css`:

```css
@import "@ferrlabs/styles/global.css";

/* ...your product-specific overrides, if any... */
```

**Do not** `@import "tailwindcss";` yourself — this package already does
it. Doubling it up will generate every utility class twice.

## What it gives you

- Fraunces 400/700/900 and DM Mono 400/500 loaded from `@fontsource`
  (self-hosted, zero Google Fonts, no third-party tracking).
- Tailwind CSS v4.
- `@theme` tokens exposing:
  - `font-sans`, `font-display`, `font-mono`
  - `color-ferrlabs-slate`, `color-ferrflow-orange`,
    `color-ferrvault-emerald`, `color-ferrtrack-indigo`,
    `color-ferrgrowth-violet`
  - These become Tailwind utilities automatically:
    `bg-ferrflow-orange`, `text-ferrvault-emerald`, `font-display`, etc.
- A minimal `@layer base` that wires `font-family` + antialiasing.

## Why a dedicated package

Before this existed, three different fonts were used across FerrLabs
surfaces (Fraunces, Inter, system) and the brand accents were duplicated
in every `global.css`. A change to the holding's accent or a font
license update required sweeping commits across every repo. Now: one
version bump, every product gets the change.

## Versioning

Semver. A font swap or token rename is a **major** bump — consumers will
need to visually re-verify. Adding a new token is minor. Patch is
documentation and internal refactors only.

## Development

```sh
pnpm --filter @ferrlabs/styles typecheck  # no-op, no TS here
```

Published to GitHub Packages npm via the FerrFlow release workflow at
the repo root.
