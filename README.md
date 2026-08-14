<div align="center">

# UI

**The FerrLabs design system.**

Angular components, Astro site chrome, and the framework-agnostic foundation of tokens,<br />
fonts and icons. One source for every product surface, so nothing gets rebuilt per app.

[![CI](https://github.com/FerrLabs/UI/actions/workflows/ci.yml/badge.svg)](https://github.com/FerrLabs/UI/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/storybook-internal-ff4785)](https://storybook.ferrlabs)

[Storybook](https://storybook.ferrlabs) (VPN-only) | [Changelog](https://ferrlabs.com/changelog/) | [FerrLabs](https://github.com/FerrLabs)

</div>

## Packages

| Package                                      | Name                      | Role                                                                                                                    |
| -------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| [`packages/ui-ng`](packages/ui-ng)           | `@ferrlabs/ui-ng`         | Angular components: app chrome, forms, surfaces, overlays, plus a `docs` entry point carrying the versioned-docs engine |
| [`packages/astro`](packages/astro)           | `@ferrlabs/ui-astro`      | Marketing-site chrome: Navbar, Footer, PreFooterCTA, Icon, LanguageSelect                                               |
| [`packages/foundation`](packages/foundation) | `@ferrlabs/ui-foundation` | Design tokens, self-hosted Fraunces and DM Mono, SVG icons. Framework-agnostic                                          |
| [`packages/showcase`](packages/showcase)     | `@ferrlabs/ui-showcase`   | Storybook on `@storybook/angular`. Private, shipped as a container image                                                |

`@ferrlabs/ui-react` is gone. Every product frontend is Angular now and nothing imported it, so
it was removed rather than left as a second component surface inviting drift. The history is in
git.

## Consumption

```json
{
  "dependencies": {
    "@ferrlabs/ui-ng": "workspace:*",
    "@ferrlabs/ui-foundation": "workspace:*"
  }
}
```

Marketing sites add `@ferrlabs/ui-astro`. Published to GitHub Packages under the `@ferrlabs`
scope.

```ts
import { ButtonComponent, PaginationComponent, ShellComponent } from '@ferrlabs/ui-ng';
import { DocsLayoutComponent } from '@ferrlabs/ui-ng/docs';
```

## The rule

If a product needs a Button, an Input, a Sidebar, a Modal or a Pagination, it imports it from
here. If the component does not exist yet, it gets added here in its own PR and then consumed.
Inlining a one-off copy in the app is not an option, including as a temporary measure.

This is not hypothetical. Four apps carried a private copy of the same editorial chrome and the
copies drifted apart. Code review rejects new local components that duplicate something upstream.

Confirmations, validations and prompts always use the shared `Modal`. Never `window.alert`,
`window.confirm` or `window.prompt`: the browser dialog is off-brand, not themeable, blocks the
event loop, and cannot be driven in tests.

## Design tokens

```css
@import '@ferrlabs/ui-foundation/styles/global.css';
```

That pulls Tailwind v4, the fonts and the tokens in one go. Tokens alone, when the app imports
Tailwind itself:

```css
@import '@ferrlabs/ui-foundation/styles/tokens.css';
```

One product, one accent, never mixed:

| Product    | Accent            |
| ---------- | ----------------- |
| FerrLabs   | slate `#1e293b`   |
| FerrFlow   | orange `#e8733a`  |
| FerrVault  | emerald `#10b981` |
| FerrTrack  | indigo `#6366f1`  |
| FerrGrowth | violet `#7c3aed`  |
| FerrFleet  | amber `#f59e0b`   |
| FerrLens   | teal `#14b8a6`    |

Components read `--color-accent`, so a product gets its hue by setting one token rather than by
theming each component.

## Develop

```bash
pnpm install
pnpm build        # topological, foundation before ui-ng
pnpm typecheck
```

Storybook, which is also the fastest way to see a component you are changing:

```bash
pnpm --filter @ferrlabs/ui-showcase storybook
```

## License

Proprietary, except `@ferrlabs/ui-foundation`, which declares MPL-2.0 in its `package.json`.
