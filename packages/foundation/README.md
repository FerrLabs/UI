# @ferrlabs/ui-foundation

Framework-agnostic FerrLabs design foundation. Bundles together what was
previously three separate packages (`@ferrlabs/ui-icons`,
`@ferrlabs/styles`, `@ferrlabs/ui-tailwind`) so consumers install one
package instead of three. Tracked under UI#105.

## What's in here

| Subpath                                     | What                                                       | Used by                  |
| ------------------------------------------- | ---------------------------------------------------------- | ------------------------ |
| `@ferrlabs/ui-foundation/icons`             | SVG icon set as raw strings (Lucide-inspired stroke icons) | React + Astro            |
| `@ferrlabs/ui-foundation/styles/global.css` | Base stylesheet — fonts + Tailwind import + brand tokens   | Every app's `global.css` |
| `@ferrlabs/ui-foundation/styles/tokens.css` | Brand color + typography tokens (consumed via `@theme`)    | apps/sites               |

## Style presets

`data-style` on `<html>` selects a preset of token overrides, the same way
`data-theme="dark"` selects the dark palette. The two combine freely. No attribute
is the default editorial look.

| `data-style` | Radii (control / card / modal) | Font     | `--control-height` |
| ------------ | ------------------------------ | -------- | ------------------ |
| (none)       | 4px / 8px / 12px               | Fraunces | 40px               |
| `precision`  | 2px / 4px / 6px                | Inter    | 28px               |
| `soft`       | 8px / 12px / 16px              | Inter    | 36px               |

`--control-height` is the `md` height of buttons, inputs, selects, search fields,
multi-selects and submit buttons. `sm` and `lg` are 8px below and above it. Buttons
are padding-sized, so they shift by half the difference to 40px on each side.

```html
<html data-style="precision" data-theme="dark"></html>
```

## Usage

### React app

```ts
import { icons, type IconName } from '@ferrlabs/ui-foundation/icons';
```

```css
/* app/src/index.css */
@import '@ferrlabs/ui-foundation/styles/global.css';
```

### Astro site

```astro
---
import { icons } from '@ferrlabs/ui-foundation/icons';
---
<div set:html={icons.shield} />
```

```css
/* site/src/styles/global.css */
@import '@ferrlabs/ui-foundation/styles/global.css';
```

## Radius tokens

| Token              | Value | Tailwind utility  | Use                                                 |
| ------------------ | ----- | ----------------- | --------------------------------------------------- |
| `--radius-control` | 4px   | `rounded-control` | Buttons, inputs, selects, search, tabs, small chips |
| `--radius-card`    | 8px   | `rounded-card`    | Cards, menus, popovers, rail items                  |
| `--radius-modal`   | 12px  | `rounded-modal`   | Modals, switcher panels, large surfaces             |
| `--radius-full`    | 999px | `rounded-full`    | Switch, avatar, badges, status dots                 |

`.btn-primary` and `.btn-ghost` use `--radius-control`.

## Migration from old packages

The old packages (`@ferrlabs/ui-icons`, `@ferrlabs/styles`,
`@ferrlabs/ui-tailwind`) keep working as re-export shells during the
transition window — change imports at your own pace. New consumers
should target `@ferrlabs/ui-foundation` directly.

## License

Licensed under either of [Apache-2.0](LICENSE-APACHE) or [MIT](LICENSE-MIT), at your option.

The Fraunces, DM Mono and Inter fonts are not covered by this license. They are pulled in through the `@fontsource/fraunces`, `@fontsource/dm-mono` and `@fontsource/inter` dependencies and stay under the SIL Open Font License 1.1, whose text ships in each of those packages.
