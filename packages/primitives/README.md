# @ferrlabs/ui-primitives

Headless React + Tailwind primitives shared across FerrLabs products. One source of truth for `Button`, `Field`, `Input`, `Textarea`, `Submit` (Wave 1) — themable through a single `--color-accent` token.

Consumed by every FerrLabs Cloud SPA (`auth/`, `app/`, `admin/`) and rendered statically by every Astro site (`site/` for the holding + each product) via `@astrojs/react`.

## Installation

The package is published to GitHub Packages under `@ferrlabs`. Each consuming repo already has the right `.npmrc` for the FerrLabs scope.

```bash
pnpm add @ferrlabs/ui-primitives
```

## Theming — set `--color-accent` once per app

Each app or site sets its accent in `global.css` next to the existing `@ferrlabs/ui-tailwind` import:

```css
@import 'tailwindcss';
@import '@ferrlabs/ui-tailwind/tokens';

@theme {
  /* Pick the accent that matches the product. */
  --color-accent: var(--color-primary-600); /* FerrFlow */
  /* --color-accent: var(--color-emerald-500); */ /* FerrVault */
  /* --color-accent: #6366f1; */ /* FerrTrack — indigo */
  /* --color-accent: #7c3aed; */ /* FerrGrowth — violet */
  /* --color-accent: #f59e0b; */ /* FerrFleet — amber */
  /* --color-accent: var(--color-slate-800); */ /* FerrLabs holding */
}

@source '../node_modules/@ferrlabs/ui-primitives/dist/**/*.js';
```

The `@source` line tells Tailwind v4 to scan the published primitives so `bg-accent`, `text-accent`, `ring-accent/30` etc. land in the final CSS. The `@theme` block declares the custom property — Tailwind v4 auto-generates utility classes for any `--color-*` token.

## Usage

### Button

```tsx
import { Button } from '@ferrlabs/ui-primitives';

<Button>Save changes</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="danger">Delete forever</Button>
<Button loading>Saving…</Button>
<Button as="a" href="/onboarding">Get started</Button>
```

### Field + Input

```tsx
import { Field, Input } from '@ferrlabs/ui-primitives';

<Field label="Work email" hint="We'll never share this." required>
  {({ id, describedBy, invalid }) => (
    <Input
      id={id}
      type="email"
      autoComplete="email"
      aria-describedby={describedBy}
      invalid={invalid}
    />
  )}
</Field>;
```

The `Field` wrapper exposes the generated `id` and the `aria-describedby` reference so the input wires up to the hint or error automatically.

### Submit

```tsx
import { Submit } from '@ferrlabs/ui-primitives';

<form onSubmit={handleSubmit}>
  {/* fields */}
  <Submit loading={isSubmitting}>Sign in</Submit>
</form>;
```

## Astro consumption

Astro renders these as static HTML at build time — no JS shipped to the browser unless the component has interactive state:

```astro
---
import { Button, Field, Input } from '@ferrlabs/ui-primitives';
---

<Button>Visit ferrflow.com →</Button>
```

For primitives with internal state (Wave 3 onwards: `Modal`, `Toast`, etc.) consumers add a `client:*` directive when used from Astro:

```astro
<Modal client:load open={false}>...</Modal>
```

Wave 1 primitives (`Button`, `Field`, `Input`, `Textarea`, `Submit`) have no internal state — they're pure presentational components. They render to HTML in Astro and only ship JS when used inside a `client:*` island for some other reason.

## Versioning

Independent semver per package. Breaking changes (rename of a prop, removal of a variant, restructuring of the children API) bump major.

## Showcase

Live examples + props tables + theme toggle: **[ui.ferrlabs.com](https://ui.ferrlabs.com)** (Storybook 8 build, deployed from `packages/showcase/`).
