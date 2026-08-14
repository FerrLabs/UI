# @ferrlabs/ui-showcase

Storybook for the FerrLabs design system. **Currently a shell** — the React
stories, the `@storybook/react-vite` config, and the image build were removed
along with `@ferrlabs/ui-react`, and the Angular rebuild has not landed yet.

`storybook.ferrlabs.internal` keeps serving the last published
`ghcr.io/ferrlabs/ui/showcase:latest` image until the rebuild ships. Nothing in
CI builds or pushes that image today.

## Rebuilding

The Angular showcase needs, roughly:

- `@storybook/angular` + `storybook` devDependencies, and a `.storybook/main.ts`
  pointing its `stories` glob at `src/stories/**`
- one story per `@ferrlabs/ui-ng` component
- a `Dockerfile` building `@ferrlabs/ui-foundation` then `@ferrlabs/ui-ng` then
  the showcase, served by the `nginx.conf` kept here
- a `storybook-image.yml` workflow pushing `ghcr.io/ferrlabs/ui/showcase`, which
  the Flux ImagePolicy in `Infra/products/ferrlabs/base/extras/` already tracks

`.storybook/preview.css` (brand selector theming, light/dark) and `nginx.conf`
were kept as the starting point.
