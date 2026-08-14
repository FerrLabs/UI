# @ferrlabs/ui-showcase

Storybook for the FerrLabs design system, running on `@storybook/angular` against
`@ferrlabs/ui-ng`. Private, not published to npm — it ships as a container image
and is served on `storybook.ferrlabs.internal` (VPN-only).

```bash
pnpm --filter @ferrlabs/ui-showcase storybook   # dev server on :6006
pnpm --filter @ferrlabs/ui-showcase build       # static build into dist/
```

Both scripts run `pnpm styles` first — see below. They also need
`@ferrlabs/ui-foundation` and `@ferrlabs/ui-ng` built, because the showcase
resolves `@ferrlabs/ui-ng` through a tsconfig path into `../ui-ng/dist`:

```bash
pnpm -r --workspace-concurrency=1 build
```

## Toolbar

Two globals drive the preview: a product accent (FerrLabs / FerrFlow / FerrVault /
FerrTrack / FerrGrowth / FerrFleet / FerrLens) and a light/dark toggle. Both are
applied as `data-accent` / `data-theme` on `<html>`, the same hooks the real apps
use, so a story renders exactly as it would in-product.

## Styles

`.storybook/preview.src.css` is the authored stylesheet; `pnpm styles` compiles it
to the generated `.storybook/preview.css` that `angular.json` loads, and mirrors the
`@fontsource` woff2 files into `.storybook/files/`. Both outputs are gitignored.

The indirection exists because Tailwind inlines the `@fontsource` stylesheets
without rebasing their `url(./files/…)`, and webpack then resolves those paths
relative to the generated file. Compiling ahead of the Angular build and putting
the fonts where the CSS expects them is what makes both agree.

## angular.json

`@storybook/angular` runs through Angular builders, so the targets live in
`angular.json` rather than in a plain `storybook` CLI call. The dev target sets
`browserTarget` to `showcase:build-storybook`: the framework preset rejects an
undefined `browserTarget`, and pointing it at the other Storybook target avoids
carrying a phantom application build target that nothing ever runs.
