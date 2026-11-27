# @ferrlabs/ui-foundation

Framework-agnostic FerrLabs design foundation. Bundles together what was
previously three separate packages (`@ferrlabs/ui-icons`,
`@ferrlabs/styles`, `@ferrlabs/ui-tailwind`) so consumers install one
package instead of three. Tracked under UI#105.

## What's in here

| Subpath                                     | What                                                              | Used by                  |
| ------------------------------------------- | ----------------------------------------------------------------- | ------------------------ |
| `@ferrlabs/ui-foundation/icons`             | SVG icon set as raw strings (Lucide-inspired stroke icons)        | React + Astro            |
| `@ferrlabs/ui-foundation/styles/global.css` | Base stylesheet — fonts + Tailwind import + brand tokens          | Every app's `global.css` |
| `@ferrlabs/ui-foundation/styles/tokens.css` | Brand color + typography tokens (consumed via `@theme`)           | apps/sites               |
| `@ferrlabs/ui-foundation/styles/icons.css`  | Icon hover animations (`fi-*` classes), pulled in by `tokens.css` | apps/sites               |

## Icon animations

Icons carry optional `fi-*` classes. They are static until an ancestor gets the `fi-play` class, which `@ferrlabs/ui-ng` adds on pointer enter or keyboard focus and removes once every animation inside it has finished, so a run is never cut short or restarted. It is wired on sidebar, menu and project switcher items through `flrIconPlay`. Every animation starts and ends at the icon's resting state. `prefers-reduced-motion: reduce` disables them.

## Style presets

`data-style` on `<html>` selects a preset of token overrides, the same way
`data-theme="dark"` selects the dark palette. The two combine freely. No attribute
is the default editorial look.

| `data-style` | Radii (control / card / modal) | Font     | `--control-height` |
| ------------ | ------------------------------ | -------- | ------------------ |
| (none)       | 8px / 16px / 24px              | Fraunces | 40px               |
| `precision`  | 4px / 4px / 6px                | Geist    | 36px               |
| `soft`       | 8px / 12px / 16px              | Geist    | 36px               |

`--control-height` is the `md` height of buttons, inputs, selects, search fields,
multi-selects and submit buttons. `sm` and `lg` are 8px below and above it.

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
| `--radius-control` | 8px   | `rounded-control` | Buttons, inputs, selects, search, tabs, small chips |
| `--radius-card`    | 16px  | `rounded-card`    | Cards, menus, popovers, rail items                  |
| `--radius-modal`   | 24px  | `rounded-modal`   | Modals, switcher panels, large surfaces             |
| `--radius-full`    | 999px | `rounded-full`    | Switch, avatar, badges, status dots                 |

`--corner-shape` (`squircle`) is applied with `corner-shape` next to the tokenized radii. Browsers without `corner-shape` support (Chromium 139+ only for now) keep plain rounded corners.

`.btn-primary` and `.btn-ghost` use `--radius-control` and `--corner-shape`.

Both are at least 44px tall. `.btn-primary` fills with `--accent` and derives its text colour from it: white on dark accents, black on light ones, so every product accent clears 4.5:1 (slate 14.6, orange 6.9, emerald 8.3, indigo 4.7, violet 5.0, amber 9.8, teal 8.4). Browsers without relative colour syntax keep white text.

## Migration from old packages

The old packages (`@ferrlabs/ui-icons`, `@ferrlabs/styles`,
`@ferrlabs/ui-tailwind`) keep working as re-export shells during the
transition window — change imports at your own pace. New consumers
should target `@ferrlabs/ui-foundation` directly.

## License

Licensed under either of [Apache-2.0](LICENSE-APACHE) or [MIT](LICENSE-MIT), at your option.

The Fraunces, DM Mono and Geist fonts are not covered by this license. They are pulled in through the `@fontsource/fraunces`, `@fontsource/dm-mono` and `@fontsource/geist-sans` dependencies and stay under the SIL Open Font License 1.1, whose text ships in each of those packages.
